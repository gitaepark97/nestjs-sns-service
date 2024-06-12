import { Member } from "../domain/member";

export abstract class GetMemberService {
  abstract getMember(id: number): Promise<Member>;
}
