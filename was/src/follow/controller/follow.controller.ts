import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { generateErrorExample } from "../../common/swagger";
import { FollowService } from "../service/follow.service";
import { GetFollowingService } from "../service/get-following.service";
import { UnfollowService } from "../service/unfollow.service";
import {
  FollowRequestPath,
  FollowRequestQuery,
} from "./request/follow.request";
import {
  UnfollowRequestPath,
  UnfollowRequestQuery,
} from "./request/unfollow.request";

@Controller("follows")
export class FollowController {
  constructor(
    private readonly followService: FollowService,
    private readonly unfollowService: UnfollowService,
    private readonly getFollowingService: GetFollowingService,
  ) {}

  @ApiOperation({ summary: "회원 팔로우 API" })
  @ApiOkResponse({ description: "ok" })
  @ApiBadRequestResponse({
    description: "bad request",
    content: {
      "application/json": {
        examples: {
          followedId: {
            value: generateErrorExample(
              "/v1/follows/:followedId",
              "팔로우 회원 ID는 자연수입니다.",
            ),
          },
          memberId: {
            value: generateErrorExample(
              "/v1/follows/:followedId",
              "회원 ID는 자연수입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiForbiddenResponse({
    description: "forbidden",
    content: {
      "application/json": {
        example: {
          value: generateErrorExample(
            "/v1/follows/:followedId",
            "본인은 팔로우 할 수 없습니다.",
          ),
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "conflict",
    content: {
      "application/json": {
        examples: {
          member: {
            value: generateErrorExample(
              "/v1/follows/:followedId",
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
          follow: {
            value: generateErrorExample(
              "/v1/follows/:followedId",
              "이미 팔로우 중입니다.",
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
          "/v1/follows/:followedId",
          "서버 오류입니다. 잠시 후 재시도해주세요.",
        ),
      },
    },
  })
  @Post(":followedId")
  @HttpCode(HttpStatus.OK)
  follow(@Param() path: FollowRequestPath, @Query() query: FollowRequestQuery) {
    return this.followService.follow(query.memberId, path.followedId);
  }

  @ApiOperation({ summary: "회원 팔로우 취소 API" })
  @ApiOkResponse({ description: "ok" })
  @ApiBadRequestResponse({
    description: "bad request",
    content: {
      "application/json": {
        examples: {
          followedId: {
            value: generateErrorExample(
              "/v1/follows/:followedId",
              "팔로우 회원 ID는 자연수입니다.",
            ),
          },
          memberId: {
            value: generateErrorExample(
              "/v1/follows/:followedId",
              "회원 ID는 자연수입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiForbiddenResponse({
    description: "forbidden",
    content: {
      "application/json": {
        example: {
          value: generateErrorExample(
            "/v1/follows/:followedId",
            "본인은 팔로우 할 수 없습니다.",
          ),
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "conflict",
    content: {
      "application/json": {
        examples: {
          follow: {
            value: generateErrorExample(
              "/v1/follows/:followedId",
              "먼저 팔로우해주세요.",
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
          "/v1/follows/:followedId",
          "서버 오류입니다. 잠시 후 재시도해주세요.",
        ),
      },
    },
  })
  @Delete(":followedId")
  unfollow(
    @Param() path: UnfollowRequestPath,
    @Query() query: UnfollowRequestQuery,
  ) {
    return this.unfollowService.unfollow(query.memberId, path.followedId);
  }
}
