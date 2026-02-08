import { Injectable } from '@nestjs/common';
import { RefreshToken } from '../entities/refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { FilterRefreshTokenDto } from '../dto/filter-refresh-token.dto';
import { ORDER_TYPE } from 'src/common/enum/database.enum';
import { User } from 'src/domains/user/entity/user.entity';
import { CreateRefreshTokenDto } from '../dto/create-refresh-token.dto';


interface IRefreshTokenQueryOptions {
  filter?: FilterRefreshTokenDto;
  order?: ORDER_TYPE;
  joinUser?: boolean;
}

export enum RefreshTokenOrderKey {
  ID = 'refresh_token.id',
  CREATE_DATE = 'refresh_token.create_date'
}

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  // 토큰 생성
  async createRefreshToken(user: User, createRefreshTokenDto: CreateRefreshTokenDto): Promise<RefreshToken> {
    const newRefreshToken = this.repository.create({
      user: user,
      ...createRefreshTokenDto,
    });
    const result = await this.repository.save(newRefreshToken);
    return result;
  }

  async deleteRefreshToken(refresh_token:string): Promise<boolean> {
    const result = await this.repository.delete({refresh_token});
    return result ? true : false;
  }

  private initializeDefaultOptions(
    options: IRefreshTokenQueryOptions = {}
  ): Required<IRefreshTokenQueryOptions> {
    return {
      filter: options.filter ?? new FilterRefreshTokenDto(),
      order: options.order ?? ORDER_TYPE.DEFAULT,
      joinUser: options.joinUser ?? true,
    };
  }

  private createQueryBuilder(
    options: IRefreshTokenQueryOptions,
  ): SelectQueryBuilder<RefreshToken> {
    const { filter, order, joinUser } = this.initializeDefaultOptions(options);
    const queryBuilder = this.createJoinQuery(options);
    const filteredQuery = this.filterQuery(queryBuilder, filter, joinUser);
    const orderedQuery = this.orderQuery(filteredQuery, order);
    return orderedQuery;
  }

  // 토큰 조회
  async getFilteredOne(options: IRefreshTokenQueryOptions = {}): Promise<RefreshToken | null> {
    const queryBuilder = this.createQueryBuilder(options);
    const result = await queryBuilder.getOne();
    return result;
  }

  private createJoinQuery(options: IRefreshTokenQueryOptions): SelectQueryBuilder<RefreshToken> {
    const queryBuilder = this.repository.createQueryBuilder('refresh_token');
    if (options.joinUser) {
      queryBuilder.leftJoinAndSelect('refresh_token.user', 'user');
    }

    queryBuilder.select([
      'refresh_token.id',
      'refresh_token.refresh_token',
      'refresh_token.create_date',
      'refresh_token.expires_date',
      ...(options.joinUser ? [
        'user.seq_id',
        'user.user_id',
        'user.email',
        'user.name',
      ] : []),
    ]);

    return queryBuilder;
  }

  private filterQuery(
    query: SelectQueryBuilder<RefreshToken>,
    filter: FilterRefreshTokenDto,
    joinUser: boolean
  ): SelectQueryBuilder<RefreshToken> {
    if (joinUser && filter.userSeqId) {
      query.andWhere('user.seq_id = :userSeqId', { userSeqId: filter.userSeqId });
    }
    if (filter.refreshToken) {
      query.andWhere('refresh_token.refresh_token = :refreshToken', { refreshToken: filter.refreshToken });
    }
    return query;
  }

  private orderQuery(query: SelectQueryBuilder<RefreshToken>, order: ORDER_TYPE): SelectQueryBuilder<RefreshToken> {
    if (order === ORDER_TYPE.ASC) {
      query.orderBy('refresh_token.id', ORDER_TYPE.ASC);
    } else if (order === ORDER_TYPE.DESC) {
      query.orderBy('refresh_token.id', ORDER_TYPE.DESC);
    }
    return query;
  }
}