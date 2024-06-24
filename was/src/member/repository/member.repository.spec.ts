import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "src/config/config.module";
import { DataSource } from "typeorm";
import { Member } from "../domain/member";
import { MemberEntity } from "./entity/member.entity";
import { MemberRepository } from "./member.repository";
import { MemberRepositoryImpl } from "./member.repository.impl";

describe("MemberRepository", () => {
  let repository: MemberRepository;
  let db: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, TypeOrmModule.forFeature([MemberEntity])],
      providers: [
        {
          provide: MemberRepository,
          useClass: MemberRepositoryImpl,
        },
      ],
    }).compile();

    repository = module.get<MemberRepository>(MemberRepository);
    db = module.get<DataSource>(DataSource);
  });

  describe("회원 저장", () => {
    it("ID가 없는 회원 저장 성공", async () => {
      // given
      const member = Member.create("member1@email.com", "Qwer1234!", "회원1");

      // when
      await repository.saveMember(member);

      // then
      const savedMemberEntity = await db
        .getRepository(MemberEntity)
        .findOne({ where: { id: 1 } });

      expect(savedMemberEntity!.email).toBe(member.email);
      expect(savedMemberEntity!.password).toBe(member.password);
      expect(savedMemberEntity!.nickname).toBe(member.nickname);
      expect(savedMemberEntity!.createdAt).toEqual(expect.any(Date));
      expect(savedMemberEntity!.updatedAt).toEqual(expect.any(Date));
    });

    it("ID가 있는 회원 저장 성공", async () => {
      // given
      const memberEntity = <MemberEntity>{
        id: 1,
        email: "member1@email.com",
        password: "Qwer1234!",
        nickname: "회원1",
      };

      const member = Member.fromEntity(memberEntity);

      // when
      await repository.saveMember(member);

      // then
      const savedMemberEntity = await db
        .getRepository(MemberEntity)
        .findOne({ where: { id: member.id } });

      expect(savedMemberEntity).toBeInstanceOf(MemberEntity);
      expect(savedMemberEntity!.id).toBe(member.id);
      expect(savedMemberEntity!.email).toBe(member.email);
      expect(savedMemberEntity!.password).toBe(member.password);
      expect(savedMemberEntity!.nickname).toBe(member.nickname);
      expect(savedMemberEntity!.createdAt).toEqual(expect.any(Date));
      expect(savedMemberEntity!.updatedAt).toEqual(expect.any(Date));
    });
  });

  describe("이메일을 통한 회원 조회", () => {
    it("이메일이 일치하는 회원이 존재하는 경우", async () => {
      // given
      await db.getRepository(MemberEntity).save({
        id: 1,
        email: "member1@email.com",
        password: "Qwer1234!",
        nickname: "회원1",
      });
      const savedMemberEntity = await db
        .getRepository(MemberEntity)
        .findOne({ where: { id: 1 } });

      // when
      const result = await repository.findMemberByEmail(
        savedMemberEntity!.email,
      );

      // then
      expect(result).toBeInstanceOf(Member);
      expect(result!.id).toBe(savedMemberEntity!.id);
      expect(result!.email).toBe(savedMemberEntity!.email);
      expect(result!.password).toBe(savedMemberEntity!.password);
      expect(result!.nickname).toBe(savedMemberEntity!.nickname);
    });

    it("이메일이 일치하는 회원이 존재하지 않는 경우", async () => {
      // given

      // when
      const result = await repository.findMemberByEmail("member2@email.com");

      // then
      expect(result).toBeNull();
    });
  });

  describe("닉네임을 통한 회원 조회", () => {
    it("닉네임이 일치하는 회원이 존재하는 경우", async () => {
      // given
      await db.getRepository(MemberEntity).save({
        id: 1,
        email: "member1@email.com",
        password: "Qwer1234!",
        nickname: "회원1",
      });
      const savedMemberEntity = await db
        .getRepository(MemberEntity)
        .findOne({ where: { id: 1 } });

      // when
      const result = await repository.findMemberByNickname(
        savedMemberEntity!.nickname,
      );

      // then
      expect(result).toBeInstanceOf(Member);
      expect(result!.id).toBe(savedMemberEntity!.id);
      expect(result!.email).toBe(savedMemberEntity!.email);
      expect(result!.password).toBe(savedMemberEntity!.password);
      expect(result!.nickname).toBe(savedMemberEntity!.nickname);
    });

    it("닉네임이 일치하는 회원이 존재하지 않는 경우", async () => {
      // given

      // when
      const result = await repository.findMemberByNickname("회원2");

      // then
      expect(result).toBeNull();
    });
  });

  describe("ID를 통한 회원 조회", () => {
    it("ID가 일치하는 회원이 존재하는 경우", async () => {
      // given
      await db.getRepository(MemberEntity).save({
        id: 1,
        email: "member1@email.com",
        password: "Qwer1234!",
        nickname: "회원1",
      });
      const savedMemberEntity = await db
        .getRepository(MemberEntity)
        .findOne({ where: { id: 1 } });

      // when
      const result = await repository.findMemberById(savedMemberEntity!.id);

      // then
      expect(result).toBeInstanceOf(Member);
      expect(result!.id).toBe(savedMemberEntity!.id);
      expect(result!.email).toBe(savedMemberEntity!.email);
      expect(result!.password).toBe(savedMemberEntity!.password);
      expect(result!.nickname).toBe(savedMemberEntity!.nickname);
    });

    it("ID가 일치하는 회원이 존재하지 않는 경우", async () => {
      // given

      // when
      const result = await repository.findMemberById(2);

      // then
      expect(result).toBeNull();
    });
  });

  describe("회원 삭제", () => {
    it("회원 삭제 성공", async () => {
      // given
      await db.getRepository(MemberEntity).save({
        id: 1,
        email: "member1@email.com",
        password: "Qwer1234!",
        nickname: "회원1",
      });
      let savedMemberEntity = await db
        .getRepository(MemberEntity)
        .findOne({ where: { id: 1 } });

      const member = Member.fromEntity(savedMemberEntity!);

      // when
      await repository.deleteMember(member);

      // then
      savedMemberEntity = await db
        .getRepository(MemberEntity)
        .findOne({ where: { id: 1 } });

      expect(savedMemberEntity).toBeNull();
    });

    it("회원이 존재하지 않는 경우", async () => {
      // given
      const memberEntity = <MemberEntity>{
        id: 2,
        email: "member2@email.com",
        password: "Qwer1234!",
        nickname: "회원2",
      };

      const member = Member.fromEntity(memberEntity);

      // when
      await expect(() => repository.deleteMember(member)).rejects.toThrow(
        "존재하지 않는 회원입니다.",
      );

      // then
    });
  });
});
