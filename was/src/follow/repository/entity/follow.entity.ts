import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { MemberEntity } from "../../../member/repository/entity/member.entity";

@Index("idx1", ["followerId"])
@Index("idx2", ["followedId"])
@Entity("follows")
export class FollowEntity {
  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: "follower_id", referencedColumnName: "id" })
  @PrimaryColumn({ name: "follower_id" })
  followerId: number;

  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: "followed_id", referencedColumnName: "id" })
  @PrimaryColumn({ name: "followed_id" })
  followedId: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
