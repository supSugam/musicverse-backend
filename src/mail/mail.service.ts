import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MailService {
  private readonly SENDER_EMAIL: string;
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly configService: ConfigService) {
    this.SENDER_EMAIL = this.configService.get<string>('SENDER_EMAIL');
    this.logger.log(`Sender email: ${this.SENDER_EMAIL}`);
  }

  //   async sendMail(
  //     to: string,
  //     subject: string,
  //     html: string
  //   ): Promise<[SendGrid.ClientResponse, {}]> {
  //     const msg = {
  //       to,
  //       from: this.SENDER_EMAIL,
  //       subject,
  //       html,
  //     };
  //     const clientResponse = await SendGrid.send(msg);
  //     this.logger.log(`Email sent to ${to} with subject ${subject}`);
  //     return clientResponse;
  //   }
}
