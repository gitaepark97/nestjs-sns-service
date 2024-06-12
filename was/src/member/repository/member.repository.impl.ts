import { Injectable } from "@nestjs/common";
import { MemberRepository } from "./member.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { MemberEntity } from "./entity/member.entity";
import { Repository } from "typeorm";
import { Member } from "../domain/member";
import { MemberMapper } from "./mapper/member.mapper";

@Injectable()
export class MemberRepositoryImpl implements MemberRepository {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly memberEntityRepository: Repository<MemberEntity>,
  ) {}

  async saveMember(member: Member): Promise<void> {
    const memberEntity = MemberMapper.mapToEntity(member);
    await this.memberEntityRepository.save(memberEntity);
  }

  async findMemberByEmail(email: string): Promise<Member | null> {
    const memberEntity = await this.memberEntityRepository.findOne({
      where: { email },
    });
    return memberEntity && MemberMapper.mapToDomain(memberEntity);
  }

  async findMemberByNickname(nickname: string): Promise<Member | null> {
    const memberEntity = await this.memberEntityRepository.findOne({
      where: { nickname },
    });
    return memberEntity && MemberMapper.mapToDomain(memberEntity);
  }

  async findMemberById(id: number): Promise<Member | null> {
    const memberEntity = await this.memberEntityRepository.findOne({
      where: { id },
    });
    return memberEntity && MemberMapper.mapToDomain(memberEntity);
  }

  async deleteMember(id: number): Promise<void> {
    await this.memberEntityRepository.softDelete(id);
  }
}
