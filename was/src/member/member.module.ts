import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MemberEntity } from "./repository/entity/member.entity";
import { CreateMemberService } from "./service/create-member.service";
import { MemberServiceImpl } from "./service/member.service.impl";
import { MemberRepository } from "./repository/member.repository";
import { MemberRepositoryImpl } from "./repository/member.repository.impl";
import { MemberController } from "./controller/member.controller";
import { GetMemberService } from "./service/get-member.service";
import { UpdateMemberService } from "./service/update-member.service";
import { DeleteMemberService } from "./service/delete-member.service";

@Module({
  imports: [TypeOrmModule.forFeature([MemberEntity])],
  controllers: [MemberController],
  providers: [
    { provide: MemberRepository, useClass: MemberRepositoryImpl },
    {
      provide: CreateMemberService,
      useClass: MemberServiceImpl,
    },
    { provide: GetMemberService, useClass: MemberServiceImpl },
    { provide: UpdateMemberService, useClass: MemberServiceImpl },
    { provide: DeleteMemberService, useClass: MemberServiceImpl },
  ],
  exports: [GetMemberService],
})
export class MemberModule {}
