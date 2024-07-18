import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProdutoRepository } from './produto.repository';

@Controller('/produtos')
export class ProdutoController {
  // eslint-disable-next-line prettier/prettier

  constructor(private ProdutoRepository: ProdutoRepository) {}
  @Post()
  async criaUsuario(@Body() dadosDoUsuario) {
    this.ProdutoRepository.salvar(dadosDoUsuario);

    return 'cadastro concluido';
  }

  @Get()
  async listUsuarios() {
    return this.ProdutoRepository.listar();
  }
}
