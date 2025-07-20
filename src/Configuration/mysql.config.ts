import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Transaction } from 'src/Entities/transactions.entity';
import { Wallet } from 'src/Entities/wallet.entity';

@Injectable()
export class MySQLConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: 'mysql',
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      driver: require('mysql2'),
      synchronize: false,
      replication: {
        master: {
          port: 52586,
          username: 'root',
          password: 'DncBcsbxPKMVTLlzQzUVRpXcdVWhlxkh',
          database: 'railway',
          host: 'ballast.proxy.rlwy.net',
        },
        slaves: [
          {
            port: 52586,
            username: 'root',
            password: 'DncBcsbxPKMVTLlzQzUVRpXcdVWhlxkh',
            database: 'railway',
            host: 'ballast.proxy.rlwy.net',
          },
        ],
      },
      entities: [Wallet, Transaction],
      extra: {
        connectionLimit: 20,
        maxIdle: 5,
        idleTimeout: 30000,
      },
    };
  }
}
