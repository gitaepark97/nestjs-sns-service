import { Injectable } from "@nestjs/common";
import { CreateMemberService } from "./create-member.service";
import { Member } from "../domain/member";
import { CreateMemberCommand } from "./command/create-member.command";
import { MemberRepository } from "../repository/member.repository";
import { GetMemberService } from "./get-member.service";
import { Validation } from "../../util/validation.util";
import { UpdateMemberService } from "./update-member.service";
import { UpdateMemberCommand } from "./command/update-member.command";
import { DeleteMemberService } from "./delete-member.service";

@Injectable()
export class MemberServiceImpl
  implements
    CreateMemberService,
    GetMemberService,
    UpdateMemberService,
    DeleteMemberService
{
  constructor(private readonly memberRepository: MemberRepository) {}

  async createMember(command: CreateMemberCommand) {
    // 병렬적으로 데이터 확인
    await Promise.all([
      this.validateEmail(command.email),
      this.validateNickname(command.nickname),
    ]);

    // 회원 생성
    const member = Member.create(
      command.email,
      command.password,
      command.nickname,
    );

    // 회원 저장
    return this.memberRepository.saveMember(member);
  }

  getMember(id: number): Promise<Member> {
    // 회원 조회
    return Validation.notFound(
      this.memberRepository.findMemberById(id),
      "존재하지 않는 회원입니다.",
    );
  }

  async deleteMember(memberId: number): Promise<void> {
    const member = await this.getMember(memberId);

    return this.memberRepository.deleteMember(member.id);
  }

  async updateMember(command: UpdateMemberCommand): Promise<void> {
    // 회원 조회
    const member = await this.getMember(command.id);

    // 닉네임 변경
    await this.updateNickname(member, command.nickname);

    // 회원 저장
    return this.memberRepository.saveMember(member);
  }

  private validateEmail(email: string) {
    return Validation.conflict(
      this.memberRepository.findMemberByEmail(email),
      "이미 사용 중인 이메일입니다.",
    );
  }

  private validateNickname(nickname: string) {
    return Validation.conflict(
      this.memberRepository.findMemberByNickname(nickname),
      "이미 사용 중인 닉네임입니다.",
    );
  }

  private async updateNickname(member: Member, newNickname?: string) {
    // 변경할 닉네임이 존재하지 않는 경우
    if (!newNickname) return;

    // 변경할 닉네임이 기존과 동일한 경우
    if (newNickname === member.nickname) return;

    // 닉네임 중복 확인
    await this.validateNickname(newNickname);

    // 회원의 닉네임 변경
    member.nickname = newNickname;
  }
}
