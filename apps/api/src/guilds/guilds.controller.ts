import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthenticatedRequest } from "../auth/types/authenticated-request";
import { CreateGuildDto } from "./dto/create-guild.dto";
import { InviteGuildMemberDto } from "./dto/invite-guild-member.dto";
import { JoinGuildDto } from "./dto/join-guild.dto";
import { UpdateGuildAppearanceDto } from "./dto/update-guild-appearance.dto";
import { UpdateGuildMemberRoleDto } from "./dto/update-guild-member-role.dto";
import { GuildsService } from "./guilds.service";

@ApiTags("guilds")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("guilds")
/** HTTP controller for guild membership, discovery, requests, and management endpoints. */
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  /**
   * Lists guilds where the current account is a member.
   *
   * @param request - Authenticated request containing the current account ID.
   * @returns Guilds for the current account.
   */
  @Get("mine")
  @ApiOkResponse({ description: "Guilds where the current account is a member." })
  getMyGuilds(@Req() request: AuthenticatedRequest) {
    return this.guildsService.getMyGuilds(request.user.accountId);
  }

  /**
   * Lists guilds the current account can request to join.
   *
   * @param request - Authenticated request containing the current account ID.
   * @returns Available guilds with pending request state.
   */
  @Get("available")
  @ApiOkResponse({ description: "Guilds the current account can request to join." })
  getAvailableGuilds(@Req() request: AuthenticatedRequest) {
    return this.guildsService.getAvailableGuilds(request.user.accountId);
  }

  /**
   * Loads guild details for a member.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param guildId - Guild to load.
   * @returns Detailed guild response.
   */
  @Get(":guildId")
  @ApiOkResponse({ description: "Detailed guild data for a member." })
  getGuildDetails(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string) {
    return this.guildsService.getGuildDetails(request.user.accountId, guildId);
  }

  /**
   * Creates a guild owned by the current account.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param dto - Guild creation payload.
   * @returns Created guild response.
   */
  @Post()
  @ApiCreatedResponse({ description: "Guild created and owner membership assigned." })
  createGuild(@Req() request: AuthenticatedRequest, @Body() dto: CreateGuildDto) {
    return this.guildsService.createGuild(request.user.accountId, dto.name, dto.themeColor, dto.emblemUrl, dto.backgroundUrl);
  }

  /**
   * Updates guild appearance for an owner or officer.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param guildId - Guild being updated.
   * @param dto - Appearance update payload.
   * @returns Detailed guild response.
   */
  @Patch(":guildId/appearance")
  @ApiOkResponse({ description: "Guild appearance updated." })
  updateAppearance(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string, @Body() dto: UpdateGuildAppearanceDto) {
    return this.guildsService.updateAppearance(request.user.accountId, guildId, dto.themeColor, dto.emblemUrl, dto.backgroundUrl);
  }

  /**
   * Joins a guild through an invite code.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param dto - Invite-code join payload.
   * @returns Joined guild response.
   */
  @Post("join")
  @ApiCreatedResponse({ description: "Joined guild through invite code." })
  joinGuild(@Req() request: AuthenticatedRequest, @Body() dto: JoinGuildDto) {
    return this.guildsService.joinGuild(request.user.accountId, dto.inviteCode);
  }

  /**
   * Creates a new invite code for a manageable guild.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param guildId - Guild receiving the invite code.
   * @returns Invite code and guild response.
   */
  @Post(":guildId/invites")
  @ApiCreatedResponse({ description: "Invite code created for the guild." })
  createInvite(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string) {
    return this.guildsService.createInvite(request.user.accountId, guildId);
  }

  /**
   * Adds another user to a guild directly.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param guildId - Guild receiving the member.
   * @param dto - Invited member payload.
   * @returns Updated guild response.
   */
  @Post(":guildId/members")
  @ApiCreatedResponse({ description: "Member added directly to the guild." })
  inviteMember(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string, @Body() dto: InviteGuildMemberDto) {
    return this.guildsService.inviteMember(request.user.accountId, guildId, dto.userId);
  }

  /**
   * Updates a non-owner guild member's role.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param guildId - Guild containing the member.
   * @param userId - Member whose role should change.
   * @param dto - Role update payload.
   * @returns Detailed guild response.
   */
  @Patch(":guildId/members/:userId/role")
  @ApiOkResponse({ description: "Guild member role updated." })
  updateMemberRole(
    @Req() request: AuthenticatedRequest,
    @Param("guildId") guildId: string,
    @Param("userId") userId: string,
    @Body() dto: UpdateGuildMemberRoleDto,
  ) {
    return this.guildsService.updateMemberRole(request.user.accountId, guildId, userId, dto.role);
  }

  /**
   * Removes a non-owner member from a guild.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param guildId - Guild containing the member.
   * @param userId - Member to remove.
   * @returns Detailed guild response.
   */
  @Delete(":guildId/members/:userId")
  @ApiOkResponse({ description: "Guild member removed." })
  removeMember(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string, @Param("userId") userId: string) {
    return this.guildsService.removeMember(request.user.accountId, guildId, userId);
  }

  /**
   * Lists pending join requests for a manageable guild.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param guildId - Guild whose join requests should be listed.
   * @returns Pending join request responses.
   */
  @Get(":guildId/join-requests")
  @ApiOkResponse({ description: "Pending join requests for the guild." })
  getJoinRequests(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string) {
    return this.guildsService.getJoinRequests(request.user.accountId, guildId);
  }

  /**
   * Creates a join request for a guild.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param guildId - Guild the current account wants to join.
   * @returns Created join request response.
   */
  @Post(":guildId/join-requests")
  @ApiCreatedResponse({ description: "Join request created." })
  requestJoin(@Req() request: AuthenticatedRequest, @Param("guildId") guildId: string) {
    return this.guildsService.requestJoin(request.user.accountId, guildId);
  }

  /**
   * Accepts a pending join request.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param guildId - Guild that owns the join request.
   * @param requestId - Join request to accept.
   * @returns Updated join request response.
   */
  @Post(":guildId/join-requests/:requestId/accept")
  @ApiOkResponse({ description: "Join request accepted." })
  acceptJoinRequest(
    @Req() request: AuthenticatedRequest,
    @Param("guildId") guildId: string,
    @Param("requestId") requestId: string,
  ) {
    return this.guildsService.acceptJoinRequest(request.user.accountId, guildId, requestId);
  }
}
