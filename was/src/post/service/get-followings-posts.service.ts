import { Post } from "../domain/post";

export abstract class GetFollowingMembersPostsService {
  abstract getFollowingMembersPosts(
    memberId: number,
    pageSize: number,
    cursor: number | undefined,
  ): Promise<{ posts: Post[] }>;
}
