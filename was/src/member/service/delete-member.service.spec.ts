import { Test, TestingModule } from "@nestjs/testing";
import { MemberServiceImpl } from "./member.service.impl";
import { MemberRepository } from "../repository/member.repository";
import { Member } from "../domain/member";
import { DeleteMemberService } from "./delete-member.service";

describe("DeleteMemberService", () => {
  let service: DeleteMemberService;
  let memberRepository: MemberRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DeleteMemberService,
          useClass: MemberServiceImpl,
        },
        {
          provide: MemberRepository,
          useValue: {
            findMemberById: jest.fn(),
            deleteMember: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DeleteMemberService>(DeleteMemberService);
    memberRepository = module.get<MemberRepository>(MemberRepository);
  });

  describe("회원 삭제", () => {
    const member1 = Member.create("member1@email.com", "Qwer1234!", "회원1");

    it("회원 삭제 성공", async () => {
      // mocking
      const findMemberByIdMock = jest
        .spyOn(memberRepository, "findMemberById")
        .mockResolvedValueOnce(member1);
      const deleteMemberMock = jest
        .spyOn(memberRepository, "deleteMember")
        .mockResolvedValueOnce();

      // given

      // when
      await service.deleteMember(member1.id);

      // then
      expect(findMemberByIdMock).toHaveBeenCalledTimes(1);
      expect(deleteMemberMock).toHaveBeenCalledTimes(1);
    });

    it("존재하지 않는 회원", async () => {
      // mocking
      const findMemberByIdMock = jest
        .spyOn(memberRepository, "findMemberById")
        .mockResolvedValueOnce(null);
      const deleteMemberMock = jest
        .spyOn(memberRepository, "deleteMember")
        .mockResolvedValueOnce();

      // given

      // when
      await expect(() => service.deleteMember(2)).rejects.toThrow(
        "존재하지 않는 회원입니다.",
      );

      // then
      expect(findMemberByIdMock).toHaveBeenCalledTimes(1);
      expect(deleteMemberMock).toHaveBeenCalledTimes(0);
    });
  });
});
