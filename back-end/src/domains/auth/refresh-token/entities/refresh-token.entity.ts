import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/domains/user/entity/user.entity';

@Entity('refresh-token')
export class RefreshToken {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // refresh token
  @Column({ default: null, nullable: true })
  refresh_token: string;

  // 토큰 생성 날짜
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  create_date: Date;

  // 토큰 만료 날짜
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  expires_date: Date;

  // 사용자
  @ManyToOne(() => User, (user) => user.seq_id, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_seq_id' })
  user: User;
}