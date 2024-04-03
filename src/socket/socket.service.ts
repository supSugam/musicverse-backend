import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {
  private readonly connectedClients: Map<string, Socket> = new Map<
    string,
    Socket
  >();

  handleConnection(socket: Socket): void {
    const clientId = socket.id;
    this.connectedClients.set(clientId, socket);

    socket.on('disconnect', () => {
      this.connectedClients.delete(clientId);
    });
  }

  handleMessage(client: Socket, payload: string): void {
    // Implement message handling logic

    // Send a message to the client

    console.log(client.client.request.headers.cookie);

    client.emit('notification', payload);
  }
}
