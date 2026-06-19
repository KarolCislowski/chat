import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UserAccount, UserAccountDocument, UserRole } from "./schemas/user-account.schema";
import { OnlineStatus, UserProfile, UserProfileDocument } from "./schemas/user-profile.schema";

type CreateAccountInput = {
  displayName: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
};

type AccountWithProfile = {
  account: UserAccountDocument;
  profile: UserProfileDocument;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserAccount.name) private readonly accountModel: Model<UserAccountDocument>,
    @InjectModel(UserProfile.name) private readonly profileModel: Model<UserProfileDocument>,
  ) {}

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

  async findAccountByEmail(email: string) {
    return this.accountModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findAccountById(accountId: string) {
    if (!Types.ObjectId.isValid(accountId)) {
      return null;
    }

    return this.accountModel.findById(accountId).exec();
  }

  async findProfileByAccountId(accountId: string) {
    if (!Types.ObjectId.isValid(accountId)) {
      return null;
    }

    return this.profileModel.findOne({ accountId }).exec();
  }

  async getAccountWithProfile(accountId: string): Promise<AccountWithProfile> {
    const [account, profile] = await Promise.all([this.findAccountById(accountId), this.findProfileByAccountId(accountId)]);

    if (!account || !profile) {
      throw new NotFoundException("User account or profile was not found.");
    }

    return { account, profile };
  }

  async updateProfile(accountId: string, dto: UpdateProfileDto) {
    const profile = await this.profileModel
      .findOneAndUpdate({ accountId }, { $set: dto }, { new: true, runValidators: true })
      .exec();

    if (!profile) {
      throw new NotFoundException("User profile was not found.");
    }

    return profile;
  }

  async updateOnlineStatus(accountId: string, onlineStatus: OnlineStatus) {
    const profile = await this.profileModel.findOneAndUpdate({ accountId }, { $set: { onlineStatus } }, { new: true }).exec();

    if (!profile) {
      throw new NotFoundException("User profile was not found.");
    }

    return profile;
  }

  async replaceRefreshTokens(accountId: string, refreshTokenHashes: string[]) {
    await this.accountModel.updateOne({ _id: accountId }, { $set: { refreshTokens: refreshTokenHashes } }).exec();
  }

  async addRefreshToken(accountId: string, refreshTokenHash: string) {
    await this.accountModel.updateOne({ _id: accountId }, { $push: { refreshTokens: refreshTokenHash } }).exec();
  }
}
