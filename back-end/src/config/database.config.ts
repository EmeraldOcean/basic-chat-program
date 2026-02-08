import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = {
  type: 'postgres',  // postgres DB
  host: 'localhost',  // local
  port: 5432,  // postgres port
  username: 'postgres',  // DB username
  password: '1234',  // DB password
  database: 'chat-program',  // DB name
} as const

export const databaseOrmConfig: TypeOrmModuleOptions = {
  name: 'default',
  ...databaseConfig,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],  // ** : 모든 하위 디렉토리 재귀적으로 탐색
  synchronize: true,  // 자동으로 DB 테이블 생성하거나 업데이트
  extra: {
    timezone: 'z',  // UTC timezone
  }
};