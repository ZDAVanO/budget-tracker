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

function Dashboard({ user }) {
  const [statistics, setStatistics] = useState({ total_expenses: 0, total_incomes: 0, balance: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log('🎨 Dashboard render, user:', user);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([loadStatistics(), loadRecentTransactions(), loadWallets()]);
      } catch (err) {
        console.error('Помилка завантаження даних:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const loadStatistics = async () => {
    try {
      const { response, data } = await api.statistics.get();
      if (response.ok) {
        setStatistics(data);
      }
    } catch (err) {
      console.error('Помилка завантаження статистики:', err);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const { response, data } = await api.transactions.getAll();
      if (response.ok) {
        setRecentTransactions((data || []).slice(0, 5));
      }
    } catch (err) {
      console.error('Помилка завантаження транзакцій:', err);
    }
  };

  const loadWallets = async () => {
    try {
      const { response, data } = await api.wallets.getAll();
      if (response.ok) {
        setWallets(data || []);
      }
    } catch (err) {
      console.error('Помилка завантаження гаманців:', err);
    }
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const statCards = [
    {
      label: 'Витрати',
      amount: `-${formatAmount(statistics.total_expenses)} ₴`,
      color: 'tomato',
      emoji: '💸',
    },
    {
      label: 'Доходи',
      amount: `+${formatAmount(statistics.total_incomes)} ₴`,
      color: 'jade',
      emoji: '💰',
    },
    {
      label: 'Баланс',
      amount: `${statistics.balance >= 0 ? '+' : ''}${formatAmount(statistics.balance)} ₴`,
      color: statistics.balance >= 0 ? 'mint' : 'tomato',
      emoji: '📊',
    },
  ];

  return (
    <Section size="3">
      <Container size="3">
        <Flex direction="column" gap="6">
          <Flex direction="column" gap="2">
            <Heading as="h1" size="7">
              Привіт, {user}! 👋
            </Heading>
            <Text color="gray">
              Перегляньте фінансовий підсумок, останні транзакції та статус гаманців.
            </Text>
          </Flex>

          <Grid columns={{ initial: '1', md: '3' }} gap="4">
            {statCards.map((card) => (
              <Card key={card.label} size="4" variant="surface">
                <Flex direction="column" gap="3">
                  <Badge color={card.color} variant="soft" size="2">
                    {card.emoji} {card.label}
                  </Badge>
                  <Heading size="6">{card.amount}</Heading>
                  <Text size="2" color="gray">
                    Оновлено {new Date().toLocaleDateString('uk-UA')}
                  </Text>
                </Flex>
              </Card>
            ))}
          </Grid>

          <Grid columns={{ initial: '1', md: '2' }} gap="5">
            <Card size="4" variant="surface">
              <Flex direction="column" gap="4">
                <Flex align="center" justify="between">
                  <Heading size="5">Останні транзакції</Heading>
                  <Button asChild variant="soft" size="2">
                    <Link to="/transactions">Переглянути всі</Link>
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
                      <Text color="gray">Поки що немає транзакцій. Створіть першу прямо зараз.</Text>
                    </Callout.Text>
                  </Callout.Root>
                ) : (
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell>Категорія</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Опис</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell align="end">Сума</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {recentTransactions.map((transaction) => (
                        <Table.Row key={`${transaction.type}-${transaction.id}`}>
                          <Table.Cell>{transaction.category?.name || 'Без категорії'}</Table.Cell>
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

            <Card size="4" variant="classic">
              <Flex direction="column" gap="4">
                <Flex align="center" justify="between">
                  <Heading size="5">Гаманці</Heading>
                  <Button asChild variant="soft" size="2">
                    <Link to="/wallets">Керувати</Link>
                  </Button>
                </Flex>

                {wallets.length === 0 ? (
                  <Callout.Root>
                    <Callout.Text>
                      <Text color="gray">
                        Немає гаманців. <Link to="/wallets">Додайте перший гаманець</Link>
                      </Text>
                    </Callout.Text>
                  </Callout.Root>
                ) : (
                  <Flex direction="column" gap="3">
                    {wallets.slice(0, 4).map((wallet) => (
                      <Flex
                        key={wallet.id}
                        justify="between"
                        align="center"
                        style={{
                          padding: 'var(--space-3) var(--space-4)',
                          borderRadius: 'var(--radius-5)',
                          backgroundColor: 'color-mix(in srgb, var(--accent-a3) 20%, transparent)',
                        }}
                      >
                        <Flex align="center" gap="3">
                          <Text size="4">{wallet.icon}</Text>
                          <Flex direction="column" gap="1">
                            <Text weight="medium">{wallet.name}</Text>
                            <Text size="2" color="gray">
                              {wallet.description || 'Без опису'}
                            </Text>
                          </Flex>
                        </Flex>
                        <Text weight="bold">{formatAmount(wallet.balance || 0)} ₴</Text>
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Flex>
            </Card>
          </Grid>

          <Card variant="surface" size="4">
            <Flex align="center" justify="between" wrap="wrap" gap="4">
              <Flex direction="column" gap="2">
                <Heading size="5">Прискорте свою фінансову мету</Heading>
                <Text color="gray">
                  Керуйте транзакціями, категоріями та гаманцями з єдиного місця.
                </Text>
              </Flex>
              <Button asChild size="3">
                <Link to="/transactions">
                  Перейти до транзакцій <ArrowRightIcon />
                </Link>
              </Button>
            </Flex>
          </Card>
        </Flex>
      </Container>
    </Section>
  );
}

export default Dashboard;
