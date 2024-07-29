import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Cron } from '@nestjs/schedule'; // Importa o decorator Cron e o CronExpression

import {
  getYear,
  differenceInCalendarDays,
  parseISO,
  isSameDay,
} from 'date-fns';

@Injectable()
export class CalendarioService {
  constructor(private readonly databaseService: DatabaseService) {}
  private readonly logger = new Logger(CalendarioService.name);

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

  async getSociosOrganizados(): Promise<any[]> {
    const resultados = await this.databaseService.consultarDadosSocios();
    const dataAtual = new Date();

    const listaEventos = resultados.map((item) => {
      const data = item.data_nascimento;
      const dataMD = data ? data.slice(-5) : 'Data não disponível';
      const anoAtual = getYear(dataAtual);
      const dataCompleta = anoAtual + '-' + dataMD;
      const nome = item.nome_socio;
      const empresa = item.empresa;

      return {
        title: nome,
        empresa: empresa,
        date: dataCompleta,
        color: 'green',
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

  async getAniversarioHoje(): Promise<any> {
    const listaEventosOrganizada = await this.getEventosOrganizados();
    const dataAtual = new Date();

    const todayEvents = listaEventosOrganizada.filter((event) =>
      isSameDay(parseISO(event.date), dataAtual),
    );
    this.logger.log(todayEvents);

    return todayEvents;
  }
  async getAniversarioSociosHoje(): Promise<any> {
    const listaEventosOrganizada = await this.getSociosOrganizados();
    const dataAtual = new Date();

    const todayEvents = listaEventosOrganizada.filter((event) =>
      isSameDay(parseISO(event.date), dataAtual),
    );
    this.logger.log(todayEvents);

    return todayEvents;
  }
  listarSocios = async (api_key_cliente) => {
    const metodo = 'socios_aniversariantes';
    const url = `https://app.e-kontroll.com.br/api/v1/metodo/${metodo}`;

    try {
      const socioApi = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key:
            'p2zazIRGQ9mwizXKkmVRBasVVW234DLdKkIpu53Rw8eh6zFpBOLolUWBCZmz',
          api_key_cliente: api_key_cliente,
        }),
      });

      const data = await socioApi.json();

      if (data && data.dados && data.dados.data) {
        return data.dados.data;
      } else {
        console.error('Estrutura de resposta inesperada', data);
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar dados da API', error);
      throw error; // rethrow the error so it can be caught by the caller
    }
  };
  delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  listarEmpresas = async () => {
    try {
      const response = await fetch(
        'https://app.e-kontroll.com.br/api/v1/metodo/listar_empresas',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key:
              'p2zazIRGQ9mwizXKkmVRBasVVW234DLdKkIpu53Rw8eh6zFpBOLolUWBCZmz',
            api_key_empresa:
              'yQuZX1A45FYa7gohZvmlHHDsUPvjLnGCTxuXMdae4W8T5x05hgWEvQgtUmxf',
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const data = await response.json();
      return data.dados.data;
    } catch (error) {
      this.logger.error('Erro ao listar empresas:', error.message);
      throw error;
    }
  };

  @Cron('00 23 * * *') // Configura o cron job para 23:00 todos os dias
  async handleCron() {
    this.logger.log('Executando postAtualizarSocios às 23:00');
    await this.postAtualizarSocios();
  }

  async postAtualizarSocios(): Promise<any> {
    let contador = 0;
    const empresas = await this.listarEmpresas();
    const separacaoSocios = [];
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < empresas.length; i++) {
      const empresa = empresas[i]['razao_social'];
      const cnpj = empresas[i]['inscricao_federal'];
      const key = empresas[i]['api_key_cliente'];
      if (key) {
        try {
          const listaSocios = await this.listarSocios(key);

          if (listaSocios && listaSocios.length > 0) {
            for (let a = 0; a < listaSocios.length; a++) {
              const nome = listaSocios[a]['nome'];
              const dataAniversario = listaSocios[a]['data_nascimento'];
              separacaoSocios.push({
                nome,
                dataAniversario,
                empresa,
                cnpj,
              });
              contador++;
              console.log(`${contador} SOCIOS ATUALIZADOS`);

              // Adiciona um delay entre requisições para evitar sobrecarregar o servidor
              await delay(3000);
            }
          } else {
            console.log('API KEY INVALIDA');
          }
        } catch (error) {
          console.error(
            `Erro ao listar sócios para a empresa ${empresa}:`,
            error,
          );
        }
      }
    }

    console.log(`Total de sócios adicionados: ${contador}`);
    await this.databaseService.upsertSocio(separacaoSocios);
  }
}
