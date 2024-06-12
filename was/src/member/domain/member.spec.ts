import { Member } from "./member";

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
    const memberLike = {
      id: 1,
      email,
      password,
      nickname,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // when
    const member = Member.fromMemberLike(memberLike);

    // then
    expect(member).toBeInstanceOf(Member);
    expect(member.id).toBe(memberLike.id);
    expect(member.email).toBe(memberLike.email);
    expect(member.password).toBe(memberLike.password);
    expect(member.nickname).toBe(memberLike.nickname);
  });
});
