import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { GetFollowingIdsService } from "src/follow/service/get-following.service";
import { GetMemberService } from "../../member/service/get-member.service";
import { Post } from "../domain/post";
import { PostRepository } from "../repository/post.repository";
import { CreatePostCommand } from "./command/create-post.command";
import { UpdatePostCommand } from "./command/update-post.command";
import { CreatePostService } from "./create-post.service";
import { DeletePostService } from "./delete-post.service";
import { GetFollowingMembersPostsService } from "./get-followings-posts.service";
import { GetMemberPostsService } from "./get-member-posts.service";
import { GetPostService } from "./get-post.service";
import { UpdatePostService } from "./update-post.service";

@Injectable()
export class PostServiceImpl
  implements
    CreatePostService,
    GetPostService,
    UpdatePostService,
    DeletePostService,
    GetFollowingMembersPostsService,
    GetMemberPostsService
{
  constructor(
    private readonly getMemberService: GetMemberService,
    private readonly getFollowingService: GetFollowingIdsService,
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

  async getFollowingMembersPosts(
    memberId: number,
    pageSize: number,
    cursor: number | undefined,
  ): Promise<{ posts: Post[] }> {
    const followingIds =
      await this.getFollowingService.getFollowingIds(memberId);

    const posts = cursor
      ? await this.postRepository.findPostsByMemberIdsWithCursor(
          followingIds,
          pageSize,
          cursor,
        )
      : await this.postRepository.findPostsByMemberIds(followingIds, pageSize);
    return { posts };
  }

  async getMemberPosts(
    memberId: number,
    pageSize: number,
    cursor: number | undefined,
  ): Promise<{ posts: Post[] }> {
    // 회원 존재 확인
    await this.getMemberService.getMember(memberId);

    // 회원 게시글 목록 조회
    const posts = cursor
      ? await this.postRepository.findPostsByMemberIdWithCursor(
          memberId,
          pageSize,
          cursor,
        )
      : await this.postRepository.findPostsByMemberId(memberId, pageSize);
    return { posts };
  }

  private async getMemberPost(memberId: number, postId: number) {
    // 게시글 조회
    const post = await this.getPost(postId);

    // 권한 확인
    if (!post.isCreator(memberId))
      throw new ForbiddenException("권한이 없습니다.");

    return post;
  }
}
