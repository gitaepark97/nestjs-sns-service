import { Test, TestingModule } from "@nestjs/testing";
import { MemberServiceImpl } from "./member.service.impl";
import { MemberRepository } from "../repository/member.repository";
import { Member } from "../domain/member";
import { GetMemberService } from "./get-member.service";

describe("GetMemberService", () => {
  let service: GetMemberService;
  let memberRepository: MemberRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetMemberService,
          useClass: MemberServiceImpl,
        },
        {
          provide: MemberRepository,
          useValue: {
            findMemberById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GetMemberService>(GetMemberService);
    memberRepository = module.get<MemberRepository>(MemberRepository);
  });

  describe("회원 조회", () => {
    const member = Member.create("member1@email.com", "Qwer1234!", "회원1");

    it("회원 조회 성공", async () => {
      // mocking
      const findMemberByIdMock = jest
        .spyOn(memberRepository, "findMemberById")
        .mockResolvedValueOnce(member);

      // given

      // when
      const result = await service.getMember(member.id);

      // then
      expect(result.id).toBe(member.id);
      expect(result.email).toBe(member.email);
      expect(result.password).toBe(member.password);
      expect(result.nickname).toBe(member.nickname);

      expect(findMemberByIdMock).toHaveBeenCalledTimes(1);
    });

    it("존재하지 않는 회원", async () => {
      // mocking
      const findMemberByIdMock = jest
        .spyOn(memberRepository, "findMemberById")
        .mockResolvedValueOnce(null);

      // given

      // when
      await expect(() => service.getMember(2)).rejects.toThrow(
        "존재하지 않는 회원입니다.",
      );

      // then
      expect(findMemberByIdMock).toHaveBeenCalledTimes(1);
    });
  });
});
