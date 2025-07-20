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
          username: 'root',
          password: 'root1234',
          database: 'payments',
          host: '127.0.0.1',
        },
        slaves: [
          {
            port: 3306,
            username: 'root',
            password: 'root1234',
            database: 'payments',
            host: '127.0.0.1',
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
