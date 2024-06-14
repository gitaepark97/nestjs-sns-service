import { PostResponse } from "./post.response";
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min, ValidateNested } from "class-validator";
import { Expose, Type } from "class-transformer";

export class PostsResponse {
  @ApiProperty({
    title: "게시글 목록",
    type: [PostResponse],
  })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => PostResponse)
  readonly posts: PostResponse[];

  @ApiProperty({
    title: "전체 게시글 개수",
    description: "음이 아닌 정수",
    example: 1,
  })
  @Expose()
  @IsInt()
  @Min(0)
  readonly totalCount: number;
}
