import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthenticatedRequest } from "../auth/types/authenticated-request";
import { MessagesService } from "./messages.service";

@UseGuards(JwtAuthGuard)
@Controller("messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get("global")
  getGlobalMessages(@Query("limit") limit?: string) {
    return this.messagesService.getGlobalMessages(Number(limit) || 50);
  }

  @Get("guild/:guildId")
  getGuildMessages(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string, @Query("limit") limit?: string) {
    return this.messagesService.getGuildMessages(request.user.accountId, guildId, Number(limit) || 50);
  }

  @Get("whisper/:recipientId")
  getWhisperMessages(@Req() request: AuthenticatedRequest, @Param("recipientId") recipientId: string, @Query("limit") limit?: string) {
    return this.messagesService.getWhisperMessages(request.user.accountId, recipientId, Number(limit) || 50);
  }
}
