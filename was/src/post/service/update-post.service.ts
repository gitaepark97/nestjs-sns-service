import { UpdatePostCommand } from "./command/update-post.command";

export abstract class UpdatePostService {
  abstract updatePost(command: UpdatePostCommand): Promise<void>;
}
