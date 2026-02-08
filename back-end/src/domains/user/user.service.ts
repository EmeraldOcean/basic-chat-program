import { BadRequestException, Injectable, NotFoundException, Logger } from "@nestjs/common";
import { UserRepository } from "./repository/user.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entity/user.entity";
import { ORDER_TYPE } from "src/common/enum/database.enum";
import { FilterUserDto } from "./dto/filter-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { HASH_SALT } from "src/config/auth.config";
import bcryptjs from "node_modules/bcryptjs";
import { RefreshTokenService } from "../auth/refresh-token/refresh-token.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name)
  constructor(
    private readonly repository: UserRepository,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  // 사용자 생성
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const filter = new FilterUserDto();
    filter.userId = createUserDto.user_id;
    const user = await this.repository.getFilteredOne({ filter, order: ORDER_TYPE.DEFAULT });
    if (user) {
      throw new BadRequestException('The User ID already exists.');
    }
    const newUser = await this.repository.createUser(createUserDto);
    return newUser;
  }

  // 로그인
  async login(loginDto: LoginUserDto): Promise<LoginResponseDto> {
    const user = await this.validateServiceUser(loginDto);
    let [accessToken, refreshToken] = ["", ""];
    if (user.seq_id > 0) {
      const tokens = await this.generateTokens(user);
      [accessToken, refreshToken] = [tokens.accessToken, tokens.refreshToken];
    }
    const loginInfo = plainToInstance(LoginResponseDto, {
      userSeqId: user.seq_id,
      accessToken: accessToken,
      refreshToken: refreshToken
    });
    
    return loginInfo;
  };

  // 사용자 목록 찾기
  async getUsers(filterDto: FilterUserDto): Promise<User[]> {
    const users = await this.repository.getFilteredList({ filter: filterDto, order: ORDER_TYPE.DESC });
    return users;
  }

  // 사용자 Seq ID로 찾기
  async getUserBySeqId(seqId: number): Promise<User> {
    const filter = new FilterUserDto();
    filter.seqId = seqId;
    const user = await this.repository.getFilteredOne({ filter, order: ORDER_TYPE.DESC });
    if (!user) {
      throw new NotFoundException('The User does not exist.');
    }
    return user;
  }

  // 사용자 ID로 찾기
  async getUserByUserId(userId: string): Promise<User> {
    const filter = new FilterUserDto();
    filter.userId = userId;
    const user = await this.repository.getFilteredOne({ filter, order: ORDER_TYPE.DESC });
    if (!user) {
      throw new NotFoundException('The User does not exist.');
    }
    return user;
  }

  // 사용자 정보 업데이트
  async updateUser(seqId: number, dto: UpdateUserDto): Promise<boolean> {
    const user = await this.getUserBySeqId(seqId);
    if (!user) {
      throw new NotFoundException('The User does not exist.');
    }
    if (dto.password) {
      const hashedPassword = await bcryptjs.hash(dto.password, HASH_SALT);
      dto.password = hashedPassword;
    }
    const result = await this.repository.updateUser(seqId, dto);
    return result;
  }

  // 사용자 탈퇴
  async softDeleteUser(seqId: number): Promise<boolean> {
    const result = await this.repository.softDelteUser(seqId);
    return result;
  }

  // refresh token 삭제
  async removeRefreshToken(refreshToken: string): Promise<boolean> {
    const result = await this.refreshTokenService.removeAuth(refreshToken);
    return result;
  };

  // access token 재발급
  async updateAccessToken(refreshToken: string): Promise<string> {
    const accessToken = await this.refreshTokenService.refreshAccessToken(refreshToken);
    return accessToken;
  };

  // 로그인 시 아이디, 비밀번호 일치 여부 확인
  private async validateServiceUser(loginDto: LoginUserDto): Promise<User> {
    const { userId, password } = loginDto
    const user = await this.getUserByUserId(userId);
    if (!user) {
      this.logger.error('User not found.');
      return new User();
    };
    if (!await bcryptjs.compare(password, user.password)) {
      this.logger.error('The password is not valid.');
      return new User();
    };
    return user;
  };

  // 토큰 발급
  private async generateTokens(users: User): Promise<{accessToken: string, refreshToken: string}> {
    const accessToken = await this.refreshTokenService.generateAccessToken(users);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(users);
    return { accessToken, refreshToken };
  };
}