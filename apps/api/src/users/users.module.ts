import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UserAccount, UserAccountSchema } from "./schemas/user-account.schema";
import { UserProfile, UserProfileSchema } from "./schemas/user-profile.schema";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET", "dev-only-change-me"),
      }),
    }),
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
    ]),
  ],
  controllers: [UsersController],
  exports: [UsersService],
  providers: [JwtAuthGuard, UsersService],
})
export class UsersModule {}
