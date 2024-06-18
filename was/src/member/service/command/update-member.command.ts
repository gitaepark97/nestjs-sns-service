export class UpdateMemberCommand {
  constructor(
    readonly memberId: number,
    readonly nickname: string | undefined,
  ) {}
}
