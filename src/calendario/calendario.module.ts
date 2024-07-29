import { Module } from '@nestjs/common';
import { CalendarioService } from './calendario.service';
import { CalendarioController } from './calendario.controller';
import { DatabaseModule } from '../database/database.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [DatabaseModule, ScheduleModule.forRoot()],
  providers: [CalendarioService],
  controllers: [CalendarioController],
})
export class CalendarioModule {}
