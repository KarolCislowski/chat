import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthenticatedRequest } from "../auth/types/authenticated-request";
import { CreateGuildDto } from "./dto/create-guild.dto";
import { InviteGuildMemberDto } from "./dto/invite-guild-member.dto";
import { JoinGuildDto } from "./dto/join-guild.dto";
import { UpdateGuildAppearanceDto } from "./dto/update-guild-appearance.dto";
import { GuildsService } from "./guilds.service";

@UseGuards(JwtAuthGuard)
@Controller("guilds")
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  @Get("mine")
  getMyGuilds(@Req() request: AuthenticatedRequest) {
    return this.guildsService.getMyGuilds(request.user.accountId);
  }

  @Get("available")
  getAvailableGuilds(@Req() request: AuthenticatedRequest) {
    return this.guildsService.getAvailableGuilds(request.user.accountId);
  }

  @Post()
  createGuild(@Req() request: AuthenticatedRequest, @Body() dto: CreateGuildDto) {
    return this.guildsService.createGuild(request.user.accountId, dto.name, dto.themeColor, dto.emblemUrl);
  }

  @Patch(":guildId/appearance")
  updateAppearance(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string, @Body() dto: UpdateGuildAppearanceDto) {
    return this.guildsService.updateAppearance(request.user.accountId, guildId, dto.themeColor, dto.emblemUrl);
  }

  @Post("join")
  joinGuild(@Req() request: AuthenticatedRequest, @Body() dto: JoinGuildDto) {
    return this.guildsService.joinGuild(request.user.accountId, dto.inviteCode);
  }

  @Post(":guildId/invites")
  createInvite(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string) {
    return this.guildsService.createInvite(request.user.accountId, guildId);
  }

  @Post(":guildId/members")
  inviteMember(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string, @Body() dto: InviteGuildMemberDto) {
    return this.guildsService.inviteMember(request.user.accountId, guildId, dto.userId);
  }

  @Get(":guildId/join-requests")
  getJoinRequests(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string) {
    return this.guildsService.getJoinRequests(request.user.accountId, guildId);
  }

  @Post(":guildId/join-requests")
  requestJoin(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string) {
    return this.guildsService.requestJoin(request.user.accountId, guildId);
  }

  @Post(":guildId/join-requests/:requestId/accept")
  acceptJoinRequest(
    @Req() request: AuthenticatedRequest,
    @Param("guildId") guildId: string,
    @Param("requestId") requestId: string,
  ) {
    return this.guildsService.acceptJoinRequest(request.user.accountId, guildId, requestId);
  }
}
