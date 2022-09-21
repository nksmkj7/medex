import {
  BadRequestException,
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
import { CustomerEntity } from './entity/customer.entity';
import { SignOptions } from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';

const jwtConfig = config.get('jwt');
const appConfig = config.get('app');

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
    private readonly jwt: JwtService
  ) {
    this.tokenExpirationTime = 60;
  }

  async store(customerDto: CustomerSignupDto) {
    const checkUniqueFn = async (token: string) => {
      const tokenCount = await this.repository.countEntityByCondition({
        token
      });
      return tokenCount <= 0;
    };
    const token = await generateUniqueToken(6, checkUniqueFn);
    const tokenValidityDate = dayjs().add(this.tokenExpirationTime, 'm');
    const customer = await this.repository.store({
      ...customerDto,
      token,
      tokenValidityDate,
      salt: await bcrypt.genSalt()
    });
    const subject = 'Account created';
    const link = `customer/verify/${token}`;
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
        link: `<a href="${appConfig.frontendUrl}/${url}">${linkLabel} →</a>`,
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

  async login(customerLoginDto: CustomerLoginDto) {
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
    return { accessToken: await this.generateAccessToken(customer) };
  }

  public async generateAccessToken(user: CustomerEntity): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id)
    };
    return this.jwt.signAsync({
      ...opts
    });
  }
}
