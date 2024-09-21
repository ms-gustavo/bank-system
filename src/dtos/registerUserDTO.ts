import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from "class-validator";
import { Role } from "../types/interface";

export class RegisterUserDTO {
  @IsEmail()
  @IsNotEmpty({ message: `O email é obrigatório` })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: `O nome é obrigatório` })
  name!: string;

  @IsEnum(Role, {
    message: `O papel deve ser um dos seguintes: ${Object.values(Role).join(
      ", "
    )}`,
  })
  @IsNotEmpty({ message: `A função é obrigatória` })
  role!: Role;

  @IsString()
  @MinLength(6, { message: `A senha deve ter no mínimo 6 caracteres` })
  @IsNotEmpty({ message: `A senha é obrigatória` })
  password!: string;
}
