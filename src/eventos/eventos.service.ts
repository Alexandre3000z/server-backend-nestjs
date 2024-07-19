import { Injectable } from '@nestjs/common';

@Injectable()
export class EventosService {
  private eventValues: any;

  faturamentoEmpresa = async (key) => {
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

      // Verifica se 'dados' existe na resposta antes de acessar 'dados.data'
      if (!data.dados || !data.dados.data) {
        throw new Error('Formato de resposta inválido: dados não encontrados');
      }

      return data.dados.data;
    } catch (error) {
      console.error('Erro na requisição de faturamento:', error.message);
      throw error; // Lança o erro para ser tratado no código que chama faturamentoEmpresa
    }
  };

  impostosEmpresa = async (key) => {
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
      console.error('Erro na função impostosEmpresa:', error);
      throw error; // Lança o erro novamente para quem chamou a função lidar com ele
    }
  };
  listarEmpresas = async () => {
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
  };

  delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  listar = async () => {
    try {
      const listaDasEmpresas = await this.listarEmpresas();
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
          somaImpostos = 0;

        if (key != null) {
          const modificarImposto = await this.impostosEmpresa(key);
          if (modificarImposto.length == 0) {
            impostos = 'Sem informações';
          } else {
            for (let i = 0; i < modificarImposto.length; i++) {
              impostos = parseFloat(modificarImposto[i].arecolher);
              if (!isNaN(impostos)) {
                // Verifica se a conversão foi bem-sucedida
                somaImpostos += impostos;
                somaImpostos = Math.round(somaImpostos * 100) / 100; // Arredonda para 2 casas decimais
              }
            }
          }
          const modificar = await this.faturamentoEmpresa(key);
          if (modificar.length == 0) {
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

        cont = cont + 1;
        console.log(faturar);
        console.log(comprar);
        console.log(despesas);
        console.log(somaImpostos);
        console.log(cont);

        separacaoEmpresas.push({
          nome: nome,
          cnpj: cnpj,
          key: key,
          faturamento: faturar,
          compras: comprar,
          despesas: despesas,

          impostos: somaImpostos,
        });

        // Adiciona um intervalo de 1 segundo (1000 ms) entre as requisições
        await this.delay(1600);
      }

      console.log(separacaoEmpresas);
      this.eventValues = separacaoEmpresas;
    } catch (error) {
      console.error('Erro ao listar empresas:', error.message);
    }
  };

  teste = async () => {
    return this.eventValues;
  };
}
