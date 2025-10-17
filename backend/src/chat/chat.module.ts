import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';

import { ChatController } from './chat.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [AuthModule, UserModule, MessageModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
