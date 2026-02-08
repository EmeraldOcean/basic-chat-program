import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { User } from "../entity/user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { FilterUserDto } from "../dto/filter-user.dto";
import { ORDER_TYPE } from "src/common/enum/database.enum";

interface IUserQueryOptions {
  filter?: FilterUserDto;
  order?: ORDER_TYPE;
}

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  // 사용자 생성
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.repository.create(createUserDto);
    const result = await this.repository.save(newUser);
    return result;
  }

  // 사용자 정보 업데이트
  async updateUser(seqId: number, updateUserDto: UpdateUserDto): Promise<boolean> {
    const result = await this.repository.update({ seq_id: seqId }, {
      update_date: new Date(),
      ...updateUserDto,
    });
    return result.affected !== undefined && result.affected > 0;
  }

  // 사용자 탈퇴
  async softDelteUser(seqId: number): Promise<boolean> {
    const result = await this.repository.update({ seq_id: seqId }, {
      valid_record: false,
    });
    return result.affected !== undefined && result.affected > 0;
  }

  // 사용자 1명 조회
  async getFilteredOne(options: IUserQueryOptions = {}): Promise<User | null> {
    const queryBuilder = this.createQueryBuilder(options);
    const result = await queryBuilder.getOne();
    return result;
  }

  // 사용자 목록 조회
  async getFilteredList(options: IUserQueryOptions = {}): Promise<User[]> {
    const queryBuilder = this.createQueryBuilder(options);
    const result = await queryBuilder.getMany();
    return result;
  }

  private initializeDefaultOptions(
    options: IUserQueryOptions = {}
  ): Required<IUserQueryOptions> {
    return {
      filter: options.filter ?? new FilterUserDto(),
      order: options.order ?? ORDER_TYPE.DEFAULT,
    };
  }

  private createQueryBuilder(
    options: IUserQueryOptions,
  ): SelectQueryBuilder<User> {
    const { filter, order } = this.initializeDefaultOptions(options);
    const queryBuilder = this.createJoinQuery();
    const filteredQuery = this.filterQuery(queryBuilder, filter);
    const orderedQuery = this.orderQuery(filteredQuery, order);
    return orderedQuery;
  }

  private createJoinQuery(): SelectQueryBuilder<User> {
    const queryBuilder = this.repository.createQueryBuilder('user');
    return queryBuilder;
  }

  private filterQuery(query: SelectQueryBuilder<User>, filter: FilterUserDto): SelectQueryBuilder<User> {
    if (filter.seqId) {
      query.andWhere('user.seq_id = :seqId', { seqId: filter.seqId });
    }
    if (filter.userId) {
      query.andWhere('user.user_id = :userId', { userId: filter.userId });
    }
    if (filter.email) {
      query.andWhere('user.email = :email', { email: filter.email });
    }
    if (filter.validRecord) {
      query.andWhere('user.valid_record = :validRecord', { validRecord: filter.validRecord });
    }
    if (filter.block) {
      query.andWhere('user.block = :block', { block: filter.block });
    }
    return query;
  }

  private orderQuery(query: SelectQueryBuilder<User>, order: ORDER_TYPE): SelectQueryBuilder<User> {
    if (order === ORDER_TYPE.ASC) {
      query.orderBy('user.seq_id', ORDER_TYPE.ASC);
    } else if (order === ORDER_TYPE.DESC) {
      query.orderBy('user.seq_id', ORDER_TYPE.DESC);
    }
    return query;
  }
}