import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseOrmConfig } from './config/database.config';
import { UserModule } from './domains/user/user.module';
import { EventsModule } from './events/events.module';
import { MessageModule } from './domains/message/message.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseOrmConfig),
    UserModule,
    EventsModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
