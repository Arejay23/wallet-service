import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { WalletService } from 'src/Services/wallet.service';

@Controller()
export class WalletController {
  constructor(private walletService: WalletService) {}
  @Post('/setup')
  @HttpCode(200)
  async setupWallet(@Body() body: any): Promise<any> {
    const response = await this.walletService.setWallet(
      body.balance,
      body.name,
    );
    return response;
  }

  @Post('/transact/:walletId')
  @HttpCode(200)
  async performTransaction(
    @Param('walletId') walletId: number,
    @Body() body: any,
  ): Promise<any> {
    const response = await this.walletService.performTransaction(
      walletId,
      body.amount,
      body.description,
    );
    return response;
  }

  @Get('/transactions')
  async getTransactions(
    @Query('walletId') walletId: number,
    @Query('skip') skip: number,
    @Query('limit') limit: number,
  ): Promise<any> {
    const response = await this.walletService.getTransactions(
      walletId,
      skip,
      limit,
    );
    return response;
  }

  @Get('/wallet/:id')
  async getWallet(@Param('id') id: number): Promise<any> {
    const response = await this.walletService.getWallet(id);
    return response;
  }
}
