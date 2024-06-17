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
import { curry, isNil, pipe, tap, throwIf } from "@fxts/core";

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
      (member) => Post.create(member.id, command.content), // 게시글 생성
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
      (member) => member.id,
      this.getMemberPost(command.postId), // 회원 게시글 조회
      tap((post) => post.updateContent(command.content)), // 내용 수정
      this.postRepository.savePost, // 게시글 저장
    );

  deletePost = (memberId: number, postId: number): Promise<void> =>
    pipe(
      this.getMemberService.getMember(memberId), // 회원 조회
      (member) => member.id,
      this.getMemberPost(postId), // 회원 게시글 조회
      (post) => post.id,
      this.postRepository.deletePost, // 게시글 삭제
    );

  getMemberPosts = (
    memberId: number,
    pageSize: number,
    cursor?: number,
  ): Promise<{ posts: Post[]; totalCount: number }> =>
    pipe(
      this.getMemberService.getMember(memberId),
      (member) =>
        cursor
          ? Promise.all([
              this.postRepository.findPostsWithCursorByMemberId(
                member.id,
                pageSize,
                cursor,
              ),
              this.postRepository.countPostsByMemberId(member.id),
            ])
          : Promise.all([
              this.postRepository.findPostsByMemberId(member.id, pageSize),
              this.postRepository.countPostsByMemberId(member.id),
            ]),
      ([posts, totalCount]) => ({ posts, totalCount }),
    );

  private getMemberPost = curry((postId: number, memberId: number) =>
    pipe(
      this.getPost(postId), // 게시글 조회
      throwIf(
        (post) => !post.isCreator(memberId), // 권한 확인
        () => new ForbiddenException("권한이 없습니다."),
      ),
    ),
  );
}
