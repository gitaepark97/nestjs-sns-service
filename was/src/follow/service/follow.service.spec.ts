import { Test, TestingModule } from "@nestjs/testing";
import { Member } from "../../member/domain/member";
import { MemberEntity } from "../../member/repository/entity/member.entity";
import { GetMemberService } from "../../member/service/get-member.service";
import { Follow } from "../domain/follow";
import { FollowEntity } from "../repository/entity/follow.entity";
import { FollowRepository } from "../repository/follow.repository";
import { FollowService } from "./follow.service";
import { FollowServiceImpl } from "./follow.service.impl";

describe("FollowService", () => {
  let service: FollowService;
  let getMemberService: GetMemberService;
  let followRepository: FollowRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FollowService,
          useClass: FollowServiceImpl,
        },
        {
          provide: GetMemberService,
          useValue: {
            getMember: jest.fn(),
          },
        },
        {
          provide: FollowRepository,
          useValue: {
            saveFollow: jest.fn(),
            findFollow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FollowService>(FollowService);
    getMemberService = module.get<GetMemberService>(GetMemberService);
    followRepository = module.get<FollowRepository>(FollowRepository);
  });

  describe("팔로우", () => {
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

    it("팔로우 성공", async () => {
      // mocking
      const getMemberMock = jest
        .spyOn(getMemberService, "getMember")
        .mockResolvedValueOnce(member2);
      const findFollowMock = jest
        .spyOn(followRepository, "findFollow")
        .mockResolvedValueOnce(null);
      const saveFollowMock = jest
        .spyOn(followRepository, "saveFollow")
        .mockResolvedValueOnce();

      // given

      // when
      await service.follow(member1.id, member2.id);

      // then
      expect(getMemberMock).toHaveBeenCalledTimes(1);
      expect(findFollowMock).toHaveBeenCalledTimes(1);
      expect(saveFollowMock).toHaveBeenCalledTimes(1);
    });

    it("본인 팔로우 시도", async () => {
      // mocking
      const getMemberMock = jest
        .spyOn(getMemberService, "getMember")
        .mockResolvedValue(member1);
      const findFollowMock = jest
        .spyOn(followRepository, "findFollow")
        .mockResolvedValueOnce(null);
      const saveFollowMock = jest
        .spyOn(followRepository, "saveFollow")
        .mockResolvedValueOnce();

      // given

      // when
      await expect(
        async () => await service.follow(member1.id, member1.id),
      ).rejects.toThrow("본인은 팔로우 할 수 없습니다.");

      // then
      expect(getMemberMock).toHaveBeenCalledTimes(0);
      expect(findFollowMock).toHaveBeenCalledTimes(0);
      expect(saveFollowMock).toHaveBeenCalledTimes(0);
    });

    it("이미 팔로우한 상태", async () => {
      // mocking
      const getMemberMock = jest
        .spyOn(getMemberService, "getMember")
        .mockResolvedValue(member1);
      const findFollowMock = jest
        .spyOn(followRepository, "findFollow")
        .mockResolvedValueOnce(follow);
      const saveFollowMock = jest
        .spyOn(followRepository, "saveFollow")
        .mockResolvedValueOnce();

      // given

      // when
      await expect(
        async () => await service.follow(member1.id, member2.id),
      ).rejects.toThrow("이미 팔로우 중입니다.");

      // then
      expect(getMemberMock).toHaveBeenCalledTimes(1);
      expect(findFollowMock).toHaveBeenCalledTimes(1);
      expect(saveFollowMock).toHaveBeenCalledTimes(0);
    });
  });
});
