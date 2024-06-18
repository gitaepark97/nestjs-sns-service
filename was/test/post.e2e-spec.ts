import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import request from "supertest";
import { PostResponse } from "../src/post/controller/response/post.response";

describe("PostController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    for (let i = 1; i <= 2; i++) {
      await request(app.getHttpServer())
        .post("/members")
        .send({
          email: `member${i}@email.com`,
          password: "Qwer1234!",
          nickname: `회원${i}`,
        });
    }
  });

  describe("/posts (POST)", () => {
    describe("created", () => {
      it("게시글 생성 성공", async () => {
        // given
        const url = "/posts";
        const query = "memberId=1";
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
          const query = "memberId=a";
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
          const query = "memberId=0";
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
          const query = "memberId=1";
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
          const query = "memberId=1";
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
        const query = "memberId=3";
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
        const query = "memberId=1";
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
        await request(app.getHttpServer()).post("/posts?memberId=1").send({
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
        expect(responseBody.creatorId).toBe(1);
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
        await request(app.getHttpServer()).post("/posts?memberId=1").send({
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
        await request(app.getHttpServer()).post("/posts?memberId=1").send({
          content: "게시글 1",
        });
      });

      it("새로운 내용으로 수정 성공", async () => {
        // given
        const url = "/posts/1";
        const query = "memberId=1";
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
        const query = "memberId=1";
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
          const query = "memberId=1";
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
          const query = "memberId=1";
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
          const query = "memberId=one";
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
          const query = "memberId=0";
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

    describe("forbidden", () => {
      beforeEach(async () => {
        await request(app.getHttpServer()).post("/posts?memberId=1").send({
          content: "게시글 1",
        });
      });

      it("권한이 없습니다.", async () => {
        // given
        const url = "/posts/1";
        const query = "memberId=2";
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
        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("권한이 없습니다.");
      });
    });

    describe("not found", () => {
      it("존재하지 않는 회원", async () => {
        // given
        const url = "/posts/1";
        const query = "memberId=3";
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
        expect(responseBody.message).toBe("존재하지 않는 회원입니다.");
      });

      it("존재하지 않는 게시글", async () => {
        // given
        const url = "/posts/2";
        const query = "memberId=1";
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
        await request(app.getHttpServer()).post("/posts?memberId=1").send({
          content: "게시글 1",
        });
      });

      it("동시에 새로운 내용으로 수정 성공", async () => {
        // given
        const url = "/posts/1";
        const query = "memberId=1";

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, (_, idx) =>
            request(app.getHttpServer())
              .patch(`${url}?${query}`)
              .send({
                content: `수정 게시글 ${idx + 1}`,
              }),
          ),
        );

        // then
        responses.forEach(({ statusCode }) => {
          expect(statusCode).toBe(HttpStatus.OK);
        });
      });

      it("동시에 기존 내용으로 수정 성공", async () => {
        // given
        const url = "/posts/1";
        const query = "memberId=1";
        const requestBody = {
          content: "게시글 1",
        };

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer())
              .patch(`${url}?${query}`)
              .send(requestBody),
          ),
        );

        // then
        responses.forEach(({ statusCode }) => {
          expect(statusCode).toBe(HttpStatus.OK);
        });
      });
    });
  });

  describe("/posts/:postId (DELETE)", () => {
    describe("ok", () => {
      beforeEach(async () => {
        await request(app.getHttpServer()).post("/posts?memberId=1").send({
          content: "게시글 1",
        });
      });

      it("게시글 삭제 성공", async () => {
        // given
        const url = "/posts/1";
        const query = "memberId=1";

        // when
        const { statusCode } = await request(app.getHttpServer()).delete(
          `${url}?${query}`,
        );

        // then
        expect(statusCode).toBe(HttpStatus.OK);
      });
    });

    describe("bad request", () => {
      describe("올바르지 않은 게시글 ID", () => {
        it("숫자가 아닌 게시글 ID", async () => {
          // given
          const url = "/posts/one";
          const query = "memberId=1";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).delete(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("게시글 ID는 자연수입니다.");
        });

        it("자연수가 아닌 게시글 ID", async () => {
          // given
          const url = "/posts/0";
          const query = "memberId=1";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).delete(`${url}?${query}`);

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

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).delete(url);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });

        it("숫자가 아닌 회원 ID", async () => {
          // given
          const url = "/posts/1";
          const query = "memberId=one";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).delete(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });

        it("자연수가 아닌 회원 ID", async () => {
          // given
          const url = "/posts/1";
          const query = "memberId=0";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).delete(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });
      });
    });

    describe("forbidden", () => {
      beforeEach(async () => {
        await request(app.getHttpServer()).post("/posts?memberId=1").send({
          content: "게시글 1",
        });
      });

      it("권한이 없습니다.", async () => {
        // given
        const url = "/posts/1";
        const query = "memberId=2";

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).delete(`${url}?${query}`);

        // then
        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("권한이 없습니다.");
      });
    });

    describe("not found", () => {
      it("존재하지 않는 회원", async () => {
        // given
        const url = "/posts/1";
        const query = "memberId=3";

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).delete(`${url}?${query}`);

        // then
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("존재하지 않는 회원입니다.");
      });

      it("존재하지 않는 게시글", async () => {
        // given
        const url = "/posts/2";
        const query = "memberId=1";

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).delete(`${url}?${query}`);

        // then
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("존재하지 않는 게시글입니다.");
      });
    });

    describe("동시성", () => {
      beforeEach(async () => {
        await request(app.getHttpServer()).post("/posts?memberId=1").send({
          content: "게시글 1",
        });
      });

      it("동시에 새로운 내용으로 수정 성공", async () => {
        // given
        const url = "/posts/1";
        const query = "memberId=1";

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, (_, idx) =>
            request(app.getHttpServer())
              .patch(`${url}?${query}`)
              .send({
                content: `수정 게시글 ${idx + 1}`,
              }),
          ),
        );

        // then
        responses.forEach(({ statusCode }) => {
          expect(statusCode).toBe(HttpStatus.OK);
        });
      });

      it("동시에 기존 내용으로 수정 성공", async () => {
        // given
        const url = "/posts/1";
        const query = "memberId=1";
        const requestBody = {
          content: "게시글 1",
        };

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer())
              .patch(`${url}?${query}`)
              .send(requestBody),
          ),
        );

        // then
        responses.forEach(({ statusCode }) => {
          expect(statusCode).toBe(HttpStatus.OK);
        });
      });
    });
  });

  describe("/posts/members/:memberId (GET)", () => {
    describe("ok", () => {
      beforeEach(async () => {
        for (let i = 1; i <= 20; i++) {
          await request(app.getHttpServer())
            .post("/posts?memberId=1")
            .send({
              content: `게시글 ${i}`,
            });
        }
      });

      it("회원 게시글 목록 조회 성공", async () => {
        // given
        const url = "/posts/members/1";

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(url);

        // then
        expect(statusCode).toBe(HttpStatus.OK);
        expect(responseBody.posts.length).toBe(10);
        expect(responseBody.totalCount).toBe(20);

        responseBody.posts.forEach((post: PostResponse, idx: number) => {
          expect(post.id).toBe(20 - idx);
          expect(post.creatorId).toBe(1);
          expect(post.content).toBe(`게시글 ${20 - idx}`);
          expect(post.createdAt).toEqual(expect.any(String));
          expect(post.updatedAt).toEqual(expect.any(String));
        });
      });

      it("페이지 크기로 회원 게시글 목록 조회 성공", async () => {
        // given
        const url = "/posts/members/1";
        const query = "pageSize=5";

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(`${url}?${query}`);

        // then
        expect(statusCode).toBe(HttpStatus.OK);
        expect(responseBody.posts.length).toBe(5);
        expect(responseBody.totalCount).toBe(20);

        responseBody.posts.forEach((post: PostResponse, idx: number) => {
          expect(post.id).toBe(20 - idx);
          expect(post.creatorId).toBe(1);
          expect(post.content).toBe(`게시글 ${20 - idx}`);
          expect(post.createdAt).toEqual(expect.any(String));
          expect(post.updatedAt).toEqual(expect.any(String));
        });
      });

      it("마지막 게시글 ID로 회원 게시글 목록 조회 성공", async () => {
        // given
        const url = "/posts/members/1";
        const query = "lastPostId=16";

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(`${url}?${query}`);

        // then
        expect(statusCode).toBe(HttpStatus.OK);
        expect(responseBody.posts.length).toBe(10);
        expect(responseBody.totalCount).toBe(20);

        responseBody.posts.forEach((post: PostResponse, idx: number) => {
          expect(post.id).toBe(16 - idx - 1);
          expect(post.creatorId).toBe(1);
          expect(post.content).toBe(`게시글 ${16 - idx - 1}`);
          expect(post.createdAt).toEqual(expect.any(String));
          expect(post.updatedAt).toEqual(expect.any(String));
        });
      });
    });

    describe("bad request", () => {
      describe("올바르지 않은 회원 ID", () => {
        it("숫자가 아닌 회원 ID", async () => {
          // given
          const url = "/posts/members/one";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).get(url);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });

        it("자연수가 아닌 회원 ID", async () => {
          // given
          const url = "/posts/members/0";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).get(url);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });
      });

      describe("올바르지 않은 페이지 크기", () => {
        it("숫자가 아닌 페이지 크기", async () => {
          // given
          const url = "/posts/members/1";
          const query = "pageSize=one";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).get(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("페이지 크기는 자연수입니다.");
        });

        it("자연수가 아닌 페이지 크기", async () => {
          // given
          const url = "/posts/members/1";
          const query = "pageSize=0";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).get(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("페이지 크기는 자연수입니다.");
        });
      });

      describe("올바르지 않은 마지막 게시글 ID", () => {
        it("숫자가 아닌 마지막 게시글 ID", async () => {
          // given
          const url = "/posts/members/1";
          const query = "lastPostId=one";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).get(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("마지막 게시글 ID는 자연수입니다.");
        });

        it("자연수가 아닌 마지막 게시글 ID", async () => {
          // given
          const url = "/posts/members/1";
          const query = "lastPostId=0";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).get(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("마지막 게시글 ID는 자연수입니다.");
        });
      });
    });

    describe("동시성", () => {
      beforeEach(async () => {
        for (let i = 1; i <= 20; i++) {
          await request(app.getHttpServer())
            .post("/posts?memberId=1")
            .send({
              content: `게시글 ${i}`,
            });
        }
      });

      it("회원 게시글 목록 조회 성공", async () => {
        // given
        const url = "/posts/members/1";

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

      it("페이지 크기로 회원 게시글 목록 조회 성공", async () => {
        // given
        const url = "/posts/members/1";
        const query = "pageSize=5";

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer()).get(`${url}?${query}`),
          ),
        );

        // then
        responses.forEach(({ statusCode }) => {
          expect(statusCode).toBe(HttpStatus.OK);
        });
      });

      it("마지막 게시글 ID로 회원 게시글 목록 조회 성공", async () => {
        // given
        const url = "/posts/members/1";
        const query = "lastPostId=16";

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer()).get(`${url}?${query}`),
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
