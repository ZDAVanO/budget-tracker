import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Callout,
  Container,
  Flex,
  Grid,
  Heading,
  Section,
  Spinner,
  Table,
  Text,
} from '@radix-ui/themes';
import { ArrowRightIcon, LightningBoltIcon } from '@radix-ui/react-icons';
import api from '../services/api';
import DonutPieChart from '../components/DonutPieChart';
import NetWorthChart from '../components/NetWorthChart';
import { useCurrency } from '../contexts/CurrencyContext.jsx';

// MARK: Dashboard
function Dashboard({ user }) {

  const [statistics, setStatistics] = useState({ total_expenses: 0, total_incomes: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // for calculation
  const [wallets, setWallets] = useState([]);

  
  const [isLoading, setIsLoading] = useState(false);

  const { baseCurrency, convert, format } = useCurrency();


  console.log('🎨 Dashboard render, user:', user);


  // Expenses by category for the current month (from 1st day)
  const nowDate = new Date();
  const firstDayOfMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);

  // Expenses by category (current month)
  const currentMonthExpenses = allTransactions.filter(t => {
    if (t.type !== 'expense') return false;
    const date = new Date(t.date);
    return date >= firstDayOfMonth && date <= nowDate;
  });
  const expenseByCategory = {};
  currentMonthExpenses.forEach(t => {
    const catId = t.category?.id || t.category_id || 'uncat';
    if (!expenseByCategory[catId]) {
      expenseByCategory[catId] = {
        name: t.category?.name || 'No category',
        icon: t.category?.icon || '',
        amount: 0,
      };
    }
    const fromCur = t.wallet?.currency || 'USD';
    expenseByCategory[catId].amount += convert(t.amount, fromCur, baseCurrency);
  });
  const chartLabels = Object.values(expenseByCategory).map(cat => `${cat.icon ? cat.icon + ' ' : ''}${cat.name}`);
  const chartData = Object.values(expenseByCategory).map(cat => cat.amount);

  // Incomes by category (current month)
  const currentMonthIncomes = allTransactions.filter(t => {
    if (t.type !== 'income') return false;
    const date = new Date(t.date);
    return date >= firstDayOfMonth && date <= nowDate;
  });
  const incomeByCategory = {};
  currentMonthIncomes.forEach(t => {
    const catId = t.category?.id || t.category_id || 'uncat';
    if (!incomeByCategory[catId]) {
      incomeByCategory[catId] = {
        name: t.category?.name || 'No category',
        icon: t.category?.icon || '',
        amount: 0,
      };
    }
    const fromCur = t.wallet?.currency || 'USD';
    incomeByCategory[catId].amount += convert(t.amount, fromCur, baseCurrency);
  });
  const incomeChartLabels = Object.values(incomeByCategory).map(cat => `${cat.icon ? cat.icon + ' ' : ''}${cat.name}`);
  const incomeChartData = Object.values(incomeByCategory).map(cat => cat.amount);

  // Colors for the chart (random or fixed)
  const chartColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#B4FF9F', '#FFB4B4', '#B4D4FF', '#FFD6A5',
    '#CDB4DB', '#F1C0E8', '#A3C4F3', '#B5EAD7', '#E2F0CB', '#FFB7B2', '#FFDAC1', '#B5EAD7', '#C7CEEA', '#E2F0CB'
  ];


  // MARK: Net worth over time (daily cumulative)
  const computeNetWorthSeries = (transactions) => {
    if (!transactions || transactions.length === 0) return { labels: [], data: [] };

    // Normalize and sort transactions by date asc
    const tx = transactions
      .map(t => ({ ...t, date: new Date(t.date) }))
      .sort((a, b) => a.date - b.date);

    const start = new Date(tx[0].date);
    start.setHours(0, 0, 0, 0); // only date part

    // Find the latest transaction date and today, use the max of both
    const lastTxDate = new Date(tx[tx.length - 1].date);
    lastTxDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = lastTxDate > today ? lastTxDate : today;

    // Helper to get yyyy-mm-dd key
    const dayKey = (d) => d.toISOString().slice(0, 10);

    // Aggregate sums per day
    const sumsByDay = {};
    tx.forEach(t => {
      // Normalize date to 00:00:00 for correct grouping
      const date = new Date(t.date);
      date.setHours(0, 0, 0, 0);
      const key = dayKey(date);
      const sign = t.type === 'expense' ? -1 : 1;
      const fromCur = t.wallet?.currency || 'USD';
      const amt = convert(Number(t.amount) || 0, fromCur, baseCurrency);
      sumsByDay[key] = (sumsByDay[key] || 0) + sign * amt;
    });

    // Build daily series from start to lastDate (which is max of lastTxDate and today)
    const labels = [];
    const data = [];
    let current = 0;
    for (let d = new Date(start); d.getTime() <= lastDate.getTime();) {
      const key = dayKey(d);
      current += sumsByDay[key] || 0;
      // push a copy of date string for label
      const label = d.toLocaleDateString('uk-UA');
      labels.push(label);
      data.push(Number(current.toFixed(2)));
      // increment date by 1 day (without mutating d)
      d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    }

    return { labels, data };
  };

  const netWorthSeries = computeNetWorthSeries(allTransactions);


  // MARK: loadStatistics
  const loadStatistics = useCallback(async () => {
    try {
      const { response, data } = await api.statistics.get({ base_currency: baseCurrency });
      if (response.ok) {
        setStatistics(data);
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  }, [baseCurrency]);


  // MARK: loadRecentTransactions
  const loadRecentTransactions = useCallback(async () => {
    try {
      const { response, data } = await api.transactions.getAll();
      if (response.ok) {
        setRecentTransactions((data || []).slice(0, 5));
        setAllTransactions(data || []);
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  }, []);


  // MARK: loadWallets
  const loadWallets = useCallback(async () => {
    try {
      const { response, data } = await api.wallets.getAll();
      if (response.ok) {
        setWallets(data || []);
      }
    } catch (err) {
      console.error('Error loading wallets:', err);
    }
  }, []);


  // MARK: useEffect - load data (after loaders are defined)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadStatistics(),
          loadRecentTransactions(),
          loadWallets(),
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadStatistics, loadRecentTransactions, loadWallets]);


  // MARK: formatAmount
  const formatAmount = (amount, currencyCode = baseCurrency) =>
    format(amount, currencyCode);


  // MARK: get current month/year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // MARK: filter transactions for current month
  const monthlyTransactions = allTransactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  // Counting the number of transactions for the month
  // const totalCount = monthlyTransactions.length;
  const incomeCount = monthlyTransactions.filter(t => t.type === 'income').length;
  const expenseCount = monthlyTransactions.filter(t => t.type === 'expense').length;

  // Calculating the sum of incomes/expenses for the month
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + convert(t.amount, t.wallet?.currency || 'USD', baseCurrency), 0);

  const monthlyIncomes = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + convert(t.amount, t.wallet?.currency || 'USD', baseCurrency), 0);


  // MARK: render

  return (
    <Section size="3" className="p-4">
      <Container size="3">
        <Flex direction="column" gap="5">

          <Flex direction="column">
            <Heading size="6">
              Hello there
            </Heading>
            <Heading size="8" color="mint">
              {user}
            </Heading>
          </Flex>

          {/* MARK: Net Worth card separately */}
          <Card variant="surface" size="4">
            <Flex direction="column" gap="2">
              <Heading size="6" align="center">Net Worth</Heading>
              <Heading size="7" align="center" color={statistics.balance >= 0 ? 'jade' : 'tomato'}>
                {formatAmount(statistics.balance, baseCurrency)}
              </Heading>
              <Text align="center" color="gray" size="2">{allTransactions.length} transactions</Text>
            </Flex>
          </Card>

          {/* MARK: Income & Expenses cards in a row */}
          <Grid columns={{ initial: '2', md: '2' }} gap="5">

            <Card variant="surface" size="3">
              <Flex direction="column" gap="2">
                <Heading size="6" align="center">Expenses</Heading>
                <Heading size="6" align="center" color="tomato">{formatAmount(monthlyExpenses, baseCurrency)}</Heading>
                <Text color="gray" align="center" size="2">{expenseCount} transactions</Text>
              </Flex>
            </Card>


            <Card variant="surface" size="3">
              <Flex direction="column" gap="2">
                <Heading size="6" align="center">Income</Heading>
                <Heading size="6" align="center" color="mint">{formatAmount(monthlyIncomes, baseCurrency)}</Heading>
                <Text color="gray" align="center" size="2">{incomeCount} transactions</Text>
              </Flex>
            </Card>

            

          </Grid>


          <Grid columns={{ initial: '1', md: '2' }} gap="5">
            {/* MARK: Recent Transactions */}
            <Card size="3" variant="surface">
              <Flex direction="column" gap="4">
                <Flex align="center" justify="between">
                  <Heading size="5">Recent Transactions</Heading>
                  <Button asChild variant="soft" size="2">
                    <Link to="/transactions">View All</Link>
                  </Button>
                </Flex>

                {isLoading ? (
                  <Flex align="center" justify="center" style={{ minHeight: 160 }}>
                    <Spinner />
                  </Flex>
                ) : recentTransactions.length === 0 ? (
                  <Callout.Root>
                    <Callout.Icon>
                      <LightningBoltIcon />
                    </Callout.Icon>
                    <Callout.Text>
                      <Text color="gray">No transactions yet. Create your first one now.</Text>
                    </Callout.Text>
                  </Callout.Root>
                ) : (
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell align="end">Amount</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {recentTransactions.map((transaction) => (
                        <Table.Row key={`${transaction.type}-${transaction.id}`}>
                          <Table.Cell>{transaction.category?.name || 'No category'}</Table.Cell>
                          <Table.Cell>{transaction.description || transaction.title}</Table.Cell>
                          <Table.Cell align="end" style={{ whiteSpace: 'nowrap' }}>
                            <Text weight="bold" color={transaction.type === 'expense' ? 'tomato' : 'jade'}>
                              {transaction.type === 'expense' ? '-' : '+'}
                              {formatAmount(convert(transaction.amount, transaction.wallet?.currency || 'USD', baseCurrency), baseCurrency)}
                            </Text>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                )}
              </Flex>
            </Card>

            {/* MARK: Wallets */}
            <Card size="3" variant="classic">
              
              <Flex direction="column" gap="4">
                <Flex align="center" justify="between">
                  <Heading size="5">Wallets</Heading>
                  <Button asChild variant="soft" size="2">
                    <Link to="/wallets">Manage</Link>
                  </Button>
                </Flex>

                {isLoading ? (
                  <Flex align="center" justify="center" style={{ minHeight: 160 }}>
                    <Spinner />
                  </Flex>
                ) :wallets.length === 0 ? (
                  <Callout.Root>
                    <Callout.Text>
                      <Text color="gray">
                        No wallets. <Link to="/wallets">Add your first wallet</Link>
                      </Text>
                    </Callout.Text>
                  </Callout.Root>
                ) : (
                  <Flex direction="column" gap="3">
                    {wallets.slice(0, 4).map((wallet) => (
                      <Card
                        key={wallet.id}
                        variant="surface"
                      >

                        <Flex justify="between" align="center">
                          <Flex align="center" gap="3">
                            <Text size="4">{wallet.icon}</Text>
                            <Flex direction="column" gap="1">
                              <Text weight="medium">{wallet.name}</Text>
                              <Text size="2" color="gray">
                                {wallet.description || 'No description'}
                              </Text>
                            </Flex>
                          </Flex>
                          <Text weight="bold">{formatAmount(wallet.balance || 0, wallet.currency)}</Text>
                        </Flex>

                      </Card>

                    ))}
                  </Flex>
                )}
              </Flex>

            </Card>


            {/* MARK: Donut Pie Chart for Expenses by Category */}
            <Card variant="surface" size="3">
              <Flex direction="column" gap="3">
                <Heading size="5" align="center">Expenses (this month)</Heading>
                {chartData.length > 0 ? (
                  <DonutPieChart
                    data={chartData}
                    labels={chartLabels}
                    colors={chartColors.slice(0, chartData.length)}
                    title={null}
                  />
                ) : (
                  <Text align="center" color="gray">No expenses in this month</Text>
                )}
              </Flex>
            </Card>

            {/* MARK: Donut Pie Chart for Incomes by Category */}
            <Card variant="surface" size="3">
              <Flex direction="column" gap="3">
                <Heading size="5" align="center">Income (this month)</Heading>
                {incomeChartData.length > 0 ? (
                  <DonutPieChart
                    data={incomeChartData}
                    labels={incomeChartLabels}
                    colors={chartColors.slice(0, incomeChartData.length)}
                    title={null}
                  />
                ) : (
                  <Text align="center" color="gray">No income in this month</Text>
                )}
              </Flex>
            </Card>

          </Grid>

          {/* MARK: Net Worth Over Time (full-width) */}
          <Card variant="surface" size="3">
            <Flex direction="column" gap="3">
              <Heading size="5" align="center">Net Worth Over Time</Heading>
              {netWorthSeries.data.length > 0 ? (
                <NetWorthChart
                  labels={netWorthSeries.labels}
                  data={netWorthSeries.data}
                  color="#6C5CE7"
                  title={null}
                  currency={baseCurrency}
                />
              ) : (
                <Text align="center" color="gray">No transactions to build net worth chart</Text>
              )}
            </Flex>
          </Card>


        </Flex>
      </Container>
    </Section>
  );
}

// MARK: export
export default Dashboard;
