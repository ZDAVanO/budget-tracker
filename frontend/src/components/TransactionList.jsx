import React from 'react';
import { Badge, Box, Button, Card, Callout, Flex, Spinner, Text } from '@radix-ui/themes';
import { Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';


function TransactionList({ transactions, onEdit, onDelete, isLoading }) {
  const emptyMessage = '📭 No transactions yet';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Add full date and time formatting
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
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

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <Flex direction="column" gap="3">
      {sortedTransactions.map((transaction) => {
        const isExpense = transaction.type === 'expense';
        const icon = isExpense ? '💸' : '💰';

        return (
          <Card key={`${transaction.type}-${transaction.id}`} variant="surface" size="2">
            <Flex align="start" justify="between" gap="4">
              <Flex align="start" gap="3">
                <Box
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'var(--color-panel-solid)',
                  }}
                >
                  <Text size="5">{transaction.category?.icon || icon}</Text>
                </Box>

                <Flex direction="column" gap="1">
                  <Flex align="center" gap="2" wrap="wrap">
                    <Text as="div" weight="medium">{transaction.title}</Text>
                    <Badge color={isExpense ? 'tomato' : 'jade'} variant="soft">
                      {isExpense ? 'Expense' : 'Income'}
                    </Badge>
                  </Flex>

                  <Flex align="center" gap="2" wrap="wrap">
                    <Text size="2" color="gray">{formatDate(transaction.date)}</Text>
                    {/* Add exact date and time */}
                    <Text size="2" color="gray" style={{ fontStyle: 'italic' }} title="Exact date and time">
                      ({formatDateTime(transaction.date)})
                    </Text>
                    {transaction.category && (
                      <>
                        <Text size="2" color="gray">•</Text>
                        <Text size="2" color="gray">{transaction.category.name}</Text>
                      </>
                    )}
                    {transaction.wallet && (
                      <>
                        <Text size="2" color="gray">•</Text>
                        <Text size="2" color="gray">{transaction.wallet.icon} {transaction.wallet.name}</Text>
                      </>
                    )}
                  </Flex>

                  {transaction.description && (
                    <Text size="2" color="gray">{transaction.description}</Text>
                  )}
                </Flex>
              </Flex>

              <Flex align="end" direction="column" gap="2">
                <Text weight="bold" color={isExpense ? 'tomato' : 'jade'}>
                  {isExpense ? '-' : '+'} {formatAmount(transaction.amount)} ₴
                </Text>
                <Flex gap="2">
                  <Button size="2" variant="soft" color="gray" onClick={() => onEdit(transaction)}>
                    <Pencil2Icon />
                  </Button>
                  <Button size="2" variant="soft" color="red" onClick={() => onDelete(transaction)}>
                    <TrashIcon />
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Card>
        );
      })}
    </Flex>
  );
}

export default TransactionList;
