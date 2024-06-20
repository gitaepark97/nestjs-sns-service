import { Module } from "@nestjs/common";
import { FollowService } from "./service/follow.service";
import { FollowServiceImpl } from "./service/follow.service.impl";
import { UnfollowService } from "./service/unfollow.service";
import { GetFollowingService } from "./service/get-following.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FollowEntity } from "./repository/entity/follow.entity";
import { MemberModule } from "../member/member.module";
import { FollowRepository } from "./repository/follow.repository";
import { FollowRepositoryImpl } from "./repository/follow.repository.impl";
import { FollowController } from "./controller/follow.controller";

@Module({
  imports: [TypeOrmModule.forFeature([FollowEntity]), MemberModule],
  controllers: [FollowController],
  providers: [
    { provide: FollowRepository, useClass: FollowRepositoryImpl },
    { provide: FollowService, useClass: FollowServiceImpl },
    {
      provide: UnfollowService,
      useClass: FollowServiceImpl,
    },
    { provide: GetFollowingService, useClass: FollowServiceImpl },
  ],
})
export class FollowModule {}
