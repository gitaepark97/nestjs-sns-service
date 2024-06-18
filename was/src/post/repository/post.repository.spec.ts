import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "src/config/config.module";
import { DataSource } from "typeorm";
import { PostRepository } from "./post.repository";
import { PostRepositoryImpl } from "./post.repository.impl";
import { Post } from "../domain/post";
import { PostEntity } from "./entity/post.entity";
import { MemberEntity } from "../../member/repository/entity/member.entity";

describe("PostRepository", () => {
  let repository: PostRepository;
  let db: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, TypeOrmModule.forFeature([PostEntity])],
      providers: [
        {
          provide: PostRepository,
          useClass: PostRepositoryImpl,
        },
      ],
    }).compile();

    repository = module.get<PostRepository>(PostRepository);
    db = module.get<DataSource>(DataSource);

    await db.getRepository(MemberEntity).save({
      id: 1,
      email: "member1@email.com",
      password: "Qwer1234!",
      nickname: "회원1",
    });
  });

  describe("게시글 저장", () => {
    it("ID가 없는 게시글 저장 성공", async () => {
      // given
      const post = Post.create(1, "게시글 1");

      // when
      await repository.savePost(post);

      // then
      const savedPostEntity = await db
        .getRepository(PostEntity)
        .findOne({ where: { id: 1 } });

      expect(savedPostEntity).toBeInstanceOf(PostEntity);
      expect(savedPostEntity!.creatorId).toBe(post.creatorId);
      expect(savedPostEntity!.content).toBe(post.content);
      expect(savedPostEntity!.createdAt).toEqual(expect.any(Date));
      expect(savedPostEntity!.updatedAt).toEqual(expect.any(Date));
    });

    it("ID가 있는 게시글 저장 성공", async () => {
      // given
      const postEn = <PostEntity>{
        id: 1,
        creatorId: 1,
        content: "게시글 1",
      };

      const post = Post.fromEntity(postEn);

      // when
      await repository.savePost(post);

      // then
      const savedPostEntity = await db
        .getRepository(PostEntity)
        .findOne({ where: { id: post.id } });

      expect(savedPostEntity).toBeInstanceOf(PostEntity);
      expect(savedPostEntity!.id).toBe(post.id);
      expect(savedPostEntity!.creatorId).toBe(post.creatorId);
      expect(savedPostEntity!.content).toBe(post.content);
      expect(savedPostEntity!.createdAt).toEqual(expect.any(Date));
      expect(savedPostEntity!.updatedAt).toEqual(expect.any(Date));
    });
  });

  describe("ID를 통한 게시글 조회", () => {
    it("ID가 일치하는 회원이 존재하는 경우", async () => {
      // given
      await db.getRepository(PostEntity).save({
        id: 1,
        creatorId: 1,
        content: "게시글 1",
      });
      const savedPostEntity = await db
        .getRepository(PostEntity)
        .findOne({ where: { id: 1 } });

      // when
      const result = await repository.findPostById(savedPostEntity!.id);

      // then
      expect(result).toBeInstanceOf(Post);
      expect(result!.id).toBe(savedPostEntity!.id);
      expect(result!.creatorId).toBe(savedPostEntity!.creatorId);
      expect(result!.content).toBe(savedPostEntity!.content);
      expect(result!.createdAt).toEqual(savedPostEntity!.createdAt);
      expect(result!.updatedAt).toEqual(savedPostEntity!.updatedAt);
    });

    it("ID가 일치하는 회원이 존재하지 않는 경우", async () => {
      // given

      // when
      const result = await repository.findPostById(2);

      // then
      expect(result).toBeNull();
    });
  });

  describe("게시글 삭제", () => {
    it("게시글 삭제 성공", async () => {
      // given
      await db.getRepository(PostEntity).save({
        id: 1,
        creatorId: 1,
        content: "게시글 1",
      });
      let savedPostEntity = await db
        .getRepository(PostEntity)
        .findOne({ where: { id: 1 } });

      const post = Post.fromEntity(savedPostEntity!);

      // when
      await repository.deletePost(post);

      // then
      savedPostEntity = await db
        .getRepository(PostEntity)
        .findOne({ where: { id: 1 } });

      expect(savedPostEntity).toBeNull();
    });

    it("회원이 존재하지 않는 경우", async () => {
      // given
      const postEntity = <PostEntity>{
        id: 2,
        creatorId: 1,
        content: "게시글 2",
      };

      const post = Post.fromEntity(postEntity);

      // when
      await expect(() => repository.deletePost(post)).rejects.toThrow(
        "존재하지 않는 게시글입니다.",
      );

      // then
    });
  });

  describe("회원 게시글 목록 조회", () => {
    beforeEach(async () => {
      for (let i = 1; i <= 20; i++) {
        await db.getRepository(PostEntity).save({
          id: i,
          creatorId: 1,
          content: `게시글 ${i}`,
        });
      }
    });

    it("회원 게시글 목록 조회 성공", async () => {
      // given
      const memberId = 1;
      const pageSize = 10;

      // when
      const posts = await repository.findPostsByMemberId(memberId, pageSize);

      // then
      expect(posts.length).toBe(pageSize);
      posts.forEach((post, idx) => {
        expect(post.id).toBe(20 - idx);
        expect(post.creatorId).toBe(1);
        expect(post.content).toBe(`게시글 ${20 - idx}`);
        expect(post.createdAt).toEqual(expect.any(Date));
        expect(post.updatedAt).toEqual(expect.any(Date));
      });
    });
  });

  describe("커서로 회원 게시글 목록 조회", () => {
    beforeEach(async () => {
      for (let i = 1; i <= 20; i++) {
        await db.getRepository(PostEntity).save({
          id: i,
          creatorId: 1,
          content: `게시글 ${i}`,
        });
      }
    });

    it("회원 게시글 목록 조회 성공", async () => {
      // given
      const memberId = 1;
      const pageSize = 10;
      const cursor = 16;

      // when
      const posts = await repository.findPostsWithCursorByMemberId(
        memberId,
        pageSize,
        cursor,
      );

      // then
      expect(posts.length).toBe(pageSize);
      posts.forEach((post, idx) => {
        expect(post.id).toBe(cursor - idx - 1);
        expect(post.creatorId).toBe(1);
        expect(post.content).toBe(`게시글 ${cursor - idx - 1}`);
        expect(post.createdAt).toEqual(expect.any(Date));
        expect(post.updatedAt).toEqual(expect.any(Date));
      });
    });
  });

  describe("회원 게시글 개수 조회", () => {
    beforeEach(async () => {
      for (let i = 1; i <= 20; i++) {
        await db.getRepository(PostEntity).save({
          id: i,
          creatorId: 1,
          content: `게시글 ${i}`,
        });
      }
    });

    it("회원 게시글 목록 조회 성공", async () => {
      // given
      const memberId = 1;

      // when
      const totalCount = await repository.countPostsByMemberId(memberId);

      // then
      expect(totalCount).toBe(20);
    });
  });
});
