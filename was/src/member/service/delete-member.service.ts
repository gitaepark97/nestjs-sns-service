export abstract class DeleteMemberService {
  abstract deleteMember(memberId: number): Promise<void>;
}
