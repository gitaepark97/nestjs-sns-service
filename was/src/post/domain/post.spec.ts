import { Post } from "./post";
import { PostEntity } from "../repository/entity/post.entity";

describe("게시글 도메인", () => {
  const memberId = 1;
  const content = "게시글 1";

  it("게시글 도메인 생성", () => {
    // given

    // when
    const post = Post.create(memberId, content);

    // then
    expect(post).toBeInstanceOf(Post);
    expect(post.creatorId).toBe(memberId);
    expect(post.content).toBe(content);
  });

  it("게시글 엔티티로부터 게시글 도메인 생성", () => {
    // given
    const postEntity = <PostEntity>{
      id: 1,
      creatorId: memberId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // when
    const member = Post.fromEntity(postEntity);

    // then
    expect(member).toBeInstanceOf(Post);
    expect(member.id).toBe(postEntity.id);
    expect(member.creatorId).toBe(postEntity.creatorId);
    expect(member.content).toBe(postEntity.content);
    expect(member.createdAt).toEqual(postEntity.createdAt);
    expect(member.updatedAt).toEqual(postEntity.updatedAt);
  });

  describe("게시글 내용 수정", () => {
    const post = Post.create(memberId, content);

    it("새로운 내용으로 수정", () => {
      // given
      const newContent = "수정 게시글 1";

      // when
      post.updateContent(newContent);

      // then
      expect(post.content).toBe(newContent);
    });

    it("기존 내용으로 수정", () => {
      // given
      const newContent = post.content;

      // when
      post.updateContent(newContent);

      // then
      expect(post.content).toBe(newContent);
    });
  });
});
