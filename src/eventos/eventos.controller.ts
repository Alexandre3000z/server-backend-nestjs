import { Controller, Get, Post } from '@nestjs/common';
import { EventosService } from './eventos.service';

@Controller('eventos')
export class EventController {
  constructor(private readonly eventosService: EventosService) {}

  @Get('/')
  async teste() {
    this.eventosService.teste;
    return this.eventosService.teste();
  }

  @Post('atualizar')
  async atualizarLista() {
    this.eventosService.listar();
    const msg = 'Ok, atualização enviada, aguarde 25 min';
    return msg;
  }
}
