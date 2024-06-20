export abstract class GetFollowingService {
  abstract getFollowing(memberId: number): Promise<number[]>;
}
