import { Controller, Get } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get()
  getRoot() {
    return this.appService.getRoot();
  }

  @Get("health")
  getHealth() {
    return {
      status: "ok",
      database: this.connection.readyState === 1 ? "connected" : "disconnected",
    };
  }
}
