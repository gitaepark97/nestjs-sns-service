import { Injectable, NotFoundException } from "@nestjs/common";
import { PostRepository } from "./post.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { PostEntity } from "./entity/post.entity";
import { FindManyOptions, IsNull, LessThan, Repository } from "typeorm";
import { Post } from "../domain/post";
import { map, noop, pipe, throwIf, toArray } from "@fxts/core";

@Injectable()
export class PostRepositoryImpl implements PostRepository {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postEntityRepository: Repository<PostEntity>,
  ) {}

  savePost = (post: Post): Promise<void> =>
    pipe(
      this.postEntityRepository.save({
        id: post.id,
        creatorId: post.creatorId,
        content: post.content,
      }),
      noop,
    );

  findPostById = (id: number): Promise<Post | null> =>
    pipe(
      this.postEntityRepository.findOne({ where: { id } }),
      (entity) => entity && Post.fromEntity(entity),
    );

  deletePost = (post: Post): Promise<void> =>
    pipe(
      this.postEntityRepository.softDelete({
        id: post.id,
        deletedAt: IsNull(),
      }),
      throwIf(
        (result) => !result.affected,
        () => new NotFoundException("존재하지 않는 게시글입니다."),
      ),
      noop,
    );

  findPostsByMemberId = (memberId: number, pageSize: number): Promise<Post[]> =>
    this.findPostsWithOption({
      where: { creatorId: memberId },
      take: pageSize,
    });

  findPostsWithCursorByMemberId = (
    memberId: number,
    pageSize: number,
    cursor: number,
  ): Promise<Post[]> =>
    this.findPostsWithOption({
      where: { creatorId: memberId, id: LessThan(cursor) },
      take: pageSize,
    });

  countPostsByMemberId = (memberId: number): Promise<number> =>
    this.postEntityRepository.count({ where: { creatorId: memberId } });

  private findPostsWithOption = (options: FindManyOptions<PostEntity>) =>
    pipe(
      this.postEntityRepository.find({
        order: { id: -1 },
        ...options,
      }),
      map(Post.fromEntity),
      toArray,
    );
}
