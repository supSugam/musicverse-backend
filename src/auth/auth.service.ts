import {
  BadRequestException,
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
import { ResetPasswordDto } from 'src/mail/dto/reset-password-dto';
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
      throw new UnauthorizedException('Invalid Credentials, Please try again.');
    }

    const isUserBanned = await this.prismaService.bannedUser.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (isUserBanned) {
      throw new UnauthorizedException(
        `You're Banned. ${isUserBanned.reason ? `Reason: ${isUserBanned.reason}` : 'Not Specified'}`
      );
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

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] =
      request.headers.authorization && request.headers.authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  async refresh(req) {
    const token = this.extractTokenFromHeader(req);

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const userPayload = await this.validateToken(token);

    if (!userPayload) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userPayload.id,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const isUserBanned = await this.prismaService.bannedUser.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (isUserBanned) {
      throw new UnauthorizedException(
        `You're Banned. ${isUserBanned.reason ? `Reason: ${isUserBanned.reason}` : 'Not Specified'}`
      );
    }

    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
    };

    // Check user membership expiry and change to user role if expired
    if (user.role !== UserRole.USER) {
      const membershipExpired = await this.prismaService.membership.findFirst({
        where: {
          userId: user.id,
          expiresAt: {
            lte: new Date(),
          },
        },
      });

      if (membershipExpired) {
        payload.role = UserRole.USER;
        await this.prismaService.user.update({
          where: {
            id: user.id,
          },
          data: {
            role: UserRole.USER,
          },
        });
      }
    }

    const newToken = await this.jwtService.signAsync(payload);

    return {
      access_token: newToken,
      user: payload,
    };
  }

  async initiatePasswordChange(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Send OTP to user email

    await this.mailService.sendResendOtp({
      email: user.email,
      name: user.username,
      subject: 'Reset Password',
      text: 'OTP to reset your MusicVerse password:',
    });

    return {
      message: 'OTP Sent, Please check your email',
    };
  }

  async resetPassword(payload: ResetPasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // const isOtpValid = await this.mailService.verifyOtp({
    //   email: user.email,
    //   otp: payload.otp,
    // });

    // if (!isOtpValid) {
    //   throw new BadRequestException('Invalid OTP');
    // }

    const hashedPassword = await getHashedPassword(payload.password);

    await this.prismaService.user.update({
      where: {
        email: payload.email,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'Password Resetted, Please login with your new password',
    };
  }
}
