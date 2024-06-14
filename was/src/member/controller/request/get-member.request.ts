import { Transform } from "class-transformer";
import { IsInt, IsPositive } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GetMemberRequestPath {
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
