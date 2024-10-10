import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as schedule from "node-schedule";
import { getMonth, getYear, subMonths } from "date-fns";
import { DatabaseService } from "../database/database.service";

// Pegar a data atual
const currentDate = new Date();

// Pegar o mês atual
const currentMonth = getMonth(currentDate) + 1;

// Pegar a data do mês anterior
const previousDate = subMonths(currentDate, 1);

// Pegar o mês anterior
const previousMonth = getMonth(previousDate) + 1;

// Pegar o ano atual
const currentYear = getYear(previousDate);
@Injectable()
export class EventosService implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}
  private readonly logger = new Logger(EventosService.name);
  private eventValues: any;

  async onModuleInit() {
    this.logger.log("Inicialização do sistema completada com sucesso.");

    // Agenda a tarefa diária
    this.scheduleDailyTask();
  }

  private scheduleDailyTask() {
    // Define o horário para a execução da tarefa (22:00 todos os dias)
    schedule.scheduleJob("0 22 * * *", async () => {
      try {
        await this.listar();
        this.logger.log(
          "Atualização dos eventos 379 e 380 executada com sucesso às 22:00"
        );
      } catch (error) {
        this.logger.error("Erro ao executar tarefa diária:", error.message);
      }
    });
  }

  faturamentoEmpresa = async (key: string) => {
    const compInicial = `${currentYear}-01-01`;
    const compFinal = `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`;

    const response = await fetch(
      "https://app.e-kontroll.com.br/api/v1/metodo/faturamento",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key:
            "p2zazIRGQ9mwizXKkmVRBasVVW234DLdKkIpu53Rw8eh6zFpBOLolUWBCZmz",
          api_key_cliente: key,
          comp_inicial: compInicial,
          comp_final: compFinal,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Erro ao tentar obter faturamento: " + response.statusText
      );
    }

    const data = await response.json();
    if (!data.dados || !data.dados.data) {
      throw new Error("Formato de resposta inválido: dados não encontrados");
    }

    const campos = [
      "faturamento",
      "venda",
      "revenda",
      "servico",
      "compras",
      "compras_imob",
      "compras_mp",
      "compras_uso",
      "compras_rev",
      "compras_serv",
    ];

    const resultados = campos.reduce((acc, campo) => {
      acc[campo] = data.dados.data.reduce((total, item) => {
        const valor = parseFloat(item[campo]);
        if (isNaN(valor)) {
          console.warn(`Valor inválido encontrado: ${item[campo]}`);

          return total;
        }
        return Math.round(total + valor);
      }, 0);
      return acc;
    }, {});

    const listalegal = [];
    listalegal.push(resultados);
    return listalegal;
  };
  impostosEmpresa = async (key: string) => {
    const compInicial = `${currentYear}-01-01`;
    const compFinal = `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`;
    try {
      const response = await fetch(
        "https://app.e-kontroll.com.br/api/v1/metodo/impostos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key:
              "p2zazIRGQ9mwizXKkmVRBasVVW234DLdKkIpu53Rw8eh6zFpBOLolUWBCZmz",
            api_key_cliente: key,
            comp_inicial: compInicial,
            comp_final: compFinal,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar os dados: " + response.status);
      }

      const data = await response.json();

      const campos = ["arecolher"];
      const resultados = campos.reduce((acc, campo) => {
        acc[campo] = data.dados.data.reduce((total, item) => {
          const valor = parseFloat(item[campo]);
          if (isNaN(valor)) {
            console.warn(`Valor inválido encontrado: ${item[campo]}`);

            return total;
          }
          return Math.round(total + valor);
        }, 0);
        return acc;
      }, {});

      const listalegal = [];
      listalegal.push(resultados);
      return listalegal;
    } catch (error) {
      this.logger.error("Erro na função impostosEmpresa:", error.message);
      throw error;
    }
  };

  listarEmpresas = async () => {
    try {
      const response = await fetch(
        "https://app.e-kontroll.com.br/api/v1/metodo/listar_empresas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key:
              "p2zazIRGQ9mwizXKkmVRBasVVW234DLdKkIpu53Rw8eh6zFpBOLolUWBCZmz",
            api_key_empresa:
              "yQuZX1A45FYa7gohZvmlHHDsUPvjLnGCTxuXMdae4W8T5x05hgWEvQgtUmxf",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const data = await response.json();
      const Dados = data.dados.data;

      const empresasAtivas = Dados.filter(
        (item: any) => item.status_empresa === "A"
      );
      return empresasAtivas;
    } catch (error) {
      this.logger.error("Erro ao listar empresas:", error.message);
      throw error;
    }
  };
  listarEmpresasEventos = async () => {
    try {
      const response = await fetch(
        "https://app.e-kontroll.com.br/api/v1/metodo/listar_empresas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key:
              "p2zazIRGQ9mwizXKkmVRBasVVW234DLdKkIpu53Rw8eh6zFpBOLolUWBCZmz",
            api_key_empresa:
              "yQuZX1A45FYa7gohZvmlHHDsUPvjLnGCTxuXMdae4W8T5x05hgWEvQgtUmxf",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const data = await response.json();
      const Dados = data.dados.data;

      const empresasAtivas = Dados.filter(
        (item: any) =>
          item.status_empresa === "A" &&
          item.regime_tributario == "SIMPLES NACIONAL"
      );
      return empresasAtivas;
    } catch (error) {
      this.logger.error("Erro ao listar empresas:", error.message);
      throw error;
    }
  };

  delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  calcula379 = async (faturamento, comprasUso, impostosRecolher) => {
    // Calcula 20% do faturamento
    const limite = 0.2 * faturamento;
    // Calcula a soma de comprasUso e impostosRecolher
    const totalComprasImpostos = comprasUso + impostosRecolher;

    // Calcula o percentual de quanto foi gasto em relação ao limite
    const percentual = (totalComprasImpostos / limite) * 100;
    const faltando = limite - totalComprasImpostos;

    return { porcentagem: percentual, resto: faltando };
  };

  calcula380 = async (compras, comprasUso, faturamento) => {
    // Calcula 80% do faturamento
    const limite = 0.8 * faturamento;
    // Calcula a soma de compras e o uso
    const totalComprasUso = compras - comprasUso;

    // Calcula o percentual de quanto foi gasto em relação ao limite
    const percentual = (totalComprasUso / limite) * 100;
    const faltando = limite - totalComprasUso;

    return { porcentagem: percentual, resto: faltando };
  };

  listar = async () => {
    try {
      const listaDasEmpresas = await this.listarEmpresasEventos();
      let cont = 0;
      const separacaoEmpresas = [];
      for (const empresa of listaDasEmpresas) {
        const nome = empresa.razao_social;
        const cnpj = empresa.inscricao_federal;
        const key = empresa.api_key_cliente;

        let faturar,
          comprar,
          despesas,
          impostos,
          evento379,
          calculo379,
          evento380,
          calculo380,
          resto380,
          calculo380Rest,
          calculo380Porcent,
          resto379,
          calculo379Rest,
          calculo379Porcent;
        let somaImpostos = 0;

        if (key) {
          const modificarImposto = await this.impostosEmpresa(key);
          if (modificarImposto.length === 0) {
            impostos = "Sem informações";
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
            faturar = "Sem informações";
            comprar = "Sem informações";
            despesas = "Sem informações";
          } else {
            faturar = parseFloat(modificar[0].faturamento);
            comprar = parseFloat(modificar[0].compras);
            despesas = parseFloat(modificar[0].compras_uso);
            calculo379 = await this.calcula379(faturar, despesas, somaImpostos);
            calculo379Porcent = calculo379.porcentagem;
            calculo379Rest = calculo379.resto;
            evento379 = calculo379Porcent.toFixed(2);
            resto379 = calculo379Rest.toFixed(2);
            calculo380 = await this.calcula380(comprar, despesas, faturar);
            calculo380Porcent = calculo380.porcentagem;
            calculo380Rest = calculo380.resto;
            evento380 = calculo380Porcent.toFixed(2);
            resto380 = calculo380Rest.toFixed(2);
          }
        } else {
          faturar = "API Key desativada";
          comprar = "API Key desativada";
          despesas = "API Key desativada";
          impostos = "API key desativada";
        }

        cont++;
        this.logger.log(`Nome: ${nome}`);
        this.logger.log(`Faturamento: ${faturar}`);
        this.logger.log(`Compras: ${comprar}`);
        this.logger.log(`Despesas: ${despesas}`);
        this.logger.log(`Soma dos impostos: ${somaImpostos}`);
        this.logger.log(`Evento379: ${evento379}, Faltando:${resto379}`);
        this.logger.log(`Evento380: ${evento380}, Faltando:${resto380}`);
        this.logger.log(`Adicionadas: ${cont}`);

        separacaoEmpresas.push({
          cnpj: cnpj,
          nome: nome,
          compras: comprar,
          despesas: despesas,
          faturamento: faturar,
          impostos: somaImpostos,
          key: key,
          sobra379: resto379,
          sobra380: resto380,
          valor379: evento379,
          valor380: evento380,
        });
        await this.delay(1600);
      }

      this.logger.log(
        `Total de ${separacaoEmpresas.length} empresas atualizadas com sucesso!`
      );
      function parseValue(value) {
        if (
          value === "sem informações" ||
          value === undefined ||
          value === Infinity ||
          Number.isNaN(parseFloat(value))
        ) {
          return -Infinity; // Tratar como valor inexistente ou inválido
        }
        return parseFloat(value);
      }
      // Função de comparação para o sort
      const organizando = separacaoEmpresas.sort((a, b) => {
        // Calcular o máximo entre valor379 e valor380 para cada item
        const maxA =
          a.valor379 !== undefined || a.valor380 !== undefined
            ? Math.max(parseValue(a.valor379), parseValue(a.valor380))
            : -Infinity;
        const maxB =
          b.valor379 !== undefined || b.valor380 !== undefined
            ? Math.max(parseValue(b.valor379), parseValue(b.valor380))
            : -Infinity;

        // Tratar casos específicos de Infinity e NaN
        if (maxA === -Infinity && maxB !== -Infinity) return 1;
        if (maxB === -Infinity && maxA !== -Infinity) return -1;

        // Tratar casos específicos de Infinity
        if (maxA === Infinity) return 1;
        if (maxB === Infinity) return -1;

        // Ordem decrescente
        return maxB - maxA;
      });
      await this.databaseService.upsertEmpresa(organizando);
      this.eventValues = organizando;
    } catch (error) {
      this.logger.error("Erro ao listar empresas:", error.message);
    }
  };

  consultaEventosHoje = async () => {
    const consulta = await this.databaseService.consultarDadosEventos();
    return consulta;
  };
}
