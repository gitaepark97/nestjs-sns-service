import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MemberRepository } from "./member.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { MemberEntity } from "./entity/member.entity";
import { IsNull, Repository } from "typeorm";
import { Member } from "../domain/member";
import { extractIdxName } from "../../util/database.util";
import { pipe, throwIf } from "@fxts/core";

@Injectable()
export class MemberRepositoryImpl implements MemberRepository {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberEntityRepository: Repository<MemberEntity>,
  ) {}

  async saveMember(member: Member): Promise<void> {
    await this.memberEntityRepository
      .save({
        id: member.id,
        email: member.email,
        password: member.password,
        nickname: member.nickname,
      })
      .catch((err) => {
        if (err.code === "ER_DUP_ENTRY") {
          switch (extractIdxName(err)) {
            case "idx2":
              throw new ConflictException("이미 사용 중인 이메일입니다.");
            case "idx3":
              throw new ConflictException("이미 사용 중인 닉네임입니다.");
          }
        }

        throw err;
      });
  }

  findMemberByEmail(email: string): Promise<Member | null> {
    return pipe(
      this.memberEntityRepository.findOne({ where: { email } }),
      (entity) => entity && Member.fromEntity(entity),
    );
  }

  findMemberByNickname(nickname: string): Promise<Member | null> {
    return pipe(
      this.memberEntityRepository.findOne({ where: { nickname } }),
      (entity) => entity && Member.fromEntity(entity),
    );
  }

  findMemberById(id: number): Promise<Member | null> {
    return pipe(
      this.memberEntityRepository.findOne({ where: { id } }),
      (entity) => entity && Member.fromEntity(entity),
    );
  }

  async deleteMember(id: number): Promise<void> {
    await pipe(
      this.memberEntityRepository.softDelete({
        id,
        deletedAt: IsNull(),
      }),
      throwIf(
        (result) => !result.affected,
        () => new NotFoundException("존재하지 않는 회원입니다."),
      ),
    );
  }
}
