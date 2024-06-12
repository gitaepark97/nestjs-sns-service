export class CreateMemberCommand {
  constructor(
    readonly email: string,
    readonly password: string,
    readonly nickname: string,
  ) {}
}
