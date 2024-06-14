import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsPositive } from "class-validator";
import { Transform } from "class-transformer";

export class CreatePostRequestQuery {
  @ApiProperty({
    title: "회원 ID",
    description: "자연수",
    example: 1,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: "회원 ID는 자연수입니다." })
  @IsPositive({ message: "회원 ID는 자연수입니다." })
  readonly memberId: number;
}

export class CreatePostRequestBody {
  @ApiProperty({
    title: "게시글 내용",
    description: "문자열",
    example: "게시글 1",
  })
  @IsNotEmpty({ message: "올바르지 않은 게시글 내용입니다." })
  readonly content: string;
}
