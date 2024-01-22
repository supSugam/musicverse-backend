import { ApiProperty } from '@nestjs/swagger';
import { Genre, User, UserRole } from '@prisma/client';

export class UserEntity implements Partial<User> {
  @ApiProperty()
  id: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  role: UserRole;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  isVerified: boolean;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
