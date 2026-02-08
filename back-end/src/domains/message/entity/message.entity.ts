import { User } from 'src/domains/user/entity/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn('increment')
  id: number;
  
  // 보낸 사용자
  @ManyToOne(() => User, (user) => user.seq_id)
  @JoinColumn({ name: 'user_seq_id' })
  user: User;

  // 메세지 생성 날짜
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  create_date: Date;

  // 메세지 내용
  @Column({ type: 'varchar', length: 255 })
  content: string;
}