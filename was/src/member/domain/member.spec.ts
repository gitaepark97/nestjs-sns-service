import { Member } from "./member";
import { MemberEntity } from "../repository/entity/member.entity";

describe("회원 도메인", () => {
  const email = "member1@email.com";
  const password = "Qwer1234!";
  const nickname = "회원1";

  it("회원 도메인 생성", () => {
    // given

    // when
    const member = Member.create(email, password, nickname);

    // then
    expect(member).toBeInstanceOf(Member);
    expect(member.email).toBe(email);
    expect(member.password).toBe(password);
    expect(member.nickname).toBe(nickname);
  });

  it("회원의 정보를 가진 객체로부터 회원 도메인 생성", () => {
    // given
    const memberEntity = new MemberEntity();
    memberEntity.id = 1;
    memberEntity.email = email;
    memberEntity.password = password;
    memberEntity.nickname = nickname;
    memberEntity.createdAt = new Date();
    memberEntity.updatedAt = new Date();

    // when
    const member = Member.fromEntity(memberEntity);

    // then
    expect(member).toBeInstanceOf(Member);
    expect(member.id).toBe(memberEntity.id);
    expect(member.email).toBe(memberEntity.email);
    expect(member.password).toBe(memberEntity.password);
    expect(member.nickname).toBe(memberEntity.nickname);
  });

  describe("회원 닉네임 수정", () => {
    const member = Member.create(email, password, nickname);

    it("새로운 닉네임으로 수정", async () => {
      // mocking
      const validator = (nickname: string) => Promise.resolve();

      // given
      const newNickname = "수정 회원1";

      // when
      await member.updateNickname(validator, newNickname);

      // then
      expect(member.nickname).toBe(newNickname);
    });

    it("기존 닉네임으로 수정", async () => {
      // mocking
      const validator = (nickname: string) => Promise.resolve();

      // given
      const newNickname = member.nickname;

      // when
      await member.updateNickname(validator, newNickname);

      // then
      expect(member.nickname).toBe(newNickname);
    });
  });
});
