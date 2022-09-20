import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generateUniqueToken } from 'src/common/helper/general.helper';
import { MailJobInterface } from 'src/mail/interface/mail-job.interface';
import { CustomerRepository } from './customer.repository';
import { CustomerSignupDto } from './dto/customer-signup.dto';
import { CustomerSerializer } from './serializer/customer.serializer';
import * as dayjs from 'dayjs';
import * as config from 'config';
import { MailService } from 'src/mail/mail.service';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { UserStatusEnum } from 'src/auth/user-status.enum';

@Injectable()
export class CustomerService {
  private tokenExpirationTime: number;
  constructor(
    @InjectRepository(CustomerRepository)
    private repository: CustomerRepository,
    protected readonly mailService: MailService
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
      tokenValidityDate
    });
    const subject = 'Account created';
    const link = `customer/verify/${token}`;
    const slug = 'activate-account';
    const linkLabel = 'Activate Account';
    await this.sendMailToUser(customer, subject, link, slug, linkLabel);
    return;
    // console.log(customer);
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
        tokenValidityDate: LessThanOrEqual(dayjs())
      }
    });
    if (!customer) {
      throw new UnprocessableEntityException('Invalid code.');
    }
    customer.status = UserStatusEnum.ACTIVE;
    await customer.save();
    return this.repository.transform(customer);
  }
}
