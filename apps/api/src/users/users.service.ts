import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UserAccount, UserAccountDocument, UserRole } from "./schemas/user-account.schema";
import { OnlineStatus, UserProfile, UserProfileDocument } from "./schemas/user-profile.schema";

/** Input accepted by the user creation workflow after password hashing. */
type CreateAccountInput = {
  displayName: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
};

/** Pair of account and profile documents returned by account lookup workflows. */
type AccountWithProfile = {
  account: UserAccountDocument;
  profile: UserProfileDocument;
};

@Injectable()
/** Owns account/profile persistence and profile-facing user queries. */
export class UsersService {
  constructor(
    @InjectModel(UserAccount.name) private readonly accountModel: Model<UserAccountDocument>,
    @InjectModel(UserProfile.name) private readonly profileModel: Model<UserProfileDocument>,
  ) {}

  /**
   * Creates a normalized account and its initial public profile.
   *
   * @param input - Account data including a pre-hashed password.
   * @returns Newly created account and profile documents.
   */
  async createAccount(input: CreateAccountInput): Promise<AccountWithProfile> {
    const normalizedEmail = input.email.toLowerCase().trim();
    const existingAccount = await this.accountModel.exists({ email: normalizedEmail });

    if (existingAccount) {
      throw new ConflictException("Account with this email already exists.");
    }

    const account = await this.accountModel.create({
      email: normalizedEmail,
      passwordHash: input.passwordHash,
      role: input.role ?? "user",
    });

    const profile = await this.profileModel.create({
      accountId: account._id,
      displayName: input.displayName,
    });

    return { account, profile };
  }

  /**
   * Finds an account by normalized email.
   *
   * @param email - Email address to look up.
   * @returns Account document or null.
   */
  async findAccountByEmail(email: string) {
    return this.accountModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  /**
   * Finds an account by Mongo ObjectId string.
   *
   * @param accountId - Account ID to look up.
   * @returns Account document, or null when the ID is invalid or missing.
   */
  async findAccountById(accountId: string) {
    if (!Types.ObjectId.isValid(accountId)) {
      return null;
    }

    return this.accountModel.findById(accountId).exec();
  }

  /**
   * Finds a profile by account ID.
   *
   * @param accountId - Account ID attached to the profile.
   * @returns Profile document, or null when the ID is invalid or missing.
   */
  async findProfileByAccountId(accountId: string) {
    if (!Types.ObjectId.isValid(accountId)) {
      return null;
    }

    return this.profileModel.findOne({ accountId }).exec();
  }

  /**
   * Lists all profiles except the current account's own profile.
   *
   * @param accountId - Account ID to exclude from the list.
   * @returns Profiles sorted by display name.
   */
  async listProfiles(accountId: string) {
    return this.profileModel.find({ accountId: { $ne: new Types.ObjectId(accountId) } }).sort({ displayName: 1 }).exec();
  }

  /**
   * Loads a profile by account ID or throws when it does not exist.
   *
   * @param accountId - Account ID attached to the profile.
   * @returns Profile document.
   */
  async getProfileByAccountId(accountId: string) {
    const profile = await this.findProfileByAccountId(accountId);

    if (!profile) {
      throw new NotFoundException("User profile was not found.");
    }

    return profile;
  }

  /**
   * Loads an account and profile pair or throws when either side is missing.
   *
   * @param accountId - Account ID to load.
   * @returns Account and profile documents.
   */
  async getAccountWithProfile(accountId: string): Promise<AccountWithProfile> {
    const [account, profile] = await Promise.all([this.findAccountById(accountId), this.findProfileByAccountId(accountId)]);

    if (!account || !profile) {
      throw new NotFoundException("User account or profile was not found.");
    }

    return { account, profile };
  }

  /**
   * Updates mutable profile fields for an account.
   *
   * @param accountId - Account whose profile should be updated.
   * @param dto - Validated partial profile payload.
   * @returns Updated profile document.
   */
  async updateProfile(accountId: string, dto: UpdateProfileDto) {
    const profile = await this.profileModel
      .findOneAndUpdate({ accountId }, { $set: dto }, { new: true, runValidators: true })
      .exec();

    if (!profile) {
      throw new NotFoundException("User profile was not found.");
    }

    return profile;
  }

  /**
   * Updates realtime presence state for an account profile.
   *
   * @param accountId - Account whose presence changed.
   * @param onlineStatus - New presence status.
   * @returns Updated profile document.
   */
  async updateOnlineStatus(accountId: string, onlineStatus: OnlineStatus) {
    const profile = await this.profileModel.findOneAndUpdate({ accountId }, { $set: { onlineStatus } }, { new: true }).exec();

    if (!profile) {
      throw new NotFoundException("User profile was not found.");
    }

    return profile;
  }

  /**
   * Replaces all stored refresh token hashes for an account.
   *
   * @param accountId - Account whose refresh token list should be replaced.
   * @param refreshTokenHashes - Next complete hash list.
   * @returns A promise that resolves after persistence.
   */
  async replaceRefreshTokens(accountId: string, refreshTokenHashes: string[]) {
    await this.accountModel.updateOne({ _id: accountId }, { $set: { refreshTokens: refreshTokenHashes } }).exec();
  }

  /**
   * Appends one refresh token hash to an account.
   *
   * @param accountId - Account receiving the refresh token hash.
   * @param refreshTokenHash - Bcrypt hash of the raw refresh token.
   * @returns A promise that resolves after persistence.
   */
  async addRefreshToken(accountId: string, refreshTokenHash: string) {
    await this.accountModel.updateOne({ _id: accountId }, { $push: { refreshTokens: refreshTokenHash } }).exec();
  }
}
