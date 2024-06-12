import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateMemberRequestBody {
  @ApiProperty({
    title: "이메일",
    description: "이메일 양식",
    example: "member1@email.com",
  })
  @IsEmail({}, { message: "올바르지 않은 이메일입니다." })
  @MaxLength(100, { message: "올바르지 않은 이메일입니다." })
  readonly email: string;

  @ApiProperty({
    title: "비밀번호",
    description: "대소문자, 숫자, 특수문자 포함 8자 이상의 문자열",
    example: "Qwer1234!",
  })
  @IsStrongPassword({}, { message: "올바르지 않은 비밀번호입니다." })
  readonly password: string;

  @ApiProperty({
    title: "닉네임",
    description: "30자 이내의 문자열",
    example: "회원1",
  })
  @IsNotEmpty({ message: "올바르지 않은 닉네임입니다." })
  @MaxLength(30, { message: "올바르지 않은 닉네임입니다." })
  readonly nickname: string;
}
