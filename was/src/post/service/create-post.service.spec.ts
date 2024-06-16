import { Test, TestingModule } from "@nestjs/testing";
import { CreatePostService } from "./create-post.service";
import { GetMemberService } from "../../member/service/get-member.service";
import { PostRepository } from "../repository/post.repository";
import { PostServiceImpl } from "./post.service.impl";
import { Member } from "../../member/domain/member";
import { MemberEntity } from "../../member/repository/entity/member.entity";
import { CreatePostCommand } from "./command/create-post.command";

describe("CreatePostService", () => {
  let service: CreatePostService;
  let getMemberService: GetMemberService;
  let postRepository: PostRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CreatePostService,
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
            savePost: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreatePostService>(CreatePostService);
    getMemberService = module.get<GetMemberService>(GetMemberService);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  describe("게시글 생성", () => {
    const member = Member.fromEntity(<MemberEntity>{
      id: 1,
      email: "member1@email.com",
      password: "Qwer1234!",
      nickname: "회원1",
    });

    it("게시글 생성 성공", async () => {
      // mocking
      const getMemberMock = jest
        .spyOn(getMemberService, "getMember")
        .mockResolvedValueOnce(member);
      const savePostMock = jest
        .spyOn(postRepository, "savePost")
        .mockResolvedValueOnce();

      // given
      const command = new CreatePostCommand(member.id, "게시글 1");

      // when
      await service.createPost(command);

      // then
      expect(getMemberMock).toHaveBeenCalledTimes(1);
      expect(savePostMock).toHaveBeenCalledTimes(1);
    });
  });
});
