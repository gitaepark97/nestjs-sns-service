export abstract class DeletePostService {
  abstract deletePost(memberId: number, postId: number): Promise<void>;
}
