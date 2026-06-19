import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AuthenticatedRequest } from "../auth/types/authenticated-request";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  async getMe(@Req() request: AuthenticatedRequest) {
    const { account, profile } = await this.usersService.getAccountWithProfile(request.user.accountId);

    return {
      account: {
        id: account.id,
        email: account.email,
        role: account.role,
        createdAt: account.createdAt,
      },
      profile: {
        id: profile.id,
        accountId: profile.accountId.toString(),
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        statusMessage: profile.statusMessage,
        onlineStatus: profile.onlineStatus,
      },
    };
  }

  @Patch("me/profile")
  updateMyProfile(@Req() request: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(request.user.accountId, dto);
  }
}
