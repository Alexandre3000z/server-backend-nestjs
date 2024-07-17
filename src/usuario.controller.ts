import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsuarioRepository } from './usuario.repository';

@Controller('/usuarios')
export class UsuarioController {
  // eslint-disable-next-line prettier/prettier

  private usuarioRepository = new UsuarioRepository();

  @Post()
  async criaUsuario(@Body() dadosDoUsuario) {
    this.usuarioRepository.salvar(dadosDoUsuario);

    return 'cadastro concluido';
  }

  @Get()
  async listUsuarios() {
    return this.usuarioRepository.listar();
  }
}
