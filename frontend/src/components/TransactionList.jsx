import React from 'react';
import { Badge, Box, Card, Callout, Flex, Spinner, Text } from '@radix-ui/themes';

// Групування транзакцій по даті (день)
const groupByDay = (transactions) => {
  return transactions.reduce((groups, tx) => {
    const dateKey = new Date(tx.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(tx);
    return groups;
  }, {});
};

function TransactionList({ transactions, onEdit, isLoading }) {
  const emptyMessage = 'No transactions yet';

  // const formatDate = (dateString) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('en-GB', {
  //     day: '2-digit',
  //     month: '2-digit',
  //     year: 'numeric'
  //   });
  // };

  // Add full date and time formatting
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
      // second: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 180 }}>
        <Spinner />
      </Flex>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Callout.Root variant="surface">
        <Callout.Text>{emptyMessage}</Callout.Text>
      </Callout.Root>
    );
  }



  // Групуємо транзакції по днях
  const grouped = groupByDay(transactions);
  const groupKeys = Object.keys(grouped).sort((a, b) => {
    // Сортуємо дати від нових до старих
    const [d1, m1, y1] = a.split('.').map(Number);
    const [d2, m2, y2] = b.split('.').map(Number);
    return new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1);
  });

  // Додаємо стилі для ефекту наведення
  const cardHoverStyle = `
  .transaction-card {
    transition: background 0.18s;
  }
  .transaction-card:hover {
    background: var(--accent-3);
  }
  `;

  // Форматування дати для заголовка групи: Today, October 24 або Friday, October 17[, 2024]
  const formatGroupDate = (dateKey) => {
    let d, m, y;
    if (dateKey.includes('/')) {
      [d, m, y] = dateKey.split('/').map(Number);
    } else if (dateKey.includes('.')) {
      [d, m, y] = dateKey.split('.').map(Number);
    } else {
      return dateKey; // fallback
    }
    const date = new Date(y, m - 1, d);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentYear = today.getFullYear();
    const showYear = y !== currentYear;

    if (date.getTime() === today.getTime()) {
      return `Today, ${date.toLocaleString('en-US', { month: 'long', day: 'numeric' })}`;
    }

    return `${date.toLocaleString('en-US', { weekday: 'long' })}, ${date.toLocaleString('en-US', { month: 'long', day: 'numeric' })}${showYear ? `, ${y}` : ''}`;
  };

  return (
    <>
      <style>{cardHoverStyle}</style>
      <Flex direction="column" gap="4">
        {groupKeys.map(dateKey => (

          <Box key={dateKey}>
            <Box mb="1">
              <Text size="3"  color="gray">{formatGroupDate(dateKey)}</Text>
            </Box>

            <Flex direction="column" gap="3">
              {grouped[dateKey].map((transaction) => {
                const isExpense = transaction.type === 'expense';
                const icon = isExpense ? '💸' : '💰';

                return (
                  <Card
                    key={`${transaction.type}-${transaction.id}`}
                    variant="surface"
                    size="2"
                    onClick={() => onEdit(transaction)}
                    style={{ cursor: 'pointer' }}
                    className="transaction-card"
                  >
                    <Flex align="center" justify="between" gap="4">
                      <Flex align="start" gap="3" style={{ minWidth: 0, flex: 1 }}>
                        <Box
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 12,
                            display: 'grid',
                            placeItems: 'center',
                            background: 'var(--color-panel-translucent)',
                          }}
                        >
                          <Text size="5">{transaction.category?.icon || icon}</Text>
                        </Box>

                        <Flex direction="column" gap="1" style={{ minWidth: 0, flex: 1 }}>
                          <Flex align="center" gap="2" wrap="wrap" style={{ minWidth: 0 }}>
                            <Text
                              as="div"
                              weight="medium"
                              style={{
                                minWidth: 0,
                                flex: '1 1 auto',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {transaction.title || transaction.category?.name || 'No title'}
                            </Text>
                            {/* <Badge color={isExpense ? 'tomato' : 'jade'} variant="soft">
                              {isExpense ? 'Expense' : 'Income'}
                            </Badge> */}
                          </Flex>

                          <Flex align="center" gap="2" wrap="wrap">
                            
                            <Text size="2" color="gray">{formatDateTime(transaction.date)}</Text>

                            {/* {transaction.category && (
                              <>
                                <Badge color='orange' variant="soft">
                                <Text size="2" color="gray">{transaction.category.name}</Text>
                                </Badge>
                              </>
                            )} */}
                            {transaction.wallet && (
                              <>
                              <Badge color='green' variant="soft">
                                <Text size="2" color="gray"> {transaction.wallet.name}</Text>
                              </Badge>
                              </>
                            )}
                          </Flex>

                          {transaction.description && (
                            <Text size="2" color="gray">{transaction.description}</Text>
                          )}
                        </Flex>
                      </Flex>

                      <Flex align="center" direction="column" gap="2" style={{ minWidth: 0, flexShrink: 0 }}>
                        <Text
                          weight="bold"
                          color={isExpense ? 'tomato' : 'jade'}
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flexShrink: 0,
                          }}
                        >
                          {isExpense ? '-' : '+'}{formatAmount(transaction.amount)} ₴
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                );
              })}
            </Flex>
            
          </Box>

        ))}
      </Flex>
    </>
  );
}

export default TransactionList;
