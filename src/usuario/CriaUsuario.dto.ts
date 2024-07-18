import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class criaUsuarioDTO {
  @IsNotEmpty()
  nome: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @MinLength(6)
  senha: string;
}
