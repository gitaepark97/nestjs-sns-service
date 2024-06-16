export class UpdatePostCommand {
  constructor(
    readonly memberId: number,
    readonly postId: number,
    readonly content: string | undefined,
  ) {}
}
