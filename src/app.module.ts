import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { GenreModule } from './genre/genre.module';
import { RolesGuard } from './guards/roles.guard';
import { PaginationModule } from './pagination/pagination.module';
import { ProfileModule } from './profile/profile.module';
@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    MailModule,
    PaginationModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // use my own gmail
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: process.env.MAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_USER, // generated ethereal user
          pass: process.env.MAIL_PASS, // generated ethereal password
        },
      },
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    GenreModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
