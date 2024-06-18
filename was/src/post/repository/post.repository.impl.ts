import { Injectable, NotFoundException } from "@nestjs/common";
import { PostRepository } from "./post.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { PostEntity } from "./entity/post.entity";
import { FindManyOptions, IsNull, LessThan, Repository } from "typeorm";
import { Post } from "../domain/post";

@Injectable()
export class PostRepositoryImpl implements PostRepository {
  constructor(
    @InjectRepository(PostEntity)
    private readonly postEntityRepository: Repository<PostEntity>,
  ) {}

  savePost = (post: Post): Promise<void> =>
    this.postEntityRepository
      .save({
        id: post.id,
        creatorId: post.creatorId,
        content: post.content,
      })
      .then();

  findPostById = (id: number): Promise<Post | null> =>
    this.postEntityRepository
      .findOne({ where: { id } })
      .then((entity) => entity && Post.fromEntity(entity));

  deletePost = (post: Post): Promise<void> =>
    this.postEntityRepository
      .softDelete({
        id: post.id,
        deletedAt: IsNull(),
      })
      .then((result) => {
        if (result.affected === 0)
          throw new NotFoundException("존재하지 않는 게시글입니다.");
      });

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
    this.postEntityRepository
      .find({
        order: { id: -1 },
        ...options,
      })
      .then((entities) => entities.map(Post.fromEntity));
}
