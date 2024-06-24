import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "src/config/config.module";
import { MemberEntity } from "src/member/repository/entity/member.entity";
import { DataSource } from "typeorm";
import { Follow } from "../domain/follow";
import { FollowEntity } from "./entity/follow.entity";
import { FollowRepository } from "./follow.repository";
import { FollowRepositoryImpl } from "./follow.repository.impl";

describe("FollowRepository", () => {
  let repository: FollowRepository;
  let db: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, TypeOrmModule.forFeature([FollowEntity])],
      providers: [
        {
          provide: FollowRepository,
          useClass: FollowRepositoryImpl,
        },
      ],
    }).compile();

    repository = module.get<FollowRepository>(FollowRepository);
    db = module.get<DataSource>(DataSource);

    await db.getRepository(MemberEntity).save({
      id: 1,
      email: "member1@email.com",
      password: "Qwer1234!",
      nickname: "회원1",
    });
    await db.getRepository(MemberEntity).save({
      id: 2,
      email: "member2@email.com",
      password: "Qwer1234!",
      nickname: "회원2",
    });
  });

  describe("회원 저장", () => {
    it("팔로우 저장 성공", async () => {
      // given
      const follow = Follow.create(1, 2);

      // when
      await repository.saveFollow(follow);

      // then
      const savedFollowEntity = await db
        .getRepository(FollowEntity)
        .findOne({ where: { followerId: 1, followedId: 2 } });

      expect(savedFollowEntity!.followerId).toBe(follow.followerId);
      expect(savedFollowEntity!.followedId).toBe(follow.followedId);
      expect(savedFollowEntity!.createdAt).toEqual(expect.any(Date));
    });
  });

  describe("팔로우 조회", () => {
    it("팔로우가 존재하는 경우", async () => {
      // given
      await db.getRepository(FollowEntity).save({
        followerId: 1,
        followedId: 2,
      });
      const savedFollowEntity = await db
        .getRepository(FollowEntity)
        .findOne({ where: { followerId: 1, followedId: 2 } });

      // when
      const result = await repository.findFollow(
        savedFollowEntity!.followerId,
        savedFollowEntity!.followedId,
      );

      // then
      expect(result).toBeInstanceOf(Follow);
      expect(result!.followerId).toBe(savedFollowEntity!.followerId);
      expect(result!.followedId).toBe(savedFollowEntity!.followedId);
    });

    it("팔로우가 존재하지 않는 경우", async () => {
      // given

      // when
      const result = await repository.findFollow(2, 1);

      // then
      expect(result).toBeNull();
    });
  });

  describe("팔로우 삭제", () => {
    it("팔로우 성공", async () => {
      // given
      await db.getRepository(FollowEntity).save({
        followerId: 1,
        followedId: 2,
      });
      let savedFollowEntity = await db
        .getRepository(FollowEntity)
        .findOne({ where: { followerId: 1, followedId: 2 } });

      const follow = Follow.fromEntity(savedFollowEntity!);

      // when
      await repository.deleteFollow(follow);

      // then
      savedFollowEntity = await db
        .getRepository(FollowEntity)
        .findOne({ where: { followerId: 1, followedId: 2 } });

      expect(savedFollowEntity).toBeNull();
    });

    it("팔로우가 존재하지 않는 경우", async () => {
      // given
      const followEntity = <FollowEntity>{
        followerId: 1,
        followedId: 2,
      };

      const follow = Follow.fromEntity(followEntity);

      // when
      await expect(() => repository.deleteFollow(follow)).rejects.toThrow(
        "먼저 팔로우해주세요.",
      );

      // then
    });
  });

  describe("팔로워 목록 조회", () => {
    it("팔로워 목록 조회 성공", async () => {
      // given
      await db.getRepository(FollowEntity).save({
        followerId: 1,
        followedId: 2,
      });

      // when
      const result = await repository.findFollowsByFollowerId(1);

      // then
      expect(result.length).toBe(1);
      result.forEach((follow) => {
        expect(follow).toBeInstanceOf(Follow);
        expect(follow.followerId).toBe(1);
        expect(follow.followedId).toEqual(expect.any(Number));
      });
    });
  });
});
