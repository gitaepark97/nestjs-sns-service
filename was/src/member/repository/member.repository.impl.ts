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
import { noop, pipe, throwIf } from "@fxts/core";

@Injectable()
export class MemberRepositoryImpl implements MemberRepository {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberEntityRepository: Repository<MemberEntity>,
  ) {}

  saveMember = (member: Member): Promise<void> =>
    this.memberEntityRepository
      .save({
        id: member.id,
        email: member.email,
        password: member.password,
        nickname: member.nickname,
      })
      .then(noop)
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

  findMemberByEmail = (email: string): Promise<Member | null> =>
    this.memberEntityRepository
      .findOne({ where: { email } })
      .then((entity) => entity && Member.fromEntity(entity));

  findMemberByNickname = (nickname: string): Promise<Member | null> =>
    this.memberEntityRepository
      .findOne({ where: { nickname } })
      .then((entity) => entity && Member.fromEntity(entity));

  findMemberById = (id: number): Promise<Member | null> =>
    this.memberEntityRepository
      .findOne({ where: { id } })
      .then((entity) => entity && Member.fromEntity(entity));

  deleteMember = (member: Member): Promise<void> =>
    pipe(
      this.memberEntityRepository.softDelete({
        id: member.id,
        deletedAt: IsNull(),
      }),
      throwIf(
        (result) => !result.affected,
        () => new NotFoundException("존재하지 않는 회원입니다."),
      ),
      noop,
    );
}
