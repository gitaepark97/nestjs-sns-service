import { Test, TestingModule } from "@nestjs/testing";
import { Member } from "../../member/domain/member";
import { MemberEntity } from "../../member/repository/entity/member.entity";
import { GetMemberService } from "../../member/service/get-member.service";
import { Follow } from "../domain/follow";
import { FollowEntity } from "../repository/entity/follow.entity";
import { FollowRepository } from "../repository/follow.repository";
import { FollowServiceImpl } from "./follow.service.impl";
import { UnfollowService } from "./unfollow.service";

describe("UnfollowService", () => {
  let service: UnfollowService;
  let followRepository: FollowRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UnfollowService,
          useClass: FollowServiceImpl,
        },
        {
          provide: GetMemberService,
          useValue: {},
        },
        {
          provide: FollowRepository,
          useValue: {
            findFollow: jest.fn(),
            deleteFollow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UnfollowService>(UnfollowService);
    followRepository = module.get<FollowRepository>(FollowRepository);
  });

  describe("팔로우 취소", () => {
    const member1 = Member.fromEntity(<MemberEntity>{
      id: 1,
      email: "member1@email.com",
      password: "Qwer1234!",
      nickname: "회원1",
    });
    const member2 = Member.fromEntity(<MemberEntity>{
      id: 2,
      email: "member2@email.com",
      password: "Qwer1234!",
      nickname: "회원2",
    });

    const follow = Follow.fromEntity(<FollowEntity>{
      followerId: member1.id,
      followedId: member2.id,
    });

    it("팔로우 취소 성공", async () => {
      // mocking
      const findFollowMock = jest
        .spyOn(followRepository, "findFollow")
        .mockResolvedValueOnce(follow);
      const deleteFollowMock = jest
        .spyOn(followRepository, "deleteFollow")
        .mockResolvedValueOnce();

      // given

      // when
      await service.unfollow(member1.id, member2.id);

      // then
      expect(findFollowMock).toHaveBeenCalledTimes(1);
      expect(deleteFollowMock).toHaveBeenCalledTimes(1);
    });

    it("본인 팔로우 시도", async () => {
      // mocking
      const findFollowMock = jest
        .spyOn(followRepository, "findFollow")
        .mockResolvedValueOnce(follow);
      const deleteFollowMock = jest
        .spyOn(followRepository, "deleteFollow")
        .mockResolvedValueOnce();

      // given

      // when
      await expect(
        async () => await service.unfollow(member1.id, member1.id),
      ).rejects.toThrow("본인은 팔로우 할 수 없습니다.");

      // then
      expect(findFollowMock).toHaveBeenCalledTimes(0);
      expect(deleteFollowMock).toHaveBeenCalledTimes(0);
    });

    it("팔로우하지 않은 상태", async () => {
      // mocking
      const findFollowMock = jest
        .spyOn(followRepository, "findFollow")
        .mockResolvedValueOnce(null);
      const deleteFollowMock = jest
        .spyOn(followRepository, "deleteFollow")
        .mockResolvedValueOnce();

      // given

      // when
      await expect(
        async () => await service.unfollow(member1.id, member2.id),
      ).rejects.toThrow("먼저 팔로우해주세요.");

      // then
      expect(findFollowMock).toHaveBeenCalledTimes(1);
      expect(deleteFollowMock).toHaveBeenCalledTimes(0);
    });
  });
});
