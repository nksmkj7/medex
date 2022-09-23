import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, MoreThanOrEqual } from 'typeorm';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import * as config from 'config';

import { CustomHttpException } from 'src/exception/custom-http.exception';
// import { AuthService } from 'src/auth/auth.service';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { ForbiddenException } from 'src/exception/forbidden.exception';
import { NotFoundException } from 'src/exception/not-found.exception';
import { CustomerRefreshToken } from 'src/customer-refresh-token/entities/customer-refresh-token.entity';
// import { RefreshTokenInterface } from 'src/refresh-token/interface/refresh-token.interface';
// import { RefreshTokenRepository } from 'src/refresh-token/refresh-token.repository';
import { RefreshPaginateFilterDto } from 'src/refresh-token/dto/refresh-paginate-filter.dto';
import { PaginationInfoInterface } from 'src/paginate/pagination-info.interface';
import { RefreshTokenSerializer } from 'src/refresh-token/serializer/refresh-token.serializer';
import { Pagination } from 'src/paginate';
import { CustomerSerializer } from 'src/customer/serializer/customer.serializer';
import { CustomerRefreshTokenRepository } from './customer-refresh-token.repository';
import { CustomerService } from 'src/customer/customer.service';
import { CustomerRefreshTokenInterface } from './interface/customer-refresh-token.interface';

const appConfig = config.get('app');
const tokenConfig = config.get('jwt');
const BASE_OPTIONS: SignOptions = {
  issuer: appConfig.appUrl,
  audience: appConfig.frontendUrl
};

@Injectable()
export class CustomerRefreshTokenService {
  constructor(
    @InjectRepository(CustomerRefreshTokenRepository)
    private readonly repository: CustomerRefreshTokenRepository,
    @Inject(forwardRef(() => CustomerService))
    private readonly authService: CustomerService,
    private readonly jwt: JwtService
  ) {}

  /**
   * Generate refresh token
   * @param user
   * @param refreshToken
   */
  public async generateRefreshToken(
    user: CustomerSerializer,
    refreshToken: Partial<CustomerRefreshToken>
  ): Promise<string> {
    const token = await this.repository.createRefreshToken(user, refreshToken);
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      expiresIn: tokenConfig.refreshExpiresIn,
      subject: String(user.id),
      jwtid: String(token.id)
    };

    return this.jwt.signAsync({ ...opts });
  }

  /**
   * Resolve encoded refresh token
   * @param encoded
   */
  public async resolveRefreshToken(encoded: string): Promise<{
    user: CustomerSerializer;
    token: CustomerRefreshToken;
  }> {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);
    if (!token) {
      throw new CustomHttpException(
        ExceptionTitleList.NotFound,
        HttpStatus.NOT_FOUND,
        StatusCodesList.NotFound
      );
    }

    if (token.isRevoked) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }

    return {
      user,
      token
    };
  }

  /**
   * Create access token from refresh token
   * @param refresh
   */
  public async createAccessTokenFromRefreshToken(refresh: string): Promise<{
    token: string;
    user: CustomerSerializer;
  }> {
    const { user } = await this.resolveRefreshToken(refresh);
    const token = await this.authService.generateAccessToken(user);
    return {
      user,
      token
    };
  }

  /**
   * Decode refresh token
   * @param token
   */
  async decodeRefreshToken(
    token: string
  ): Promise<CustomerRefreshTokenInterface> {
    try {
      return await this.jwt.verifyAsync(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new CustomHttpException(
          ExceptionTitleList.RefreshTokenExpired,
          HttpStatus.BAD_REQUEST,
          StatusCodesList.RefreshTokenExpired
        );
      } else {
        throw new CustomHttpException(
          ExceptionTitleList.InvalidRefreshToken,
          HttpStatus.BAD_REQUEST,
          StatusCodesList.InvalidRefreshToken
        );
      }
    }
  }

  /**
   * get user detail from refresh token
   * @param payload
   */
  async getUserFromRefreshTokenPayload(
    payload: CustomerRefreshTokenInterface
  ): Promise<CustomerSerializer> {
    const subId = payload.subject;

    if (!subId) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }

    return this.authService.findById(subId);
  }

  /**
   * Get refresh token entity from token payload
   * @param payload
   */
  async getStoredTokenFromRefreshTokenPayload(
    payload: CustomerRefreshTokenInterface
  ): Promise<CustomerRefreshToken | null> {
    const tokenId = payload.jwtid;

    if (!tokenId) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }

    return this.repository.findTokenById(tokenId);
  }

  /**
   * Get active refresh token list of user
   * @param userId
   */
  async getRefreshTokenByUserId(
    userId: number,
    filter: RefreshPaginateFilterDto
  ): Promise<Pagination<RefreshTokenSerializer>> {
    const paginationInfo: PaginationInfoInterface =
      this.repository.getPaginationInfo(filter);
    const findOptions: FindManyOptions = {
      where: {
        userId,
        isRevoked: false,
        expires: MoreThanOrEqual(new Date())
      }
    };
    const { page, skip, limit } = paginationInfo;
    findOptions.take = paginationInfo.limit;
    findOptions.skip = paginationInfo.skip;
    findOptions.order = {
      id: 'DESC'
    };
    const [results, total] = await this.repository.findAndCount(findOptions);
    const serializedResult = this.repository.transformMany(results);
    return new Pagination<RefreshTokenSerializer>({
      results: serializedResult,
      totalItems: total,
      pageSize: limit,
      currentPage: page,
      previous: page > 1 ? page - 1 : 0,
      next: total > skip + limit ? page + 1 : 0
    });
  }

  /**
   * Revoke refresh token by id
   * @param id
   * @param userId
   */
  async revokeRefreshTokenById(
    id: number,
    userId: number
  ): Promise<CustomerRefreshToken> {
    const token = await this.repository.findTokenById(id);
    if (!token) {
      throw new NotFoundException();
    }
    if (token.customerId !== userId) {
      throw new ForbiddenException();
    }
    token.isRevoked = true;
    await token.save();
    return token;
  }

  async getRefreshTokenGroupedData(field: string) {
    return this.repository
      .createQueryBuilder('token')
      .select(`token.${field} AS type`)
      .where(`token.${field} IS NOT NULL`)
      .addSelect('COUNT(*)::int AS value')
      .groupBy(`token.${field}`)
      .getRawMany();
  }
}
