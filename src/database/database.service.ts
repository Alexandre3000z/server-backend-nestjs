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

  async disconnect() {
    await this.client.end();
    console.log('Conexão encerrada.');
  }
}
