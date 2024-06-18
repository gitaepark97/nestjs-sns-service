import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateMemberService } from "./create-member.service";
import { Member } from "../domain/member";
import { CreateMemberCommand } from "./command/create-member.command";
import { MemberRepository } from "../repository/member.repository";
import { GetMemberService } from "./get-member.service";
import { UpdateMemberService } from "./update-member.service";
import { UpdateMemberCommand } from "./command/update-member.command";
import { DeleteMemberService } from "./delete-member.service";
import { curry, isNil, negate, noop, pipe, tap, throwIf } from "@fxts/core";

@Injectable()
export class MemberServiceImpl
  implements
    CreateMemberService,
    GetMemberService,
    UpdateMemberService,
    DeleteMemberService
{
  constructor(private readonly memberRepository: MemberRepository) {}

  createMember = (command: CreateMemberCommand): Promise<void> =>
    pipe(
      Promise.all([
        this.validateEmail(command.email),
        this.validateNickname(command.nickname),
      ]), // 데이터 확인

      () => Member.create(command.email, command.password, command.nickname), // 회원 생성
      this.memberRepository.saveMember, // 회원 저장
    );

  getMember = (id: number): Promise<Member> =>
    pipe(
      this.memberRepository.findMemberById(id), // 회원 조회
      throwIf(isNil, () => new NotFoundException("존재하지 않는 회원입니다.")),
    );

  deleteMember = (memberId: number): Promise<void> =>
    pipe(
      this.getMember(memberId), // 회원 조회
      this.memberRepository.deleteMember, // 회원 삭제
    );

  updateMember = (command: UpdateMemberCommand): Promise<void> =>
    pipe(
      this.getMember(command.memberId), // 회원 조회
      tap(this.updateNickname(command.nickname)), // 닉네임 변경
      this.memberRepository.saveMember, // 회원 저장
    );

  private validateEmail = (email: string) =>
    pipe(
      this.memberRepository.findMemberByEmail(email),
      throwIf(
        negate(isNil),
        () => new ConflictException("이미 사용 중인 이메일입니다."),
      ),
      noop,
    );

  private validateNickname = (nickname: string) =>
    pipe(
      this.memberRepository.findMemberByNickname(nickname),
      throwIf(
        negate(isNil),
        () => new ConflictException("이미 사용 중인 닉네임입니다."),
      ),
      noop,
    );

  private updateNickname = curry(
    async (newNickname: string | undefined, member: Member) => {
      // 변경할 닉네임이 존재하지 않는 경우
      if (!newNickname) return;

      // 변경할 닉네임이 기존과 동일한 경우
      if (newNickname === member.nickname) return;

      // 닉네임 확인
      await this.validateNickname(newNickname);

      // 회원의 닉네임 변경
      member.updateNickname(newNickname);
    },
  );
}
