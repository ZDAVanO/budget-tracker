// Seed data generator for Demo Mode (localStorage based)

export const DEFAULT_USER = {
  id: 1,
  username: 'Demo User',
  email: 'demo@budgettracker.local'
};

export const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Uncategorized', icon: '📂', type: 'both', description: 'Default category for uncategorized transactions', user_id: 1 },
  { id: 2, name: 'Adjust Balance', icon: '⚖️', type: 'both', description: 'Balance adjustments (initial/manual)', user_id: 1 },
  // Expenses
  { id: 3, name: 'Food', icon: '🍔', type: 'expense', description: 'Groceries, restaurants, cafes', user_id: 1 },
  { id: 4, name: 'Transport', icon: '🚗', type: 'expense', description: 'Transport, fuel, taxi', user_id: 1 },
  { id: 5, name: 'Entertainment', icon: '🎮', type: 'expense', description: 'Movies, games, hobbies', user_id: 1 },
  { id: 6, name: 'Health', icon: '💊', type: 'expense', description: 'Medicine, doctor, gym', user_id: 1 },
  { id: 7, name: 'Clothing', icon: '👕', type: 'expense', description: 'Clothes, shoes, accessories', user_id: 1 },
  { id: 8, name: 'Home', icon: '🏠', type: 'expense', description: 'Rent, utilities, repairs', user_id: 1 },
  { id: 9, name: 'Education', icon: '📚', type: 'expense', description: 'Courses, books, learning', user_id: 1 },
  { id: 10, name: 'Travel', icon: '✈️', type: 'expense', description: 'Travel expenses and hotels', user_id: 1 },
  { id: 11, name: 'Other', icon: '📦', type: 'expense', description: 'Other expenses', user_id: 1 },
  // Income
  { id: 12, name: 'Salary', icon: '💰', type: 'income', description: 'Main monthly salary', user_id: 1 },
  { id: 13, name: 'Freelance', icon: '💻', type: 'income', description: 'Freelance contracts and gigs', user_id: 1 },
  { id: 14, name: 'Gifts', icon: '🎁', type: 'income', description: 'Received gifts', user_id: 1 },
  { id: 15, name: 'Investments', icon: '📈', type: 'income', description: 'Dividends and passive returns', user_id: 1 },
  { id: 16, name: 'Bonus', icon: '🎉', type: 'income', description: 'Performance bonuses', user_id: 1 },
];

export const DEFAULT_WALLETS = [
  { id: 1, name: 'Cash', icon: '💵', description: 'Pocket cash', currency: 'USD', user_id: 1 },
  { id: 2, name: 'Main Card', icon: '💳', description: 'Primary debit card', currency: 'UAH', user_id: 1 },
  { id: 3, name: 'Savings Account', icon: '🏦', description: 'Reserve savings', currency: 'UAH', user_id: 1 },
  { id: 4, name: 'Crypto Wallet', icon: '🪙', description: 'Bitcoin and stablecoins', currency: 'USD', user_id: 1 },
];

export const generateSampleTransactions = () => {
  const transactions = [];
  let txId = 1;

  // Initial balance adjustments
  const initialBalances = [
    { walletId: 1, amount: 250, currency: 'USD' },
    { walletId: 2, amount: 28000, currency: 'UAH' },
    { walletId: 3, amount: 75000, currency: 'UAH' },
    { walletId: 4, amount: 1500, currency: 'USD' }
  ];

  const now = new Date();
  const baseDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago

  initialBalances.forEach(({ walletId, amount }) => {
    transactions.push({
      id: txId++,
      amount,
      date: new Date(baseDate.getTime() + 1000 * 60 * 60).toISOString(),
      modified_at: new Date().toISOString(),
      title: 'Initial Balance',
      description: 'Starting wallet balance adjustment',
      type: 'income',
      user_id: 1,
      category_id: 2, // Adjust Balance
      wallet_id: walletId
    });
  });

  // Pre-configured realistic transactions distributed over past 60 days
  const sampleEvents = [
    { daysAgo: 58, type: 'income', categoryId: 12, walletId: 2, amount: 45000, title: 'Monthly Salary', desc: 'Main company payout' },
    { daysAgo: 55, type: 'expense', categoryId: 8, walletId: 2, amount: 12000, title: 'Apartment Rent', desc: 'Monthly rent transfer' },
    { daysAgo: 53, type: 'expense', categoryId: 3, walletId: 2, amount: 1450, title: 'Supermarket', desc: 'Weekly groceries' },
    { daysAgo: 51, type: 'expense', categoryId: 4, walletId: 1, amount: 40, title: 'Taxi', desc: 'Uber ride to city center' },
    { daysAgo: 50, type: 'income', categoryId: 13, walletId: 1, amount: 350, title: 'Website Design Gig', desc: 'Client frontend design' },
    { daysAgo: 48, type: 'expense', categoryId: 3, walletId: 2, amount: 620, title: 'Coffee & Breakfast', desc: 'Cafe meeting' },
    { daysAgo: 45, type: 'expense', categoryId: 5, walletId: 2, amount: 350, title: 'Cinema Tickets', desc: 'Weekend movie' },
    { daysAgo: 43, type: 'expense', categoryId: 6, walletId: 2, amount: 890, title: 'Pharmacy', desc: 'Vitamins and supplements' },
    { daysAgo: 40, type: 'expense', categoryId: 4, walletId: 2, amount: 1800, title: 'Gas Station', desc: 'Full tank fuel' },
    { daysAgo: 38, type: 'expense', categoryId: 3, walletId: 2, amount: 2100, title: 'Groceries', desc: 'Food market' },
    { daysAgo: 35, type: 'income', categoryId: 15, walletId: 4, amount: 120, title: 'Staking Reward', desc: 'Crypto interest' },
    { daysAgo: 33, type: 'expense', categoryId: 7, walletId: 2, amount: 2400, title: 'Sport Shoes', desc: 'Running sneakers' },
    { daysAgo: 30, type: 'expense', categoryId: 8, walletId: 2, amount: 2100, title: 'Utilities Bill', desc: 'Electricity & water' },
    { daysAgo: 28, type: 'income', categoryId: 12, walletId: 2, amount: 45000, title: 'Monthly Salary', desc: 'Main company payout' },
    { daysAgo: 26, type: 'expense', categoryId: 8, walletId: 2, amount: 12000, title: 'Apartment Rent', desc: 'Monthly rent' },
    { daysAgo: 25, type: 'expense', categoryId: 10, walletId: 1, amount: 180, title: 'Flight Ticket', desc: 'Weekend trip' },
    { daysAgo: 22, type: 'expense', categoryId: 3, walletId: 2, amount: 1680, title: 'Supermarket', desc: 'Weekly groceries' },
    { daysAgo: 20, type: 'income', categoryId: 14, walletId: 1, amount: 100, title: 'Birthday Gift', desc: 'Gift from friends' },
    { daysAgo: 18, type: 'expense', categoryId: 9, walletId: 1, amount: 50, title: 'Programming Book', desc: 'System design guide' },
    { daysAgo: 16, type: 'expense', categoryId: 5, walletId: 2, amount: 790, title: 'Steam Game', desc: 'Video game sale' },
    { daysAgo: 14, type: 'expense', categoryId: 4, walletId: 2, amount: 1950, title: 'Gas Station', desc: 'Fuel refill' },
    { daysAgo: 12, type: 'expense', categoryId: 3, walletId: 2, amount: 840, title: 'Dinner with Friends', desc: 'Italian restaurant' },
    { daysAgo: 10, type: 'income', categoryId: 16, walletId: 2, amount: 8000, title: 'Quarterly Bonus', desc: 'Performance bonus' },
    { daysAgo: 8, type: 'expense', categoryId: 6, walletId: 2, amount: 1500, title: 'Dentist Checkup', desc: 'Routine dental visit' },
    { daysAgo: 6, type: 'expense', categoryId: 3, walletId: 2, amount: 1920, title: 'Groceries', desc: 'Supermarket restock' },
    { daysAgo: 4, type: 'expense', categoryId: 4, walletId: 1, amount: 35, title: 'Taxi', desc: 'Late evening cab' },
    { daysAgo: 2, type: 'expense', categoryId: 3, walletId: 2, amount: 480, title: 'Lunch Cafe', desc: 'Workday business lunch' },
    { daysAgo: 1, type: 'income', categoryId: 13, walletId: 4, amount: 200, title: 'Freelance Bugfix', desc: 'Fast client fix' },
    { daysAgo: 0, type: 'expense', categoryId: 3, walletId: 2, amount: 310, title: 'Coffee & Pastry', desc: 'Morning coffee' }
  ];

  sampleEvents.forEach(evt => {
    const d = new Date(now.getTime() - evt.daysAgo * 24 * 60 * 60 * 1000);
    d.setHours(12 + (txId % 8), (txId * 17) % 60, 0);

    transactions.push({
      id: txId++,
      amount: evt.amount,
      date: d.toISOString(),
      modified_at: d.toISOString(),
      title: evt.title,
      description: evt.desc,
      type: evt.type,
      user_id: 1,
      category_id: evt.categoryId,
      wallet_id: evt.walletId
    });
  });

  return transactions;
};
