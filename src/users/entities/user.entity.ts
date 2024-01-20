import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UserRole } from 'src/utils/enums/User';

export class UserEntity implements User {
  @ApiProperty()
  id: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  role: UserRole;
}
