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
        await request(app.getHttpServer()).post("/members").send({
          email: "member1@email.com",
          password: "Qwer1234!",
          nickname: "회원1",
        });
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
      it("동시에 새로운 정보로 여러 회원 생성", async () => {
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

      it("동시에 동일한 이메일로 여러 회원 생성", async () => {
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
          created: 0,
          conflict: 0,
        };
        responses.forEach(({ statusCode }) => {
          if (statusCode === HttpStatus.CREATED) count.created++;
          else if (statusCode === HttpStatus.CONFLICT) count.conflict++;
        });

        expect(count.created).toBe(1);
        expect(count.conflict).toBe(tryCount - 1);
      });

      it("동시에 동일한 닉네임으로 여러 회원 생성", async () => {
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
          created: 0,
          conflict: 0,
        };
        responses.forEach(({ statusCode }) => {
          if (statusCode === HttpStatus.CREATED) count.created++;
          else if (statusCode === HttpStatus.CONFLICT) count.conflict++;
        });

        expect(count.created).toBe(1);
        expect(count.conflict).toBe(tryCount - 1);
      });
    });
  });

  describe("/members/:memberId (GET)", () => {
    describe("ok", () => {
      beforeEach(async () => {
        await request(app.getHttpServer()).post("/members").send({
          email: "member1@email.com",
          password: "Qwer1234!",
          nickname: "회원1",
        });
      });

      it("회원 조회 성공", async () => {
        // given
        const memberId = 1;
        const url = `/members/${memberId}`;

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(url);

        // then
        expect(statusCode).toBe(HttpStatus.OK);
        expect(responseBody).toBeDefined();
        expect(responseBody.id).toBe(memberId);
        expect(responseBody.email).toBe("member1@email.com");
        expect(responseBody.nickname).toBe("회원1");
      });
    });

    describe("bad request", () => {
      describe("올바르지 않은 ID", () => {
        it("숫자가 아닌 ID", async () => {
          // given
          const memberId = "one";
          const url = `/members/${memberId}`;

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
    });

    describe("not found", () => {
      it("존재하지 않는 회원", async () => {
        // given
        const memberId = 2;
        const url = `/members/${memberId}`;

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(url);

        // then
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("존재하지 않는 회원입니다.");
      });
    });

    describe("동시성", () => {
      beforeEach(async () => {
        const url = "/members";
        const requestBody = {
          email: "member1@email.com",
          password: "Qwer1234!",
          nickname: "회원1",
        };

        await request(app.getHttpServer()).post(url).send(requestBody);
      });

      it("동시에 회원 조회 생성", async () => {
        // given
        const memberId = 1;
        const url = `/members/${memberId}`;

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

  describe("/members/:memberId (PATCH)", () => {
    describe("ok", () => {
      beforeEach(async () => {
        const url = "/members";

        await request(app.getHttpServer()).post(url).send({
          email: "member1@email.com",
          password: "Qwer1234!",
          nickname: "회원1",
        });
      });

      it("새로운 닉네임으로 수정 성공", async () => {
        // given
        const memberId = 1;
        const url = `/members/${memberId}`;
        const requestBody = {
          nickname: "수정 회원1",
        };

        // when
        const { statusCode } = await request(app.getHttpServer())
          .patch(url)
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.OK);
      });

      it("기존 닉네임으로 수정 성공", async () => {
        // given
        const memberId = 1;
        const url = `/members/${memberId}`;
        const requestBody = {
          nickname: "회원1",
        };

        // when
        const { statusCode } = await request(app.getHttpServer())
          .patch(url)
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.OK);
      });
    });

    describe("bad request", () => {
      describe("올바르지 않은 ID", () => {
        it("숫자가 아닌 ID", async () => {
          // given
          const memberId = "one";
          const url = `/members/${memberId}`;
          const requestBody = {
            nickname: "수정 회원1",
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
      });

      describe("올바르지 않은 닉네임", () => {
        it("문자열이 아닌 닉네임", async () => {
          // given
          const memberId = 1;
          const url = `/members/${memberId}`;
          const requestBody = {
            nickname: 1,
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
          expect(responseBody.message).toBe("올바르지 않은 닉네임입니다.");
        });

        it("30자 초과의 닉네임", async () => {
          // given
          const memberId = 1;
          const url = `/members/${memberId}`;
          const requestBody = {
            nickname: generateString(31),
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
          expect(responseBody.message).toBe("올바르지 않은 닉네임입니다.");
        });
      });
    });

    describe("not found", () => {
      it("존재하지 않는 회원", async () => {
        // given
        const memberId = 2;
        const url = `/members/${memberId}`;
        const requestBody = {
          nickname: "수정 회원1",
        };

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        )
          .patch(url)
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("존재하지 않는 회원입니다.");
      });
    });

    describe("conflict", () => {
      beforeEach(async () => {
        const url = "/members";

        await request(app.getHttpServer()).post(url).send({
          email: "member1@email.com",
          password: "Qwer1234!",
          nickname: "회원1",
        });

        await request(app.getHttpServer()).post(url).send({
          email: "member2@email.com",
          password: "Qwer1234!",
          nickname: "회원2",
        });
      });

      it("이미 사용 중인 닉네임입니다.", async () => {
        // given
        const memberId = 1;
        const url = `/members/${memberId}`;
        const requestBody = {
          nickname: "회원2",
        };

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        )
          .patch(url)
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.CONFLICT);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("이미 사용 중인 닉네임입니다.");
      });
    });

    describe("동시성", () => {
      beforeEach(async () => {
        const url = "/members";

        await request(app.getHttpServer()).post(url).send({
          email: "member1@email.com",
          password: "Qwer1234!",
          nickname: "회원1",
        });
      });

      it("동시에 새로운 닉네임으로 수정", async () => {
        // given
        const memberId = 1;
        const url = `/members/${memberId}`;

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, (_, idx) =>
            request(app.getHttpServer())
              .patch(url)
              .send({
                nickname: `수정 회원${idx + 1}`,
              }),
          ),
        );

        // then
        responses.forEach(({ statusCode }) => {
          expect(statusCode).toBe(HttpStatus.OK);
        });
      });

      it("동시에 기존 닉네임으로 수정", async () => {
        // given
        const memberId = 1;
        const url = `/members/${memberId}`;

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer()).patch(url).send({
              nickname: `회원1`,
            }),
          ),
        );

        // then
        responses.forEach(({ statusCode }) => {
          expect(statusCode).toBe(HttpStatus.OK);
        });
      });
    });
  });

  describe("/members/:memberId (DELETE)", () => {
    describe("ok", () => {
      beforeEach(async () => {
        const url = "/members";

        await request(app.getHttpServer()).post(url).send({
          email: "member1@email.com",
          password: "Qwer1234!",
          nickname: "회원1",
        });
      });

      it("회원 삭제 성공", async () => {
        // given
        const memberId = 1;
        const url = `/members/${memberId}`;

        // when
        const { statusCode } = await request(app.getHttpServer()).delete(url);

        // then
        expect(statusCode).toBe(HttpStatus.OK);
      });
    });

    describe("bad request", () => {
      describe("올바르지 않은 ID", () => {
        it("숫자가 아닌 ID", async () => {
          // given
          const memberId = "one";
          const url = `/members/${memberId}`;

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
      });
    });

    describe("not found", () => {
      it("존재하지 않는 회원", async () => {
        // given
        const memberId = 2;
        const url = `/members/${memberId}`;

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).delete(url);

        // then
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(url);
        expect(responseBody.message).toBe("존재하지 않는 회원입니다.");
      });
    });

    describe("동시성", () => {
      beforeEach(async () => {
        const url = "/members";

        await request(app.getHttpServer()).post(url).send({
          email: "member1@email.com",
          password: "Qwer1234!",
          nickname: "회원1",
        });
      });

      it("동시에 회원 삭제", async () => {
        // given
        const memberId = 1;
        const url = `/members/${memberId}`;

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer()).delete(url),
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
