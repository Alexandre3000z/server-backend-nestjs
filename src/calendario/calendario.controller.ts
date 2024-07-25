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
  @Get('aniversario-hoje')
  async aniversario() {
    return this.calendarioService.getAniversarioHoje();
  }
  @Get('socios')
  async socios() {
    return this.calendarioService.getSociosOrganizados();
  }
  @Get('aniversario-socios')
  async aniversarioSocios() {
    return this.calendarioService.getAniversarioSociosHoje();
  }
}
