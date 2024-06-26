export abstract class GetFollowingIdsService {
  abstract getFollowingIds(memberId: number): Promise<number[]>;
}
