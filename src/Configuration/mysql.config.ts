import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Transaction } from 'src/Entities/transactions.entity';
import { Wallet } from 'src/Entities/wallet.entity';

@Injectable()
export class MySQLConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: 'mysql',
      synchronize: false,
      replication: {
        master: {
          port: 3306,
          username: 'sql12790890',
          password: '2FAzREisH2',
          database: 'sql12790890',
          host: 'sql12.freesqldatabase.com',
        },
        slaves: [
          {
            port: 3306,
            username: 'sql12790890',
            password: '2FAzREisH2',
            database: 'sql12790890',
            host: 'sql12.freesqldatabase.com',
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
