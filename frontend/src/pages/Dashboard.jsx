import React, { useEffect, useState } from 'react';
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

// MARK: Dashboard
function Dashboard({ user }) {

  const [statistics, setStatistics] = useState({ total_expenses: 0, total_incomes: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // for calculation
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);


  console.log('🎨 Dashboard render, user:', user);


  // MARK: useEffect - load data
  useEffect(() => {

    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadStatistics(),
          loadRecentTransactions(),
          loadWallets(),
          loadCategories()
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // MARK: loadCategories
  const loadCategories = async () => {
    try {
      const { response, data } = await api.categories.getAll('expense');
      if (response.ok) {
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };
  // MARK: Pie chart data for last 30 days
  // Expenses by category for the last 30 days
  const nowDate = new Date();
  const last30Days = new Date(nowDate);
  last30Days.setDate(nowDate.getDate() - 29);

  // Expenses by category (last 30 days)
  const last30DaysExpenses = allTransactions.filter(t => {
    if (t.type !== 'expense') return false;
    const date = new Date(t.date);
    return date >= last30Days && date <= nowDate;
  });
  const expenseByCategory = {};
  last30DaysExpenses.forEach(t => {
    const catId = t.category?.id || t.category_id || 'uncat';
    if (!expenseByCategory[catId]) {
      expenseByCategory[catId] = {
        name: t.category?.name || 'No category',
        icon: t.category?.icon || '',
        amount: 0,
      };
    }
    expenseByCategory[catId].amount += t.amount;
  });
  const chartLabels = Object.values(expenseByCategory).map(cat => `${cat.icon ? cat.icon + ' ' : ''}${cat.name}`);
  const chartData = Object.values(expenseByCategory).map(cat => cat.amount);

  // Incomes by category (last 30 days)
  const last30DaysIncomes = allTransactions.filter(t => {
    if (t.type !== 'income') return false;
    const date = new Date(t.date);
    return date >= last30Days && date <= nowDate;
  });
  const incomeByCategory = {};
  last30DaysIncomes.forEach(t => {
    const catId = t.category?.id || t.category_id || 'uncat';
    if (!incomeByCategory[catId]) {
      incomeByCategory[catId] = {
        name: t.category?.name || 'No category',
        icon: t.category?.icon || '',
        amount: 0,
      };
    }
    incomeByCategory[catId].amount += t.amount;
  });
  const incomeChartLabels = Object.values(incomeByCategory).map(cat => `${cat.icon ? cat.icon + ' ' : ''}${cat.name}`);
  const incomeChartData = Object.values(incomeByCategory).map(cat => cat.amount);

  // Colors for the chart (random or fixed)
  const chartColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#B4FF9F', '#FFB4B4', '#B4D4FF', '#FFD6A5',
    '#CDB4DB', '#F1C0E8', '#A3C4F3', '#B5EAD7', '#E2F0CB', '#FFB7B2', '#FFDAC1', '#B5EAD7', '#C7CEEA', '#E2F0CB'
  ];


  // MARK: loadStatistics
  const loadStatistics = async () => {
    try {
      const { response, data } = await api.statistics.get();
      if (response.ok) {
        setStatistics(data);
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };


  // MARK: loadRecentTransactions
  const loadRecentTransactions = async () => {
    try {
      const { response, data } = await api.transactions.getAll();
      if (response.ok) {
        setRecentTransactions((data || []).slice(0, 5));
        setAllTransactions(data || []);
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };


  // MARK: loadWallets
  const loadWallets = async () => {
    try {
      const { response, data } = await api.wallets.getAll();
      if (response.ok) {
        setWallets(data || []);
      }
    } catch (err) {
      console.error('Error loading wallets:', err);
    }
  };


  // MARK: formatAmount
  const formatAmount = (amount) =>
    new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);


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
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncomes = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);


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
                {statistics.balance >= 0 ? '+' : ''}{statistics.balance.toFixed(2)} UAH
              </Heading>
              <Text align="center" color="gray" size="2">{allTransactions.length} transactions</Text>
            </Flex>
          </Card>

          {/* MARK: Income & Expenses cards in a row */}
          <Grid columns={{ initial: '2', md: '2' }} gap="5">

            <Card variant="surface" size="3">
              <Flex direction="column" gap="2">
                <Heading size="6" align="center">Expenses</Heading>
                <Heading size="6" align="center" color="tomato">{monthlyExpenses.toFixed(2)} UAH</Heading>
                <Text color="gray" align="center" size="2">{expenseCount} transactions</Text>
              </Flex>
            </Card>


            <Card variant="surface" size="3">
              <Flex direction="column" gap="2">
                <Heading size="6" align="center">Income</Heading>
                <Heading size="6" align="center" color="mint">{monthlyIncomes.toFixed(2)} UAH</Heading>
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
                          <Table.Cell align="end">
                            <Text weight="bold" color={transaction.type === 'expense' ? 'tomato' : 'jade'}>
                              {transaction.type === 'expense' ? '-' : '+'}
                              {formatAmount(transaction.amount)} ₴
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
                          <Text weight="bold">{formatAmount(wallet.balance || 0)} UAH</Text>
                        </Flex>

                      </Card>

                    ))}
                  </Flex>
                )}
              </Flex>

            </Card>
          </Grid>


          {/* MARK: Donut Pie Chart for Expenses by Category (last 30 days) */}
          <Card variant="surface" size="4">
            <Flex direction="column" gap="5">
              <Heading size="5" align="center">Expenses (last 30 days)</Heading>
              {chartData.length > 0 ? (
                <DonutPieChart
                  data={chartData}
                  labels={chartLabels}
                  colors={chartColors.slice(0, chartData.length)}
                  title={null}
                />
              ) : (
                <Text align="center" color="gray">No expenses in the last 30 days</Text>
              )}
            </Flex>
          </Card>

          {/* MARK: Donut Pie Chart for Incomes by Category (last 30 days) */}
          <Card variant="surface" size="4">
            <Flex direction="column" gap="5">
              <Heading size="5" align="center">Income (last 30 days)</Heading>
              {incomeChartData.length > 0 ? (
                <DonutPieChart
                  data={incomeChartData}
                  labels={incomeChartLabels}
                  colors={chartColors.slice(0, incomeChartData.length)}
                  title={null}
                />
              ) : (
                <Text align="center" color="gray">No income in the last 30 days</Text>
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
