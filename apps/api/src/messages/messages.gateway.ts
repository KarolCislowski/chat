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
import { MessagesService } from "./messages.service";

type ChatSocketUser = {
  accountId: string;
  email: string;
  role: UserRole;
};

type AuthenticatedSocket = Socket & {
  data: {
    user?: ChatSocketUser;
  };
};

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

  async handleDisconnect(client: AuthenticatedSocket) {
    const accountId = client.data.user?.accountId;

    if (!accountId) {
      return;
    }

    await this.unregisterPresence(client, accountId);
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @SubscribeMessage("message:create")
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

  private async verifyClient(client: AuthenticatedSocket) {
    const token = this.extractToken(client);

    if (!token) {
      throw new UnauthorizedException("Missing socket token.");
    }

    const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
    this.logger.debug(`Socket connected for account ${payload.sub}`);

    return payload;
  }

  private extractToken(client: Socket) {
    const authToken = client.handshake.auth?.token;

    if (typeof authToken === "string") {
      return authToken;
    }

    const [type, token] = client.handshake.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

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

  private async joinGuildRooms(client: Socket, accountId: string) {
    const guildIds = await this.guildsService.getGuildIdsForUser(accountId);

    await Promise.all(guildIds.map((guildId) => client.join(this.getGuildRoom(guildId))));
  }

  private getGuildRoom(guildId: string) {
    return `guild:${guildId}`;
  }

  private getUserRoom(accountId: string) {
    return `user:${accountId}`;
  }

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
