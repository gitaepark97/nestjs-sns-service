import { Member } from "../domain/member";

export abstract class MemberRepository {
  abstract saveMember(member: Member): Promise<void>;

  abstract findMemberByEmail(email: string): Promise<Member | null>;

  abstract findMemberByNickname(nickname: string): Promise<Member | null>;

  abstract findMemberById(id: number): Promise<Member | null>;

  abstract deleteMember(member: Member): Promise<void>;
}
