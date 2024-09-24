import {
  Controller,
  Get,
  Post,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { EventosService } from "./eventos.service";

@Controller("eventos")
export class EventController {
  constructor(private readonly eventosService: EventosService) {}

  @Get("/")
  async consulta() {
    return this.eventosService.consultaEventosHoje();
  }

  @Post("atualizar")
  async atualizarLista() {
    this.eventosService.listar();
    const msg = "Ok, atualização enviada, aguarde 25 min";
    return msg;
  }
}
