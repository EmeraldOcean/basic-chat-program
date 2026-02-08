import { Injectable } from "@nestjs/common";
import { ORDER_TYPE } from "src/common/enum/database.enum";
import { MessageRepository } from "./repository/message.repository";
import { Message } from "./entity/message.entity";
import { CreateMessageDto } from "./dto/create-message.dto";
import { FilterMessageDto } from "./dto/filter-message.dto";
import { UserService } from "../user/user.service";

@Injectable()
export class MessageService {
  constructor(
    private readonly repository: MessageRepository,
    private readonly userService: UserService,
  ) {}

  // 메세지 생성
  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const user = await this.userService.getUserBySeqId(createMessageDto.user_seq_id);
    const newMessage = await this.repository.createMessage(user, createMessageDto);
    return newMessage;
  }

  // 사용자 Seq ID로 메세지 목록 찾기
  async getMessageByUserSeqId(seqId: number): Promise<Message[]> {
    const filter = new FilterMessageDto();
    filter.userSeqId = seqId;
    const messages = await this.repository.getFilteredList({ filter, order: ORDER_TYPE.ASC });
    return messages;
  }

  // 키워드로 메세지 목록 찾기
  async getMessageByContentKeyword(contentKeyword: string): Promise<Message[]> {
    const filter = new FilterMessageDto();
    filter.contentKeyword = contentKeyword;
    const messages = await this.repository.getFilteredList({ filter, order: ORDER_TYPE.ASC });
    return messages;
  }
}