import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { AuthenticatedUser } from "./types/authenticated-request";

/** JWT payload expected in HTTP bearer access tokens. */
type AccessTokenPayload = AuthenticatedUser & {
  sub: string;
};

@Injectable()
/** Verifies bearer access tokens and attaches AuthenticatedUser to the request. */
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Validates the incoming HTTP request and injects the authenticated user.
   *
   * @param context - Nest execution context for the protected route.
   * @returns True when the request has a valid bearer token.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("Missing bearer token.");
    }

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      request.user = {
        accountId: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException("Invalid bearer token.");
    }
  }

  /**
   * Extracts a bearer token from the Authorization header.
   *
   * @param request - Incoming Express request.
   * @returns Access token string when present.
   */
  private extractToken(request: Request) {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
