import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { PostResponse } from "./post.response";

export class PostsResponse {
  @ApiProperty({
    title: "게시글 목록",
    type: [PostResponse],
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => PostResponse)
  readonly posts: PostResponse[];
}
