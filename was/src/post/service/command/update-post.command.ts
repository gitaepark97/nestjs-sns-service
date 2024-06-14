export class UpdatePostCommand {
  constructor(
    readonly postId: number,
    readonly memberId: number,
    readonly content: string | undefined,
  ) {}
}
