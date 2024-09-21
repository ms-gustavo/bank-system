import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class TransactionDTO {
  @IsString()
  @IsNotEmpty({ message: `O id do estabelecimento é obrigatório` })
  merchantId!: string;

  @IsNumber()
  @IsNotEmpty({ message: `O valor é obrigatório` })
  amount!: number;
}
