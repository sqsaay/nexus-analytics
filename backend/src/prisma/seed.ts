import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting NexusAnalytics Database Seeding...');

  // Clean existing tables
  await prisma.transaction.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Demo User
  const user = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'demo@nexus.io',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Created Demo User: ${user.email} (Password: Password123!)`);

  // 2. Create Demo Portfolio
  const portfolio = await prisma.portfolio.create({
    data: {
      userId: user.id,
      name: 'Main Alpha Fund',
      description: 'Core long-term investment holdings',
      currency: 'USD',
      isDefault: true,
    },
  });

  console.log(`✅ Created Portfolio: ${portfolio.name}`);

  // 3. Create Demo Transactions
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  await prisma.transaction.createMany({
    data: [
      {
        portfolioId: portfolio.id,
        coinId: 'bitcoin',
        coinSymbol: 'BTC',
        coinName: 'Bitcoin',
        type: 'BUY',
        amount: 0.5,
        pricePerUnit: 58500.0,
        totalSpent: 29250.0,
        fee: 15.0,
        notes: 'DCA purchase during dip',
        transactionDate: daysAgo(30),
      },
      {
        portfolioId: portfolio.id,
        coinId: 'ethereum',
        coinSymbol: 'ETH',
        coinName: 'Ethereum',
        type: 'BUY',
        amount: 4.5,
        pricePerUnit: 3200.0,
        totalSpent: 14400.0,
        fee: 10.0,
        notes: 'Staking allocation',
        transactionDate: daysAgo(20),
      },
      {
        portfolioId: portfolio.id,
        coinId: 'solana',
        coinSymbol: 'SOL',
        coinName: 'Solana',
        type: 'BUY',
        amount: 30.0,
        pricePerUnit: 135.0,
        totalSpent: 4050.0,
        fee: 5.0,
        notes: 'DeFi yield portfolio',
        transactionDate: daysAgo(15),
      },
      {
        portfolioId: portfolio.id,
        coinId: 'solana',
        coinSymbol: 'SOL',
        coinName: 'Solana',
        type: 'SELL',
        amount: 5.0,
        pricePerUnit: 155.0,
        totalSpent: 775.0,
        fee: 2.0,
        notes: 'Took partial profit',
        transactionDate: daysAgo(5),
      },
    ],
  });

  console.log('✅ Created 4 Demo Transactions');

  // 4. Create Watchlist Items
  await prisma.watchlist.createMany({
    data: [
      {
        userId: user.id,
        coinId: 'cardano',
        coinSymbol: 'ADA',
        coinName: 'Cardano',
        targetPrice: 0.45,
        notes: 'Buy trigger target',
      },
      {
        userId: user.id,
        coinId: 'chainlink',
        coinSymbol: 'LINK',
        coinName: 'Chainlink',
        targetPrice: 15.0,
        notes: 'Oracle narrative play',
      },
    ],
  });

  console.log('✅ Created Watchlist Items');
  console.log('🎉 Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
