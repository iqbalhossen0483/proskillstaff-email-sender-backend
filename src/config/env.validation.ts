import { plainToClass } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsString()
  DATABASE_URL!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '1h';

  @IsString()
  REDIS_URL!: string;

  @IsString()
  @IsOptional()
  GCS_BUCKET!: string;

  @IsString()
  @IsOptional()
  GCS_KEY_FILE!: string;

  @IsString()
  @IsOptional()
  RESEND_API_KEY!: string;

  @IsUrl({ require_tld: false })
  FRONTEND_URL!: string;

  @IsInt()
  @Min(10)
  @Max(14)
  @IsOptional()
  BCRYPT_ROUNDS: number = 12;

  @IsInt()
  @IsOptional()
  PORT: number = 3000;

  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validated;
}
