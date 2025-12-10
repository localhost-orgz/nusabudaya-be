import { IsString, IsArray, ArrayMinSize, IsNotEmpty } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  choices: string[];

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsNotEmpty()
  provinceId: number;

  @IsString()
  @IsNotEmpty()
  explanation: string;
}
