import { Exclude } from 'class-transformer';
import { verification_statuses, user_role } from 'generated/prisma/enums.js';

export class User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  @Exclude()
  password_hash: string;
  password?: string;
  phone_number: string;
  national_id: string;
  username: string;
  role?: user_role;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  verification_status: verification_statuses;
}
