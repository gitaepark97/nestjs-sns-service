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
        it("입력되지 않은 회원 ID", async () => {
          // given
          const url = "/posts";
          const requestBody = {
            content: "게시글 1",
          };

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          )
            .post(url)
            .send(requestBody);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });

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

        it("자연수가 아닌 회원 ID", async () => {
          // given
          const url = "/posts";
          const query = `memberId=0`;
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

  describe("/posts/:postId (GET)", () => {
    describe("ok", () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(`/posts?memberId=${member.id}`)
          .send({
            content: "게시글 1",
          });
      });

      it("게시글 조회 성공", async () => {
        // given
        const url = "/posts/1";

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(url);

        // then
        expect(statusCode).toBe(HttpStatus.OK);
        expect(responseBody.id).toBe(1);
        expect(responseBody.creatorId).toBe(member.id);
        expect(responseBody.content).toBe("게시글 1");
        expect(responseBody.createdAt).toEqual(expect.any(String));
        expect(responseBody.updatedAt).toEqual(expect.any(String));
      });
    });

    describe("bad request", () => {
      describe("올바르지 않은 게시글 ID", () => {
        it("숫자가 아닌 게시글 ID", async () => {
          // given
          const url = "/posts/one";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).get(url);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("게시글 ID는 자연수입니다.");
        });

        it("자연수가 아닌 게시글 ID", async () => {
          // given
          const url = "/posts/0";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).get(url);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("게시글 ID는 자연수입니다.");
        });
      });
    });

    describe("not found", () => {
      it("존재하지 않는 게시글", async () => {
        // given
        const url = "/posts/2";

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(url);

        // then
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("존재하지 않는 게시글입니다.");
      });
    });

    describe("동시성", () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(`/posts?memberId=${member.id}`)
          .send({
            content: "게시글 1",
          });
      });

      it("동시에 게시글 조회 성공", async () => {
        // given
        const url = "/posts/1";

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer()).get(url),
          ),
        );

        // then
        responses.forEach(({ statusCode }) => {
          expect(statusCode).toBe(HttpStatus.OK);
        });
      });
    });
  });

  describe("/posts/:postId (PATCH)", () => {
    describe("ok", () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(`/posts?memberId=${member.id}`)
          .send({
            content: "게시글 1",
          });
      });

      it("새로운 내용으로 수정 성공", async () => {
        // given
        const url = "/posts/1";
        const query = `memberId=${member.id}`;
        const requestBody = {
          content: "수정 게시글 1",
        };

        // when
        const { statusCode } = await request(app.getHttpServer())
          .patch(`${url}?${query}`)
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.OK);
      });

      it("기존 내용으로 수정 성공", async () => {
        // given
        const url = "/posts/1";
        const query = `memberId=${member.id}`;
        const requestBody = {
          content: "게시글 1",
        };

        // when
        const { statusCode } = await request(app.getHttpServer())
          .patch(`${url}?${query}`)
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.OK);
      });
    });

    describe("bad request", () => {
      describe("올바르지 않은 게시글 ID", () => {
        it("숫자가 아닌 게시글 ID", async () => {
          // given
          const url = "/posts/one";
          const query = `memberId=${member.id}`;
          const requestBody = {
            content: "수정 게시글 1",
          };

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          )
            .patch(`${url}?${query}`)
            .send(requestBody);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("게시글 ID는 자연수입니다.");
        });

        it("자연수가 아닌 게시글 ID", async () => {
          // given
          const url = "/posts/0";
          const query = `memberId=${member.id}`;
          const requestBody = {
            content: "수정 게시글 1",
          };

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          )
            .patch(`${url}?${query}`)
            .send(requestBody);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("게시글 ID는 자연수입니다.");
        });
      });

      describe("올바르지 않은 회원 ID", () => {
        it("입력되지 않은 회원 ID", async () => {
          // given
          const url = "/posts/one";
          const requestBody = {
            content: "수정 게시글 1",
          };

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          )
            .patch(url)
            .send(requestBody);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });

        it("숫자가 아닌 회원 ID", async () => {
          // given
          const url = "/posts/1";
          const query = `memberId=one`;
          const requestBody = {
            content: "수정 게시글 1",
          };

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          )
            .patch(`${url}?${query}`)
            .send(requestBody);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });

        it("자연수가 아닌 회원 ID", async () => {
          // given
          const url = "/posts/1";
          const query = `memberId=0`;
          const requestBody = {
            content: "수정 게시글 1",
          };

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          )
            .patch(`${url}?${query}`)
            .send(requestBody);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });
      });
    });

    describe("not found", () => {
      it("존재하지 않는 게시글", async () => {
        // given
        const url = "/posts/2";
        const query = `memberId=${member.id}`;
        const requestBody = {
          content: "수정 게시글 1",
        };

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        )
          .patch(`${url}?${query}`)
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("존재하지 않는 게시글입니다.");
      });
    });

    describe("동시성", () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post(`/posts?memberId=${member.id}`)
          .send({
            content: "게시글 1",
          });
      });

      it("동시에 게시글 조회 성공", async () => {
        // given
        const url = "/posts/1";

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer()).get(url),
          ),
        );

        // then
        responses.forEach(({ statusCode }) => {
          expect(statusCode).toBe(HttpStatus.OK);
        });
      });
    });
  });
});
