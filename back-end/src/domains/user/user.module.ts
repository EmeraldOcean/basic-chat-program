import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entity/user.entity';
import { UserRepository } from './repository/user.repository';
import { RefreshTokenModule } from '../auth/refresh-token/refresh-token.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RefreshTokenModule],
  controllers: [UserController],
  providers: [
    UserService, 
    UserRepository,
  ],
  exports: [UserService]
})
export class UserModule {}