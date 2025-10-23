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

// MARK: Dashboard
function Dashboard({ user }) {

  const [statistics, setStatistics] = useState({ total_expenses: 0, total_incomes: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // для підрахунку
  const [wallets, setWallets] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);


  console.log('🎨 Dashboard render, user:', user);


  // MARK: useEffect - load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([loadStatistics(), loadRecentTransactions(), loadWallets()]);

      } catch (err) {
        console.error('Error loading data:', err);

      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);


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




  // MARK: render
  // Підрахунок кількості транзакцій
  const totalCount = allTransactions.length;
  const incomeCount = allTransactions.filter(t => t.type === 'income').length;
  const expenseCount = allTransactions.filter(t => t.type === 'expense').length;

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

          {/* MARK: Net Worth card окремо */}
          <Card variant="surface" size="4">
            <Flex direction="column" gap="2">
              <Heading size="6" align="center">Net Worth</Heading>
              <Heading size="7" align="center" color={statistics.balance >= 0 ? 'jade' : 'tomato'}>
                {statistics.balance >= 0 ? '+' : ''}{statistics.balance.toFixed(2)} UAH
              </Heading>
              <Text align="center" color="gray" size="2">{totalCount} transactions</Text>
            </Flex>
          </Card>

          {/* MARK: Income & Expenses cards в рядок */}
          <Grid columns={{ initial: '2', md: '2' }} gap="5">

            <Card variant="surface" size="3">
              <Flex direction="column" gap="2">
                <Heading size="6" align="center">Expenses</Heading>
                <Heading size="6" align="center" color="tomato">{statistics.total_expenses.toFixed(2)} UAH</Heading>
                <Text color="gray" align="center" size="2">{expenseCount} transactions</Text>
              </Flex>
            </Card>


            <Card variant="surface" size="3">
              <Flex direction="column" gap="2">
                <Heading size="6" align="center">Income</Heading>
                <Heading size="6" align="center" color="mint">{statistics.total_incomes.toFixed(2)} UAH</Heading>
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

        </Flex>
      </Container>
    </Section>
  );
}

// MARK: export
export default Dashboard;
