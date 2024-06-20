export abstract class UnfollowService {
  abstract unfollow(followerId: number, followedId: number): Promise<void>;
}
