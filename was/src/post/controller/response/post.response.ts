import { IsDate, IsInt, IsNotEmpty, IsPositive } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class PostResponse {
  @ApiProperty({
    title: "게시글 ID",
    description: "자연수",
    example: 1,
  })
  @Expose()
  @IsInt()
  @IsPositive()
  readonly id: number;

  @ApiProperty({
    title: "작성 회원 ID",
    description: "자연수",
    example: 1,
  })
  @Expose()
  @IsInt()
  @IsPositive()
  readonly creatorId: number;

  @ApiProperty({
    title: "내용",
    description: "문자열",
    example: "게시글 1",
  })
  @Expose()
  @IsNotEmpty()
  readonly content: string;

  @ApiProperty({
    title: "생성일시",
    description: "UTC",
    example: "0000-00-00T00:00:00.000Z",
  })
  @Expose()
  @IsDate()
  readonly createdAt: Date;

  @ApiProperty({
    title: "수정일시",
    description: "UTC",
    example: "0000-00-00T00:00:00.000Z",
  })
  @Expose()
  @IsDate()
  readonly updatedAt: Date;
}
