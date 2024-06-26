import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsPositive } from "class-validator";

export class GetFollowingMembersPostsRequestQuery {
  @ApiProperty({
    title: "회원 ID",
    description: "자연수",
    example: 1,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: "회원 ID는 자연수입니다." })
  @IsPositive({ message: "회원 ID는 자연수입니다." })
  readonly memberId: number;

  @ApiPropertyOptional({
    title: "페이지 크기",
    description: "자연수",
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: "페이지 크기는 자연수입니다." })
  @IsPositive({ message: "페이지 크기는 자연수입니다." })
  readonly pageSize: number = 10;

  @ApiPropertyOptional({
    title: "마지막 게시글 ID",
    description: "자연수",
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: "마지막 게시글 ID는 자연수입니다." })
  @IsPositive({ message: "마지막 게시글 ID는 자연수입니다." })
  readonly lastPostId?: number;
}
