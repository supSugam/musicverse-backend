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
@Injectable()
export class MailService {
  private readonly SENDER_EMAIL: string;
  private readonly logger = new Logger(MailService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerMain: MailerService
  ) {
    this.SENDER_EMAIL = this.configService.get<string>('SENDER_EMAIL');
    this.logger.log(`Sender email: ${this.SENDER_EMAIL}`);
  }

  _bodytemplate(template: string, data: any) {
    return pug.renderFile(template, data);
  }

  async sendOtpAsMail(sendOtpDto: SendOtpDto) {
    const { email, otp, name, subject, text } = sendOtpDto;
    const data = {
      subject,
      text,
    } satisfies ISendMailOptions;

    const templateFile = path.join(
      process.cwd(),
      '/templates/otp-verification.pug'
    );
    const render = this._bodytemplate(templateFile, {
      name,
      otp: otp.toString().split(''),
      title: subject,
    });

    await this._processSendEmail({
      ...data,
      to: email,
      from: this.SENDER_EMAIL,
      html: render,
    });
  }

  async _processSendEmail(body: Partial<ISendMailOptions>): Promise<void> {
    await this.mailerMain
      .sendMail(body)
      .then(() => {
        this.logger.log(`Email sent to ${body.to}`);
      })
      .catch((e) => {
        this.logger.error(`Error sending email to ${body.to}`, e);
        throw new InternalServerErrorException('Error sending email');
      });
  }
}
