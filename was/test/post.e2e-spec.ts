import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import request from "supertest";
import { MemberResponse } from "../src/member/controller/response/member.response";

describe("PostController (e2e)", () => {
  let app: INestApplication;
  let member: MemberResponse;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).post("/members").send({
      email: "member1@email.com",
      password: "Qwer1234!",
      nickname: "회원1",
    });

    const { body } = await request(app.getHttpServer()).get("/members/1");
    member = body;
  });

  describe("/posts (POST)", () => {
    describe("created", () => {
      it("게시글 생성 성공", async () => {
        // given
        const url = "/posts";
        const query = `memberId=${member.id}`;
        const requestBody = {
          content: "게시글 1",
        };

        // when
        const { statusCode } = await request(app.getHttpServer())
          .post(`${url}?${query}`)
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.CREATED);
      });
    });

    describe("bad request", () => {
      describe("올바르지 않은 회원 ID", () => {
        it("숫자가 아닌 회원 ID", async () => {
          // given
          const url = "/posts";
          const query = `memberId=a`;
          const requestBody = {
            content: "게시글 1",
          };

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          )
            .post(`${url}?${query}`)
            .send(requestBody);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });
      });

      describe("올바르지 않은 내용", () => {
        it("입력되지 않은 내용", async () => {
          // given
          const url = "/posts";
          const query = `memberId=${member.id}`;
          const requestBody = {};

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          )
            .post(`${url}?${query}`)
            .send(requestBody);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("올바르지 않은 내용입니다.");
        });

        it("문자열이 아닌 내용", async () => {
          // given
          const url = "/posts";
          const query = `memberId=${member.id}`;
          const requestBody = {
            content: 1,
          };

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          )
            .post(`${url}?${query}`)
            .send(requestBody);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("올바르지 않은 내용입니다.");
        });
      });
    });

    describe("not found", () => {
      it("존재하지 않는 회원", async () => {
        // given
        const url = "/posts";
        const query = `memberId=2`;
        const requestBody = {
          content: "게시글 1",
        };

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        )
          .post(`${url}?${query}`)
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("존재하지 않는 회원입니다.");
      });
    });

    describe("동시성", () => {
      it("동시에 게시글 생성", async () => {
        // given
        const url = "/posts";
        const query = `memberId=${member.id}`;
        const requestBody = {
          content: "게시글 1",
        };

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer())
              .post(`${url}?${query}`)
              .send(requestBody),
          ),
        );

        // then
        responses.forEach(({ statusCode }) => {
          expect(statusCode).toBe(HttpStatus.CREATED);
        });
      });
    });
  });
});
