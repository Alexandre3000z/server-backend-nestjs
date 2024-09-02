import { Module } from '@nestjs/common';
import { EventosService } from './eventos.service';
import { EventController } from './eventos.controller';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';

@Module({
  imports: [DatabaseModule],
  providers: [EventosService, DatabaseService],
  controllers: [EventController],
})
export class EventosModule {}
