import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsPositive } from "class-validator";

export class GetPostRequestPath {
  @ApiProperty({
    title: "게시글 ID",
    description: "자연수",
    example: 1,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: "게시글 ID는 자연수입니다." })
  @IsPositive({ message: "게시글 ID는 자연수입니다." })
  readonly postId: number;
}
