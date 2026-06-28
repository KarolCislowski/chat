import { Logger, UnauthorizedException, UsePipes, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GuildsService } from "../guilds/guilds.service";
import { UserRole } from "../users/schemas/user-account.schema";
import { UsersService } from "../users/users.service";
import { CreateGlobalMessageDto } from "./dto/create-global-message.dto";
import { TypingEventDto } from "./dto/typing-event.dto";
import { MessagesService } from "./messages.service";

/** Authenticated user data stored on each accepted chat socket. */
type ChatSocketUser = {
  accountId: string;
  email: string;
  role: UserRole;
};

/** Socket.IO client extended with the authenticated chat user payload. */
type AuthenticatedSocket = Socket & {
  data: {
    user?: ChatSocketUser;
  };
};

/** JWT payload expected in websocket access tokens. */
type AccessTokenPayload = {
  email: string;
  role: UserRole;
  sub: string;
};

@WebSocketGateway({
  cors: {
    origin: true,
  },
  namespace: "chat",
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MessagesGateway.name);
  private readonly socketsByAccountId = new Map<string, Set<string>>();

  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly guildsService: GuildsService,
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Authenticates a socket, joins user/guild rooms, and marks first connection online.
   *
   * @param client - Socket.IO client attempting to connect to the chat namespace.
   * @returns A promise that resolves after connection setup or rejection.
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      const payload = await this.verifyClient(client);
      client.data.user = {
        accountId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      await client.join(this.getUserRoom(payload.sub));
      await this.joinGuildRooms(client, payload.sub);
      await this.registerPresence(client, payload.sub);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown socket auth error.";
      this.logger.warn(`Rejected socket connection: ${message}`);
      client.emit("chat:error", { message: "Chat session expired. Please log in again." });
      client.disconnect(true);
    }
  }

  /**
   * Unregisters socket presence and marks the account offline when its last socket closes.
   *
   * @param client - Socket.IO client disconnecting from the chat namespace.
   * @returns A promise that resolves after presence state is updated.
   */
  async handleDisconnect(client: AuthenticatedSocket) {
    const accountId = client.data.user?.accountId;

    if (!accountId) {
      return;
    }

    await this.unregisterPresence(client, accountId);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @SubscribeMessage("message:create")
  /**
   * Handles realtime message creation and emits the result to the proper room set.
   *
   * @param client - Authenticated socket that sent the message event.
   * @param dto - Validated message creation payload.
   * @returns A promise that resolves after the message is persisted and emitted.
   */
  async createMessage(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() dto: CreateGlobalMessageDto) {
    const user = client.data.user;

    if (!user) {
      throw new UnauthorizedException("Socket is not authenticated.");
    }

    if (dto.channelType === "guild") {
      if (!dto.guildId) {
        client.emit("chat:error", { message: "Guild message requires guildId." });
        return;
      }

      const message = await this.messagesService.createGuildMessage({
        content: dto.content,
        guildId: dto.guildId,
        senderId: user.accountId,
      });

      this.server.to(this.getGuildRoom(dto.guildId)).emit("message:created", message);
      return;
    }

    if (dto.channelType === "whisper") {
      if (!dto.recipientId) {
        client.emit("chat:error", { message: "Whisper message requires recipientId." });
        return;
      }

      const message = await this.messagesService.createWhisperMessage({
        content: dto.content,
        recipientId: dto.recipientId,
        senderId: user.accountId,
      });

      this.server.to(this.getUserRoom(user.accountId)).to(this.getUserRoom(dto.recipientId)).emit("message:created", message);
      return;
    }

    const message = await this.messagesService.createGlobalMessage({
      content: dto.content,
      senderId: user.accountId,
    });
    this.server.emit("message:created", message);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @SubscribeMessage("typing:changed")
  /**
   * Relays transient typing-state changes to the destination channel members.
   *
   * @param client - Authenticated socket that sent the typing event.
   * @param dto - Validated typing-state payload.
   * @returns A promise that resolves after the event is broadcast.
   */
  async changeTypingState(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() dto: TypingEventDto) {
    const user = client.data.user;

    if (!user) {
      throw new UnauthorizedException("Socket is not authenticated.");
    }

    const event = {
      accountId: user.accountId,
      channelType: dto.channelType,
      guildId: dto.guildId ?? null,
      isTyping: dto.isTyping,
      recipientId: dto.recipientId ?? null,
    };

    if (dto.channelType === "guild") {
      if (!dto.guildId) {
        client.emit("chat:error", { message: "Guild typing event requires guildId." });
        return;
      }

      await this.guildsService.assertGuildMembership(user.accountId, dto.guildId);
      client.to(this.getGuildRoom(dto.guildId)).emit("typing:changed", event);
      return;
    }

    if (dto.channelType === "whisper") {
      if (!dto.recipientId) {
        client.emit("chat:error", { message: "Whisper typing event requires recipientId." });
        return;
      }

      client.to(this.getUserRoom(dto.recipientId)).emit("typing:changed", event);
      return;
    }

    client.broadcast.emit("typing:changed", event);
  }

  /**
   * Verifies the socket access token and returns its payload.
   *
   * @param client - Socket.IO client being authenticated.
   * @returns Verified access token payload.
   */
  private async verifyClient(client: AuthenticatedSocket) {
    const token = this.extractToken(client);

    if (!token) {
      throw new UnauthorizedException("Missing socket token.");
    }

    const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
    this.logger.debug(`Socket connected for account ${payload.sub}`);

    return payload;
  }

  /**
   * Extracts a bearer token from socket auth data or fallback headers.
   *
   * @param client - Socket.IO client handshake.
   * @returns Access token string when present.
   */
  private extractToken(client: Socket) {
    const authToken = client.handshake.auth?.token;

    if (typeof authToken === "string") {
      return authToken;
    }

    const [type, token] = client.handshake.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  /**
   * Tracks an account socket and broadcasts online presence for the first active socket.
   *
   * @param client - Connected socket to track.
   * @param accountId - Account represented by the socket.
   * @returns A promise that resolves after any presence update is emitted.
   */
  private async registerPresence(client: Socket, accountId: string) {
    const sockets = this.socketsByAccountId.get(accountId) ?? new Set<string>();
    const wasOffline = sockets.size === 0;

    sockets.add(client.id);
    this.socketsByAccountId.set(accountId, sockets);

    if (!wasOffline) {
      return;
    }

    await this.usersService.updateOnlineStatus(accountId, "online");
    this.server.emit("presence:changed", {
      accountId,
      onlineStatus: "online",
    });
  }

  /**
   * Joins all guild rooms available to an account.
   *
   * @param client - Connected socket to join into rooms.
   * @param accountId - Account whose guild memberships should be used.
   * @returns A promise that resolves after all room joins finish.
   */
  private async joinGuildRooms(client: Socket, accountId: string) {
    const guildIds = await this.guildsService.getGuildIdsForUser(accountId);

    await Promise.all(guildIds.map((guildId) => client.join(this.getGuildRoom(guildId))));
  }

  /**
   * Builds the Socket.IO room name for a guild channel.
   *
   * @param guildId - Guild ID.
   * @returns Socket room name for the guild.
   */
  private getGuildRoom(guildId: string) {
    return `guild:${guildId}`;
  }

  /**
   * Builds the Socket.IO room name for one account's personal events.
   *
   * @param accountId - Account ID.
   * @returns Socket room name for the account.
   */
  private getUserRoom(accountId: string) {
    return `user:${accountId}`;
  }

  /**
   * Removes a socket from presence tracking and broadcasts offline when no sockets remain.
   *
   * @param client - Disconnecting socket.
   * @param accountId - Account represented by the socket.
   * @returns A promise that resolves after any presence update is emitted.
   */
  private async unregisterPresence(client: Socket, accountId: string) {
    const sockets = this.socketsByAccountId.get(accountId);

    if (!sockets) {
      return;
    }

    sockets.delete(client.id);

    if (sockets.size > 0) {
      return;
    }

    this.socketsByAccountId.delete(accountId);
    await this.usersService.updateOnlineStatus(accountId, "offline");
    this.server.emit("presence:changed", {
      accountId,
      onlineStatus: "offline",
    });
  }
}
