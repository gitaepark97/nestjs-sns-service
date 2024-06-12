import { IsNotEmpty, IsOptional, MaxLength } from "class-validator";
import { GetMemberRequestPath } from "./get-member.request";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateMemberRequestPath extends GetMemberRequestPath {}

export class UpdateMemberRequestBody {
  @ApiPropertyOptional({
    title: "닉네임",
    description: "30자 이내의 문자열",
    example: "회원1",
  })
  @IsOptional()
  @IsNotEmpty({ message: "올바르지 않은 닉네임입니다." })
  @MaxLength(30, { message: "올바르지 않은 닉네임입니다." })
  readonly nickname: string;
}
