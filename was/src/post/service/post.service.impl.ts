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
    // 회원 존재 확인
    await this.getMemberService.getMember(command.memberId);

    // 게시글 생성
    const post = Post.create(command.memberId, command.content);
    return this.postRepository.savePost(post);
  }

  async getPost(postId: number): Promise<Post> {
    const post = await this.postRepository.findPostById(postId);
    if (!post) throw new NotFoundException("존재하지 않는 게시글입니다.");
    return post;
  }

  updatePost = async (command: UpdatePostCommand): Promise<void> => {
    // 회원 존재 확인
    await this.getMemberService.getMember(command.memberId);

    // 게시글 조회
    const post = await this.getMemberPost(command.memberId, command.postId);

    // 게시글 수정
    post.updateContent(command.content);
    return this.postRepository.savePost(post);
  };

  async deletePost(memberId: number, postId: number): Promise<void> {
    // 회원 존재 확인
    await this.getMemberService.getMember(memberId);

    // 게시글 삭제
    const post = await this.getMemberPost(memberId, postId);
    return this.postRepository.deletePost(post);
  }

  async getMemberPosts(
    memberId: number,
    pageSize: number,
    cursor: number | undefined,
  ): Promise<{ posts: Post[]; totalCount: number }> {
    // 회원 존재 확인
    await this.getMemberService.getMember(memberId);

    // 회원 게시글 목록 조회
    const [posts, totalCount] = await Promise.all([
      this.getPostsByMemberId(memberId, pageSize, cursor),
      this.postRepository.countPostsByMemberId(memberId),
    ]);
    return { posts, totalCount };
  }

  private async getMemberPost(memberId: number, postId: number) {
    // 게시글 조회
    const post = await this.getPost(postId);

    // 권한 확인
    if (!post.isCreator(memberId))
      throw new ForbiddenException("권한이 없습니다.");

    return post;
  }

  private getPostsByMemberId(
    memberId: number,
    pageSize: number,
    cursor: number | undefined,
  ) {
    return cursor
      ? this.postRepository.findPostsWithCursorByMemberId(
          memberId,
          pageSize,
          cursor,
        )
      : this.postRepository.findPostsByMemberId(memberId, pageSize);
  }
}
