import { ForbiddenException, Injectable } from "@nestjs/common";
import { FollowRepository } from "./follow.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { FollowEntity } from "./entity/follow.entity";
import { Repository } from "typeorm";
import { Follow } from "../domain/follow";

@Injectable()
export class FollowRepositoryImpl implements FollowRepository {
  constructor(
    @InjectRepository(FollowEntity)
    private followEntityRepository: Repository<FollowEntity>,
  ) {}

  async saveFollow(follow: Follow): Promise<void> {
    console.log(follow);
    await this.followEntityRepository.save({
      followerId: follow.followerId,
      followedId: follow.followedId,
    });
  }

  async findFollow(
    followerId: number,
    followedId: number,
  ): Promise<Follow | null> {
    const entity = await this.followEntityRepository.findOne({
      where: { followedId, followerId },
    });
    return entity && Follow.fromEntity(entity);
  }

  async deleteFollow(follow: Follow): Promise<void> {
    const result = await this.followEntityRepository.delete({
      followerId: follow.followerId,
      followedId: follow.followedId,
    });
    if (result.affected === 0)
      throw new ForbiddenException("팔로우 관계가 아닙니다.");
  }

  async findFollowsByFollowerId(followerId: number): Promise<Follow[]> {
    const entities = await this.followEntityRepository.find({
      where: { followerId },
    });
    return entities.map((entity) => Follow.fromEntity(entity));
  }
}
