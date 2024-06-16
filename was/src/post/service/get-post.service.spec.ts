import { Test, TestingModule } from "@nestjs/testing";
import { GetMemberService } from "../../member/service/get-member.service";
import { PostRepository } from "../repository/post.repository";
import { PostServiceImpl } from "./post.service.impl";
import { Member } from "../../member/domain/member";
import { MemberEntity } from "../../member/repository/entity/member.entity";
import { Post } from "../domain/post";
import { PostEntity } from "../repository/entity/post.entity";
import { GetPostService } from "./get-post.service";

describe("GetPostService", () => {
  let service: GetPostService;
  let getMemberService: GetMemberService;
  let postRepository: PostRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetPostService,
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

    service = module.get<GetPostService>(GetPostService);
    getMemberService = module.get<GetMemberService>(GetMemberService);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  describe("게시글 조회", () => {
    const member = Member.fromEntity(<MemberEntity>{
      id: 1,
      email: "member1@email.com",
      password: "Qwer1234!",
      nickname: "회원1",
    });
    const post = Post.fromEntity(<PostEntity>{
      id: 1,
      creatorId: member.id,
      content: "게시글 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    it("게시글 삭제 성공", async () => {
      // mocking
      const findPostByIdMock = jest
        .spyOn(postRepository, "findPostById")
        .mockResolvedValueOnce(post);

      // given

      // when
      await service.getPost(post.id);

      // then
      expect(findPostByIdMock).toHaveBeenCalledTimes(1);
    });

    it("존재하지 않는 게시글", async () => {
      // mocking
      const findPostByIdMock = jest
        .spyOn(postRepository, "findPostById")
        .mockResolvedValueOnce(null);

      // given

      // when
      await expect(() => service.getPost(2)).rejects.toThrow(
        "존재하지 않는 게시글입니다.",
      );

      // then
      expect(findPostByIdMock).toHaveBeenCalledTimes(1);
    });
  });
});
