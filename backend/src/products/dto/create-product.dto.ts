import { IsString, IsNumber, IsBoolean,IsInt,IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional() // category is now optional
  @IsString()
  category: string;

  @IsNumber()
  price: number;

  @IsInt()
  quantity: number;

  @IsBoolean()
  inStock: boolean;

  @IsString()
  @IsOptional() // <-- Make sure it's optional
  description?: string; // <-- Make sure it's defined here with a '?'
}
