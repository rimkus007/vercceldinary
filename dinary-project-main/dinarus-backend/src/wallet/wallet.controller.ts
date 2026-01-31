import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ForbiddenException,
  Request,
  Query,
  Param,
  Res,
  Header,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { RechargeDto } from './dto/recharge.dto';
import { SendMoneyDto } from './dto/send-money.dto';
import { PayQrDto } from './dto/pay-qr.dto';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { RechargeByMerchantDto } from './dto/recharge-by-merchant.dto';
import type { User } from '@prisma/client'; // CORRECTION: Importation du type
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { RefundItemsDto } from './dto/refund-items.dto';
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  private getUserId(req: any): string {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException(
        'ID utilisateur non trouvé dans le token.',
      );
    }
    return userId;
  }
  @Get('history/pdf')
  @UseGuards(AuthGuard('jwt'))
  @Header('Content-Type', 'application/pdf')
  async getHistoryPdf(
    @Req() req: any,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const userId = this.getUserId(req);

    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (from) {
      fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) {
        throw new BadRequestException('Date "from" invalide.');
      }
    }
    if (to) {
      toDate = new Date(to);
      if (isNaN(toDate.getTime())) {
        throw new BadRequestException('Date "to" invalide.');
      }
    }

    const pdfBuffer = await this.walletService.generateHistoryPdf(
      userId,
      fromDate,
      toDate,
    );

    const filename = `historique-dinary-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(pdfBuffer);
  }

  @Get('search-user')
  @UseGuards(AuthGuard('jwt'))
  searchUsers(@Request() req, @Query('q') query: string) {
    const userId = this.getUserId(req);
    return this.walletService.searchUsers(query, userId);
  }

  @Get('payment-status/:id')
  @UseGuards(AuthGuard('jwt'))
  checkPaymentStatus(@Param('id') id: string) {
    return this.walletService.getPaymentStatus(id);
  }

  @Post('pay-qr')
  @UseGuards(AuthGuard('jwt'))
  payWithQrCode(@Request() req, @Body() payQrDto: PayQrDto) {
    const senderUserId = this.getUserId(req);
    return this.walletService.payQr(senderUserId, payQrDto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMyWallet(@Request() req) {
    const userId = this.getUserId(req);
    return this.walletService.findOneByUserId(userId);
  }

  @Get('transactions')
  @UseGuards(AuthGuard('jwt'))
  getTransactions(@Request() req) {
    const userId = this.getUserId(req);
    return this.walletService.getTransactions(userId);
  }

  @Post('recharge')
  @UseGuards(AuthGuard('jwt'))
  rechargeWallet(@Request() req, @Body() rechargeDto: RechargeDto) {
    const userId = this.getUserId(req);
    return this.walletService.recharge(userId, rechargeDto);
  }

  @Post('send')
  @UseGuards(AuthGuard('jwt'))
  sendMoney(@Request() req, @Body() sendMoneyDto: SendMoneyDto) {
    const senderUserId = this.getUserId(req);
    void 0;
    void 0;
    return this.walletService.sendMoney(senderUserId, sendMoneyDto);
  }
  @Post('refund/items')
  @UseGuards(AuthGuard('jwt'))
  async refundItems(@Request() req, @Body() refundDto: RefundItemsDto) {
    if (req.user.role !== 'MERCHANT') {
      throw new UnauthorizedException(
        'Seuls les commerçants peuvent effectuer des remboursements.',
      );
    }
    const merchantUserId = this.getUserId(req);
    return this.walletService.refundItemsFromTransaction(
      merchantUserId,
      refundDto,
    );
  }

  @Get('transaction/:id/invoice')
  @UseGuards(AuthGuard('jwt'))
  @Header('Content-Type', 'application/pdf')
  async getTransactionInvoice(
    @Req() req: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const userId = this.getUserId(req);
    const pdfBuffer = await this.walletService.generateInvoicePdf(id, userId);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=facture-dinary-${id}.pdf`,
    );
    res.send(pdfBuffer);
  }

  @Post('refund')
  @UseGuards(AuthGuard('jwt'))
  async refundTransaction(
    @Request() req,
    @Body('transactionId') transactionId: string,
  ) {
    // On s'assure que l'utilisateur est bien un marchand
    if (req.user.role !== 'MERCHANT') {
      throw new UnauthorizedException(
        'Seuls les commerçants peuvent effectuer des remboursements.',
      );
    }
    const merchantUserId = this.getUserId(req);
    return this.walletService.refundTransaction(merchantUserId, transactionId);
  }
  @Get('transaction/:id/details')
  @UseGuards(AuthGuard('jwt'))
  async getTransactionDetails(@Request() req, @Param('id') id: string) {
    if (req.user.role !== 'MERCHANT') {
      throw new UnauthorizedException('Accès réservé aux commerçants.');
    }
    const merchantUserId = this.getUserId(req);
    return this.walletService.getTransactionDetailsForMerchant(
      merchantUserId,
      id,
    );
  }
  @Post('request-withdrawal')
  @UseGuards(AuthGuard('jwt'))
  requestWithdrawal(
    @Request() req,
    @Body() body: { amount: number; bankDetails: any },
  ) {
    // VÉRIFICATION DU RÔLE
    if (req.user.role !== Role.MERCHANT) {
      throw new ForbiddenException(
        'Seuls les commerçants peuvent demander un retrait.',
      );
    }

    const userId = this.getUserId(req);
    const { amount, bankDetails } = body;
    if (!amount || amount <= 0 || !bankDetails) {
      throw new BadRequestException('Montant et détails bancaires requis.');
    }
    return this.walletService.requestWithdrawal(userId, amount, bankDetails);
  }

  @Get('recharge-status/:id')
  checkRechargeStatus(@Param('id') id: string) {
    return this.walletService.getRechargeStatus(id);
  }

  @Post('recharge-by-merchant')
  @UseGuards(JwtAuthGuard)
  rechargeClientByMerchant(
    @GetUser() merchant: User,
    @Body() rechargeByMerchantDto: RechargeByMerchantDto,
  ) {
    if (merchant.role !== 'MERCHANT') {
      throw new ForbiddenException(
        'Seuls les commerçants peuvent effectuer cette action.',
      );
    }
    return this.walletService.rechargeClientByMerchant(
      merchant.id,
      rechargeByMerchantDto,
    );
  }
}
