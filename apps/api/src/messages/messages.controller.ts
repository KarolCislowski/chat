import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthenticatedRequest } from "../auth/types/authenticated-request";
import { MessagesService } from "./messages.service";

@ApiTags("messages")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("messages")
/** HTTP controller for loading persisted chat history. */
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Loads the aggregate open-chat feed visible to the current account.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param limit - Optional requested message count.
   * @returns Open-chat message history.
   */
  @Get("open")
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiOkResponse({ description: "Aggregate open-chat message history." })
  getOpenMessages(@Req() request: AuthenticatedRequest, @Query("limit") limit?: string) {
    return this.messagesService.getOpenMessages(request.user.accountId, Number(limit) || 100);
  }

  /**
   * Loads recent global chat messages.
   *
   * @param limit - Optional requested message count.
   * @returns Global message history.
   */
  @Get("global")
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiOkResponse({ description: "Global chat message history." })
  getGlobalMessages(@Query("limit") limit?: string) {
    return this.messagesService.getGlobalMessages(Number(limit) || 50);
  }

  /**
   * Loads recent guild channel messages for a member.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param guildId - Guild channel ID.
   * @param limit - Optional requested message count.
   * @returns Guild message history.
   */
  @Get("guild/:guildId")
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiOkResponse({ description: "Guild channel message history." })
  getGuildMessages(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string, @Query("limit") limit?: string) {
    return this.messagesService.getGuildMessages(request.user.accountId, guildId, Number(limit) || 50);
  }

  /**
   * Loads recent whisper messages with another account.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param recipientId - Other participant account ID.
   * @param limit - Optional requested message count.
   * @returns Whisper message history.
   */
  @Get("whisper/:recipientId")
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiOkResponse({ description: "Whisper conversation message history." })
  getWhisperMessages(@Req() request: AuthenticatedRequest, @Param("recipientId") recipientId: string, @Query("limit") limit?: string) {
    return this.messagesService.getWhisperMessages(request.user.accountId, recipientId, Number(limit) || 50);
  }
}
