import { Injectable, PipeTransform } from '@nestjs/common';

interface UserInput {
  email?: string;
  phoneNumber?: string;
  [key: string]: any;
}

interface UserOutput extends UserInput {
  username: string;
}

@Injectable()
export class UsernameGeneratorPipe implements PipeTransform<
  UserInput,
  UserOutput
> {
  transform(value: UserInput): UserOutput {
    return {
      ...value,
      username: `${value.email},${value.phoneNumber}`,
    };
  }
}
