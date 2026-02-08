import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { ORDER_TYPE } from "src/common/enum/database.enum";
import { FilterMessageDto } from "../dto/filter-message.dto";
import { Message } from "../entity/message.entity";
import { CreateMessageDto } from "../dto/create-message.dto";
import { User } from "src/domains/user/entity/user.entity";

interface IMessageQueryOptions {
  filter?: FilterMessageDto;
  order?: ORDER_TYPE;
  joinUser?: boolean;
}

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repository: Repository<Message>,
  ) {}

  // 메세지 생성
  async createMessage(user: User, createMessageDto: CreateMessageDto): Promise<Message> {
    const newMessage = this.repository.create({
      user: user,
      ...createMessageDto,
    });
    const result = await this.repository.save(newMessage);
    return result;
  }

  // 메세지 1개 조회
  async getFilteredOne(options: IMessageQueryOptions = {}): Promise<Message | null> {
    const queryBuilder = this.createQueryBuilder(options);
    const result = await queryBuilder.getOne();
    return result;
  }

  // 메세지 목록 조회
  async getFilteredList(options: IMessageQueryOptions = {}): Promise<Message[]> {
    const queryBuilder = this.createQueryBuilder(options);
    const result = await queryBuilder.getMany();
    return result;
  }

  private initializeDefaultOptions(
    options: IMessageQueryOptions = {}
  ): Required<IMessageQueryOptions> {
    return {
      filter: options.filter ?? new FilterMessageDto(),
      order: options.order ?? ORDER_TYPE.DEFAULT,
      joinUser: options.joinUser ?? true,
    };
  }

  private createQueryBuilder(
    options: IMessageQueryOptions,
  ): SelectQueryBuilder<Message> {
    const { filter, order, joinUser } = this.initializeDefaultOptions(options);
    const queryBuilder = this.createJoinQuery(joinUser);
    const filteredQuery = this.filterQuery(queryBuilder, filter, joinUser);
    const orderedQuery = this.orderQuery(filteredQuery, order);
    return orderedQuery;
  }

  private createJoinQuery(joinUser: boolean): SelectQueryBuilder<Message> {
    const queryBuilder = this.repository.createQueryBuilder('message');
    if (joinUser) {
      queryBuilder.leftJoinAndSelect('message.user', 'user');
    }

    queryBuilder.select([
      'message.id',
      'message.content',
      'message.create_date',
      ...(joinUser ? [
        'user.seq_id'
      ] : []),
    ]);

    return queryBuilder;
  }

  private filterQuery(query: SelectQueryBuilder<Message>, filter: FilterMessageDto, joinUser: boolean): SelectQueryBuilder<Message> {
    if (joinUser && filter.userSeqId) {
      query.andWhere('user.seq_id = :userSeqId', { userSeqId: filter.userSeqId });
    }
    if (filter.contentKeyword) {
      query.andWhere('message.content LIKE :contentKeyword', { contentKeyword: `%${filter.contentKeyword}%` });
    }
    return query;
  }

  private orderQuery(query: SelectQueryBuilder<Message>, order: ORDER_TYPE): SelectQueryBuilder<Message> {
    if (order === ORDER_TYPE.ASC) {
      query.orderBy('message.id', ORDER_TYPE.ASC);
    } else if (order === ORDER_TYPE.DESC) {
      query.orderBy('message.id', ORDER_TYPE.DESC);
    }
    return query;
  }
}