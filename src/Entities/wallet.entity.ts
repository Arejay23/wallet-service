import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('wallet')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ name: 'name' })
  name: string;
  @Column({ name: 'balance', type: 'decimal', precision: 18, scale: 4 })
  balance: number;
  @Column({ name: 'created_at' })
  createdAt: Date;
  @Column({ name: 'updated_at' })
  updatedAt: Date;
}
// CREATE TABLE `payments`.`wallet` (
//   `id` INT NOT NULL,
//   `name` VARCHAR(45) NULL,
//   `balance` DECIMAL(18,4) NULL,
//   `created_at` DATETIME NULL,
//   `updated_at` DATETIME NULL,
//   PRIMARY KEY (`id`))
