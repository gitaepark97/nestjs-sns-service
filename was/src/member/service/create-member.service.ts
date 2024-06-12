import { CreateMemberCommand } from "./command/create-member.command";

export abstract class CreateMemberService {
  abstract createMember(command: CreateMemberCommand): Promise<void>;
}
