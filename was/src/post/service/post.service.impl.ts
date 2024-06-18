import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreatePostService } from "./create-post.service";
import { PostRepository } from "../repository/post.repository";
import { CreatePostCommand } from "./command/create-post.command";
import { GetMemberService } from "../../member/service/get-member.service";
import { Post } from "../domain/post";
import { GetMemberPostsService } from "./get-member-posts.service";
import { GetPostService } from "./get-post.service";
import { UpdatePostService } from "./update-post.service";
import { UpdatePostCommand } from "./command/update-post.command";
import { DeletePostService } from "./delete-post.service";
import { isNil, pipe, tap, throwIf } from "@fxts/core";

@Injectable()
export class PostServiceImpl
  implements
    CreatePostService,
    GetPostService,
    UpdatePostService,
    DeletePostService,
    GetMemberPostsService
{
  constructor(
    private readonly getMemberService: GetMemberService,
    private readonly postRepository: PostRepository,
  ) {}

  createPost = (command: CreatePostCommand): Promise<void> =>
    pipe(
      this.getMemberService.getMember(command.memberId), // 회원 조회

      () => Post.create(command.memberId, command.content), // 게시글 생성
      this.postRepository.savePost, // 게시글 저장
    );

  getPost = (postId: number): Promise<Post> =>
    pipe(
      this.postRepository.findPostById(postId), // 게시글 조회
      throwIf(
        isNil,
        () => new NotFoundException("존재하지 않는 게시글입니다."),
      ),
    );

  updatePost = (command: UpdatePostCommand): Promise<void> =>
    pipe(
      this.getMemberService.getMember(command.memberId), // 회원 조회

      () => this.getMemberPost(command.memberId, command.postId), // 회원 게시글 조회
      tap((post) => post.updateContent(command.content)), // 내용 수정
      this.postRepository.savePost, // 게시글 저장
    );

  deletePost = (memberId: number, postId: number): Promise<void> =>
    pipe(
      { memberId, postId },
      tap(({ memberId }) => this.getMemberService.getMember(memberId)), // 회원 조회
      ({ memberId, postId }) => this.getMemberPost(memberId, postId), // 회원 게시글 조회
      this.postRepository.deletePost, // 게시글 삭제
    );

  getMemberPosts = (
    memberId: number,
    pageSize: number,
    cursor?: number,
  ): Promise<{ posts: Post[]; totalCount: number }> =>
    pipe(
      this.getMemberService.getMember(memberId), // 회원 조회

      () =>
        cursor
          ? Promise.all([
              this.postRepository.findPostsWithCursorByMemberId(
                memberId,
                pageSize,
                cursor,
              ),
              this.postRepository.countPostsByMemberId(memberId),
            ])
          : Promise.all([
              this.postRepository.findPostsByMemberId(memberId, pageSize),
              this.postRepository.countPostsByMemberId(memberId),
            ]),
      ([posts, totalCount]) => ({ posts, totalCount }),
    );

  private getMemberPost = (memberId: number, postId: number) =>
    pipe(
      this.getPost(postId), // 게시글 조회
      throwIf(
        (post) => !post.isCreator(memberId), // 권한 확인
        () => new ForbiddenException("권한이 없습니다."),
      ),
    );
}
