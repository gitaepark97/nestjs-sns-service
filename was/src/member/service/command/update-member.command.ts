export class UpdateMemberCommand {
  constructor(
    readonly id: number,
    readonly nickname: string | undefined,
  ) {}
}
