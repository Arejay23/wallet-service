import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Transaction } from 'src/Entities/transactions.entity';
import { TransactionStatusEnum } from 'src/Enums/transactionStatus.enum';
import { TransactionTypeEnum } from 'src/Enums/transationType.enum';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class TransactionRepositoryService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async addTransaction(
    walletId: number,
    amount: number,
    type: TransactionTypeEnum,
    description: string,
    status: TransactionStatusEnum,
    balance: number,
  ): Promise<Transaction> {
    const transaction = new Transaction();
    transaction.walletId = walletId;
    transaction.amount = amount;
    transaction.type = type;
    transaction.description = description;
    transaction.status = status;
    transaction.created_at = new Date();
    transaction.balance = balance;
    const data = await this.transactionRepository.save(transaction);
    return data;
  }

  async addTransactionWithEntityManager(
    walletId: number,
    amount: number,
    type: TransactionTypeEnum,
    description: string,
    status: TransactionStatusEnum,
    balance: number,
    entityManager: EntityManager,
  ): Promise<Transaction> {
    const transaction = new Transaction();
    transaction.walletId = walletId;
    transaction.amount = amount;
    transaction.type = type;
    transaction.description = description;
    transaction.status = status;
    transaction.created_at = new Date();
    transaction.balance = balance;
    const data = await entityManager.save(Transaction, transaction);
    return data;
  }

  async updateTransaction(
    id: number,
    status: TransactionStatusEnum,
  ): Promise<any> {
    const data = await this.transactionRepository.update(id, {
      status,
    });
    return data;
  }

  async updateTransactionWithEntityManager(
    id: number,
    status: TransactionStatusEnum,
    balance: number,
    entityManager: EntityManager,
  ): Promise<any> {
    const data = await entityManager.update(Transaction, id, {
      status,
      balance,
    });
    return data;
  }

  async getTransactions(
    walletId: number,
    skip: number,
    limit: number,
  ): Promise<Transaction[]> {
    const data = await this.transactionRepository.find({
      where: {
        walletId,
      },
      skip,
      take: limit,
    });

    return data;
  }
}
