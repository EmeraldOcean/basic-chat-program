import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { MessageModule } from 'src/domains/message/message.module';
import { JwtModule } from '@nestjs/jwt';
import { SECRET_KEY } from 'src/config/auth.config';

@Module({
  imports: [MessageModule,
    JwtModule.register({
      secret: SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [EventsGateway],
})
export class EventsModule {}
