import { Follow } from "../domain/follow";

export abstract class FollowRepository {
  abstract saveFollow(follow: Follow): Promise<void>;

  abstract findFollow(
    followerId: number,
    followedId: number,
  ): Promise<Follow | null>;

  abstract deleteFollow(follow: Follow): Promise<void>;

  abstract findFollowsByFollowerId(followerId: number): Promise<Follow[]>;
}
