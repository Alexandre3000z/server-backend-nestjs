import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { CalendarioModule } from "./calendario/calendario.module";
import { EventosModule } from "./eventos/eventos.module";

@Module({
  imports: [EventosModule, CalendarioModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
