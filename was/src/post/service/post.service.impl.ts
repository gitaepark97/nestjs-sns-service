import { Injectable } from "@nestjs/common";
import { CreatePostService } from "./create-post.service";
import { PostRepository } from "../repository/post.repository";
import { CreatePostCommand } from "./command/create-post.command";
import { GetMemberService } from "../../member/service/get-member.service";
import { Post } from "../domain/post";
import { GetMemberPostsService } from "./get-member-posts.service";
import { GetPostService } from "./get-post.service";
import { Validation } from "../../util/validation.util";
import { UpdatePostService } from "./update-post.service";
import { UpdatePostCommand } from "./command/update-post.command";
import { DeletePostService } from "./delete-post.service";

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
    const member = await this.getMemberService.getMember(command.memberId);

    // 게시글 생성
    const post = Post.create(member.id, command.content);

    // 게시글 저장
    return this.postRepository.savePost(post);
  }

  getPost(postId: number): Promise<Post> {
    return Validation.asyncNotFound(
      this.postRepository.findPostById(postId),
      "존재하지 않는 게시글입니다.",
    );
  }

  async updatePost(command: UpdatePostCommand): Promise<void> {
    // 회원 게시글 조회
    const post = await this.getMemberPost(command.memberId, command.postId);

    // 게시글 내용 수정
    post.updateContent(command.content);

    // 게시글 저장
    return this.postRepository.savePost(post);
  }

  async deletePost(postId: number, memberId: number): Promise<void> {
    // 회원 게시글 조회
    const post = await this.getMemberPost(memberId, postId);

    // 게시글 삭제
    return this.postRepository.deletePost(postId);
  }

  async getMemberPosts(
    memberId: number,
    pageSize: number,
    cursor?: number,
  ): Promise<{ posts: Post[]; totalCount: number }> {
    // 회원 조회
    const member = await this.getMemberService.getMember(memberId);

    // 게시글 목록 조회
    let posts, totalCount;
    if (cursor) {
      [posts, totalCount] = await Promise.all([
        this.postRepository.findPostsWithCursorByMemberId(
          memberId,
          pageSize,
          cursor,
        ),
        this.postRepository.countPostsByMemberId(memberId),
      ]);
    } else {
      [posts, totalCount] = await Promise.all([
        this.postRepository.findPostsByMemberId(memberId, pageSize),
        this.postRepository.countPostsByMemberId(memberId),
      ]);
    }

    return { posts, totalCount };
  }

  private async getMemberPost(memberId: number, postId: number) {
    // 회원과 게시글 조회
    const member = await this.getMemberService.getMember(memberId);

    // 게시글 조회
    const post = await this.getPost(postId);

    // 권한
    Validation.forbidden(post.isCreator(member.id), "권한이 없습니다.");

    return post;
  }
}
