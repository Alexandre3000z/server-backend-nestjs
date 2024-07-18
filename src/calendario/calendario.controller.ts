import { Controller, Get } from '@nestjs/common';
import { CalendarioService } from './calendario.service';

@Controller('calendario')
export class CalendarioController {
  constructor(private readonly calendarioService: CalendarioService) {}

  @Get('/')
  async getEventosOrganizados() {
    return this.calendarioService.getEventosOrganizados();
  }

  @Get('proximo-aniversario')
  async getProximoAniversario() {
    return this.calendarioService.getProximoAniversario();
  }
}
