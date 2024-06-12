import { UpdateMemberCommand } from "./command/update-member.command";

export abstract class UpdateMemberService {
  abstract updateMember(command: UpdateMemberCommand): Promise<void>;
}
