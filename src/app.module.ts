import { Module } from '@nestjs/common';
import { UsuarioModule } from './usuario/usuario.module';
import { ProdutoModule } from './produto/produto.module';
import { DatabaseModule } from './database/database.module';
import { CalendarioModule } from './calendario/calendario.module';
import { EventosModule } from './eventos/eventos.module';

@Module({
  imports: [
    EventosModule,
    CalendarioModule,
    DatabaseModule,
    UsuarioModule,
    ProdutoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
