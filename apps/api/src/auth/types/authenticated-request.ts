import { Request } from "express";
import { UserRole } from "../../users/schemas/user-account.schema";

/** User identity injected by JwtAuthGuard after token verification. */
export type AuthenticatedUser = {
  accountId: string;
  email: string;
  role: UserRole;
};

/** Express request shape available to authenticated controllers. */
export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
