import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { CreatePostRequestQuery } from "./create-post.request";
import { GetPostRequestPath } from "./get-post.request";

export class UpdatePostRequestPath extends GetPostRequestPath {}

export class UpdatePostRequestQuery extends CreatePostRequestQuery {}

export class UpdatePostRequestBody {
  @ApiPropertyOptional({
    title: "내용",
    description: "문자열",
    example: "게시글 1",
  })
  @IsOptional()
  @IsNotEmpty({ message: "올바르지 않은 게시글 내용입니다." })
  readonly content?: string;
}
