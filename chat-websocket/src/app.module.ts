import { Module } from '@nestjs/common';
import { ChatSocketModule } from './chat-socket/chat-socket.module';

@Module({
  imports: [ChatSocketModule],
})
export class AppModule {}
