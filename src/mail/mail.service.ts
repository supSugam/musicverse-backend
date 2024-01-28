import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendOtpDto } from './dto/send-otp.dto';
import * as pug from 'pug';
import * as path from 'path';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VerifyOtpDto } from './dto/verify-otp.dto';
// import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class MailService {
  private readonly SENDER_EMAIL: string;
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerMain: MailerService
    // private readonly prismaservice: PrismaService
  ) {
    this.SENDER_EMAIL = this.configService.get<string>('SENDER_EMAIL');
    this.logger.log(`Sender email: ${this.SENDER_EMAIL}`);
  }

  _bodytemplate(template: string, data: any) {
    return pug.renderFile(template, data);
  }

  // OTP related
  private ACTIVE_OTPs = new Map<string, { otp: string; timestamp: number }>();

  generateOtp(email: string): string {
    const otp = this.generateRandomOtp();
    const timestamp = Date.now();
    this.ACTIVE_OTPs.set(email, { otp, timestamp });
    return otp;
  }

  getOtp(email: string): string | undefined {
    const entry = this.ACTIVE_OTPs.get(email);
    return entry?.otp;
  }

  deleteOtp(email: string): void {
    this.ACTIVE_OTPs.delete(email);
  }

  // @Cron(CronExpression.EVERY_10_SECONDS)
  // cleanExpiredOtps(): void {
  //   // get all unverified users that are isVerified false and createdAt is greater than 24 hours
  //   const allUnverifiedUsers = this.prismaservice.user.findMany({
  //     where: {
  //       isVerified: false,
  //       createdAt: {
  //         gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  //       },
  //     },
  //   });
  // }

  // delete user if user is not verified within 24 hours
  @Cron(CronExpression.EVERY_10_SECONDS)
  removeUnverifiedUsers(): void {}

  generateRandomOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendResendOtp(sendOtpDto: SendOtpDto) {
    const { email, name, subject, text } = sendOtpDto;
    const data = {
      subject,
      text,
    } satisfies ISendMailOptions;

    const templateFile = path.join(
      process.cwd(),
      '/templates/otp-verification.pug'
    );

    // Check if OTP exists in the map
    if (this.ACTIVE_OTPs.has(email)) {
      this.deleteOtp(email);
    }
    this.generateOtp(email);

    const render = this._bodytemplate(templateFile, {
      name,
      otp: this.getOtp(email).split(''),
      title: subject,
    });

    const OTP_SENT = await this._processSendEmail({
      ...data,
      to: email,
      from: this.SENDER_EMAIL,
      html: render,
    });
    if (OTP_SENT) {
      return { message: 'OTP sent successfully.' };
    } else {
      return { message: 'Failed to send OTP.' };
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<boolean> {
    if (this.getOtp(verifyOtpDto.email) === verifyOtpDto.otp.toString()) {
      this.deleteOtp(verifyOtpDto.email);
      return true;
    }
    return false;
  }

  async _processSendEmail(body: Partial<ISendMailOptions>): Promise<boolean> {
    try {
      await this.mailerMain.sendMail(body);
      return true;
    } catch (error) {
      throw new InternalServerErrorException('Error sending email.');
    }
  }
}
