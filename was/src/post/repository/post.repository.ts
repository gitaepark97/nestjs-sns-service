import { Post } from "../domain/post";

export abstract class PostRepository {
  abstract savePost(post: Post): Promise<void>;

  abstract findPostById(id: number): Promise<Post | null>;

  abstract deletePost(post: Post): Promise<void>;

  abstract findPostsByMemberId(
    memberId: number,
    pageSize: number,
  ): Promise<Post[]>;

  abstract findPostsByMemberIdWithCursor(
    memberId: number,
    pageSize: number,
    cursor: number,
  ): Promise<Post[]>;

  abstract findPostsByMemberIds(
    memberIds: number[],
    pageSize: number,
  ): Promise<Post[]>;

  abstract findPostsByMemberIdsWithCursor(
    memberIds: number[],
    pageSize: number,
    cursor: number,
  ): Promise<Post[]>;
}
