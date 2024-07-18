import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { getYear, differenceInCalendarDays, parseISO } from 'date-fns';

@Injectable()
export class CalendarioService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getEventosOrganizados(): Promise<any[]> {
    const resultados = await this.databaseService.consultarDados();
    const dataAtual = new Date();

    const listaEventos = resultados.map((item) => {
      const data = item.dataabertura;
      const dataMD = data ? data.slice(-5) : 'Data não disponível';
      const anoAtual = getYear(dataAtual);
      const dataCompleta = anoAtual + '-' + dataMD;
      const nome = item.razaosocial;

      return {
        title: nome,
        date: dataCompleta,
        color: 'orange',
      };
    });

    return listaEventos.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }

  async getProximoAniversario(): Promise<any> {
    const listaEventosOrganizada = await this.getEventosOrganizados();
    const dataAtual = new Date();

    const proximosAniversarios = listaEventosOrganizada.map((evento) => {
      const aniversarioEsteAno = parseISO(evento.date);
      if (aniversarioEsteAno < dataAtual) {
        aniversarioEsteAno.setFullYear(aniversarioEsteAno.getFullYear() + 1);
      }

      const diasParaAniversario = differenceInCalendarDays(
        aniversarioEsteAno,
        dataAtual,
      );

      return {
        ...evento,
        diasParaAniversario,
      };
    });

    proximosAniversarios.sort(
      (a, b) => a.diasParaAniversario - b.diasParaAniversario,
    );

    return proximosAniversarios[0];
  }
}
