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

  @Get("/consulta")
  async consultaMes(@Query("mes") mes: string) {
    // Verifica se o parâmetro 'mes' foi fornecido
    if (!mes) {
      throw new HttpException(
        'O parâmetro "mes" é obrigatório.',
        HttpStatus.BAD_REQUEST
      );
    }

    // Chama o serviço para consultar os eventos pelo mês fornecido
    const resultado = await this.eventosService.consultarPorData(mes);

    // Se não encontrar resultados, lança uma exceção
    if (!resultado || resultado.length === 0) {
      throw new HttpException(
        "Nenhum evento encontrado para o mês fornecido.",
        HttpStatus.NOT_FOUND
      );
    }

    // Retorna o resultado se tudo estiver correto
    return resultado;
  }

  @Post("atualizar")
  async atualizarLista() {
    this.eventosService.listar();
    const msg = "Ok, atualização enviada, aguarde 25 min";
    return msg;
  }
}
