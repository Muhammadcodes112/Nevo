import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { StellarAuthGuard } from '../auth/stellar-auth.guard.js';
import { DonationsService } from './donations.service.js';

@Controller()
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get('pools/:id/donations')
  findByPool(
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.donationsService.findByPool(
      id,
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
    );
  }

  @UseGuards(StellarAuthGuard)
  @Get('users/me/donations')
  findMyDonations(
    @Request() req: { user: { publicKey: string } },
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.donationsService.findByDonor(
      req.user.publicKey,
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
    );
  }
}
