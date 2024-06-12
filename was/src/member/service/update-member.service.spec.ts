import { Test, TestingModule } from "@nestjs/testing";
import { MemberServiceImpl } from "./member.service.impl";
import { MemberRepository } from "../repository/member.repository";
import { Member } from "../domain/member";
import { UpdateMemberService } from "./update-member.service";
import { UpdateMemberCommand } from "./command/update-member.command";

describe("UpdateMemberService", () => {
  let service: UpdateMemberService;
  let memberRepository: MemberRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UpdateMemberService,
          useClass: MemberServiceImpl,
        },
        {
          provide: MemberRepository,
          useValue: {
            saveMember: jest.fn(),
            findMemberByNickname: jest.fn(),
            findMemberById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UpdateMemberService>(UpdateMemberService);
    memberRepository = module.get<MemberRepository>(MemberRepository);
  });

  describe("회원 수정", () => {
    const member1 = Member.create("member1@email.com", "Qwer1234!", "회원1");
    const member2 = Member.create("member2@email.com", "Qwer1234!", "회원2");

    it("새로운 닉네임으로 수정 성공", async () => {
      // mocking
      const findMemberByIdMock = jest
        .spyOn(memberRepository, "findMemberById")
        .mockResolvedValueOnce(member1);
      const findMemberByNickname = jest
        .spyOn(memberRepository, "findMemberByNickname")
        .mockResolvedValueOnce(null);
      const saveMemberMock = jest
        .spyOn(memberRepository, "saveMember")
        .mockResolvedValueOnce();

      // given
      const command = new UpdateMemberCommand(member1.id, "수정 회원1");

      // when
      await service.updateMember(command);

      // then
      expect(findMemberByIdMock).toHaveBeenCalledTimes(1);
      expect(findMemberByNickname).toHaveBeenCalledTimes(1);
      expect(saveMemberMock).toHaveBeenCalledTimes(1);
    });

    it("기존 닉네임으로 수정 성공", async () => {
      // mocking
      const findMemberByIdMock = jest
        .spyOn(memberRepository, "findMemberById")
        .mockResolvedValueOnce(member1);
      const findMemberByNickname = jest
        .spyOn(memberRepository, "findMemberByNickname")
        .mockResolvedValueOnce(null);
      const saveMemberMock = jest
        .spyOn(memberRepository, "saveMember")
        .mockResolvedValueOnce();

      // given
      const command = new UpdateMemberCommand(member1.id, member1.nickname);

      // when
      await service.updateMember(command);

      // then
      expect(findMemberByIdMock).toHaveBeenCalledTimes(1);
      expect(findMemberByNickname).toHaveBeenCalledTimes(0);
      expect(saveMemberMock).toHaveBeenCalledTimes(1);
    });

    it("존재하지 않는 회원", async () => {
      // mocking
      const findMemberByIdMock = jest
        .spyOn(memberRepository, "findMemberById")
        .mockResolvedValueOnce(null);
      const findMemberByNickname = jest
        .spyOn(memberRepository, "findMemberByNickname")
        .mockResolvedValueOnce(null);
      const saveMemberMock = jest
        .spyOn(memberRepository, "saveMember")
        .mockResolvedValueOnce();

      // given
      const command = new UpdateMemberCommand(1, "수정 회원1");

      // when
      await expect(() => service.updateMember(command)).rejects.toThrow(
        "존재하지 않는 회원입니다.",
      );

      // then
      expect(findMemberByIdMock).toHaveBeenCalledTimes(1);
      expect(findMemberByNickname).toHaveBeenCalledTimes(0);
      expect(saveMemberMock).toHaveBeenCalledTimes(0);
    });

    it("이미 사용 중인 닉네임", async () => {
      // mocking
      const findMemberByIdMock = jest
        .spyOn(memberRepository, "findMemberById")
        .mockResolvedValueOnce(member1);
      const findMemberByNickname = jest
        .spyOn(memberRepository, "findMemberByNickname")
        .mockResolvedValueOnce(member2);
      const saveMemberMock = jest
        .spyOn(memberRepository, "saveMember")
        .mockResolvedValueOnce();

      // given
      const command = new UpdateMemberCommand(member1.id, member2.nickname);

      // when
      await expect(() => service.updateMember(command)).rejects.toThrow(
        "이미 사용 중인 닉네임입니다.",
      );

      // then
      expect(findMemberByIdMock).toHaveBeenCalledTimes(1);
      expect(findMemberByNickname).toHaveBeenCalledTimes(1);
      expect(saveMemberMock).toHaveBeenCalledTimes(0);
    });
  });
});
