import React from 'react';
import {
  Button,
  Flex,
  Grid,
  Select,
  Text,
  TextField,
} from '@radix-ui/themes';

function TransactionFilters({ filters, onFilterChange, categories, wallets = [] }) {
  const updateValue = (name, value) => {
    onFilterChange({ ...filters, [name]: value });
  };

  const handleReset = () => {
    onFilterChange({
      category_id: '',
      wallet_id: '',
      type: '',
      start_date: '',
      end_date: '',
    });
  };

  const hasActiveFilters =
    filters.category_id || filters.wallet_id || filters.type || filters.start_date || filters.end_date;

  return (
    <Flex direction="column" gap="4">
      <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            Type
          </Text>
          <Select.Root
            value={filters.type || 'all'}
            onValueChange={(value) => updateValue('type', value === 'all' ? '' : value)}
          >
            <Select.Trigger placeholder="All transactions" />
            <Select.Content>
              <Select.Item value="all">All transactions</Select.Item>
              <Select.Item value="income">💰 Income</Select.Item>
              <Select.Item value="expense">💸 Expense</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            Category
          </Text>
          <Select.Root
            value={filters.category_id?.toString() || 'all'}
            onValueChange={(value) => updateValue('category_id', value === 'all' ? '' : value)}
          >
            <Select.Trigger placeholder="All categories" />
            <Select.Content>
              <Select.Item value="all">All categories</Select.Item>
              {categories.map((cat) => (
                <Select.Item key={cat.id} value={cat.id?.toString()}>
                  {cat.icon} {cat.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            Wallet
          </Text>
          <Select.Root
            value={filters.wallet_id?.toString() || 'all'}
            onValueChange={(value) => updateValue('wallet_id', value === 'all' ? '' : value)}
          >
            <Select.Trigger placeholder="All wallets" />
            <Select.Content>
              <Select.Item value="all">All wallets</Select.Item>
              {wallets.map((wallet) => (
                <Select.Item key={wallet.id} value={wallet.id?.toString()}>
                  {wallet.icon} {wallet.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            From date
          </Text>
          <TextField.Root
            type="date"
            value={filters.start_date}
            onChange={(event) => updateValue('start_date', event.target.value)}
          />
        </Flex>

        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            To date
          </Text>
          <TextField.Root
            type="date"
            value={filters.end_date}
            onChange={(event) => updateValue('end_date', event.target.value)}
          />
        </Flex>
      </Grid>

      {hasActiveFilters && (
        <Flex justify="flex-end">
          <Button variant="soft" color="gray" onClick={handleReset}>
            Reset filters
          </Button>
        </Flex>
      )}
    </Flex>
  );
}

export default TransactionFilters;
