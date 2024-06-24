import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { GetMemberService } from "../../member/service/get-member.service";
import { Follow } from "../domain/follow";
import { FollowRepository } from "../repository/follow.repository";
import { FollowService } from "./follow.service";
import { GetFollowingService } from "./get-following.service";
import { UnfollowService } from "./unfollow.service";

@Injectable()
export class FollowServiceImpl
  implements FollowService, UnfollowService, GetFollowingService
{
  constructor(
    private readonly getMemberService: GetMemberService,
    private readonly followRepository: FollowRepository,
  ) {}

  async follow(followerId: number, followedId: number): Promise<void> {
    if (followerId === followedId)
      throw new ForbiddenException("본인은 팔로우 할 수 없습니다.");

    // 회원 확인
    await Promise.all([
      this.getMemberService.getMember(followerId),
      this.getMemberService.getMember(followedId),
    ]);

    // 팔로우 확인
    const existFollow = await this.followRepository.findFollow(
      followerId,
      followedId,
    );
    if (existFollow) throw new ConflictException("이미 팔로우 중입니다.");

    // 팔로우 생성
    const follow = Follow.create(followerId, followedId);
    return this.followRepository.saveFollow(follow);
  }

  async unfollow(followerId: number, followedId: number): Promise<void> {
    if (followerId === followedId)
      throw new ForbiddenException("본인은 팔로우 할 수 없습니다.");

    // 팔로우 확인
    const follow = await this.followRepository.findFollow(
      followerId,
      followedId,
    );
    if (!follow) throw new NotFoundException("먼저 팔로우해주세요.");

    // 팔로우 삭제
    return this.followRepository.deleteFollow(follow);
  }

  async getFollowing(memberId: number): Promise<number[]> {
    // 팔로우 목록 조회
    const followers =
      await this.followRepository.findFollowsByFollowerId(memberId);

    // 팔로워 ID만 추출
    return followers.map((follow) => follow.followedId);
  }
}
