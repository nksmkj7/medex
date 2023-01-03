import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generateUniqueToken } from 'src/common/helper/general.helper';
import { MailJobInterface } from 'src/mail/interface/mail-job.interface';
import { CustomerRepository } from './customer.repository';
import { CustomerSignupDto } from './dto/customer-signup.dto';
import { CustomerSerializer } from './serializer/customer.serializer';
import * as dayjs from 'dayjs';
import * as config from 'config';
import { MailService } from 'src/mail/mail.service';
import { MoreThanOrEqual } from 'typeorm';
import { UserStatusEnum } from 'src/auth/user-status.enum';
import { CustomerLoginDto } from './dto/customer-login.dto';
import * as bcrypt from 'bcrypt';
import { SignOptions } from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { CustomerRefreshToken } from 'src/customer-refresh-token/entities/customer-refresh-token.entity';
import { CustomerRefreshTokenService } from 'src/customer-refresh-token/customer-refresh-token.service';
import { ForgetPasswordDto } from 'src/auth/dto/forget-password.dto';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';
import { CustomerEntity } from './entity/customer.entity';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { CustomHttpException } from 'src/exception/custom-http.exception';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { existsSync, unlinkSync } from 'fs';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CustomerFilterDto } from './dto/customer-filter.dto';
import { Pagination } from 'src/paginate';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

// const jwtConfig = config.get('jwt');
const appConfig = config.get('app');
const tokenConfig = config.get('jwt');

const BASE_OPTIONS: SignOptions = {
  issuer: appConfig.appUrl,
  audience: appConfig.frontendUrl
};

@Injectable()
export class CustomerService {
  private tokenExpirationTime: number;
  constructor(
    @InjectRepository(CustomerRepository)
    private repository: CustomerRepository,
    protected readonly mailService: MailService,
    private readonly jwt: JwtService,
    private readonly refreshTokenService: CustomerRefreshTokenService
  ) {
    this.tokenExpirationTime = 60;
  }

  checkUniqueFn = async (token: string) => {
    const tokenCount = await this.repository.countEntityByCondition({
      token
    });
    return tokenCount <= 0;
  };

  async store(customerDto: CustomerSignupDto) {
    const token = await generateUniqueToken(6, this.checkUniqueFn);
    const tokenValidityDate = dayjs().add(this.tokenExpirationTime, 'm');
    const customer = await this.repository.store({
      ...customerDto,
      token,
      tokenValidityDate,
      salt: await bcrypt.genSalt()
    });
    const subject = 'Account created';
    const link = `?verify-token=${token}`;
    const slug = 'activate-account';
    const linkLabel = 'Activate Account';
    await this.sendMailToUser(customer, subject, link, slug, linkLabel);
    return customer;
  }

  async sendMailToUser(
    user: CustomerSerializer,
    subject: string,
    url: string,
    slug: string,
    linkLabel: string
  ) {
    const appConfig = config.get('app');
    const mailData: MailJobInterface = {
      to: user.email,
      subject,
      slug,
      context: {
        email: user.email,
        link: `<a href="${appConfig.customerEndUrl}/${url}">${linkLabel} →</a>`,
        username: user.username,
        subject
      }
    };
    await this.mailService.sendMail(mailData, 'system-mail');
  }

  async activateAccount(code: string) {
    const customer = await this.repository.findOne({
      where: {
        token: code,
        tokenValidityDate: MoreThanOrEqual(dayjs())
      }
    });
    if (!customer) {
      throw new UnprocessableEntityException('Invalid code.');
    }
    customer.status = UserStatusEnum.ACTIVE;
    customer.token = null;
    customer.tokenValidityDate = null;
    await customer.save();
    return this.repository.transform(customer);
  }

  async login(
    customerLoginDto: CustomerLoginDto,
    refreshTokenPayload: Partial<CustomerRefreshToken>
  ) {
    const usernameIPkey = `${customerLoginDto.email}_${refreshTokenPayload.ip}`;
    const { email, password } = customerLoginDto;
    const customer = await this.repository.findOne({
      email
    });
    if (!customer) {
      throw new NotFoundException("user with that email doesn't exist");
    }
    switch (customer.status) {
      case UserStatusEnum.BLOCKED:
        throw new BadRequestException('Your account has been blocked.');
      case UserStatusEnum.INACTIVE:
        throw new BadRequestException(
          'Your account has not been activated yet.'
        );
    }
    if (!(await customer.validatePassword(password))) {
      throw new UnauthorizedException('Invalid password');
    }
    const serializedCustomer = this.repository.transform(customer);

    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      serializedCustomer,
      refreshTokenPayload
    );
    const accessToken = await this.generateAccessToken(serializedCustomer);
    return {
      accessToken,
      refreshToken,
      expiresIn: tokenConfig.expiresIn
    };
  }

  public async generateAccessToken(user: CustomerSerializer): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id)
    };
    return this.jwt.signAsync({
      ...opts
    });
  }

  async findById(id: string): Promise<CustomerSerializer> {
    return this.repository.get(id);
  }

  async forgotPassword(forgetPasswordDto: ForgetPasswordDto): Promise<void> {
    const { email } = forgetPasswordDto;
    const user = await this.repository.findOne({
      where: {
        email
      }
    });
    if (!user) {
      throw new NotFoundException("Customer with that email doesn't exist");
    }
    const checkUniqueFn = async (token: string) => {
      const tokenCount = await this.repository.countEntityByCondition({
        token
      });
      return tokenCount <= 0;
    };
    const token = await generateUniqueToken(6, checkUniqueFn);
    user.token = token;
    const currentDateTime = new Date();
    currentDateTime.setHours(currentDateTime.getHours() + 1);
    const tokenValidityDate = dayjs().add(this.tokenExpirationTime, 'm');
    user.tokenValidityDate = tokenValidityDate.toDate();
    await user.save();
    const subject = 'Reset Password';
    await this.sendMailToUser(
      this.repository.transform(user),
      subject,
      `?reset-token=${token}`,
      'reset-password',
      subject
    );
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { password } = resetPasswordDto;
    const user = await this.repository.getUserForResetPassword(
      resetPasswordDto
    );
    if (!user) {
      throw new NotFoundException();
    }
    user.token = await generateUniqueToken(6, this.checkUniqueFn);
    user.password = password;
    await user.save();
  }

  async changePassword(
    customer: CustomerEntity,
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    const { oldPassword, password } = changePasswordDto;
    const checkOldPwdMatches = await customer.validatePassword(oldPassword);
    if (!checkOldPwdMatches) {
      throw new CustomHttpException(
        ExceptionTitleList.IncorrectOldPassword,
        HttpStatus.PRECONDITION_FAILED,
        StatusCodesList.IncorrectOldPassword
      );
    }
    customer.password = password;
    await customer.save();
  }

  async uploadProfileImage(
    file: Express.Multer.File,
    customer: CustomerEntity
  ) {
    if (customer.profilePicture) {
      const path = `public/images/customer-profile/${customer.profilePicture}`;
      if (existsSync(path)) {
        unlinkSync(`public/images/customer-profile/${customer.profilePicture}`);
      }
    }
    customer.profilePicture = file.filename;
    customer.save();
    return this.repository.transform(customer);
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    customer: CustomerEntity
  ) {
    console.log(updateProfileDto,'------->')
    return
    this.repository.merge(customer, updateProfileDto);
    await customer.save();
    return this.repository.transform(customer);
  }

  getProfile(customer: CustomerEntity) {
    return this.repository.transform(customer);
  }

  async findAll(
    customerFilterDto: CustomerFilterDto
  ): Promise<Pagination<CustomerSerializer>> {
    return this.repository.paginate(
      customerFilterDto,
      [],
      ['email', 'firstName', 'lastName']
    );
  }

  async findOne(id: string): Promise<CustomerSerializer> {
    return this.repository.get(id);
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto
  ): Promise<CustomerSerializer> {
    const customer = await this.repository.findOne(id);
    if (!customer) {
      throw new NotFoundException();
    }
    return this.repository.updateItem(customer, updateCustomerDto);
  }

  async createAccessTokenFromRefreshToken(
    refreshToken: string,
    refreshTokenPayload: Partial<CustomerRefreshToken>
  ) {
    const { token, user, oldRefreshToken } =
      await this.refreshTokenService.createAccessTokenFromRefreshToken(
        refreshToken
      );

    if (oldRefreshToken) {
      oldRefreshToken.isRevoked = true;
      oldRefreshToken.save();
    }
    const newRefreshToken = await this.refreshTokenService.generateRefreshToken(
      user,
      refreshTokenPayload
    );

    return {
      accessToken: token,
      refreshToken: newRefreshToken,
      expiresIn: tokenConfig.expiresIn
    };
  }

  async revokeCustomerRefreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    const { token: oldRefreshToken } =
      await this.refreshTokenService.resolveRefreshToken(refreshToken);
    if (oldRefreshToken) {
      oldRefreshToken.isRevoked = true;
      await oldRefreshToken.save();
    }
    return oldRefreshToken;
  }
}
