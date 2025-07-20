import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletService } from './Services/wallet.service';
import { WalletController } from './Controllers/wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MySQLConfig } from './Configuration/mysql.config';
import { Wallet } from './Entities/wallet.entity';
import { TransactionRepositoryService } from './Repositories/transactionRepository.service';
import { WalletRepositoryService } from './Repositories/walletRepository.service';
import { Transaction } from './Entities/transactions.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: MySQLConfig,
    }),
    TypeOrmModule.forFeature([Wallet, Transaction]),
  ],
  controllers: [AppController, WalletController],
  providers: [
    AppService,
    WalletService,
    TransactionRepositoryService,
    WalletRepositoryService,
  ],
})
export class AppModule {}
