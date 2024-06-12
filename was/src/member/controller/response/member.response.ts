import { Expose } from "class-transformer";
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  MaxLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class MemberResponse {
  @ApiProperty({
    title: "ID",
    description: "자연수",
    example: 1,
  })
  @Expose()
  @IsInt()
  @IsPositive()
  readonly id: number;

  @ApiProperty({
    title: "이메일",
    description: "이메일 형식",
    example: "member1@email.com",
  })
  @Expose()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    title: "닉네임",
    description: "30자 이내의 문자열",
    example: "회원1",
  })
  @Expose()
  @IsNotEmpty()
  @MaxLength(30)
  readonly nickname: string;
}
