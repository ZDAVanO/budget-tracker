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


import { Checkbox } from '@radix-ui/themes';

function TransactionFilters({
  filters,
  onFilterChange,
  categories = [],
  wallets = [],
}) {
  // Multi-select for categories and wallets
  const selectedTypes = filters.type && Array.isArray(filters.type)
    ? filters.type
    : filters.type
      ? [filters.type]
      : ['expense', 'income'];
  const selectedCategoryIds = filters.category_id && Array.isArray(filters.category_id)
    ? filters.category_id
    : filters.category_id
      ? [filters.category_id]
      : [];
  const selectedWalletIds = filters.wallet_id && Array.isArray(filters.wallet_id)
    ? filters.wallet_id
    : filters.wallet_id
      ? [filters.wallet_id]
      : [];

  const updateType = (value) => {
    if (value === 'all') onFilterChange({ ...filters, type: ['expense', 'income'] });
    else onFilterChange({ ...filters, type: [value] });
  };
  const toggleCategory = (id) => {
    const ids = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((c) => c !== id)
      : [...selectedCategoryIds, id];
    onFilterChange({ ...filters, category_id: ids });
  };
  const toggleWallet = (id) => {
    const ids = selectedWalletIds.includes(id)
      ? selectedWalletIds.filter((w) => w !== id)
      : [...selectedWalletIds, id];
    onFilterChange({ ...filters, wallet_id: ids });
  };
  const updateValue = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };
  const handleReset = () => {
    onFilterChange({
      type: ['expense', 'income'],
      category_id: [],
      wallet_id: [],
      start_date: '',
      end_date: '',
    });
  };
  const hasActiveFilters =
    selectedTypes.length !== 2 ||
    selectedCategoryIds.length > 0 ||
    selectedWalletIds.length > 0 ||
    filters.start_date ||
    filters.end_date;

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant={hasActiveFilters ? 'solid' : 'soft'}>
          <MixerHorizontalIcon /> Filters
        </Button>
      </Popover.Trigger>
      <Popover.Content side="bottom" align="start" style={{ minWidth: 340, maxWidth: 480 }}>
        <Flex direction="column" gap="4">
          <Flex direction="column" gap="2">
            <Text size="2" color="gray">
              Type
            </Text>
            <SegmentedControl.Root
              value={
                selectedTypes.length === 2
                  ? 'all'
                  : selectedTypes[0] || 'all'
              }
              onValueChange={updateType}
            >
              <SegmentedControl.Item value="all">All</SegmentedControl.Item>
              <SegmentedControl.Item value="income">💰 Income</SegmentedControl.Item>
              <SegmentedControl.Item value="expense">💸 Expense</SegmentedControl.Item>
            </SegmentedControl.Root>
          </Flex>
          <Flex direction="row" gap="4">
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
          </Flex>
          <Grid columns={{ initial: '1', md: '2' }} gap="4">
            <Flex direction="column" gap="2">
              <Text weight="bold">Categories</Text>
              <div className="mt-2 max-h-50 overflow-auto pr-2">
                <Flex direction="column" gap="2">
                  {categories.map(cat => {
                    const id = String(cat.id);
                    return (
                      <label key={id} className="flex items-center gap-2">
                        <Checkbox checked={selectedCategoryIds.includes(id)} onCheckedChange={() => toggleCategory(id)} />
                        <Text>{cat.icon ? `${cat.icon} ` : ''}{cat.name}</Text>
                      </label>
                    );
                  })}
                </Flex>
              </div>
            </Flex>
            <Flex direction="column" gap="2">
              <Text weight="bold">Wallets</Text>
              <div className="mt-2 max-h-50 overflow-auto pr-2">
                <Flex direction="column" gap="2">
                  {wallets.map(w => {
                    const id = String(w.id);
                    return (
                      <label key={id} className="flex items-center gap-2">
                        <Checkbox checked={selectedWalletIds.includes(id)} onCheckedChange={() => toggleWallet(id)} />
                        <Text>{w.icon ? `${w.icon} ` : ''}{w.name} <span className="text-gray-500">({w.currency})</span></Text>
                      </label>
                    );
                  })}
                </Flex>
              </div>
            </Flex>
          </Grid>
          {hasActiveFilters && (
            <Flex justify="flex-end">
              <Button variant="soft" color="gray" size="2" onClick={handleReset}>
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
