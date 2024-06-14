export abstract class DeletePostService {
  abstract deletePost(postId: number, memberId: number): Promise<void>;
}
