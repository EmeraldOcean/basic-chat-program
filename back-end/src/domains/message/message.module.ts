import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageRepository } from './repository/message.repository';
import { Message } from './entity/message.entity';
import { MessageService } from './message.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), UserModule],
  providers: [
    MessageService, 
    MessageRepository,
  ],
  exports: [MessageService]
})
export class MessageModule {}