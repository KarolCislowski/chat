import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthenticatedRequest } from "../auth/types/authenticated-request";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UserAccountDocument } from "./schemas/user-account.schema";
import { UserProfileDocument } from "./schemas/user-profile.schema";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  async getMe(@Req() request: AuthenticatedRequest) {
    const { account, profile } = await this.usersService.getAccountWithProfile(request.user.accountId);

    return {
      account: this.toAccountResponse(account),
      profile: this.toProfileResponse(profile),
    };
  }

  @Patch("me/profile")
  async updateMyProfile(@Req() request: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    const profile = await this.usersService.updateProfile(request.user.accountId, dto);

    return this.toProfileResponse(profile);
  }

  private toAccountResponse(account: UserAccountDocument) {
    return {
      id: account.id,
      email: account.email,
      role: account.role,
      createdAt: account.createdAt,
    };
  }

  @Get()
  async listUsers(@Req() request: AuthenticatedRequest) {
    const profiles = await this.usersService.listProfiles(request.user.accountId);

    return profiles.map((profile) => this.toProfileResponse(profile));
  }

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
