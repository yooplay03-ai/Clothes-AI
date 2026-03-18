import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WardrobeModule } from './wardrobe/wardrobe.module';
import { OutfitModule } from './outfit/outfit.module';
import { WeatherModule } from './weather/weather.module';
import { AiModule } from './ai/ai.module';
import { CommunityModule } from './community/community.module';
import { SeedModule } from './seed/seed.module';
import { MusinsaModule } from './musinsa/musinsa.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.test', '.env', '.env.local'],
    }),

    // Database — SQLite (테스트용) or PostgreSQL (프로덕션)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const useSqlite = config.get('USE_SQLITE', 'false') === 'true';

        if (useSqlite) {
          return {
            type: 'sqljs',
            location: config.get<string>('SQLITE_PATH', 'moodfit-test.db'),
            autoSave: true,
            useLocalForage: false,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
          } as TypeOrmModuleOptions;
        }

        return {
          type: 'postgres',
          host: config.get<string>('DATABASE_HOST', 'localhost'),
          port: config.get<number>('DATABASE_PORT', 5432),
          username: config.get<string>('DATABASE_USER', 'moodfit'),
          password: config.get<string>('DATABASE_PASSWORD', 'moodfit_secret'),
          database: config.get<string>('DATABASE_NAME', 'moodfit_db'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: config.get('DATABASE_SYNC', 'true') === 'true',
          logging: config.get('DATABASE_LOGGING', 'false') === 'true',
          ssl:
            config.get('NODE_ENV') === 'production'
              ? { rejectUnauthorized: false }
              : false,
        } as TypeOrmModuleOptions;
      },
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    WardrobeModule,
    OutfitModule,
    WeatherModule,
    AiModule,
    CommunityModule,
    SeedModule,
    MusinsaModule,
  ],
})
export class AppModule {}
