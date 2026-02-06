import { CreateUserDto } from '../../users/dto/create-user.dto.js';

export class CreateAuthDto {
  public toPersistenceObject() {
    return {} as CreateUserDto;
  }
}
