import { Test, TestingModule } from "@nestjs/testing";
import { GetMemberService } from "../../member/service/get-member.service";
import { Follow } from "../domain/follow";
import { FollowEntity } from "../repository/entity/follow.entity";
import { FollowRepository } from "../repository/follow.repository";
import { FollowServiceImpl } from "./follow.service.impl";
import { GetFollowingIdsService } from "./get-following.service";

describe("GetFollowingService", () => {
  let service: GetFollowingIdsService;
  let followRepository: FollowRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetFollowingIdsService,
          useClass: FollowServiceImpl,
        },
        {
          provide: GetMemberService,
          useValue: {},
        },
        {
          provide: FollowRepository,
          useValue: {
            findFollowsByFollowerId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GetFollowingIdsService>(GetFollowingIdsService);
    followRepository = module.get<FollowRepository>(FollowRepository);
  });

  describe("팔로워 목록 조회", () => {
    const follow1 = Follow.fromEntity(<FollowEntity>{
      followerId: 1,
      followedId: 2,
    });
    const follow2 = Follow.fromEntity(<FollowEntity>{
      followerId: 1,
      followedId: 3,
    });

    it("팔로워 목록 성공", async () => {
      // mocking
      const findFollowsByFollowerIdMock = jest
        .spyOn(followRepository, "findFollowsByFollowerId")
        .mockResolvedValueOnce([follow1, follow2]);

      // given

      // when
      const result = await service.getFollowingIds(1);

      // then
      result.forEach((memberId) => {
        expect(memberId).toEqual(expect.any(Number));
      });

      expect(findFollowsByFollowerIdMock).toHaveBeenCalledTimes(1);
    });
  });
});
