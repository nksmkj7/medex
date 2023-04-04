import { Module, ValidationPipeOptions } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import * as path from 'path';
import * as config from 'config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import {
  CookieResolver,
  HeaderResolver,
  I18nJsonParser,
  I18nModule,
  QueryResolver
} from 'nestjs-i18n';
import { WinstonModule } from 'nest-winston';

import { AuthModule } from 'src/auth/auth.module';
import { RolesModule } from 'src/role/roles.module';
import { PermissionsModule } from 'src/permission/permissions.module';
import * as ormConfig from 'src/config/ormconfig';
import * as throttleConfig from 'src/config/throttle-config';
import { MailModule } from 'src/mail/mail.module';
import { EmailTemplateModule } from 'src/email-template/email-template.module';
import { RefreshTokenModule } from 'src/refresh-token/refresh-token.module';
import { I18nExceptionFilterPipe } from 'src/common/pipes/i18n-exception-filter.pipe';
import { CustomValidationPipe } from 'src/common/pipes/custom-validation.pipe';
import { TwofaModule } from 'src/twofa/twofa.module';
import { CustomThrottlerGuard } from 'src/common/guard/custom-throttle.guard';
import { DashboardModule } from 'src/dashboard/dashboard.module';
import { AppController } from 'src/app.controller';
import { CountryModule } from './country/country.module';
import { ProviderModule } from './provider/provider.module';
import { BannerModule } from './banner/banner.module';
import { SpecialistModule } from './specialist/specialist.module';
import { MenuModule } from './menu/menu.module';
import winstonConfig from 'src/config/winston';
import { CategoryModule } from './category/category.module';
import { ServiceModule } from './service/service.module';
import { ScheduleModule } from './schedule/schedule.module';
import { CustomerModule } from './customer/customer.module';
import { PackageModule } from './package/package.module';
import { HomeJsonModule } from './home-json/home-json.module';
import { BookingModule } from './booking/booking.module';
import { TransactionModule } from './transaction/transaction.module';
import { StaticPageModule } from './static-page/static-page.module';
import { FaqModule } from './faq/faq.module';
import { OmiseModule } from './payment/omise/omise.module';
import { StripeModule } from './payment/stripe/stripe.module';
import { FileModule } from './file/file.module';
import { CacheManagerModule } from './cache-manager/cache-manager.module';

const appConfig = config.get('app');

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    ThrottlerModule.forRootAsync({
      useFactory: () => throttleConfig
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ormConfig
    }),
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: appConfig.fallbackLanguage,
        parserOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: true
        }
      }),
      parser: I18nJsonParser,
      resolvers: [
        {
          use: QueryResolver,
          options: ['lang', 'locale', 'l']
        },
        new HeaderResolver(['x-custom-lang']),
        new CookieResolver(['lang', 'locale', 'l'])
      ]
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*']
    }),
    AuthModule,
    RolesModule,
    PermissionsModule,
    MailModule,
    EmailTemplateModule,
    RefreshTokenModule,
    TwofaModule,
    DashboardModule,
    CountryModule,
    ProviderModule,
    BannerModule,
    PackageModule,
    MenuModule,
    CategoryModule,
    SpecialistModule,
    ServiceModule,
    ScheduleModule,
    CustomerModule,
    HomeJsonModule,
    BookingModule,
    TransactionModule,
    StaticPageModule,
    FaqModule,
    OmiseModule.register({
      publicKey: process.env.OMISE_PUBLIC_KEY,
      secretKey: process.env.OMISE_SECRET_KEY
    }),
    StripeModule.register(process.env.STRIPE_SECRET_KEY),
    FileModule,
    CacheManagerModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: (options: ValidationPipeOptions) => {
        return new CustomValidationPipe(options);
      },
      inject: ['options']
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard
    },
    {
      provide: APP_FILTER,
      useClass: I18nExceptionFilterPipe
    },
    {
      provide: 'options',
      useValue: {
        transform: true
      }
    }
  ],
  controllers: [AppController]
})
export class AppModule {}
