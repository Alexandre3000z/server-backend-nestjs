import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsuarioRepository } from './usuario.repository';
import { criaUsuarioDTO } from './CriaUsuario.dto';

@Controller('/usuarios')
export class UsuarioController {
  // eslint-disable-next-line prettier/prettier

  constructor(private usuarioRepository: UsuarioRepository) {}
  @Post()
  async criaUsuario(@Body() dadosDoUsuario: criaUsuarioDTO) {
    this.usuarioRepository.salvar(dadosDoUsuario);

    return 'cadastro concluido';
  }

  @Get()
  async listUsuarios() {
    return this.usuarioRepository.listar();
  }
}
