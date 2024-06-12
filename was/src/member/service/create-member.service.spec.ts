import { Test, TestingModule } from "@nestjs/testing";
import { CreateMemberService } from "./create-member.service";
import { MemberServiceImpl } from "./member.service.impl";
import { MemberRepository } from "../repository/member.repository";
import { CreateMemberCommand } from "./command/create-member.command";
import { Member } from "../domain/member";

describe("CreateMemberService", () => {
  let service: CreateMemberService;
  let memberRepository: MemberRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CreateMemberService,
          useClass: MemberServiceImpl,
        },
        {
          provide: MemberRepository,
          useValue: {
            findMemberByEmail: jest.fn(),
            findMemberByNickname: jest.fn(),
            saveMember: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreateMemberService>(CreateMemberService);
    memberRepository = module.get<MemberRepository>(MemberRepository);
  });

  describe("회원 생성", () => {
    const member1 = Member.create("member1@email.com", "Qwer1234!", "회원1");

    it("회원 생성 성공", async () => {
      // mocking
      const findMemberByEmailMock = jest
        .spyOn(memberRepository, "findMemberByEmail")
        .mockResolvedValueOnce(null);
      const findMemberByNicknameMock = jest
        .spyOn(memberRepository, "findMemberByNickname")
        .mockResolvedValueOnce(null);
      const saveMemberMock = jest
        .spyOn(memberRepository, "saveMember")
        .mockResolvedValueOnce();

      // given
      const command = new CreateMemberCommand(
        "member2@email.com",
        "Qwer1234!",
        "회원2",
      );

      // when
      await service.createMember(command);

      // then
      expect(findMemberByEmailMock).toHaveBeenCalledTimes(1);
      expect(findMemberByNicknameMock).toHaveBeenCalledTimes(1);
      expect(saveMemberMock).toHaveBeenCalledTimes(1);
    });

    it("이메일 중복", async () => {
      // mocking
      const findMemberByEmailMock = jest
        .spyOn(memberRepository, "findMemberByEmail")
        .mockResolvedValueOnce(member1);
      const findMemberByNicknameMock = jest
        .spyOn(memberRepository, "findMemberByNickname")
        .mockResolvedValueOnce(null);
      const saveMemberMock = jest
        .spyOn(memberRepository, "saveMember")
        .mockResolvedValueOnce();

      // given
      const command = new CreateMemberCommand(
        member1.email,
        "Qwer1234!",
        "회원2",
      );

      // when
      await expect(() => service.createMember(command)).rejects.toThrow(
        "이미 사용 중인 이메일입니다.",
      );

      // then
      expect(findMemberByEmailMock).toHaveBeenCalledTimes(1);
      expect(findMemberByNicknameMock).toHaveBeenCalledTimes(1);
      expect(saveMemberMock).toHaveBeenCalledTimes(0);
    });

    it("닉네임 중복", async () => {
      // mocking
      const findMemberByEmailMock = jest
        .spyOn(memberRepository, "findMemberByEmail")
        .mockResolvedValueOnce(null);
      const findMemberByNicknameMock = jest
        .spyOn(memberRepository, "findMemberByNickname")
        .mockResolvedValueOnce(member1);
      const saveMemberMock = jest
        .spyOn(memberRepository, "saveMember")
        .mockResolvedValueOnce();

      // given
      const command = new CreateMemberCommand(
        "member2@email.com",
        "Qwer1234!",
        member1.nickname,
      );

      // when
      await expect(() => service.createMember(command)).rejects.toThrow(
        "이미 사용 중인 닉네임입니다.",
      );

      // then
      expect(findMemberByEmailMock).toHaveBeenCalledTimes(1);
      expect(findMemberByNicknameMock).toHaveBeenCalledTimes(1);
      expect(saveMemberMock).toHaveBeenCalledTimes(0);
    });
  });
});
