import React from 'react';
import {
  Button,
  Flex,
  Grid,
  Select,
  Text,
  TextField,
  SegmentedControl,
  Popover,
} from '@radix-ui/themes';

import { MixerHorizontalIcon } from '@radix-ui/react-icons';

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
    <Popover.Root>
      <Popover.Trigger>
        <Button variant={hasActiveFilters ? "solid" : "soft"}>
          <MixerHorizontalIcon /> Filters
        </Button>
      </Popover.Trigger>
      <Popover.Content side="bottom" align="start" style={{ minWidth: 320, maxWidth: 400 }}>
        
        <Flex direction="column" gap="4">
          <Flex direction="column" gap="2">
            <Text size="2" color="gray">
              Type
            </Text>
            <SegmentedControl.Root
              value={filters.type || 'all'}
              onValueChange={(value) => updateValue('type', value === 'all' ? '' : value)}
            >
              <SegmentedControl.Item value="all">All</SegmentedControl.Item>
              <SegmentedControl.Item value="income">💰 Income</SegmentedControl.Item>
              <SegmentedControl.Item value="expense">💸 Expense</SegmentedControl.Item>
            </SegmentedControl.Root>
          </Flex>
          <Grid columns={{ initial: '1', sm: '2', md: '2' }} gap="4">

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

            {/* <Flex direction="column" gap="2">
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
            </Flex> */}
          </Grid>

          {hasActiveFilters && (
            <Flex justify="flex-end">
              <Button variant="soft" color="gray" onClick={handleReset}>
                Reset filters
              </Button>
            </Flex>
          )}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}

export default TransactionFilters;
