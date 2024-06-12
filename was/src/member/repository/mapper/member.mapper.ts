import { Member } from "../../domain/member";
import { MemberEntity } from "../entity/member.entity";

export abstract class MemberMapper {
  static mapToEntity(domain: Member) {
    const entity = new MemberEntity();

    entity.id = domain.id;
    entity.email = domain.email;
    entity.password = domain.password;
    entity.nickname = domain.nickname;

    return entity;
  }

  static mapToDomain(entity: MemberEntity) {
    return Member.fromMemberLike(entity);
  }
}
