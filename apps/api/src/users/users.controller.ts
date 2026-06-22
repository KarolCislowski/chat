import { Body, Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthenticatedRequest } from "../auth/types/authenticated-request";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UserAccountDocument } from "./schemas/user-account.schema";
import { UserProfileDocument } from "./schemas/user-profile.schema";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard)
@Controller("users")
/** HTTP controller for account profile and user discovery endpoints. */
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Returns the current account and profile.
   *
   * @param request - Authenticated request containing the current account ID.
   * @returns Current account and profile response.
   */
  @Get("me")
  async getMe(@Req() request: AuthenticatedRequest) {
    const { account, profile } = await this.usersService.getAccountWithProfile(request.user.accountId);

    return {
      account: this.toAccountResponse(account),
      profile: this.toProfileResponse(profile),
    };
  }

  /**
   * Updates the current account's profile.
   *
   * @param request - Authenticated request containing the current account ID.
   * @param dto - Partial profile update payload.
   * @returns Updated public profile response.
   */
  @Patch("me/profile")
  async updateMyProfile(@Req() request: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    const profile = await this.usersService.updateProfile(request.user.accountId, dto);

    return this.toProfileResponse(profile);
  }

  /**
   * Converts an account document into the public account response shape.
   *
   * @param account - Account document from MongoDB.
   * @returns Serializable account response.
   */
  private toAccountResponse(account: UserAccountDocument) {
    return {
      id: account.id,
      email: account.email,
      role: account.role,
      createdAt: account.createdAt,
    };
  }

  /**
   * Lists profiles available for chat interactions, excluding the current user.
   *
   * @param request - Authenticated request containing the current account ID.
   * @returns Public profile responses.
   */
  @Get()
  async listUsers(@Req() request: AuthenticatedRequest) {
    const profiles = await this.usersService.listProfiles(request.user.accountId);

    return profiles.map((profile) => this.toProfileResponse(profile));
  }

  /**
   * Loads a public profile by account ID.
   *
   * @param accountId - Account ID whose profile should be returned.
   * @returns Public profile response.
   */
  @Get(":accountId")
  async getProfile(@Param("accountId") accountId: string) {
    const profile = await this.usersService.getProfileByAccountId(accountId);

    return this.toProfileResponse(profile);
  }

  /**
   * Converts a profile document into the public profile response shape.
   *
   * @param profile - Profile document from MongoDB.
   * @returns Serializable profile response.
   */
  private toProfileResponse(profile: UserProfileDocument) {
    return {
      id: profile.id,
      accountId: profile.accountId.toString(),
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      statusMessage: profile.statusMessage,
      onlineStatus: profile.onlineStatus,
      language: profile.language,
    };
  }
}
