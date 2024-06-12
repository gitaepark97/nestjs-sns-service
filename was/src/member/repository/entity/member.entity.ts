import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Index("idx_members_1", ["email"], { unique: true })
@Index("idx_members_2", ["nickname"], { unique: true })
@Entity("members")
export class MemberEntity {
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Column({ length: 100 })
  email: string;

  @Column()
  password: string;

  @Column({ length: 30 })
  nickname: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date;
}
