import { user_role } from '../../../generated/prisma/client.js';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { User } from '../entities/user.entity.js';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString() firstName: string;

  @IsString() lastName: string;

  @IsString() nationalId: string;

  @IsPhoneNumber('KE', {
    message:
      'Phone number must be a valid international format (e.g., +254...)',
  })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString() role: user_role;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  public toPersistenceObject = (): User => {
    return {
      first_name: this.firstName,
      last_name: this.lastName,
      national_id: this.nationalId,
      phone_number: this.phoneNumber,
      role: this.role,
      email: this.email,
      username: this.username,
    } as User;
  };
}
