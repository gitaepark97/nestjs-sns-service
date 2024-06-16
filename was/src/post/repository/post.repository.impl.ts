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

  async savePost(post: Post): Promise<void> {
    await this.postEntityRepository.save({
      id: post.id,
      creatorId: post.creatorId,
      content: post.content,
    });
  }

  async findPostById(id: number): Promise<Post | null> {
    const postEntity = await this.postEntityRepository.findOne({
      where: { id },
    });
    return postEntity && Post.fromEntity(postEntity);
  }

  async deletePost(id: number): Promise<void> {
    const result = await this.postEntityRepository.softDelete({
      id,
      deletedAt: IsNull(),
    });
    if (!result.affected)
      throw new NotFoundException("존재하지 않는 게시글입니다.");
  }

  findPostsByMemberId(memberId: number, pageSize: number): Promise<Post[]> {
    return this.findPostsWithOption({
      where: { creatorId: memberId },
      take: pageSize,
    });
  }

  findPostsWithCursorByMemberId(
    memberId: number,
    pageSize: number,
    cursor: number,
  ): Promise<Post[]> {
    return this.findPostsWithOption({
      where: { creatorId: memberId, id: LessThan(cursor) },
      take: pageSize,
    });
  }

  countPostsByMemberId(memberId: number): Promise<number> {
    return this.postEntityRepository.count({ where: { creatorId: memberId } });
  }

  private async findPostsWithOption(options: FindManyOptions<PostEntity>) {
    const postEntities = await this.postEntityRepository.find({
      order: { id: -1 },
      ...options,
    });
    return postEntities.map((entity) => Post.fromEntity(entity));
  }
}
