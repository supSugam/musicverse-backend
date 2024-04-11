import { Injectable } from '@nestjs/common';
import * as os from 'os';
@Injectable()
export class AppService {
  async getLocalIpAddress(): Promise<string> {
    const ifaces = os.networkInterfaces();
    let ipAddress;
    // Loop through all network interfaces
    Object.keys(ifaces).forEach((ifname) => {
      ifaces[ifname].forEach((iface) => {
        // Check if the interface is IPv4 and not internal
        if (iface.family === 'IPv4' && !iface.internal) {
          ipAddress = iface.address;
        }
      });
    });

    return ipAddress;
  }
}
