import { Module } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { EventController } from './eventos.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [EventosService],
  controllers: [EventController],
})
export class EventosModule {}
