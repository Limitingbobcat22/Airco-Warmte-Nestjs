import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@airco.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'changeme' })
  @IsString()
  @MinLength(8)
  password!: string;
}
