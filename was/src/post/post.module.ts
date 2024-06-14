import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostEntity } from "./repository/entity/post.entity";
import { PostController } from "./controller/post.controller";
import { PostRepository } from "./repository/post.repository";
import { PostRepositoryImpl } from "./repository/post.repository.impl";
import { CreatePostService } from "./service/create-post.service";
import { PostServiceImpl } from "./service/post.service.impl";
import { MemberModule } from "../member/member.module";
import { GetMemberPostsService } from "./service/get-member-posts.service";
import { GetPostService } from "./service/get-post.service";
import { UpdatePostService } from "./service/update-post.service";
import { DeletePostService } from "./service/delete-post.service";

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity]), MemberModule],
  controllers: [PostController],
  providers: [
    { provide: PostRepository, useClass: PostRepositoryImpl },
    {
      provide: CreatePostService,
      useClass: PostServiceImpl,
    },
    { provide: GetPostService, useClass: PostServiceImpl },
    { provide: UpdatePostService, useClass: PostServiceImpl },
    { provide: DeletePostService, useClass: PostServiceImpl },
    { provide: GetMemberPostsService, useClass: PostServiceImpl },
  ],
})
export class PostModule {}
