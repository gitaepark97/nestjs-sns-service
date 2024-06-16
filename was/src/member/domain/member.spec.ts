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

  it("회원 엔티티로부터 회원 도메인 생성", () => {
    // given
    const memberEntity = <MemberEntity>{
      id: 1,
      email,
      password,
      nickname,
    };

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
      // given
      const newNickname = "수정 회원1";

      // when
      member.updateNickname(newNickname);

      // then
      expect(member.nickname).toBe(newNickname);
    });

    it("기존 닉네임으로 수정", () => {
      // given
      const newNickname = member.nickname;

      // when
      member.updateNickname(newNickname);

      // then
      expect(member.nickname).toBe(newNickname);
    });
  });
});
