import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { comparePassword, getHashedPassword } from 'src/utils/helpers/Hasher';
import { UserRole } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { CredentialsType } from 'src/utils/enums/Auth';
import { JWT_SECRET } from 'src/utils/constants';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly mailService: MailService,
    private jwtService: JwtService,
    private readonly prismaService: PrismaService
  ) {}

  async validateToken(token: string) {
    return this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });
  }

  async invalidateToken(token: string) {
    return this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });
  }

  async create(registerUserDto: RegisterUserDto): Promise<UserEntity> {
    const { email, username, password, genreIds, role } = registerUserDto;
    const user_role = role as UserRole;
    // Check if the user already exists
    const existingEmail = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      throw new ConflictException('Email is already taken');
    }

    const existingUsername = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    const hashedPassword = await getHashedPassword(password);
    const userData = {
      email,
      username,
      password: hashedPassword,
      role: user_role,
    };

    // if (genreIds && genreIds.length > 0) {
    //   const existingGenres = await this.usersService.genre.findMany({
    //     where: {
    //       id: {
    //         in: genreIds,
    //       },
    //     },
    //   });

    //   if (existingGenres.length !== genreIds.length) {
    //     throw new BadRequestException('Selected genres are invalid.');
    //   }
    //   userData['genres'] = {
    //     connect: genreIds.map((genreId) => ({ id: genreId })),
    //   };
    // }

    const user = await this.prismaService.user.create({
      data: userData,
    });

    await this.mailService.sendResendOtp({
      email: user.email,
      name: user.username,
      subject: 'Email Verification',
      text: '',
    });

    delete user.password;
    return user;
  }

  // User Sign In (User can login with both email and username)

  async signIn(signInDto: LoginUserDto) {
    const { usernameOrEmail, credentialsType } = signInDto;
    const user = await this.prismaService.user.findFirst({
      where: {
        [credentialsType === CredentialsType.EMAIL ? 'email' : 'username']:
          usernameOrEmail,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials, Please try again.');
    }

    // if(!user.isVerified) {
    //   throw new UnauthorizedException('Please verify your email to login.');
    // }

    const isPasswordValid = await comparePassword(
      signInDto.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect Password');
    }

    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
    };

    const token = await this.jwtService.signAsync(payload);

    const hasCompletedProfile = await this.prismaService.profile.findFirst({
      where: {
        userId: user.id,
      },
    });

    return {
      access_token: token,
      user: payload,
      hasCompletedProfile: !!hasCompletedProfile,
    };
  }
}
