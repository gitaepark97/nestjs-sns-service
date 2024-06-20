import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive } from "class-validator";

export class FollowRequestPath {
  @ApiProperty({
    title: "팔로우 회원 ID",
    description: "자연수",
    example: 2,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: "팔로우 회원 ID는 자연수입니다." })
  @IsPositive({ message: "팔로우 회원 ID는 자연수입니다." })
  readonly followedId: number;
}

export class FollowRequestQuery {
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
