import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, In, IsNull, LessThan, Repository } from "typeorm";
import { Post } from "../domain/post";
import { PostEntity } from "./entity/post.entity";
import { PostRepository } from "./post.repository";

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
    const entity = await this.postEntityRepository.findOne({ where: { id } });
    return entity && Post.fromEntity(entity);
  }

  async deletePost(post: Post): Promise<void> {
    const result = await this.postEntityRepository.softDelete({
      id: post.id,
      deletedAt: IsNull(),
    });
    if (result.affected === 0)
      throw new NotFoundException("존재하지 않는 게시글입니다.");
  }

  findPostsByMemberId(memberId: number, pageSize: number): Promise<Post[]> {
    return this.findPostsWithOption({
      where: { creatorId: memberId },
      take: pageSize,
    });
  }

  findPostsByMemberIdWithCursor(
    memberId: number,
    pageSize: number,
    cursor: number,
  ): Promise<Post[]> {
    return this.findPostsWithOption({
      where: {
        creatorId: memberId,
        id: LessThan(cursor),
      },

      take: pageSize,
    });
  }

  findPostsByMemberIds(memberIds: number[], pageSize: number): Promise<Post[]> {
    return this.findPostsWithOption({
      where: { creatorId: In(memberIds) },
      take: pageSize,
    });
  }

  findPostsByMemberIdsWithCursor(
    memberIds: number[],
    pageSize: number,
    cursor: number,
  ): Promise<Post[]> {
    return this.findPostsWithOption({
      where: {
        creatorId: In(memberIds),
        id: LessThan(cursor),
      },

      take: pageSize,
    });
  }

  private async findPostsWithOption(options: FindManyOptions<PostEntity>) {
    const entities = await this.postEntityRepository.find({
      order: { id: -1 },
      ...options,
    });
    return entities.map(Post.fromEntity);
  }
}
