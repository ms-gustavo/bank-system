import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ClientToMerchantTransactionDTO {
  @IsString({ message: `Formato de id inválido` })
  @IsNotEmpty({ message: `O id do estabelecimento é obrigatório` })
  merchantId!: string;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: `O valor é obrigatório` }
  )
  @IsNotEmpty({ message: `O valor é obrigatório` })
  amount!: number;

  @IsString({ message: `Formato de senha inválida` })
  @IsNotEmpty({ message: `A senha é obrigatória` })
  password!: string;
}

export class MerchantToSupplierTransactionDTO {
  @IsString({ message: `Formato de id inválido` })
  @IsNotEmpty({ message: `O id do estabelecimento é obrigatório` })
  supplierId!: string;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: `O valor é obrigatório` }
  )
  @IsNotEmpty({ message: `O valor é obrigatório` })
  amount!: number;

  @IsString({ message: `A senha é obrigatória` })
  @IsNotEmpty({ message: `A senha é obrigatória` })
  password!: string;
}
