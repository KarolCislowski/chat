import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { MessagesService } from "./messages.service";

@UseGuards(JwtAuthGuard)
@Controller("messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get("global")
  getGlobalMessages(@Query("limit") limit?: string) {
    return this.messagesService.getGlobalMessages(Number(limit) || 50);
  }
}
