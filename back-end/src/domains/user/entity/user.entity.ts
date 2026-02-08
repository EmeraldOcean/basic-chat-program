import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { HASH_SALT } from '../../../config/auth.config';

@Entity('user')
export class User {
  // 사용자 seq_id
  @PrimaryGeneratedColumn('increment')
  seq_id: number;

  // 사용자 실제 ID
  @Column({ type: 'varchar', length: 30, unique: true })
  user_id: string;

  // 사용자 비밀번호
  @Column({ type: 'varchar' })
  password: string;

  // 사용자 이메일
  @Column({ type: 'varchar', length: 50 })
  email: string;

  // 사용자 이름
  @Column({ type: 'varchar', length: 30 })
  name: string;

  // 사용자 생성 날짜
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  create_date: Date;

  // 사용자 수정 날짜
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  update_date: Date;

  // 사용자 접속 가능 여부
  @Column({ type: 'boolean', default: true })
  valid_record: boolean = true;

  // 사용자 차단 여부
  @Column({ type: 'boolean', default: false })
  block: boolean = false;

  // 사용자 비밀번호 해싱
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcryptjs.hash(this.password, HASH_SALT);
  }
}