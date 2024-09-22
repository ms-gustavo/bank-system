import { IsNotEmpty, IsNumber } from "class-validator";

export class LogsDTO {
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: `A página é obrigatória` }
  )
  @IsNotEmpty({ message: `A página é obrigatória` })
  page!: number;

  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: `O limite é obrigatório` }
  )
  @IsNotEmpty({ message: `O limite é obrigatório` })
  limit!: number;
}
