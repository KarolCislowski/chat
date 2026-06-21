import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomBytes } from "crypto";
import { Model, Types } from "mongoose";
import { UserProfile, UserProfileDocument } from "../users/schemas/user-profile.schema";
import { Guild, GuildDocument, GuildThemeColor } from "./schemas/guild.schema";
import { GuildJoinRequest, GuildJoinRequestDocument } from "./schemas/guild-join-request.schema";
import { GuildMembership, GuildMembershipDocument, GuildRole } from "./schemas/guild-membership.schema";

const MAX_GUILDS_PER_USER = 3;
const DEFAULT_GUILD_THEME_COLOR: GuildThemeColor = "red";
const DEFAULT_GUILD_EMBLEM_URL = "/assets/imgs/flags/red/crest_001_16_29_41_r1_c1.png";
const DEFAULT_GUILD_BACKGROUND_URL = "/assets/imgs/gbg/01_radiant_alpine_castle.png";

@Injectable()
export class GuildsService {
  constructor(
    @InjectModel(Guild.name) private readonly guildModel: Model<GuildDocument>,
    @InjectModel(GuildJoinRequest.name) private readonly joinRequestModel: Model<GuildJoinRequestDocument>,
    @InjectModel(GuildMembership.name) private readonly membershipModel: Model<GuildMembershipDocument>,
    @InjectModel(UserProfile.name) private readonly profileModel: Model<UserProfileDocument>,
  ) {}

  async createGuild(
    accountId: string,
    name: string,
    themeColor = DEFAULT_GUILD_THEME_COLOR,
    emblemUrl = DEFAULT_GUILD_EMBLEM_URL,
    backgroundUrl = DEFAULT_GUILD_BACKGROUND_URL,
  ) {
    await this.assertMembershipLimit(accountId);
    this.assertGuildAppearance(themeColor, emblemUrl, backgroundUrl);

    const guild = await this.guildModel.create({
      backgroundUrl,
      emblemUrl,
      inviteCodes: [this.createInviteCode()],
      members: [new Types.ObjectId(accountId)],
      name: name.trim(),
      ownerId: new Types.ObjectId(accountId),
      slug: await this.createUniqueSlug(name),
      themeColor,
    });

    const membership = await this.membershipModel.create({
      guildId: guild._id,
      role: "owner",
      userId: new Types.ObjectId(accountId),
    });

    return this.toGuildResponse(guild, membership.role);
  }

  async updateAppearance(accountId: string, guildId: string, themeColor: GuildThemeColor, emblemUrl: string, backgroundUrl: string) {
    const membership = await this.assertCanManageGuild(accountId, guildId);
    this.assertGuildAppearance(themeColor, emblemUrl, backgroundUrl);
    const guild = await this.guildModel.findByIdAndUpdate(guildId, { $set: { backgroundUrl, emblemUrl, themeColor } }, { new: true }).exec();

    if (!guild) {
      throw new NotFoundException("Guild was not found.");
    }

    const memberships = await this.membershipModel.find({ guildId }).sort({ joinedAt: 1 }).exec();

    return this.toGuildDetailsResponse(guild, membership.role, memberships);
  }

  async getMyGuilds(accountId: string) {
    const memberships = await this.membershipModel.find({ userId: accountId }).sort({ joinedAt: -1 }).exec();
    const guildIds = memberships.map((membership) => membership.guildId);
    const guilds = await this.guildModel.find({ _id: { $in: guildIds } }).exec();
    const guildsById = new Map(guilds.map((guild) => [guild.id, guild]));

    return memberships
      .map((membership) => {
        const guild = guildsById.get(membership.guildId.toString());
        return guild ? this.toGuildResponse(guild, membership.role) : null;
      })
      .filter((guild) => guild !== null);
  }

  async getGuildDetails(accountId: string, guildId: string) {
    if (!Types.ObjectId.isValid(guildId)) {
      throw new NotFoundException("Guild was not found.");
    }

    const [guild, requesterMembership, memberships] = await Promise.all([
      this.guildModel.findById(guildId).exec(),
      this.membershipModel.findOne({ guildId, userId: accountId }).exec(),
      this.membershipModel.find({ guildId }).sort({ joinedAt: 1 }).exec(),
    ]);

    if (!guild) {
      throw new NotFoundException("Guild was not found.");
    }

    if (!requesterMembership) {
      throw new ForbiddenException("You are not a member of this guild.");
    }

    return this.toGuildDetailsResponse(guild, requesterMembership.role, memberships);
  }

  async getGuildIdsForUser(accountId: string) {
    const memberships = await this.membershipModel.find({ userId: accountId }).select("guildId").exec();
    return memberships.map((membership) => membership.guildId.toString());
  }

  async assertGuildMembership(accountId: string, guildId: string) {
    if (!Types.ObjectId.isValid(guildId)) {
      throw new NotFoundException("Guild was not found.");
    }

    const membership = await this.membershipModel.exists({ guildId, userId: accountId });

    if (!membership) {
      throw new ForbiddenException("You are not a member of this guild.");
    }
  }

  async getAvailableGuilds(accountId: string) {
    const [memberships, pendingRequests] = await Promise.all([
      this.membershipModel.find({ userId: accountId }).exec(),
      this.joinRequestModel.find({ status: "pending", userId: accountId }).exec(),
    ]);
    const joinedGuildIds = new Set(memberships.map((membership) => membership.guildId.toString()));
    const pendingGuildIds = new Set(pendingRequests.map((request) => request.guildId.toString()));
    const guilds = await this.guildModel.find({ _id: { $nin: [...joinedGuildIds].map((guildId) => new Types.ObjectId(guildId)) } }).sort({ createdAt: -1 }).exec();

    return guilds.map((guild) => ({
      ...this.toGuildResponse(guild, null),
      joinRequestStatus: pendingGuildIds.has(guild.id) ? "pending" : null,
    }));
  }

  async joinGuild(accountId: string, inviteCode: string) {
    await this.assertMembershipLimit(accountId);

    const guild = await this.guildModel.findOne({ inviteCodes: inviteCode.trim() }).exec();

    if (!guild) {
      throw new NotFoundException("Guild invite code was not found.");
    }

    const existingMembership = await this.membershipModel.exists({ guildId: guild._id, userId: accountId });

    if (existingMembership) {
      throw new BadRequestException("You are already a member of this guild.");
    }

    const membership = await this.membershipModel.create({
      guildId: guild._id,
      role: "member",
      userId: new Types.ObjectId(accountId),
    });

    await this.guildModel.updateOne({ _id: guild._id }, { $addToSet: { members: new Types.ObjectId(accountId) } }).exec();

    guild.members = [...guild.members, new Types.ObjectId(accountId)];

    return this.toGuildResponse(guild, membership.role);
  }

  async createInvite(accountId: string, guildId: string) {
    if (!Types.ObjectId.isValid(guildId)) {
      throw new NotFoundException("Guild was not found.");
    }

    const membership = await this.membershipModel.findOne({ guildId, userId: accountId }).exec();

    if (!membership) {
      throw new ForbiddenException("You are not a member of this guild.");
    }

    if (!["owner", "officer"].includes(membership.role)) {
      throw new ForbiddenException("Only guild owners and officers can create invites.");
    }

    const inviteCode = this.createInviteCode();
    const guild = await this.guildModel
      .findByIdAndUpdate(guildId, { $push: { inviteCodes: inviteCode } }, { new: true })
      .exec();

    if (!guild) {
      throw new NotFoundException("Guild was not found.");
    }

    return {
      guild: this.toGuildResponse(guild, membership.role),
      inviteCode,
    };
  }

  async inviteMember(accountId: string, guildId: string, userId: string) {
    const membership = await this.assertCanManageGuild(accountId, guildId);

    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException("User was not found.");
    }

    if (accountId === userId) {
      throw new BadRequestException("You are already a member of this guild.");
    }

    const [guild, profile, existingMembership] = await Promise.all([
      this.guildModel.findById(guildId).exec(),
      this.profileModel.findOne({ accountId: userId }).exec(),
      this.membershipModel.exists({ guildId, userId }),
    ]);

    if (!guild) {
      throw new NotFoundException("Guild was not found.");
    }

    if (!profile) {
      throw new NotFoundException("User was not found.");
    }

    if (existingMembership) {
      throw new BadRequestException("User is already a member of this guild.");
    }

    await this.assertMembershipLimit(userId);

    await this.membershipModel.create({
      guildId: guild._id,
      role: "member",
      userId: new Types.ObjectId(userId),
    });
    await this.guildModel.updateOne({ _id: guild._id }, { $addToSet: { members: new Types.ObjectId(userId) } }).exec();

    guild.members = [...guild.members, new Types.ObjectId(userId)];

    return this.toGuildResponse(guild, membership.role);
  }

  async updateMemberRole(accountId: string, guildId: string, userId: string, role: Exclude<GuildRole, "owner">) {
    await this.assertGuildOwner(accountId, guildId);

    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException("User was not found.");
    }

    if (accountId === userId) {
      throw new BadRequestException("Guild owner role cannot be changed.");
    }

    const membership = await this.membershipModel.findOne({ guildId, userId }).exec();

    if (!membership) {
      throw new NotFoundException("Guild member was not found.");
    }

    if (membership.role === "owner") {
      throw new BadRequestException("Guild owner role cannot be changed.");
    }

    membership.role = role;
    await membership.save();

    return this.getGuildDetails(accountId, guildId);
  }

  async removeMember(accountId: string, guildId: string, userId: string) {
    await this.assertGuildOwner(accountId, guildId);

    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException("User was not found.");
    }

    if (accountId === userId) {
      throw new BadRequestException("Guild owner cannot be removed.");
    }

    const membership = await this.membershipModel.findOne({ guildId, userId }).exec();

    if (!membership) {
      throw new NotFoundException("Guild member was not found.");
    }

    if (membership.role === "owner") {
      throw new BadRequestException("Guild owner cannot be removed.");
    }

    await this.membershipModel.deleteOne({ _id: membership._id }).exec();
    await this.guildModel.updateOne({ _id: guildId }, { $pull: { members: new Types.ObjectId(userId) } }).exec();

    return this.getGuildDetails(accountId, guildId);
  }

  async requestJoin(accountId: string, guildId: string) {
    await this.assertMembershipLimit(accountId);

    if (!Types.ObjectId.isValid(guildId)) {
      throw new NotFoundException("Guild was not found.");
    }

    const guild = await this.guildModel.findById(guildId).exec();

    if (!guild) {
      throw new NotFoundException("Guild was not found.");
    }

    const existingMembership = await this.membershipModel.exists({ guildId, userId: accountId });

    if (existingMembership) {
      throw new BadRequestException("You are already a member of this guild.");
    }

    const existingPendingRequest = await this.joinRequestModel.exists({ guildId, status: "pending", userId: accountId });

    if (existingPendingRequest) {
      throw new BadRequestException("You already requested to join this guild.");
    }

    const request = await this.joinRequestModel.create({
      guildId: new Types.ObjectId(guildId),
      userId: new Types.ObjectId(accountId),
    });

    return this.toJoinRequestResponse(request);
  }

  async getJoinRequests(accountId: string, guildId: string) {
    await this.assertCanManageGuild(accountId, guildId);

    const requests = await this.joinRequestModel.find({ guildId, status: "pending" }).sort({ createdAt: 1 }).exec();
    const userIds = requests.map((request) => request.userId);
    const profiles = await this.profileModel.find({ accountId: { $in: userIds } }).exec();
    const profilesByAccountId = new Map(profiles.map((profile) => [profile.accountId.toString(), profile]));

    return requests.map((request) => this.toJoinRequestResponse(request, profilesByAccountId.get(request.userId.toString()) ?? null));
  }

  async acceptJoinRequest(accountId: string, guildId: string, requestId: string) {
    await this.assertCanManageGuild(accountId, guildId);

    if (!Types.ObjectId.isValid(requestId)) {
      throw new NotFoundException("Join request was not found.");
    }

    const request = await this.joinRequestModel.findOne({ _id: requestId, guildId, status: "pending" }).exec();

    if (!request) {
      throw new NotFoundException("Join request was not found.");
    }

    await this.assertMembershipLimit(request.userId.toString());

    const existingMembership = await this.membershipModel.exists({ guildId, userId: request.userId });

    if (!existingMembership) {
      await this.membershipModel.create({
        guildId: request.guildId,
        role: "member",
        userId: request.userId,
      });
      await this.guildModel.updateOne({ _id: guildId }, { $addToSet: { members: request.userId } }).exec();
    }

    request.status = "accepted";
    request.decidedAt = new Date();
    request.decidedBy = new Types.ObjectId(accountId);
    await request.save();

    return this.toJoinRequestResponse(request);
  }

  private async assertMembershipLimit(accountId: string) {
    const membershipCount = await this.membershipModel.countDocuments({ userId: accountId }).exec();

    if (membershipCount >= MAX_GUILDS_PER_USER) {
      throw new BadRequestException(`A user can belong to at most ${MAX_GUILDS_PER_USER} guilds.`);
    }
  }

  private async assertCanManageGuild(accountId: string, guildId: string) {
    if (!Types.ObjectId.isValid(guildId)) {
      throw new NotFoundException("Guild was not found.");
    }

    const membership = await this.membershipModel.findOne({ guildId, userId: accountId }).exec();

    if (!membership) {
      throw new ForbiddenException("You are not a member of this guild.");
    }

    if (!["owner", "officer"].includes(membership.role)) {
      throw new ForbiddenException("Only guild owners and officers can manage join requests.");
    }

    return membership;
  }

  private async assertGuildOwner(accountId: string, guildId: string) {
    if (!Types.ObjectId.isValid(guildId)) {
      throw new NotFoundException("Guild was not found.");
    }

    const membership = await this.membershipModel.findOne({ guildId, userId: accountId }).exec();

    if (!membership) {
      throw new ForbiddenException("You are not a member of this guild.");
    }

    if (membership.role !== "owner") {
      throw new ForbiddenException("Only guild owners can manage member roles.");
    }

    return membership;
  }

  private async createUniqueSlug(name: string) {
    const baseSlug = this.slugify(name);
    let slug = baseSlug;
    let suffix = 2;

    while (await this.guildModel.exists({ slug })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private slugify(name: string) {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || `guild-${randomBytes(3).toString("hex")}`;
  }

  private createInviteCode() {
    return randomBytes(8).toString("hex");
  }

  private assertGuildAppearance(themeColor: GuildThemeColor, emblemUrl: string, backgroundUrl: string) {
    if (!emblemUrl.startsWith(`/assets/imgs/flags/${themeColor}/`)) {
      throw new BadRequestException("Guild emblem must belong to the selected theme color.");
    }

    if (!backgroundUrl.startsWith("/assets/imgs/gbg/")) {
      throw new BadRequestException("Guild background must belong to the available background set.");
    }
  }

  private toGuildResponse(guild: GuildDocument, role: GuildMembershipDocument["role"] | null) {
    return {
      _id: guild.id,
      name: guild.name,
      slug: guild.slug,
      ownerId: guild.ownerId.toString(),
      members: guild.members.map((memberId) => memberId.toString()),
      inviteCodes: guild.inviteCodes,
      themeColor: guild.themeColor ?? DEFAULT_GUILD_THEME_COLOR,
      emblemUrl: guild.emblemUrl ?? DEFAULT_GUILD_EMBLEM_URL,
      backgroundUrl: guild.backgroundUrl ?? DEFAULT_GUILD_BACKGROUND_URL,
      createdAt: guild.createdAt,
      membership: {
        role,
      },
    };
  }

  private async toGuildDetailsResponse(guild: GuildDocument, role: GuildMembershipDocument["role"], memberships: GuildMembershipDocument[]) {
    const accountIds = memberships.map((membership) => membership.userId);
    const profiles = await this.profileModel.find({ accountId: { $in: accountIds } }).exec();
    const profilesByAccountId = new Map(profiles.map((profile) => [profile.accountId.toString(), profile]));

    return {
      ...this.toGuildResponse(guild, role),
      memberProfiles: memberships.map((membership) => {
        const profile = profilesByAccountId.get(membership.userId.toString());

        return {
          userId: membership.userId.toString(),
          role: membership.role,
          joinedAt: membership.joinedAt,
          user: profile
            ? {
                id: profile.accountId.toString(),
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
                onlineStatus: profile.onlineStatus,
                statusMessage: profile.statusMessage,
              }
            : null,
        };
      }),
    };
  }

  private toJoinRequestResponse(request: GuildJoinRequestDocument, profile?: UserProfileDocument | null) {
    return {
      _id: request.id,
      guildId: request.guildId.toString(),
      userId: request.userId.toString(),
      status: request.status,
      createdAt: request.createdAt,
      decidedAt: request.decidedAt,
      decidedBy: request.decidedBy?.toString() ?? null,
      user: profile
        ? {
            id: profile.accountId.toString(),
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
          }
        : null,
    };
  }
}
