import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { CommonModule } from "./common/common.module";
import { MemberModule } from "./member/member.module";
import { PostModule } from "./post/post.module";
import { FollowModule } from './follow/follow.module';

@Module({
  imports: [ConfigModule, CommonModule, MemberModule, PostModule, FollowModule],
})
export class AppModule {}
