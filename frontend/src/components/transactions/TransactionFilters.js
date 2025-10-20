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
            Тип
          </Text>
          <Select.Root
            value={filters.type || 'all'}
            onValueChange={(value) => updateValue('type', value === 'all' ? '' : value)}
          >
            <Select.Trigger placeholder="Всі транзакції" />
            <Select.Content>
              <Select.Item value="all">Всі транзакції</Select.Item>
              <Select.Item value="income">💰 Доходи</Select.Item>
              <Select.Item value="expense">💸 Витрати</Select.Item>
            </Select.Content>
          </Select.Root>
        </Flex>

        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            Категорія
          </Text>
          <Select.Root
            value={filters.category_id?.toString() || 'all'}
            onValueChange={(value) => updateValue('category_id', value === 'all' ? '' : value)}
          >
            <Select.Trigger placeholder="Всі категорії" />
            <Select.Content>
              <Select.Item value="all">Всі категорії</Select.Item>
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
            Гаманець
          </Text>
          <Select.Root
            value={filters.wallet_id?.toString() || 'all'}
            onValueChange={(value) => updateValue('wallet_id', value === 'all' ? '' : value)}
          >
            <Select.Trigger placeholder="Всі гаманці" />
            <Select.Content>
              <Select.Item value="all">Всі гаманці</Select.Item>
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
            Від дати
          </Text>
          <TextField.Root
            type="date"
            value={filters.start_date}
            onChange={(event) => updateValue('start_date', event.target.value)}
          />
        </Flex>

        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            До дати
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
            Скинути фільтри
          </Button>
        </Flex>
      )}
    </Flex>
  );
}

export default TransactionFilters;
