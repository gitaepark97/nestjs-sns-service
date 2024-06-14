export class CreatePostCommand {
  constructor(
    readonly memberId: number,
    readonly content: string,
  ) {}
}
