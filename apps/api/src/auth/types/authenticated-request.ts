import { Request } from "express";
import { UserRole } from "../../users/schemas/user-account.schema";

export type AuthenticatedUser = {
  accountId: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
