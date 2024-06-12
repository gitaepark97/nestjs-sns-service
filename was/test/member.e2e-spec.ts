import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import request from "supertest";
import { generateString } from "./util";

describe("MemberController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe("/members (POST)", () => {
    describe("created", () => {
      it("회원 생성 성공", async () => {
        // given
        const url = "/members";
        const requestBody = {
          email: "member1@email.com",
          password: "Qwer1234!",
          nickname: "회원1",
        };

        // when
        const { statusCode } = await request(app.getHttpServer())
          .post(url)
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.CREATED);
      });
    });

    describe("bad request", () => {
      describe("올바르지 않은 이메일", () => {
        it("입력되지 않은 이메일", async () => {
          // given
          const url = "/members";
          const requestBody = {
            password: "Qwer1234!",
            nickname: "회원1",
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
          expect(responseBody.message).toBe("올바르지 않은 이메일입니다.");
        });

        it("문자열이 아닌 이메일", async () => {
          // given
          const url = "/members";
          const requestBody = {
            email: 1,
            password: "Qwer1234!",
            nickname: "회원1",
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
          expect(responseBody.message).toBe("올바르지 않은 이메일입니다.");
        });

        it("이메일 형식이 아닌 이메일", async () => {
          // given
          const url = "/members";
          const requestBody = {
            email: "member1",
            password: "Qwer1234!",
            nickname: "회원1",
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
          expect(responseBody.message).toBe("올바르지 않은 이메일입니다.");
        });

        it("100자 초과의 이메일", async () => {
          // given
          const url = "/members";
          const requestBody = {
            email: `${generateString(91)}@email.com`,
            password: "Qwer1234!",
            nickname: "회원1",
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
          expect(responseBody.message).toBe("올바르지 않은 이메일입니다.");
        });
      });

      describe("올바르지 않은 비밀번호", () => {
        it("입력되지 않은 비밀번호", async () => {
          // given
          const url = "/members";
          const requestBody = {
            email: "member1@email.com",
            nickname: "회원1",
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
          expect(responseBody.message).toBe("올바르지 않은 비밀번호입니다.");
        });

        it("문자열이 아닌 비밀번호", async () => {
          // given
          const url = "/members";
          const requestBody = {
            email: "member1@email.com",
            password: 1,
            nickname: "회원1",
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
          expect(responseBody.message).toBe("올바르지 않은 비밀번호입니다.");
        });

        it("대문자가 포함되지 않은 비밀번호", async () => {
          // given
          const url = "/members";
          const requestBody = {
            email: "member1@email.com",
            password: "qwer1234!",
            nickname: "회원1",
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
          expect(responseBody.message).toBe("올바르지 않은 비밀번호입니다.");
        });

        it("소문자가 포함되지 않은 비밀번호", async () => {
          // given
          const url = "/members";
          const requestBody = {
            email: "member1@email.com",
            password: "QWER1234!",
            nickname: "회원1",
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
          expect(responseBody.message).toBe("올바르지 않은 비밀번호입니다.");
        });

        it("숫자가 포함되지 않은 비밀번호", async () => {
          // given
          const url = "/members";
          const requestBody = {
            email: "member1@email.com",
            password: "Qwertyui!",
            nickname: "회원1",
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
          expect(responseBody.message).toBe("올바르지 않은 비밀번호입니다.");
        });

        it("특수문자가 포함되지 않은 비밀번호", async () => {
          // given
          const url = "/members";
          const requestBody = {
            email: "member1@email.com",
            password: "Qwer12345",
            nickname: "회원1",
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
          expect(responseBody.message).toBe("올바르지 않은 비밀번호입니다.");
        });

        it("8자 이하의 비밀번호", async () => {
          // given
          const url = "/members";
          const requestBody = {
            email: "member1@email.com",
            password: "Qwer12!",
            nickname: "회원1",
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
          expect(responseBody.message).toBe("올바르지 않은 비밀번호입니다.");
        });
      });

      describe("올바르지 않은 닉네임", () => {
        it("입력되지 않은 닉네임", async () => {
          // given
          const url = "/members";
          const requestBody = {
            email: "member1@email.com",
            password: "Qwer1234!",
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
          expect(responseBody.message).toBe("올바르지 않은 닉네임입니다.");
        });

        it("문자열이 아닌 닉네임", async () => {
          // given
          const url = "/members";
          const requestBody = {
            email: "member1@email.com",
            password: "Qwer1234!",
            nickname: 1,
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
          expect(responseBody.message).toBe("올바르지 않은 닉네임입니다.");
        });

        it("30자 초과의 닉네임", async () => {
          // given
          const url = "/members";
          const requestBody = {
            email: "member1@email.com",
            password: "Qwer1234!",
            nickname: generateString(31),
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
          expect(responseBody.message).toBe("올바르지 않은 닉네임입니다.");
        });
      });
    });

    describe("conflict", () => {
      beforeEach(async () => {
        const url = "/members";
        const requestBody = {
          email: "member1@email.com",
          password: "Qwer1234!",
          nickname: "회원1",
        };

        // when
        await request(app.getHttpServer()).post(url).send(requestBody);
      });

      it("이미 사용 중인 이메일", async () => {
        // given
        const url = "/members";
        const requestBody = {
          email: "member1@email.com",
          password: "Qwer1234!",
          nickname: "회원2",
        };

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        )
          .post(url)
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.CONFLICT);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("이미 사용 중인 이메일입니다.");
      });

      it("이미 사용 중인 닉네임", async () => {
        // given
        const url = "/members";
        const requestBody = {
          email: "member2@email.com",
          password: "Qwer1234!",
          nickname: "회원1",
        };

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        )
          .post(url)
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.CONFLICT);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("이미 사용 중인 닉네임입니다.");
      });
    });

    describe("동시성", () => {
      it("동시에 여러 회원 생성 성공", async () => {
        // given
        const url = "/members";

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, (_, idx) =>
            request(app.getHttpServer())
              .post(url)
              .send({
                email: `member${idx + 1}@email.com`,
                password: "Qwer1234!",
                nickname: `회원${idx + 1}`,
              }),
          ),
        );

        // then
        responses.forEach(({ statusCode }) => {
          expect(statusCode).toBe(HttpStatus.CREATED);
        });
      });

      it("동시에 여러 회원 생성 시 이메일 중복", async () => {
        // given
        const url = "/members";

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, (_, idx) =>
            request(app.getHttpServer())
              .post(url)
              .send({
                email: `member1@email.com`,
                password: "Qwer1234!",
                nickname: `회원${idx + 1}`,
              }),
          ),
        );

        // then
        const count = {
          ok: 0,
          conflict: 0,
        };
        responses.forEach(({ statusCode }) => {
          if (statusCode === HttpStatus.CREATED) count.ok++;
          else if (statusCode === HttpStatus.CONFLICT) count.conflict++;
        });

        expect(count.ok).toBe(1);
        expect(count.conflict).toBe(9);
      });

      it("동시에 여러 회원 생성 시 닉네임 중복", async () => {
        // given
        const url = "/members";

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, (_, idx) =>
            request(app.getHttpServer())
              .post(url)
              .send({
                email: `member${idx + 1}@email.com`,
                password: "Qwer1234!",
                nickname: `회원1`,
              }),
          ),
        );

        // then
        const count = {
          ok: 0,
          conflict: 0,
        };
        responses.forEach(({ statusCode }) => {
          if (statusCode === HttpStatus.CREATED) count.ok++;
          else if (statusCode === HttpStatus.CONFLICT) count.conflict++;
        });

        expect(count.ok).toBe(1);
        expect(count.conflict).toBe(9);
      });
    });
  });
});
