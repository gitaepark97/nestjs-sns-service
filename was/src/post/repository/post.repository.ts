import { Post } from "../domain/post";

export abstract class PostRepository {
  abstract savePost(post: Post): Promise<void>;

  abstract findPostById(id: number): Promise<Post | null>;

  abstract deletePost(post: Post): Promise<void>;

  abstract findPostsByMemberId(
    memberId: number,
    pageSize: number,
  ): Promise<Post[]>;

  abstract findPostsWithCursorByMemberId(
    memberId: number,
    pageSize: number,
    cursor: number,
  ): Promise<Post[]>;

  abstract countPostsByMemberId(memberId: number): Promise<number>;
}
