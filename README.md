<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

# Wallet Service

## Overview
This service manages wallet balances and transactions, providing endpoints to create wallets, perform credit/debit operations, and view transaction history. It includes robust race condition handling through database transactions and row-level locking to ensure data consistency during concurrent operations.

## Description

A wallet service built with [Nest](https://github.com/nestjs/nest) framework that provides functionality for creating wallets, performing transactions (credit and debit), and retrieving wallet information and transaction history.

## Project Setup
1. Clone the repository

```bash
# Install dependencies
$ npm install
```

### Requirements
- Node.js v20.19.4
- npm v10.8.2
- NVM 0.39.7 (for managing Node.js versions)

### Running the Application
```bash
# Start the application
$ npm run start

# The service will be available at http://localhost:3001
```

## Running the Application

```bash
# development mode
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Running Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation

### Wallet APIs
-**Base URL**: `https://wallet-service-production-36e0.up.railway.app`
#### 1. Create Wallet

- **Endpoint**: `POST /setup`
- **Description**: Creates a new wallet with the specified balance and name
- **Request Body**:
  ```json
  {
    "balance": 1000,
    "name": "Main Wallet"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "balance": 1000,
    "name": "Main Wallet",
    "transactionId": 1,
    "date": "2023-01-01T00:00:00.000Z"
  }
  ```
- **Error Response**:
  ```json
  {
    "message": "Wallet already exists",
    "error": "Bad Request",
    "statusCode": 400
  }
  ```
  ```json
  {
    "message": "Balance must be a number",
    "error": "Bad Request",
    "statusCode": 400
  }
  ```

#### 2. Perform Transaction

- **Endpoint**: `POST /transact/:walletId`
- **Description**: Performs a credit (positive amount) or debit (negative amount) transaction on the specified wallet
- **URL Parameters**:
  - `walletId` - The ID of the wallet
- **Request Body**:
  ```json
  {
    "amount": 500,    // Positive for credit, negative for debit
    "description": "Payment received"
  }
  ```
- **Response**:
  ```json
  {
    "balance": 1500,  // Updated wallet balance
    "transactionId": 2
  }
  ```
  - **Error Response**:
  ```json
  {
    "message": "Wallet not found",
    "error": "Bad Request",
    "statusCode": 400
  }
  ```
  ```json
  {
    "message": "Amount must be a number",
    "error": "Bad Request",
    "statusCode": 400
  }
  ```
  ```json
  {
    "message": "Insufficient balance",
    "error": "Bad Request",
    "statusCode": 400
  }
  ```

#### 3. Get Wallet Details

- **Endpoint**: `GET /wallet/:id`
- **Description**: Retrieves the details of a specific wallet
- **URL Parameters**:
  - `id` - The ID of the wallet
- **Response**:
  ```json
  {
    "id": 5,
    "name": "name",
    "balance": 357.3555,
    "date": "2025-07-20T02:21:37.000Z"
  }
  ```

#### 4. Get Transactions

- **Endpoint**: `GET /transactions`
- **Description**: Retrieves transactions for a specific wallet with pagination
- **Query Parameters**:
  - `walletId` - The ID of the wallet
  - `skip` - Number of records to skip for pagination (default: 0)
  - `limit` - Maximum number of records to return (default: 10)
- **Response**:
  ```json
  [
    {
      "id": 2,
      "walletId": 1,
      "amount": 500,
      "balance": 357.3555,
      "type": "CREDIT",
      "description": "Payment received",
      "status": "SUCCESS",
      "created_at": "2023-01-01T00:30:00.000Z",
    },
    {
      "id": 1,
      "walletId": 1,
      "amount": -100,
      "balance": 357.3555,
      "type": "DEBIT",
      "description": "Initial balance",
      "status": "SUCCESS",
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  ]
  ```

## Technical Design

### Database Schema

#### Wallet Table
- `id` (Primary Key)
- `name` (VARCHAR)
- `balance` (DECIMAL(18,4))
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

#### Transactions Table
- `id` (Primary Key)
- `wallet_id` (Foreign Key)
- `amount` (DECIMAL(18,4))
- `balance` (DECIMAL(18,4)) - Wallet balance at time of transaction
- `type` (VARCHAR) - 'CREDIT' or 'DEBIT'
- `description` (VARCHAR)
- `status` (VARCHAR) - 'PENDING', 'SUCCESS', or 'FAILED'
- `created_at` (DATETIME)

### Transaction Flow

1. **Credit Transaction**:
   - Start database transaction with row-level locking
   - Fetch wallet by ID with FOR UPDATE lock to prevent concurrent modifications
   - Validate input data
   - Create a pending transaction with current wallet balance
   - Add amount to wallet balance with explicit numeric conversion
   - Update transaction status to success
   - Commit database transaction
   - Return updated balance (truncated to 4 decimal places) and transaction ID

2. **Debit Transaction**:
   - Start database transaction with row-level locking
   - Fetch wallet by ID with FOR UPDATE lock to prevent concurrent modifications
   - Validate input data and check sufficient balance
   - Create a pending transaction with current wallet balance
   - Subtract amount from wallet balance with explicit numeric conversion
   - Update transaction status to success
   - Commit database transaction
   - Return updated balance (truncated to 4 decimal places) and transaction ID

### Race Condition Handling

- Transactions are protected from race conditions using database transactions and row-level locking
- Pessimistic locking (FOR UPDATE) ensures that concurrent operations on the same wallet are serialized
- All operations (balance check, transaction creation, balance update) happen atomically
- If any step fails, the entire transaction is rolled back, preserving data consistency
- Wallet balances are explicitly converted to numbers to prevent string concatenation issues

### Error Handling

The service provides proper error handling for various scenarios:

- Wallet not found
- Insufficient balance for debit transactions
- Invalid amount values
- Duplicate wallet names

## Configuration

The service uses NestJS's configuration system. Refer to the `Configuration` directory for specific settings.

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Node.js Documentation](https://nodejs.org/en/docs/)

