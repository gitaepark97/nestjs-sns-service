import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import request from "supertest";

describe("FollowController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    for (let i = 1; i <= 3; i++) {
      await request(app.getHttpServer())
        .post("/members")
        .send({
          email: `member${i}@email.com`,
          password: "Qwer1234!",
          nickname: `회원${i}`,
        });
    }
  });

  afterEach(async () => {
    app.close();
  });

  describe("/follows/:followedId (POST)", () => {
    describe("ok", () => {
      it("팔로우 성공", async () => {
        // given
        const url = "/follows/2";
        const query = "memberId=1";

        // when
        const { statusCode } = await request(app.getHttpServer()).post(
          `${url}?${query}`,
        );

        // then
        expect(statusCode).toBe(HttpStatus.OK);
      });
    });

    describe("bad request", () => {
      describe("올바르지 않은 팔로우 회원 ID", () => {
        it("숫자가 아닌 팔로우 회원 ID", async () => {
          // given
          const url = "/follows/a";
          const query = "memberId=1";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).post(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("팔로우 회원 ID는 자연수입니다.");
        });

        it("자연수가 아닌 팔로우 회원 ID", async () => {
          // given
          const url = "/follows/0";
          const query = "memberId=1";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).post(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("팔로우 회원 ID는 자연수입니다.");
        });
      });

      describe("올바르지 않은 회원 ID", () => {
        it("입력되지 않은 회원 ID", async () => {
          // given
          const url = "/follows/2";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).post(url);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });

        it("숫자가 아닌 회원 ID", async () => {
          // given
          const url = "/follows/2";
          const query = "memberId=a";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).post(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });

        it("자연수가 아닌 회원 ID", async () => {
          // given
          const url = "/follows/2";
          const query = "memberId=0";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).post(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });
      });
    });

    describe("forbidden", () => {
      it("본인 팔로우 시도", async () => {
        // given
        const url = "/follows/1";
        const query = "memberId=1";

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).post(`${url}?${query}`);

        // then
        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("본인은 팔로우 할 수 없습니다.");
      });
    });

    describe("not found", () => {
      it("존재하지 않는 팔로우 회원", async () => {
        // given
        const url = "/follows/4";
        const query = "memberId=1";

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).post(`${url}?${query}`);

        // then
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("존재하지 않는 회원입니다.");
      });

      it("존재하지 않는 회원", async () => {
        // given
        const url = "/follows/2";
        const query = "memberId=4";

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).post(`${url}?${query}`);

        // then
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("존재하지 않는 회원입니다.");
      });
    });

    describe("conflict", () => {
      it("이미 팔로우한 상태", async () => {
        // given
        const url = "/follows/3";
        const query = "memberId=1";
        await request(app.getHttpServer()).post(`${url}?${query}`);

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).post(`${url}?${query}`);

        // then
        expect(statusCode).toBe(HttpStatus.CONFLICT);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("이미 팔로우 중입니다.");
      });
    });

    describe("동시성", () => {
      it("동시에 팔로우", async () => {
        // given
        const url = "/follows/2";
        const query = "memberId=1";

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer()).post(`${url}?${query}`),
          ),
        );

        // then
        const count = {
          ok: 0,
          conflict: 0,
        };
        responses.forEach(({ statusCode }) => {
          if (statusCode === HttpStatus.OK) count.ok++;
          else if (statusCode === HttpStatus.CONFLICT) count.conflict++;
        });

        expect(count.ok).toBe(1);
        expect(count.conflict).toBe(tryCount - 1);
      });
    });
  });

  describe("/follows/:followedId (DELETE)", () => {
    describe("ok", () => {
      beforeEach(async () => {
        await request(app.getHttpServer()).post("/follows/2?memberId=1");
      });

      it("팔로우 취소", async () => {
        // given
        const url = "/follows/2";
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
      describe("올바르지 않은 팔로우 회원 ID", () => {
        it("숫자가 아닌 팔로우 회원 ID", async () => {
          // given
          const url = "/follows/a";
          const query = "memberId=1";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).delete(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("팔로우 회원 ID는 자연수입니다.");
        });

        it("자연수가 아닌 팔로우 회원 ID", async () => {
          // given
          const url = "/follows/0";
          const query = "memberId=1";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).delete(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("팔로우 회원 ID는 자연수입니다.");
        });
      });

      describe("올바르지 않은 회원 ID", () => {
        it("입력되지 않은 회원 ID", async () => {
          // given
          const url = "/follows/2";

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
          const url = "/follows/2";
          const query = "memberId=a";

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
          const url = "/follows/2";
          const query = "memberId=0";

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).post(`${url}?${query}`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe(url);
          expect(responseBody.message).toBe("회원 ID는 자연수입니다.");
        });
      });
    });

    describe("forbidden", () => {
      it("본인 팔로우 시도", async () => {
        // given
        const url = "/follows/1";
        const query = "memberId=1";

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).delete(`${url}?${query}`);

        // then
        expect(statusCode).toBe(HttpStatus.FORBIDDEN);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("본인은 팔로우 할 수 없습니다.");
      });
    });

    describe("not found", () => {
      it("팔로우하지 않은 상태", async () => {
        // given
        const url = "/follows/3";
        const query = "memberId=1";

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).delete(`${url}?${query}`);

        // then
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("먼저 팔로우해주세요.");
      });
    });

    describe("동시성", () => {
      beforeEach(async () => {
        await request(app.getHttpServer()).post("/follows/2?memberId=1");
      });

      it("동시에 팔로우 취소", async () => {
        // given
        const url = "/follows/2";
        const query = "memberId=1";

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer()).delete(`${url}?${query}`),
          ),
        );

        // then
        const count = {
          ok: 0,
          notFound: 0,
        };
        responses.forEach(({ statusCode }) => {
          if (statusCode === HttpStatus.OK) count.ok++;
          else if (statusCode === HttpStatus.NOT_FOUND) count.notFound++;
        });

        expect(count.ok).toBe(1);
        expect(count.notFound).toBe(tryCount - 1);
      });
    });
  });
});
