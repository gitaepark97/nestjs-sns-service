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

@Injectable()
export class MemberRepositoryImpl implements MemberRepository {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberEntityRepository: Repository<MemberEntity>,
  ) {}

  async saveMember(member: Member): Promise<void> {
    try {
      await this.memberEntityRepository.save({
        id: member.id,
        email: member.email,
        password: member.password,
        nickname: member.nickname,
      });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        switch (extractIdxName(err)) {
          case "idx2":
            throw new ConflictException("이미 사용 중인 이메일입니다.");
          case "idx3":
            throw new ConflictException("이미 사용 중인 닉네임입니다.");
        }
      }

      throw err;
    }
  }

  async findMemberByEmail(email: string): Promise<Member | null> {
    const memberEntity = await this.memberEntityRepository.findOne({
      where: { email },
    });
    return memberEntity && Member.fromEntity(memberEntity);
  }

  async findMemberByNickname(nickname: string): Promise<Member | null> {
    const memberEntity = await this.memberEntityRepository.findOne({
      where: { nickname },
    });
    return memberEntity && Member.fromEntity(memberEntity);
  }

  async findMemberById(id: number): Promise<Member | null> {
    const memberEntity = await this.memberEntityRepository.findOne({
      where: { id },
    });
    return memberEntity && Member.fromEntity(memberEntity);
  }

  async deleteMember(id: number): Promise<void> {
    const result = await this.memberEntityRepository.softDelete({
      id,
      deletedAt: IsNull(),
    });
    if (!result.affected)
      throw new NotFoundException("존재하지 않는 회원입니다.");
  }
}
