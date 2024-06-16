import { Test, TestingModule } from "@nestjs/testing";
import { GetMemberService } from "../../member/service/get-member.service";
import { PostRepository } from "../repository/post.repository";
import { PostServiceImpl } from "./post.service.impl";
import { Member } from "../../member/domain/member";
import { MemberEntity } from "../../member/repository/entity/member.entity";
import { DeletePostService } from "./delete-post.service";
import { Post } from "../domain/post";
import { PostEntity } from "../repository/entity/post.entity";

describe("DeletePostService", () => {
  let service: DeletePostService;
  let getMemberService: GetMemberService;
  let postRepository: PostRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DeletePostService,
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
            findPostById: jest.fn(),
            deletePost: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DeletePostService>(DeletePostService);
    getMemberService = module.get<GetMemberService>(GetMemberService);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  describe("게시글 삭제", () => {
    const member = Member.fromEntity(<MemberEntity>{
      id: 1,
      email: "member1@email.com",
      password: "Qwer1234!",
      nickname: "회원1",
    });
    const post1 = Post.fromEntity(<PostEntity>{
      id: 1,
      creatorId: member.id,
      content: "게시글 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const post2 = Post.fromEntity(<PostEntity>{
      id: 2,
      creatorId: 2,
      content: "게시글 2",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it("게시글 삭제 성공", async () => {
      // mocking
      const getMemberMock = jest
        .spyOn(getMemberService, "getMember")
        .mockResolvedValueOnce(member);
      const findPostByIdMock = jest
        .spyOn(postRepository, "findPostById")
        .mockResolvedValueOnce(post1);
      const deletePostMock = jest
        .spyOn(postRepository, "deletePost")
        .mockResolvedValueOnce();

      // given

      // when
      await service.deletePost(member.id, post1.id);

      // then
      expect(getMemberMock).toHaveBeenCalledTimes(1);
      expect(findPostByIdMock).toHaveBeenCalledTimes(1);
      expect(deletePostMock).toHaveBeenCalledTimes(1);
    });

    it("존재하지 않는 게시글", async () => {
      // mocking
      const getMemberMock = jest
        .spyOn(getMemberService, "getMember")
        .mockResolvedValueOnce(member);
      const findPostByIdMock = jest
        .spyOn(postRepository, "findPostById")
        .mockResolvedValueOnce(null);
      const deletePostMock = jest
        .spyOn(postRepository, "deletePost")
        .mockResolvedValueOnce();

      // given

      // when
      await expect(() => service.deletePost(member.id, 3)).rejects.toThrow(
        "존재하지 않는 게시글입니다.",
      );

      // then
      expect(getMemberMock).toHaveBeenCalledTimes(1);
      expect(findPostByIdMock).toHaveBeenCalledTimes(1);
      expect(deletePostMock).toHaveBeenCalledTimes(0);
    });

    it("권한이 없는 회원", async () => {
      // mocking
      const getMemberMock = jest
        .spyOn(getMemberService, "getMember")
        .mockResolvedValueOnce(member);
      const findPostByIdMock = jest
        .spyOn(postRepository, "findPostById")
        .mockResolvedValueOnce(post2);
      const deletePostMock = jest
        .spyOn(postRepository, "deletePost")
        .mockResolvedValueOnce();

      // given

      // when
      await expect(() =>
        service.deletePost(member.id, post2.id),
      ).rejects.toThrow("권한이 없습니다.");

      // then
      expect(getMemberMock).toHaveBeenCalledTimes(1);
      expect(findPostByIdMock).toHaveBeenCalledTimes(1);
      expect(deletePostMock).toHaveBeenCalledTimes(0);
    });
  });
});
