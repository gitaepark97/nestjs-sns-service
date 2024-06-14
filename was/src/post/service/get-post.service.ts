import { Post } from "../domain/post";

export abstract class GetPostService {
  abstract getPost(postId: number): Promise<Post>;
}
