import { Test, TestingModule } from "@nestjs/testing";
import { PostRepository } from "../repository/post.repository";
import { PostServiceImpl } from "./post.service.impl";
import { Member } from "../../member/domain/member";
import { MemberEntity } from "../../member/repository/entity/member.entity";
import { Post } from "../domain/post";
import { PostEntity } from "../repository/entity/post.entity";
import { GetMemberPostsService } from "./get-member-posts.service";
import { GetMemberService } from "../../member/service/get-member.service";

describe("GetMemberPostsService", () => {
  let service: GetMemberPostsService;
  let getMemberService: GetMemberService;
  let postRepository: PostRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetMemberPostsService,
          useClass: PostServiceImpl,
        },
        {
          provide: GetMemberService,
          useValue: {
            getMember: jest.fn(),
          },
        },
        {
          provide: PostRepository,
          useValue: {
            findPostsByMemberId: jest.fn(),
            findPostsWithCursorByMemberId: jest.fn(),
            countPostsByMemberId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GetMemberPostsService>(GetMemberPostsService);
    getMemberService = module.get<GetMemberService>(GetMemberService);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  describe("회원 게시글 목록 조회", () => {
    const member = Member.fromEntity(<MemberEntity>{
      id: 1,
      email: "member1@email.com",
      password: "Qwer1234!",
      nickname: "회원1",
    });
    const posts = Array.from({ length: 20 }, (_, idx) =>
      Post.fromEntity(<PostEntity>{
        id: idx + 1,
        creatorId: member.id,
        content: `게시글 ${idx + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).reverse();

    it("회원 게시글 목록 조회 성공", async () => {
      // mocking
      const getMemberMock = jest
        .spyOn(getMemberService, "getMember")
        .mockResolvedValueOnce(member);
      const findPostsByMemberIdMock = jest
        .spyOn(postRepository, "findPostsByMemberId")
        .mockImplementation(async (_, pageSize) => posts.slice(0, pageSize));
      const countPostsByMemberIdMock = jest
        .spyOn(postRepository, "countPostsByMemberId")
        .mockResolvedValueOnce(posts.length);

      // given
      const pageSize = 10;

      // when
      const result = await service.getMemberPosts(member.id, pageSize);

      // then
      expect(result.posts.length).toBe(pageSize);
      expect(result.totalCount).toBe(posts.length);

      result.posts.forEach((post, idx) => {
        expect(post.id).toBe(posts.length - idx);
        expect(post.creatorId).toBe(member.id);
        expect(post.content).toBe(`게시글 ${posts.length - idx}`);
        expect(post.createdAt).toEqual(expect.any(Date));
        expect(post.updatedAt).toEqual(expect.any(Date));
      });

      expect(getMemberMock).toHaveBeenCalledTimes(1);
      expect(findPostsByMemberIdMock).toHaveBeenCalledTimes(1);
      expect(countPostsByMemberIdMock).toHaveBeenCalledTimes(1);
    });

    it("마지막 게시글 ID로 회원 게시글 목록 조회 성공", async () => {
      // mocking
      const getMemberMock = jest
        .spyOn(getMemberService, "getMember")
        .mockResolvedValueOnce(member);
      const findPostsWithCursorByMemberIdMock = jest
        .spyOn(postRepository, "findPostsWithCursorByMemberId")
        .mockImplementation(async (_, pageSize, cursor) =>
          posts.slice(
            posts.length - cursor + 1,
            posts.length - cursor + 1 + pageSize,
          ),
        );
      const countPostsByMemberIdMock = jest
        .spyOn(postRepository, "countPostsByMemberId")
        .mockResolvedValueOnce(posts.length);

      // given
      const pageSize = 10;
      const lastPostId = 16;

      // when
      const result = await service.getMemberPosts(
        member.id,
        pageSize,
        lastPostId,
      );

      // then
      expect(result.posts.length).toBe(pageSize);
      expect(result.totalCount).toBe(posts.length);

      result.posts.forEach((post, idx) => {
        expect(post.id).toBe(lastPostId - idx - 1);
        expect(post.creatorId).toBe(member.id);
        expect(post.content).toBe(`게시글 ${lastPostId - idx - 1}`);
        expect(post.createdAt).toEqual(expect.any(Date));
        expect(post.updatedAt).toEqual(expect.any(Date));
      });

      expect(getMemberMock).toHaveBeenCalledTimes(1);
      expect(findPostsWithCursorByMemberIdMock).toHaveBeenCalledTimes(1);
      expect(countPostsByMemberIdMock).toHaveBeenCalledTimes(1);
    });
  });
});
