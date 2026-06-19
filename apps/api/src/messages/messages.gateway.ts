import { Logger, UnauthorizedException, UsePipes, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UserRole } from "../users/schemas/user-account.schema";
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
export class MessagesGateway implements OnGatewayConnection {
  private readonly logger = new Logger(MessagesGateway.name);

  @WebSocketServer()
  private readonly server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const payload = await this.verifyClient(client);
      client.data.user = {
        accountId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown socket auth error.";
      this.logger.warn(`Rejected socket connection: ${message}`);
      client.emit("chat:error", { message: "Chat session expired. Please log in again." });
      client.disconnect(true);
    }
  }

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @SubscribeMessage("message:create")
  async createGlobalMessage(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() dto: CreateGlobalMessageDto) {
    const user = client.data.user;

    if (!user) {
      throw new UnauthorizedException("Socket is not authenticated.");
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
}
