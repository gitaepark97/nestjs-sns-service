import { CreatePostCommand } from "./command/create-post.command";

export abstract class CreatePostService {
  abstract createPost(command: CreatePostCommand): Promise<void>;
}
