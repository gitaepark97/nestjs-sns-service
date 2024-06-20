export abstract class FollowService {
  abstract follow(followerId: number, followedId: number): Promise<void>;
}
