import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { CommonModule } from "./common/common.module";
import { MemberModule } from "./member/member.module";

@Module({
  imports: [ConfigModule, CommonModule, MemberModule],
})
export class AppModule {}
