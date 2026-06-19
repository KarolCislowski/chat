import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { UserProfile, UserProfileSchema } from "../users/schemas/user-profile.schema";
import { GuildJoinRequest, GuildJoinRequestSchema } from "./schemas/guild-join-request.schema";
import { GuildMembership, GuildMembershipSchema } from "./schemas/guild-membership.schema";
import { Guild, GuildSchema } from "./schemas/guild.schema";
import { GuildsController } from "./guilds.controller";
import { GuildsService } from "./guilds.service";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Guild.name, schema: GuildSchema },
      { name: GuildJoinRequest.name, schema: GuildJoinRequestSchema },
      { name: GuildMembership.name, schema: GuildMembershipSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
    ]),
  ],
  controllers: [GuildsController],
  providers: [GuildsService],
})
export class GuildsModule {}
