import { FollowEntity } from "../repository/entity/follow.entity";

export class Follow {
  private _followerId: number;
  private _followedId: number;

  private constructor() {}

  get followerId() {
    return this._followerId;
  }

  get followedId() {
    return this._followedId;
  }

  static create(followerId: number, followedId: number) {
    const follow = new Follow();

    follow._followerId = followerId;
    follow._followedId = followedId;

    return follow;
  }

  static fromEntity(entity: FollowEntity) {
    const follow = new Follow();

    follow._followerId = entity.followerId;
    follow._followedId = entity.followedId;

    return follow;
  }
}
