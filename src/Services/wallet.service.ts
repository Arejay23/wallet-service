import { BadRequestException, Injectable } from '@nestjs/common';
import { TransactionStatusEnum } from 'src/Enums/transactionStatus.enum';
import { TransactionTypeEnum } from 'src/Enums/transationType.enum';
import { TransactionRepositoryService } from 'src/Repositories/transactionRepository.service';
import { WalletRepositoryService } from 'src/Repositories/walletRepository.service';

@Injectable()
export class WalletService {
  constructor(
    private walletRepositoryService: WalletRepositoryService,
    private transactionRepositoryService: TransactionRepositoryService,
  ) {}
  async setWallet(balance: number, name: string): Promise<any> {
    if (isNaN(balance)) {
      throw new BadRequestException('Balance must be a number');
    }
    if (!name) {
      throw new BadRequestException('name is required');
    }
    try {
      const data = await this.walletRepositoryService.getWalletByName(name);
      if (data) {
        throw new BadRequestException('Wallet already exists');
      }
      const wallet = await this.walletRepositoryService.addWallet(
        balance,
        name,
      );
      const transaction =
        await this.transactionRepositoryService.addTransaction(
          wallet.id,
          balance,
          TransactionTypeEnum.CREDIT,
          'Initial balance',
          TransactionStatusEnum.SUCCESS,
          balance,
        );
      const response = {
        id: wallet.id,
        balance,
        name,
        transactionId: transaction.id,
        date: wallet.createdAt,
      };
      return response;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async performTransaction(
    walletId: number,
    amount: number,
    description: string,
  ): Promise<any> {
    if (isNaN(amount)) {
      throw new BadRequestException('Amount must be a number');
    }
    if (!walletId) {
      throw new BadRequestException('walletId is required');
    }
    if (Number(amount) > 0) {
      return await this.creditWallet(walletId, amount, description);
    } else {
      return await this.debitWallet(walletId, amount, description);
    }
  }
  async debitWallet(
    walletId: number,
    amount: number,
    description: string,
  ): Promise<any> {
    if (isNaN(amount)) {
      throw new BadRequestException('Amount must be a number');
    }
    if (isNaN(walletId)) {
      throw new BadRequestException('walletId must be a number');
    }
    let transaction;

    // Start a database transaction to ensure atomicity
    return this.walletRepositoryService.runInTransaction(
      async (entityManager) => {
        try {
          // Get wallet with a row lock to prevent concurrent modifications
          const wallet =
            await this.walletRepositoryService.getWalletByIdWithLock(
              walletId,
              entityManager,
            );

          if (!wallet) {
            throw new BadRequestException('Wallet not found');
          }

          if (Number(amount * -1) > Number(wallet.balance)) {
            throw new BadRequestException('Insufficient balance');
          }

          // Create pending transaction
          transaction =
            await this.transactionRepositoryService.addTransactionWithEntityManager(
              walletId,
              amount,
              TransactionTypeEnum.DEBIT,
              description,
              TransactionStatusEnum.PENDING,
              wallet.balance,
              entityManager,
            );

          // Update wallet balance within the same transaction
          // Explicitly convert to numbers to prevent string concatenation
          wallet.balance = Number(wallet.balance) + Number(amount);
          await this.walletRepositoryService.updateWalletWithEntityManager(
            wallet,
            entityManager,
          );

          // Mark transaction as successful
          await this.transactionRepositoryService.updateTransactionWithEntityManager(
            transaction.id,
            TransactionStatusEnum.SUCCESS,
            wallet.balance,
            entityManager,
          );

          // Truncate balance to 4 decimal places to match database precision
          const truncatedBalance = parseFloat(wallet.balance.toFixed(4));
          const response = {
            balance: truncatedBalance,
            transactionId: transaction.id,
          };

          return response;
        } catch (e) {
          if (transaction) {
            // If there's an error, mark transaction as failed within the transaction
            await this.transactionRepositoryService
              .updateTransactionWithEntityManager(
                transaction.id,
                TransactionStatusEnum.FAILED,
                transaction.balance,
                entityManager,
              )
              .catch(() => {}); // Ignore any errors from this update
          }
          throw new BadRequestException(e.message);
        }
      },
    );
  }

  async creditWallet(
    walletId: number,
    amount: number,
    description: string,
  ): Promise<any> {
    if (isNaN(amount)) {
      throw new BadRequestException('Amount must be a number');
    }
    if (isNaN(walletId)) {
      throw new BadRequestException('walletId must be a number');
    }
    let transaction;

    // Start a database transaction to ensure atomicity
    return this.walletRepositoryService.runInTransaction(
      async (entityManager) => {
        try {
          // Get wallet with a row lock to prevent concurrent modifications
          const wallet =
            await this.walletRepositoryService.getWalletByIdWithLock(
              walletId,
              entityManager,
            );

          if (!wallet) {
            throw new BadRequestException('Wallet not found');
          }

          // Create pending transaction
          transaction =
            await this.transactionRepositoryService.addTransactionWithEntityManager(
              walletId,
              amount,
              TransactionTypeEnum.CREDIT,
              description,
              TransactionStatusEnum.PENDING,
              wallet.balance,
              entityManager,
            );

          // Update wallet balance within the same transaction
          // Explicitly convert to numbers to prevent string concatenation
          wallet.balance = Number(wallet.balance) + Number(amount);
          await this.walletRepositoryService.updateWalletWithEntityManager(
            wallet,
            entityManager,
          );

          // Mark transaction as successful
          await this.transactionRepositoryService.updateTransactionWithEntityManager(
            transaction.id,
            TransactionStatusEnum.SUCCESS,
            wallet.balance,
            entityManager,
          );

          // Truncate balance to 4 decimal places to match database precision
          const truncatedBalance = parseFloat(wallet.balance.toFixed(4));
          const response = {
            balance: truncatedBalance,
            transactionId: transaction.id,
          };

          return response;
        } catch (e) {
          if (transaction) {
            // If there's an error, mark transaction as failed within the transaction
            await this.transactionRepositoryService
              .updateTransactionWithEntityManager(
                transaction.id,
                TransactionStatusEnum.FAILED,
                transaction.balance,
                entityManager,
              )
              .catch(() => {}); // Ignore any errors from this update
          }
          throw new BadRequestException(e.message);
        }
      },
    );
  }

  async getTransactions(
    walletId: number,
    skip: number,
    limit: number,
  ): Promise<any> {
    if (isNaN(walletId)) {
      throw new BadRequestException('walletId must be a number');
    }
    if (isNaN(skip)) {
      throw new BadRequestException('skip must be a number');
    }
    if (isNaN(limit)) {
      throw new BadRequestException('limit must be a number');
    }
    try {
      const data = await this.transactionRepositoryService.getTransactions(
        walletId,
        skip,
        limit,
      );
      return data;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getWallet(walletId: number): Promise<any> {
    try {
      const wallet = await this.walletRepositoryService.getWalletById(walletId);
      if (!wallet) throw new BadRequestException('Wallet not found');

      // Truncate balance to 4 decimal places for consistency
      const truncatedBalance = parseFloat(Number(wallet.balance).toFixed(4));
      return {
        id: wallet.id,
        name: wallet.name,
        balance: truncatedBalance,
        date: wallet.createdAt,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
