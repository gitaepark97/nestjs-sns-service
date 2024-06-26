import { Post } from "../domain/post";

export abstract class GetMemberPostsService {
  abstract getMemberPosts(
    memberId: number,
    pageSize: number,
    cursor?: number,
  ): Promise<{ posts: Post[] }>;
}
