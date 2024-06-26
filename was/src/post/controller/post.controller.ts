import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { generateErrorExample } from "../../common/swagger";
import { ResponseValidationInterceptor } from "../../common/validation/response-validation.interceptor";
import { CreatePostCommand } from "../service/command/create-post.command";
import { UpdatePostCommand } from "../service/command/update-post.command";
import { CreatePostService } from "../service/create-post.service";
import { DeletePostService } from "../service/delete-post.service";
import { GetFollowingMembersPostsService } from "../service/get-followings-posts.service";
import { GetMemberPostsService } from "../service/get-member-posts.service";
import { GetPostService } from "../service/get-post.service";
import { UpdatePostService } from "../service/update-post.service";
import {
  CreatePostRequestBody,
  CreatePostRequestQuery,
} from "./request/create-post.request";
import {
  DeletePostRequestPath,
  DeletePostRequestQuery,
} from "./request/delete-post.request";
import { GetFollowingMembersPostsRequestQuery } from "./request/get-following-members-posts.request";
import {
  GetMemberPostsRequestPath,
  GetMemberPostsRequestQuery,
} from "./request/get-member-posts.request";
import { GetPostRequestPath } from "./request/get-post.request";
import {
  UpdatePostRequestBody,
  UpdatePostRequestPath,
  UpdatePostRequestQuery,
} from "./request/update-post.request";
import { PostResponse } from "./response/post.response";
import { PostsResponse } from "./response/posts.response";

@ApiTags("게시글")
@Controller("posts")
export class PostController {
  constructor(
    private readonly createPostService: CreatePostService,
    private readonly getPostService: GetPostService,
    private readonly updatePostService: UpdatePostService,
    private readonly deletePostService: DeletePostService,
    private readonly getMemberPostsService: GetMemberPostsService,
    private readonly getFollowingMembersPostsService: GetFollowingMembersPostsService,
  ) {}

  @ApiOperation({ summary: "게시글 생성 API" })
  @ApiCreatedResponse({ description: "created" })
  @ApiBadRequestResponse({
    description: "bad request",
    content: {
      "application/json": {
        examples: {
          memberId: {
            value: generateErrorExample("/v1/posts", "회원 ID는 자연수입니다."),
          },
          content: {
            value: generateErrorExample(
              "/v1/posts",
              "올바르지 않은 내용입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "conflict",
    content: {
      "application/json": {
        examples: {
          email: {
            value: generateErrorExample(
              "/v1/posts",
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
          "/v1/posts",
          "서버 오류입니다. 잠시 후 재시도해주세요.",
        ),
      },
    },
  })
  @Post()
  createPost(
    @Query() query: CreatePostRequestQuery,
    @Body() body: CreatePostRequestBody,
  ) {
    const command = new CreatePostCommand(query.memberId, body.content);
    return this.createPostService.createPost(command);
  }

  @ApiOperation({ summary: "게시글 조회 API" })
  @ApiOkResponse({ description: "ok", type: PostResponse })
  @ApiBadRequestResponse({
    description: "bad request",
    content: {
      "application/json": {
        examples: {
          postId: {
            value: generateErrorExample(
              "/v1/posts/:postId",
              "게시글 ID는 자연수입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "conflict",
    content: {
      "application/json": {
        examples: {
          post: {
            value: generateErrorExample(
              "/v1/posts/:postId",
              "존재하지 않는 게시글입니다.",
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
          "/v1/posts/:postId",
          "서버 오류입니다. 잠시 후 재시도해주세요.",
        ),
      },
    },
  })
  @Get(":postId")
  @UseInterceptors(new ResponseValidationInterceptor(PostResponse))
  getPost(@Param() path: GetPostRequestPath) {
    return this.getPostService.getPost(path.postId);
  }

  @ApiOperation({ summary: "게시글 수정 API" })
  @ApiOkResponse({ description: "ok" })
  @ApiBadRequestResponse({
    description: "bad request",
    content: {
      "application/json": {
        examples: {
          postId: {
            value: generateErrorExample(
              "/v1/posts/:postId",
              "게시글 ID는 자연수입니다.",
            ),
          },
          memberId: {
            value: generateErrorExample(
              "/v1/posts/:postId",
              "회원 ID는 자연수입니다.",
            ),
          },
          content: {
            value: generateErrorExample(
              "/v1/posts/:postId",
              "올바르지 않은 내용입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiForbiddenResponse({
    description: "conflict",
    content: {
      "application/json": {
        example: {
          value: generateErrorExample("/v1/posts/:postId", "권한이 없습니다."),
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
              "/v1/posts/:postId",
              "존재하지 않는 회원입니다.",
            ),
          },
          post: {
            value: generateErrorExample(
              "/v1/posts/:postId",
              "존재하지 않는 게시글입니다.",
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
          "/v1/posts/:postId",
          "서버 오류입니다. 잠시 후 재시도해주세요.",
        ),
      },
    },
  })
  @Patch(":postId")
  updatePost(
    @Param() path: UpdatePostRequestPath,
    @Query() query: UpdatePostRequestQuery,
    @Body() body: UpdatePostRequestBody,
  ) {
    const command = new UpdatePostCommand(
      query.memberId,
      path.postId,
      body.content,
    );
    return this.updatePostService.updatePost(command);
  }

  @ApiOperation({ summary: "게시글 삭제 API" })
  @ApiOkResponse({ description: "ok" })
  @ApiBadRequestResponse({
    description: "bad request",
    content: {
      "application/json": {
        examples: {
          postId: {
            value: generateErrorExample(
              "/v1/posts/:postId",
              "게시글 ID는 자연수입니다.",
            ),
          },
          memberId: {
            value: generateErrorExample(
              "/v1/posts/:postId",
              "회원 ID는 자연수입니다.",
            ),
          },
        },
      },
    },
  })
  @ApiForbiddenResponse({
    description: "conflict",
    content: {
      "application/json": {
        example: {
          value: generateErrorExample("/v1/posts/:postId", "권한이 없습니다."),
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
              "/v1/posts/:postId",
              "존재하지 않는 회원입니다.",
            ),
          },
          post: {
            value: generateErrorExample(
              "/v1/posts/:postId",
              "존재하지 않는 게시글입니다.",
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
          "/v1/posts/:postId",
          "서버 오류입니다. 잠시 후 재시도해주세요.",
        ),
      },
    },
  })
  @Delete(":postId")
  deletePost(
    @Param() path: DeletePostRequestPath,
    @Query() query: DeletePostRequestQuery,
  ) {
    return this.deletePostService.deletePost(query.memberId, path.postId);
  }

  @ApiOperation({ summary: "팔루우 회원들의 게시글 목록 API" })
  @ApiOkResponse({ description: "ok", type: PostsResponse })
  @ApiBadRequestResponse({
    description: "bad request",
    content: {
      "application/json": {
        examples: {
          memberId: {
            value: generateErrorExample(
              "/v1/posts/members/following",
              "회원 ID는 자연수입니다.",
            ),
          },
          pageSize: {
            value: generateErrorExample(
              "/v1/posts/members/following",
              "페이지 크기는 자연수입니다.",
            ),
          },
          lastPostId: {
            value: generateErrorExample(
              "/v1/posts/members/following",
              "마지막 게시글 ID는 자연수입니다.",
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
          "/v1/posts/members/following",
          "서버 오류입니다. 잠시 후 재시도해주세요.",
        ),
      },
    },
  })
  @Get("members/following")
  @UseInterceptors(new ResponseValidationInterceptor(PostsResponse))
  getFollowingMembersPosts(
    @Query() query: GetFollowingMembersPostsRequestQuery,
  ) {
    return this.getFollowingMembersPostsService.getFollowingMembersPosts(
      query.memberId,
      query.pageSize,
      query.lastPostId,
    );
  }

  @ApiOperation({ summary: "회원의 게시글 목록 API" })
  @ApiOkResponse({ description: "ok", type: PostsResponse })
  @ApiBadRequestResponse({
    description: "bad request",
    content: {
      "application/json": {
        examples: {
          memberId: {
            value: generateErrorExample(
              "/v1/posts/members/:memberId",
              "회원 ID는 자연수입니다.",
            ),
          },
          pageSize: {
            value: generateErrorExample(
              "/v1/posts/members/:memberId",
              "페이지 크기는 자연수입니다.",
            ),
          },
          lastPostId: {
            value: generateErrorExample(
              "/v1/posts/members/:memberId",
              "마지막 게시글 ID는 자연수입니다.",
            ),
          },
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
              "/v1/posts/members/:memberId",
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
          "/v1/posts/members/:memberId",
          "서버 오류입니다. 잠시 후 재시도해주세요.",
        ),
      },
    },
  })
  @Get("members/:memberId")
  @UseInterceptors(new ResponseValidationInterceptor(PostsResponse))
  getMemberPosts(
    @Param() path: GetMemberPostsRequestPath,
    @Query() query: GetMemberPostsRequestQuery,
  ) {
    return this.getMemberPostsService.getMemberPosts(
      path.memberId,
      query.pageSize,
      query.lastPostId,
    );
  }
}
