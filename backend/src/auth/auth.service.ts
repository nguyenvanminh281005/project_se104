import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../database/entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { RedisService } from '../common/services/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
    const { email, username, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      status: UserStatus.OFFLINE,
    });

    await this.userRepository.save(user);

    // Generate JWT token
    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    // Remove password from response
    delete user.password;

    return { user, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update user status to online
    user.status = UserStatus.ONLINE;
    await this.userRepository.save(user);
    await this.redisService.setUserOnline(user.id);

    // Generate JWT token
    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    // Remove password from response
    delete user.password;

    return { user, token };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async logout(userId: string): Promise<void> {
    // Update user status to offline
    await this.userRepository.update(userId, {
      status: UserStatus.OFFLINE,
      lastSeen: new Date(),
    });

    await this.redisService.setUserOffline(userId);
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['playlists'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    delete user.password;
    return user;
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(userId, updateData);
    return this.getProfile(userId);
  }
}
