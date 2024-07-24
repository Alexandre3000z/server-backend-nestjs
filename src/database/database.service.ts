import { Injectable } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class DatabaseService {
  private client: Client;

  constructor() {
    this.client = new Client({
      user: 'postgres',
      host: '192.168.25.83',
      database: 'db.pessoaJuridica',
      password: 'office',
      port: 5432,
    });

    this.client
      .connect()
      .then(() => console.log('Conectado ao banco de dados'))
      .catch((err) =>
        console.error('Erro ao conectar ao banco de dados:', err),
      );
  }

  async consultarDados(): Promise<any[]> {
    try {
      const res = await this.client.query('SELECT * FROM empresas');
      return res.rows;
    } catch (err) {
      console.error('Erro ao consultar os dados:', err);
      throw err;
    }
  }
  async upsertEmpresa(data) {
    try {
      // Inicia uma transação
      await this.client.query('BEGIN');

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
          UPDATE eventos
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
            INSERT INTO eventos (cnpj, nome, compras, despesas, faturamento, impostos, key, sobra379, sobra380, valor379, valor380)
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
      await this.client.query('COMMIT');
    } catch (error) {
      // Reverte a transação em caso de erro
      await this.client.query('ROLLBACK');
      console.error('Erro ao atualizar ou inserir dados:', error);
    }
  }
  async consultarDadosEventos(): Promise<any[]> {
    try {
      const res = await this.client.query('SELECT * FROM eventos');
      return res.rows;
    } catch (err) {
      console.error('Erro ao consultar os dados:', err);
      throw err;
    }
  }
}
