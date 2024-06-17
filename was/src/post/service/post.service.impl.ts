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

  async createPost(command: CreatePostCommand): Promise<void> {
    // 회원 검증
    await pipe(
      command,
      tap(({ memberId }) => this.getMemberService.getMember(command.memberId)), // 회원 조회
      ({ memberId, content }) => Post.create(memberId, command.content), // 게시글 생성
      (post) => this.postRepository.savePost(post), // 게시글 저장
    );
  }

  getPost(postId: number): Promise<Post> {
    return pipe(
      this.postRepository.findPostById(postId), // 게시글 조회
      throwIf(
        isNil,
        () => new NotFoundException("존재하지 않는 게시글입니다."),
      ),
    );
  }

  updatePost(command: UpdatePostCommand): Promise<void> {
    return pipe(
      this.getMemberService.getMember(command.memberId), // 회원 조회
      (member) => this.getMemberPost(member.id, command.postId), // 회원의 게시글 조회
      tap((post) => post.updateContent(command.content)), // 내용 수정
      (post) => this.postRepository.savePost(post), // 게시글 저장
    );
  }

  deletePost(memberId: number, postId: number): Promise<void> {
    return pipe(
      this.getMemberService.getMember(memberId), // 회원 조회
      (member) => this.getMemberPost(member.id, postId), // 회원의 게시글 조회
      (post) => this.postRepository.deletePost(post.id), // 게시글 삭제
    );
  }

  getMemberPosts(
    memberId: number,
    pageSize: number,
    cursor?: number,
  ): Promise<{ posts: Post[]; totalCount: number }> {
    return pipe(
      this.getMemberService.getMember(memberId),
      (member) => {
        if (cursor) {
          return Promise.all([
            this.postRepository.findPostsWithCursorByMemberId(
              member.id,
              pageSize,
              cursor,
            ),
            this.postRepository.countPostsByMemberId(memberId),
          ]);
        } else {
          return Promise.all([
            this.postRepository.findPostsByMemberId(member.id, pageSize),
            this.postRepository.countPostsByMemberId(memberId),
          ]);
        }
      },
      ([posts, totalCount]) => ({ posts, totalCount }),
    );
  }

  private getMemberPost(memberId: number, postId: number) {
    return pipe(
      this.getPost(postId), // 게시글 조회
      throwIf(
        (post) => !post.isCreator(memberId), // 권한 확인
        () => new ForbiddenException("권한이 없습니다."),
      ),
    );
  }
}
