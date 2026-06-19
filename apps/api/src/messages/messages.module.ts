import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { UserProfile, UserProfileSchema } from "../users/schemas/user-profile.schema";
import { UsersModule } from "../users/users.module";
import { Message, MessageSchema } from "./schemas/message.schema";
import { MessagesController } from "./messages.controller";
import { MessagesGateway } from "./messages.gateway";
import { MessagesService } from "./messages.service";

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET", "dev-only-change-me"),
      }),
    }),
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
    ]),
  ],
  controllers: [MessagesController],
  providers: [MessagesGateway, MessagesService],
})
export class MessagesModule {}
