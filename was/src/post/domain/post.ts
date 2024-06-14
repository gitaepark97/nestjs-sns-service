import { PostEntity } from "../repository/entity/post.entity";

type PostLike = Pick<
  Post,
  "id" | "creatorId" | "content" | "createdAt" | "updatedAt"
>;

export class Post {
  private _id: number;
  private _creatorId: number;
  private _content: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  get id() {
    return this._id;
  }

  get creatorId() {
    return this._creatorId;
  }

  get content() {
    return this._content;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  set content(content: string) {
    this._content = content;
  }

  static create(memberId: number, content: string) {
    const post = new Post();

    post._creatorId = memberId;
    post._content = content;

    return post;
  }

  static fromEntity(entity: PostEntity) {
    const post = new Post();

    post._id = entity.id;
    post._creatorId = entity.creatorId;
    post._content = entity.content;
    post._createdAt = new Date(entity.createdAt);
    post._updatedAt = new Date(entity.updatedAt);

    return post;
  }

  isCreator(memberId: number) {
    return memberId === this._creatorId;
  }

  updateContent(newContent?: string) {
    // 변경할 게시글 내용 존재하지 않는 경우
    if (!newContent) return;

    // 변경할 게시글 내용이 기존과 동일한 경우
    if (newContent === this._content) return;

    // 게시글 내용 변경
    this._content = newContent;
  }
}
