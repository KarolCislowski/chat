import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserAccountDocument } from "../users/schemas/user-account.schema";
import { UserProfileDocument } from "../users/schemas/user-profile.schema";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";

/** Access and refresh token pair issued after auth operations. */
type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
/** Handles credential validation, token issuing, refresh rotation, and logout. */
export class AuthService {
  private readonly accessTokenTtl: JwtSignOptions["expiresIn"];
  private readonly bcryptRounds: number;
  private readonly refreshTokenTtl: JwtSignOptions["expiresIn"];

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {
    this.accessTokenTtl = this.configService.get<string>("JWT_ACCESS_TOKEN_TTL", "15m") as JwtSignOptions["expiresIn"];
    this.bcryptRounds = Number(this.configService.get<string | number>("BCRYPT_ROUNDS", 12));
    this.refreshTokenTtl = this.configService.get<string>("JWT_REFRESH_TOKEN_TTL", "7d") as JwtSignOptions["expiresIn"];
  }

  /**
   * Creates a user account and returns an authenticated session.
   *
   * @param dto - Registration payload with email, password, and display name.
   * @returns Auth response containing account, profile, and token pair.
   */
  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);
    const { account, profile } = await this.usersService.createAccount({
      displayName: dto.displayName,
      email: dto.email,
      passwordHash,
    });

    const tokens = await this.issueTokens(account);
    await this.usersService.addRefreshToken(account.id, await bcrypt.hash(tokens.refreshToken, this.bcryptRounds));

    return this.toAuthResponse(account, profile, tokens);
  }

  /**
   * Validates credentials and returns a new authenticated session.
   *
   * @param dto - Login payload with email and password.
   * @returns Auth response containing account, profile, and token pair.
   */
  async login(dto: LoginDto) {
    const account = await this.usersService.findAccountByEmail(dto.email);

    if (!account) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, account.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const profile = await this.usersService.findProfileByAccountId(account.id);

    if (!profile) {
      throw new UnauthorizedException("User profile does not exist.");
    }

    const tokens = await this.issueTokens(account);
    await this.usersService.addRefreshToken(account.id, await bcrypt.hash(tokens.refreshToken, this.bcryptRounds));

    return this.toAuthResponse(account, profile, tokens);
  }

  /**
   * Rotates a valid refresh token and issues a fresh token pair.
   *
   * @param dto - Refresh payload containing the current refresh token.
   * @returns Auth response containing account, profile, and rotated token pair.
   */
  async refresh(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const { account, profile } = await this.usersService.getAccountWithProfile(payload.sub);
    const matchingTokenHash = await this.findMatchingRefreshTokenHash(account.refreshTokens, dto.refreshToken);

    if (!matchingTokenHash) {
      throw new UnauthorizedException("Refresh token was revoked.");
    }

    const tokens = await this.issueTokens(account);
    const nextRefreshTokenHash = await bcrypt.hash(tokens.refreshToken, this.bcryptRounds);
    const remainingTokenHashes = account.refreshTokens.filter((tokenHash) => tokenHash !== matchingTokenHash);

    await this.usersService.replaceRefreshTokens(account.id, [...remainingTokenHashes, nextRefreshTokenHash]);

    return this.toAuthResponse(account, profile, tokens);
  }

  /**
   * Revokes all refresh tokens for an account.
   *
   * @param accountId - Account being logged out.
   * @returns Status object confirming logout.
   */
  async logout(accountId: string) {
    await this.usersService.replaceRefreshTokens(accountId, []);
    return { status: "ok" };
  }

  /**
   * Signs a new access and refresh token pair for an account.
   *
   * @param account - Account document to encode into token claims.
   * @returns Signed access and refresh tokens.
   */
  private async issueTokens(account: UserAccountDocument): Promise<TokenPair> {
    const payload = {
      email: account.email,
      role: account.role,
      sub: account.id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: this.accessTokenTtl }),
      this.jwtService.signAsync(payload, { expiresIn: this.refreshTokenTtl }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Verifies a refresh token and normalizes token errors to UnauthorizedException.
   *
   * @param refreshToken - Raw refresh token from the client.
   * @returns Verified token payload containing the account subject.
   */
  private async verifyRefreshToken(refreshToken: string) {
    try {
      return await this.jwtService.verifyAsync<{ sub: string }>(refreshToken);
    } catch {
      throw new UnauthorizedException("Invalid refresh token.");
    }
  }

  /**
   * Finds the stored bcrypt hash that matches a presented refresh token.
   *
   * @param refreshTokenHashes - Stored refresh token hashes for the account.
   * @param refreshToken - Raw refresh token presented by the client.
   * @returns Matching hash, or null when the token was revoked or unknown.
   */
  private async findMatchingRefreshTokenHash(refreshTokenHashes: string[], refreshToken: string) {
    for (const refreshTokenHash of refreshTokenHashes) {
      if (await bcrypt.compare(refreshToken, refreshTokenHash)) {
        return refreshTokenHash;
      }
    }

    return null;
  }

  /**
   * Converts persisted account and profile documents into the auth response shape.
   *
   * @param account - Authenticated account document.
   * @param profile - Profile document attached to the account.
   * @param tokens - Token pair issued for this response.
   * @returns Serializable auth response consumed by the web app.
   */
  private toAuthResponse(account: UserAccountDocument, profile: UserProfileDocument, tokens: TokenPair) {
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
        language: profile.language,
      },
      tokens,
    };
  }
}
