import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Wallet } from 'src/Entities/wallet.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class WalletRepositoryService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getWalletByName(name: string) {
    return await this.walletRepository.findOne({ where: { name } });
  }

  async getWalletById(id: number) {
    return await this.walletRepository.findOne({ where: { id } });
  }

  async getWalletByIdWithLock(id: number, entityManager: EntityManager) {
    // Use FOR UPDATE lock to prevent concurrent modifications to the same wallet record
    // This ensures the wallet record is locked for the entire transaction
    return entityManager
      .createQueryBuilder(Wallet, 'wallet')
      .setLock('pessimistic_write') // Exclusive lock for this transaction
      .where('wallet.id = :id', { id })
      .getOne();
  }

  async addWallet(balance: number, name: string): Promise<Wallet> {
    const wallet = new Wallet();
    wallet.balance = balance;
    wallet.name = name;
    wallet.createdAt = new Date();
    wallet.updatedAt = new Date();
    const data = await this.walletRepository.save(wallet);
    return data;
  }

  async updateWallet(wallet: Wallet): Promise<Wallet> {
    const data = await this.walletRepository.save(wallet);
    return data;
  }

  async updateWalletWithEntityManager(
    wallet: Wallet,
    entityManager: EntityManager,
  ): Promise<Wallet> {
    // Update the wallet using the provided entity manager within a transaction
    return entityManager.save(Wallet, wallet);
  }

  async runInTransaction<T>(
    callback: (entityManager: EntityManager) => Promise<T>,
  ): Promise<T> {
    // Create a query runner
    const queryRunner = this.dataSource.createQueryRunner();

    // Start transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Execute the callback with the transaction entity manager
      const result = await callback(queryRunner.manager);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return result;
    } catch (error) {
      // If error, rollback the transaction
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
}
