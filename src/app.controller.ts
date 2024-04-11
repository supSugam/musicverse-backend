import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('ip')
  async getIpV4() {
    return await this.appService.getLocalIpAddress();
  }
}
