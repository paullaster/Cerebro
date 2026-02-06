import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';
import { User } from '../entities/user.entity.js';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  public override toPersistenceObject = (): User => {
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
