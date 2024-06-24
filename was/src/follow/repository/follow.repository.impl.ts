import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { extractIdxName } from "src/util/database.util";
import { Repository } from "typeorm";
import { Follow } from "../domain/follow";
import { FollowEntity } from "./entity/follow.entity";
import { FollowRepository } from "./follow.repository";

@Injectable()
export class FollowRepositoryImpl implements FollowRepository {
  constructor(
    @InjectRepository(FollowEntity)
    private followEntityRepository: Repository<FollowEntity>,
  ) {}

  async saveFollow(follow: Follow): Promise<void> {
    await this.followEntityRepository
      .save({
        followerId: follow.followerId,
        followedId: follow.followedId,
      })
      .catch((err) => {
        switch (err.code) {
          case "ER_DUP_ENTRY":
            switch (extractIdxName(err)) {
              case "PRIMARY":
                throw new ConflictException("이미 팔로우 중입니다.");
            }
        }

        throw err;
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
      throw new NotFoundException("먼저 팔로우해주세요.");
  }

  async findFollowsByFollowerId(followerId: number): Promise<Follow[]> {
    const entities = await this.followEntityRepository.find({
      where: { followerId },
    });
    return entities.map((entity) => Follow.fromEntity(entity));
  }
}
