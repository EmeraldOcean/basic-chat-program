import { JwtService } from '@nestjs/jwt';
import { Logger, NotFoundException } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from 'src/domains/message/dto/create-message.dto';
import { MessageService } from 'src/domains/message/message.service';
import { SECRET_KEY } from 'src/config/auth.config';

@WebSocketGateway({
  namespace: "chat",
  cors: { origin: "*" }
})

export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger('EventsGateway');
  constructor(
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('Websocket Init')
  }

  async handleConnection(client: Socket) {
    try {
      const authToken = client.handshake.auth.token || client.handshake.headers['authorization'];
      if (!authToken) {
        throw new NotFoundException('No token exists');
      }
      const token = authToken.startsWith('Bearer ') ? authToken.split(' ')[1] : authToken;

      const payload = await this.jwtService.verifyAsync(token, { secret: SECRET_KEY })
      client.data.user = {
        seqId: payload.seqId,
        userId: payload.userId,
        userName: payload.name || payload.userId
      }
      this.logger.log(`Client connected: ${payload.userId}`)
    } catch (error) {
      this.logger.error('Invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.data.user.userId}`);
  }

  @SubscribeMessage("message")
  async handleEvent(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const user = client.data.user;
    
    // 메시지와 함께 사용자 정보도 전송
    const messageData = {
      content: data,
      userId: user.userId,
      userSeqId: user.seqId,
      userName: user.userName || user.userId,
    };
    
    this.server.emit("message", messageData);

    try {
      const createMessageDto = new CreateMessageDto();
      createMessageDto.user_seq_id = user.seqId;
      createMessageDto.content = data;
      await this.messageService.createMessage(createMessageDto);  
    } catch (error) {
      this.logger.error(`Failed to save message: ${error}`);
    }
  }
}
