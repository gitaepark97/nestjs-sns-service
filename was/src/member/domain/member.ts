type MemberLike = Pick<Member, "id" | "email" | "password" | "nickname">;

export class Member {
  private _id: number;
  private _email: string;
  private _password: string;
  private _nickname: string;

  get id() {
    return this._id;
  }

  get email() {
    return this._email;
  }

  get password() {
    return this._password;
  }

  get nickname() {
    return this._nickname;
  }

  set nickname(nickname: string) {
    this._nickname = nickname;
  }

  static create(email: string, password: string, nickname: string) {
    const member = new Member();

    member._email = email;
    member._password = password;
    member._nickname = nickname;

    return member;
  }

  static fromMemberLike(memberLike: MemberLike) {
    const member = new Member();

    member._id = memberLike.id;
    member._email = memberLike.email;
    member._password = memberLike.password;
    member._nickname = memberLike.nickname;

    return member;
  }
}
