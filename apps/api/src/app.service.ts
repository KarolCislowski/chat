import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getRoot() {
    return {
      name: "chat-api",
      status: "ok",
    };
  }
}
