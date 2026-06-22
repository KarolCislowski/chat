import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthenticatedRequest } from "./types/authenticated-request";

@Controller("auth")
/** HTTP controller for registration, login, token refresh, and logout. */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Creates a new account and authenticated session.
   *
   * @param dto - Registration payload.
   * @returns Auth response from AuthService.
   */
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Authenticates an existing account.
   *
   * @param dto - Login payload.
   * @returns Auth response from AuthService.
   */
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Rotates a refresh token and returns a new session.
   *
   * @param dto - Refresh-token payload.
   * @returns Auth response from AuthService.
   */
  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  /**
   * Revokes refresh tokens for the authenticated account.
   *
   * @param request - Authenticated request containing the current account ID.
   * @returns Logout status from AuthService.
   */
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  logout(@Req() request: AuthenticatedRequest) {
    return this.authService.logout(request.user.accountId);
  }
}
