import { AuthService } from '@/auth/auth.service';
import { ForgotPasswordDto } from '@/auth/dto/forgot-password.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { ResetPasswordDto } from '@/auth/dto/reset-password.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Returns access token and user info',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account suspended' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiResponse({ status: 200, description: 'Always returns 200' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using a token' })
  @ApiResponse({ status: 200, description: 'Password updated' })
  @ApiResponse({ status: 404, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Password reset successfully.' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate current JWT' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  async logout(
    @Request()
    req: {
      user: { jti: string };
      headers: { authorization?: string };
    },
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
      ) as { exp: number; jti: string };
      await this.authService.logout(req.user.jti, decoded.exp);
    }
    return { message: 'Logged out successfully.' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user info' })
  me(@Request() req: { user: { id: number; email: string; role: string } }) {
    return this.authService.getMe(req.user);
  }
}
