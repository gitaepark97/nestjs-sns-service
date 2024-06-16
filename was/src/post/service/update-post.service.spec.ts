import { Test, TestingModule } from "@nestjs/testing";
import { GetMemberService } from "../../member/service/get-member.service";
import { PostRepository } from "../repository/post.repository";
import { PostServiceImpl } from "./post.service.impl";
import { Member } from "../../member/domain/member";
import { MemberEntity } from "../../member/repository/entity/member.entity";
import { Post } from "../domain/post";
import { PostEntity } from "../repository/entity/post.entity";
import { UpdatePostService } from "./update-post.service";
import { UpdatePostCommand } from "./command/update-post.command";

describe("UpdatePostService", () => {
  let service: UpdatePostService;
  let getMemberService: GetMemberService;
  let postRepository: PostRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UpdatePostService,
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
            savePost: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UpdatePostService>(UpdatePostService);
    getMemberService = module.get<GetMemberService>(GetMemberService);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  describe("게시글 수정", () => {
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

    it("새로운 내용으로 수정 성공", async () => {
      // mocking
      const getMemberMock = jest
        .spyOn(getMemberService, "getMember")
        .mockResolvedValueOnce(member);
      const findPostByIdMock = jest
        .spyOn(postRepository, "findPostById")
        .mockResolvedValueOnce(post1);
      const savePostMock = jest
        .spyOn(postRepository, "savePost")
        .mockResolvedValueOnce();

      // given
      const command = new UpdatePostCommand(
        member.id,
        post1.id,
        "수정 게시글 내용 1",
      );

      // when
      await service.updatePost(command);

      // then
      expect(getMemberMock).toHaveBeenCalledTimes(1);
      expect(findPostByIdMock).toHaveBeenCalledTimes(1);
      expect(savePostMock).toHaveBeenCalledTimes(1);
    });

    it("기존 내용으로 수정 성공", async () => {
      // mocking
      const getMemberMock = jest
        .spyOn(getMemberService, "getMember")
        .mockResolvedValueOnce(member);
      const findPostByIdMock = jest
        .spyOn(postRepository, "findPostById")
        .mockResolvedValueOnce(post1);
      const savePostMock = jest
        .spyOn(postRepository, "savePost")
        .mockResolvedValueOnce();

      // given
      const command = new UpdatePostCommand(member.id, post1.id, post1.content);

      // when
      await service.updatePost(command);

      // then
      expect(getMemberMock).toHaveBeenCalledTimes(1);
      expect(findPostByIdMock).toHaveBeenCalledTimes(1);
      expect(savePostMock).toHaveBeenCalledTimes(1);
    });

    it("존재하지 않는 게시글", async () => {
      // mocking
      const getMemberMock = jest
        .spyOn(getMemberService, "getMember")
        .mockResolvedValueOnce(member);
      const findPostByIdMock = jest
        .spyOn(postRepository, "findPostById")
        .mockResolvedValueOnce(null);
      const savePostMock = jest
        .spyOn(postRepository, "savePost")
        .mockResolvedValueOnce();

      // given
      const command = new UpdatePostCommand(member.id, 3, "수정 게시글 내용 1");

      // when
      await expect(() => service.updatePost(command)).rejects.toThrow(
        "존재하지 않는 게시글입니다.",
      );

      // then
      expect(getMemberMock).toHaveBeenCalledTimes(1);
      expect(findPostByIdMock).toHaveBeenCalledTimes(1);
      expect(savePostMock).toHaveBeenCalledTimes(0);
    });

    it("존재하지 않는 게시글", async () => {
      // mocking
      const getMemberMock = jest
        .spyOn(getMemberService, "getMember")
        .mockResolvedValueOnce(member);
      const findPostByIdMock = jest
        .spyOn(postRepository, "findPostById")
        .mockResolvedValueOnce(post2);
      const savePostMock = jest
        .spyOn(postRepository, "savePost")
        .mockResolvedValueOnce();

      // given
      const command = new UpdatePostCommand(
        member.id,
        post2.id,
        "수정 게시글 내용 2",
      );

      // when
      await expect(() => service.updatePost(command)).rejects.toThrow(
        "권한이 없습니다.",
      );

      // then
      expect(getMemberMock).toHaveBeenCalledTimes(1);
      expect(findPostByIdMock).toHaveBeenCalledTimes(1);
      expect(savePostMock).toHaveBeenCalledTimes(0);
    });
  });
});
