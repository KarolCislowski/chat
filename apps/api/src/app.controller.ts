import { Controller, Get } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Connection } from "mongoose";
import { AppService } from "./app.service";

@ApiTags("health")
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get()
  @ApiOkResponse({ description: "API root response." })
  getRoot() {
    return this.appService.getRoot();
  }

  @Get("health")
  @ApiOkResponse({ description: "API and database health status." })
  getHealth() {
    return {
      status: "ok",
      database: this.connection.readyState === 1 ? "connected" : "disconnected",
    };
  }
}
