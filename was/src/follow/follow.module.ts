import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MemberModule } from "../member/member.module";
import { FollowController } from "./controller/follow.controller";
import { FollowEntity } from "./repository/entity/follow.entity";
import { FollowRepository } from "./repository/follow.repository";
import { FollowRepositoryImpl } from "./repository/follow.repository.impl";
import { FollowService } from "./service/follow.service";
import { FollowServiceImpl } from "./service/follow.service.impl";
import { GetFollowingIdsService } from "./service/get-following.service";
import { UnfollowService } from "./service/unfollow.service";

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
    { provide: GetFollowingIdsService, useClass: FollowServiceImpl },
  ],
  exports: [GetFollowingIdsService],
})
export class FollowModule {}
