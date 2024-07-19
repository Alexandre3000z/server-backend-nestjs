import { Module } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { EventController } from './eventos.controller';

@Module({
  imports: [],
  providers: [EventosService],
  controllers: [EventController],
})
export class EventosModule {}
