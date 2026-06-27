import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from './donation.entity.js';

export type DonationSortBy = 'newest' | 'largest';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DonationWithPool extends Donation {
  poolTitle: string | null;
}

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepo: Repository<Donation>,
  ) {}

  async findByPool(
    poolId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Donation>> {
    const [data, total] = await this.donationRepo.findAndCount({
      where: { poolId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findByDonor(
    donorWallet: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<DonationWithPool>> {
    const qb = this.donationRepo
      .createQueryBuilder('d')
      .leftJoin('pools', 'p', 'p.contract_pool_id = d.pool_id')
      .select([
        'd.id          AS id',
        'd.tx_hash      AS "txHash"',
        'd.pool_id      AS "poolId"',
        'd.donor_wallet AS "donorWallet"',
        'd.amount       AS amount',
        'd.asset        AS asset',
        'd.created_at   AS "createdAt"',
        'p.title        AS "poolTitle"',
      ])
      .where('d.donor_wallet = :donorWallet', { donorWallet })
      .orderBy('d.created_at', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit);

    const data = await qb.getRawMany<DonationWithPool>();
    const total = await this.donationRepo.count({ where: { donorWallet } });

    return { data, total, page, limit };
  }
}
