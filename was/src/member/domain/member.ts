import { MemberEntity } from "../repository/entity/member.entity";

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

  static fromEntity(entity: MemberEntity) {
    const member = new Member();

    member._id = entity.id;
    member._email = entity.email;
    member._password = entity.password;
    member._nickname = entity.nickname;

    return member;
  }

  async updateNickname(
    validator: (nickname: string) => Promise<void>,
    newNickname?: string,
  ) {
    // 변경할 닉네임이 존재하지 않는 경우
    if (!newNickname) return;

    // 변경할 닉네임이 기존과 동일한 경우
    if (newNickname === this._nickname) return;

    // 닉네임 중복 확인
    await validator(newNickname);

    // 회원의 닉네임 변경
    this._nickname = newNickname;
  }
}
