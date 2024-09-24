import { Injectable } from "@nestjs/common";
import { Client } from "pg";
import { format, getYear, subMonths, addYears, subYears } from "date-fns";
@Injectable()
export class DatabaseService {
  private client: Client;

  constructor() {
    this.client = new Client({
      user: "postgres",
      host: "192.168.25.83",
      database: "db.pessoaJuridica",
      password: "office",
      port: 5432,
    });

    this.client
      .connect()
      .then(() => console.log("Conectado ao banco de dados"))
      .catch((err) =>
        console.error("Erro ao conectar ao banco de dados:", err)
      );
  }

  async consultarDados(): Promise<any[]> {
    try {
      const res = await this.client.query("SELECT * FROM empresas");
      return res.rows;
    } catch (err) {
      console.error("Erro ao consultar os dados:", err);
      throw err;
    }
  }

  async consultarDadosSocios(): Promise<any[]> {
    try {
      const res = await this.client.query("SELECT * FROM socios");
      return res.rows;
    } catch (err) {
      console.error("Erro ao consultar os dados:", err);
      throw err;
    }
  }

  async upsertEmpresa(data) {
    try {
      // Inicia uma transação
      await this.client.query("BEGIN");

      // Data atual
      const hoje = new Date();

      // Nome do mês atual e ano atual
      const anoAtual = getYear(hoje);

      // Data do mês passado
      const umMesAtras = subMonths(hoje, 1);

      // Nome do mês passado
      const nomeDoMesPassado = format(umMesAtras, "MMMM");

      // Data do ano passado
      const mesmaDataNoAnopassado = subYears(hoje, 1);
      const AnoPassado = format(mesmaDataNoAnopassado, "yyyy");

      // Nome da tabela, usando o ano passado se o mês for dezembro
      const nomeDaTabela =
        nomeDoMesPassado === "December"
          ? `${nomeDoMesPassado}${AnoPassado}`
          : `${nomeDoMesPassado}${anoAtual}`;

      const criarMes = `
      CREATE TABLE IF NOT EXISTS ${nomeDaTabela} (
        id SERIAL PRIMARY KEY,
        cnpj VARCHAR(255),
        nome VARCHAR(255),
        compras VARCHAR(255),
        despesas VARCHAR(255),
        faturamento VARCHAR(255),
        impostos VARCHAR(255),
        key VARCHAR(255),
        sobra379 VARCHAR(255),
        sobra380 VARCHAR(255),
        valor379 VARCHAR(255),
        valor380 VARCHAR(255)
      );
    `;

      await this.client.query(criarMes);
      await this.client.query("COMMIT");

      // Percorre cada objeto na array de dados
      for (const empresa of data) {
        const {
          cnpj,
          nome,
          compras,
          despesas,
          faturamento,
          impostos,
          key,
          sobra379,
          sobra380,
          valor379,
          valor380,
        } = empresa;

        // Tenta atualizar o registro se ele já existe
        const updateQuery = `
          UPDATE ${nomeDaTabela}
          SET nome = $2, compras = $3, despesas = $4, faturamento = $5, impostos = $6, key = $7, 
              sobra379 = $8, sobra380 = $9, valor379 = $10, valor380 = $11
          WHERE cnpj = $1
          RETURNING cnpj
        `;

        const updateResult = await this.client.query(updateQuery, [
          cnpj,
          nome,
          compras,
          despesas,
          faturamento,
          impostos,
          key,
          sobra379,
          sobra380,
          valor379,
          valor380,
        ]);

        // Se o registro não foi atualizado (não existe), insere um novo
        if (updateResult.rowCount === 0) {
          const insertQuery = `
            INSERT INTO ${nomeDaTabela} (cnpj, nome, compras, despesas, faturamento, impostos, key, sobra379, sobra380, valor379, valor380)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `;

          await this.client.query(insertQuery, [
            cnpj,
            nome,
            compras,
            despesas,
            faturamento,
            impostos,
            key,
            sobra379,
            sobra380,
            valor379,
            valor380,
          ]);
        }
      }

      // Comita a transação
      await this.client.query("COMMIT");
    } catch (error) {
      // Reverte a transação em caso de erro
      await this.client.query("ROLLBACK");
      console.error("Erro ao atualizar ou inserir dados:", error);
    }
  }

  ///////////////////////////////////////////////////////////////////////

  async upsertSocio(data) {
    try {
      // Inicia uma transação
      await this.client.query("BEGIN");

      // Percorre cada objeto na array de dados
      for (const socio of data) {
        const { nome, dataAniversario, empresa, cnpj } = socio;

        // Tenta atualizar o registro se ele já existe
        const updateQuery = `
          UPDATE socios
          SET nome_socio = $1, data_nascimento = $2, empresa = $3
          WHERE cnpj = $4
          RETURNING cnpj
        `;

        const updateResult = await this.client.query(updateQuery, [
          nome,
          dataAniversario,
          empresa,
          cnpj,
        ]);

        // Se o registro não foi atualizado (não existe), insere um novo
        if (updateResult.rowCount === 0) {
          const insertQuery = `
            INSERT INTO socios (nome_socio, data_nascimento, empresa, cnpj)
            VALUES ($1, $2, $3, $4)
          `;

          await this.client.query(insertQuery, [
            nome,
            dataAniversario,
            empresa,
            cnpj,
          ]);
        }
      }

      // Comita a transação
      await this.client.query("COMMIT");
    } catch (error) {
      // Reverte a transação em caso de erro
      await this.client.query("ROLLBACK");
      console.error("Erro ao atualizar ou inserir dados:", error);
    }
  }

  async consultarDadosEventos(): Promise<any[]> {
    try {
     
      const res = await this.client.query(`SELECT * FROM eventos`);
      return res.rows;
    } catch (err) {
      console.error("Erro ao consultar os dados:", err);
      throw err;
    }
  }

  
}
