import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { MemberEntity } from "../../../member/repository/entity/member.entity";

@Index("idx1", ["deletedAt"])
@Entity("posts")
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: "creator_id", referencedColumnName: "id" })
  @Column({ name: "creator_id" })
  creatorId: number;

  @Column({ type: "text" })
  content: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date;
}
