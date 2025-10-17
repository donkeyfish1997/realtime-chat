import { Module } from '@nestjs/common';
import { ChatSocketService } from './chat-socket.service';
import { ChatSocketController } from './chat-socket.controller';
import { ChatSocketGetway } from './chat-socket.getway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ChatSocketService, ChatSocketGetway],
  controllers: [ChatSocketController],
})
export class ChatSocketModule {}
