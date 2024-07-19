import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as schedule from 'node-schedule';

@Injectable()
export class EventosService implements OnModuleInit {
  private readonly logger = new Logger(EventosService.name);
  private eventValues: any;

  async onModuleInit() {
    this.scheduleDailyTask();
  }

  private scheduleDailyTask() {
    // Define o horário para a execução da tarefa (22:00 todos os dias)
    schedule.scheduleJob('0 22 * * *', async () => {
      try {
        await this.listar();
        this.logger.log(
          'Atualização dos eventos 379 e 380 executada com sucesso às 22:00',
        );
      } catch (error) {
        this.logger.error('Erro ao executar tarefa diária:', error.message);
      }
    });
  }

  faturamentoEmpresa = async (key: string) => {
    try {
      const response = await fetch(
        'https://app.e-kontroll.com.br/api/v1/metodo/faturamento',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key:
              'p2zazIRGQ9mwizXKkmVRBasVVW234DLdKkIpu53Rw8eh6zFpBOLolUWBCZmz',
            api_key_cliente: key,
            comp_inicial: '2024-05-01',
            comp_final: '2024-06-01',
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          'Erro ao tentar obter faturamento: ' + response.statusText,
        );
      }

      const data = await response.json();

      if (!data.dados || !data.dados.data) {
        throw new Error('Formato de resposta inválido: dados não encontrados');
      }

      return data.dados.data;
    } catch (error) {
      this.logger.error('Erro na requisição de faturamento:', error.message);
      throw error;
    }
  };

  impostosEmpresa = async (key: string) => {
    try {
      const response = await fetch(
        'https://app.e-kontroll.com.br/api/v1/metodo/impostos',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key:
              'p2zazIRGQ9mwizXKkmVRBasVVW234DLdKkIpu53Rw8eh6zFpBOLolUWBCZmz',
            api_key_cliente: key,
            comp_inicial: '2024-05-01',
            comp_final: '2024-07-01',
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar os dados: ' + response.status);
      }

      const data = await response.json();
      return data.dados.data;
    } catch (error) {
      this.logger.error('Erro na função impostosEmpresa:', error.message);
      throw error;
    }
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

  delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  listar = async () => {
    try {
      const listaDasEmpresas = await this.listarEmpresas();
      let cont = 0;
      const separacaoEmpresas = [];
      for (const empresa of listaDasEmpresas) {
        const nome = empresa.razao_social;
        const cnpj = empresa.inscricao_federal;
        const key = empresa.api_key_cliente;

        let faturar, comprar, despesas, impostos;
        let somaImpostos = 0;

        if (key) {
          const modificarImposto = await this.impostosEmpresa(key);
          if (modificarImposto.length === 0) {
            impostos = 'Sem informações';
          } else {
            for (const imposto of modificarImposto) {
              impostos = parseFloat(imposto.arecolher);
              if (!isNaN(impostos)) {
                somaImpostos += impostos;
                somaImpostos = Math.round(somaImpostos * 100) / 100;
              }
            }
          }
          const modificar = await this.faturamentoEmpresa(key);
          if (modificar.length === 0) {
            faturar = 'Sem informações';
            comprar = 'Sem informações';
            despesas = 'Sem informações';
          } else {
            faturar = modificar[0].faturamento;
            comprar = modificar[0].compras;
            despesas = modificar[0].compras_uso;
          }
        } else {
          faturar = 'API Key desativada';
          comprar = 'API Key desativada';
          despesas = 'API Key desativada';
          impostos = 'API key desativada';
        }

        cont++;
        this.logger.log(`Faturamento: ${faturar}`);
        this.logger.log(`Compras: ${comprar}`);
        this.logger.log(`Despesas: ${despesas}`);
        this.logger.log(`Soma dos impostos: ${somaImpostos}`);
        this.logger.log(`Adicionadas: ${cont}`);

        separacaoEmpresas.push({
          nome: nome,
          cnpj: cnpj,
          key: key,
          faturamento: faturar,
          compras: comprar,
          despesas: despesas,
          impostos: somaImpostos,
        });

        await this.delay(1600);
      }

      this.logger.log(
        `Total de ${separacaoEmpresas.length} empresas atualizadas com sucesso!`,
      );
      this.eventValues = separacaoEmpresas;
    } catch (error) {
      this.logger.error('Erro ao listar empresas:', error.message);
    }
  };

  teste = async () => {
    return this.eventValues;
  };
}
