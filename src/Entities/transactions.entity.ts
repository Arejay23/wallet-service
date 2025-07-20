import { TransactionStatusEnum } from 'src/Enums/transactionStatus.enum';
import { TransactionTypeEnum } from 'src/Enums/transationType.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'wallet_id' })
  walletId: number;

  @Column({ name: 'amount', type: 'decimal', precision: 18, scale: 4 })
  amount: number;

  @Column({ name: 'type' })
  type: TransactionTypeEnum;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'status' })
  status: TransactionStatusEnum;

  @Column({ name: 'balance', type: 'decimal', precision: 18, scale: 4 })
  balance: number;
}

// CREATE TABLE `payments`.`transactions` (
//   `id` INT NOT NULL AUTO_INCREMENT,
//   `wallet_id` INT NULL,
//   `amount` DECIMAL(18,4) NULL,
//   `balance` DECIMAL(18,4) NULL,
//   `type` VARCHAR(45) NULL,
//   `description` VARCHAR(45) NULL,
//   `status` VARCHAR(45) NULL,
//   `created_at` DATETIME NULL,
//   PRIMARY KEY (`id`));
