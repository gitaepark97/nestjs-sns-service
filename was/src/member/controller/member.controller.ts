import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from "@nestjs/common";
import { CreateMemberService } from "../service/create-member.service";
import { CreateMemberRequestBody } from "./request/create-member.request";
import { CreateMemberCommand } from "../service/command/create-member.command";
import { GetMemberService } from "../service/get-member.service";
import { GetMemberRequestPath } from "./request/get-member.request";
import { ResponseValidationInterceptor } from "../../common/validation/response-validation.interceptor";
import { MemberResponse } from "./response/member.response";
import { UpdateMemberCommand } from "../service/command/update-member.command";
import {
  UpdateMemberRequestBody,
  UpdateMemberRequestPath,
} from "./request/update-member.request";
import { UpdateMemberService } from "../service/update-member.service";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { generateErrorExample } from "../../common/swagger";
import { DeleteMemberRequestPath } from "./request/delete-member.request";
import { DeleteMemberService } from "../service/delete-member.service";

@ApiTags("회원")
@Controller("members")
export class MemberController {
  constructor(
    private readonly createMemberService: CreateMemberService,
    private readonly getMemberService: GetMemberService,
    private readonly updateMemberService: UpdateMemberService,
    private readonly deleteMemberService: DeleteMemberService,
  ) {}

  @ApiOperation({ summary: "회원 생성 API" })
  @ApiCreatedResponse({ description: "created" })
  @ApiBadRequestResponse({
    description: "bad request",
    content: {
      "application/json": {
        examples: {
          email: {
            value: generateErrorExample(
              "/v1/members",
              "올바르지 않은 이메일입니다.",
            ),
          },
          password: {
            value: generateErrorExample(
              "/v1/members",
              "올바르지 않은 비밀번호입니다.",
            ),
          },
          nickname: {
            value: generateErrorExample(
              "/v1/members",
              "올바르지 않은 닉네임입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: "conflict",
    content: {
      "application/json": {
        examples: {
          email: {
            value: generateErrorExample(
              "/v1/members",
              "이미 사용 중인 이메일입니다.",
            ),
          },
          nickname: {
            value: generateErrorExample(
              "/v1/members",
              "이미 사용 중인 닉네임입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: "internal server error",
    content: {
      "application/json": {
        example: generateErrorExample(
          "/v1/members",
          "서버 오류입니다. 잠시 후 재시도해주세요.",
        ),
      },
    },
  })
  @Post()
  async createMember(@Body() body: CreateMemberRequestBody) {
    const command = new CreateMemberCommand(
      body.email,
      body.password,
      body.nickname,
    );
    await this.createMemberService.createMember(command);
  }

  @ApiOperation({ summary: "회원 조회 API" })
  @ApiOkResponse({ description: "ok", type: MemberResponse })
  @ApiBadRequestResponse({
    description: "bad request",
    content: {
      "application/json": {
        examples: {
          memberId: {
            value: generateErrorExample(
              "/v1/members/:memberId",
              "ID는 자연수입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "not found",
    content: {
      "application/json": {
        examples: {
          member: {
            value: generateErrorExample(
              "/v1/members/:memberId",
              "존재하지 않는 회원입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: "internal server error",
    content: {
      "application/json": {
        example: generateErrorExample(
          "/v1/members/:memberId",
          "서버 오류입니다. 잠시 후 재시도해주세요.",
        ),
      },
    },
  })
  @Get(":memberId")
  @UseInterceptors(new ResponseValidationInterceptor(MemberResponse))
  getMember(@Param() path: GetMemberRequestPath) {
    return this.getMemberService.getMember(path.memberId);
  }

  @ApiOperation({ summary: "회원 수정 API" })
  @ApiOkResponse({ description: "ok" })
  @ApiBadRequestResponse({
    description: "bad request",
    content: {
      "application/json": {
        examples: {
          memberId: {
            value: generateErrorExample(
              "/v1/members/:memberId",
              "ID는 자연수입니다.",
            ),
          },
          nickname: {
            value: generateErrorExample(
              "/v1/members/:memberId",
              "올바르지 않은 닉네임입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "not found",
    content: {
      "application/json": {
        examples: {
          member: {
            value: generateErrorExample(
              "/v1/members/:memberId",
              "존재하지 않는 회원입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: "conflict",
    content: {
      "application/json": {
        examples: {
          nickname: {
            value: generateErrorExample(
              "/v1/members/:memberId",
              "이미 사용 중인 닉네임입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: "internal server error",
    content: {
      "application/json": {
        example: generateErrorExample(
          "/v1/members/:memberId",
          "서버 오류입니다. 잠시 후 재시도해주세요.",
        ),
      },
    },
  })
  @Patch(":memberId")
  async updateMember(
    @Param() path: UpdateMemberRequestPath,
    @Body() body: UpdateMemberRequestBody,
  ) {
    const command = new UpdateMemberCommand(path.memberId, body.nickname);
    await this.updateMemberService.updateMember(command);
  }

  @ApiOperation({ summary: "회원 삭제 API" })
  @ApiOkResponse({ description: "ok" })
  @ApiBadRequestResponse({
    description: "bad request",
    content: {
      "application/json": {
        examples: {
          memberId: {
            value: generateErrorExample(
              "/v1/members/:memberId",
              "ID는 자연수입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "not found",
    content: {
      "application/json": {
        examples: {
          member: {
            value: generateErrorExample(
              "/v1/members/:memberId",
              "존재하지 않는 회원입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: "internal server error",
    content: {
      "application/json": {
        example: generateErrorExample(
          "/v1/members/:memberId",
          "서버 오류입니다. 잠시 후 재시도해주세요.",
        ),
      },
    },
  })
  @Delete(":memberId")
  async deleteMember(@Param() path: DeleteMemberRequestPath) {
    await this.deleteMemberService.deleteMember(path.memberId);
  }
}
