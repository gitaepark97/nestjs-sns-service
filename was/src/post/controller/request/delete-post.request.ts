import { CreatePostRequestQuery } from "./create-post.request";
import { GetPostRequestPath } from "./get-post.request";

export class DeletePostRequestPath extends GetPostRequestPath {}

export class DeletePostRequestQuery extends CreatePostRequestQuery {}
