import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Section,
  Spinner,
  Text,
  Separator,
  Checkbox,
  TextField,
  Popover,
  SegmentedControl,
} from '@radix-ui/themes';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import DonutPieChart from '../components/DonutPieChart';
import NetWorthChart from '../components/NetWorthChart';
import api from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext.jsx';

// Shared colors for charts
const CHART_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#B4FF9F', '#FFB4B4', '#B4D4FF', '#FFD6A5',
  '#CDB4DB', '#F1C0E8', '#A3C4F3', '#B5EAD7', '#E2F0CB', '#FFB7B2', '#FFDAC1', '#B5EAD7', '#C7CEEA', '#E2F0CB'
];

// MARK: Spending (All Spending)
function Spending() {
  // MARK: state
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);

  // MARK: filters
  const [selectedTypes, setSelectedTypes] = useState(['expense', 'income']);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); // strings
  const [selectedWalletIds, setSelectedWalletIds] = useState([]); // strings
  const [startDate, setStartDate] = useState(''); // yyyy-mm-dd
  const [endDate, setEndDate] = useState('');

  const { baseCurrency, convert, format } = useCurrency();


  // MARK: loadTransactions
  const loadTransactions = useCallback(async () => {
    try {
      const { response, data } = await api.transactions.getAll();
      if (response.ok) setTransactions(data || []);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  }, []);


    // MARK: loadCategories
  const loadCategories = useCallback(async () => {
    try {
      const { response, data } = await api.categories.getAll();
      if (response.ok) setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }, []);


    // MARK: loadWallets
  const loadWallets = useCallback(async () => {
    try {
      const { response, data } = await api.wallets.getAll();
      if (response.ok) setWallets(data || []);
    } catch (err) {
      console.error('Error loading wallets:', err);
    }
  }, []);


  // MARK: useEffect
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        await Promise.all([loadTransactions(), loadCategories(), loadWallets()]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [loadTransactions, loadCategories, loadWallets]);


  // MARK: filtered
  const filtered = useMemo(() => {
    return (transactions || []).filter(t => {
      // Types
      if (selectedTypes.length && !selectedTypes.includes(t.type)) return false;

      // Categories (handle nested or id fields)
      if (selectedCategoryIds.length) {
        const catId = String(t.category?.id ?? t.category_id ?? '');
        if (!selectedCategoryIds.includes(catId)) return false;
      }

      // Wallets
      if (selectedWalletIds.length) {
        const walId = String(t.wallet?.id ?? t.wallet_id ?? '');
        if (!selectedWalletIds.includes(walId)) return false;
      }

      // Dates (t.date expected ISO or YYYY-MM-DD)
      if (startDate) {
        const d = new Date(t.date);
        const s = new Date(startDate);
        s.setHours(0,0,0,0);
        if (d < s) return false;
      }
      if (endDate) {
        const d = new Date(t.date);
        const e = new Date(endDate);
        e.setHours(23,59,59,999);
        if (d > e) return false;
      }
      return true;
    });
  }, [transactions, selectedTypes, selectedCategoryIds, selectedWalletIds, startDate, endDate]);


  // MARK: totals
  const totals = useMemo(() => {
    let expenses = 0;
    let incomes = 0;
    let expenseCount = 0;
    let incomeCount = 0;
    for (const t of filtered) {
      const fromCur = t.wallet?.currency || 'UAH';
      const amt = convert(Number(t.amount) || 0, fromCur, baseCurrency);
      if (t.type === 'expense') {
        expenses += amt;
        expenseCount += 1;
      } else if (t.type === 'income') {
        incomes += amt;
        incomeCount += 1;
      }
    }
    return {
      expenses: Number(expenses.toFixed(2)),
      incomes: Number(incomes.toFixed(2)),
      balance: Number((incomes - expenses).toFixed(2)),
      expenseCount,
      incomeCount,
      totalCount: filtered.length,
    };
  }, [filtered, convert, baseCurrency]);


  // MARK: buildCategoryPie
  const buildCategoryPie = useCallback((type) => {
    const items = filtered.filter(t => t.type === type);
    const map = {};
    for (const t of items) {
      const id = String(t.category?.id ?? t.category_id ?? 'uncat');
      const name = t.category?.name || 'No category';
      const icon = t.category?.icon || '';
      const fromCur = t.wallet?.currency || 'UAH';
      const amt = convert(Number(t.amount) || 0, fromCur, baseCurrency);
      if (!map[id]) map[id] = { name, icon, amount: 0 };
      map[id].amount += amt;
    }
    const labels = Object.values(map).map(cat => `${cat.icon ? cat.icon + ' ' : ''}${cat.name}`);
    const data = Object.values(map).map(cat => Number(cat.amount.toFixed(2)));
    const colors = CHART_COLORS.slice(0, data.length);
    return { labels, data, colors };
  }, [filtered, convert, baseCurrency]);

  const expensePie = buildCategoryPie('expense');
  const incomePie = buildCategoryPie('income');

  
  // MARK: computeNetWorthSeries (net worth series)
  const computeNetWorthSeries = useCallback((txList) => {
    if (!txList || txList.length === 0) return { labels: [], data: [] };
    const tx = txList
      .map(t => ({ ...t, date: new Date(t.date) }))
      .sort((a, b) => a.date - b.date);
    const start = new Date(tx[0].date);
    const end = new Date(tx[tx.length - 1].date);
    // day key helper
    const dayKey = (d) => d.toISOString().slice(0, 10);
    const sumsByDay = {};
    tx.forEach(t => {
      const key = dayKey(t.date);
      const sign = t.type === 'expense' ? -1 : 1;
      const fromCur = t.wallet?.currency || 'UAH';
      const amt = convert(Number(t.amount) || 0, fromCur, baseCurrency);
      sumsByDay[key] = (sumsByDay[key] || 0) + sign * amt;
    });
    const labels = [];
    const data = [];
    let current = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = dayKey(d);
      current += sumsByDay[key] || 0;
      labels.push(new Date(d).toLocaleDateString('uk-UA'));
      data.push(Number(current.toFixed(2)));
    }
    return { labels, data };
  }, [convert, baseCurrency]);

  const netWorthSeries = useMemo(() => computeNetWorthSeries(filtered), [filtered, computeNetWorthSeries]);


  // MARK: filter handlers
//   const toggleType = (type) => {
//     setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
//   };
  const toggleCategory = (id) => {
    setSelectedCategoryIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };
  const toggleWallet = (id) => {
    setSelectedWalletIds(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  };
  const resetFilters = () => {
    setSelectedTypes(['expense', 'income']);
    setSelectedCategoryIds([]);
    setSelectedWalletIds([]);
    setStartDate('');
    setEndDate('');
  };


  // MARK: handleTypeSegmented
  const handleTypeSegmented = (value) => {
    if (value === 'all') setSelectedTypes(['expense', 'income']);
    else setSelectedTypes([value]);
  };

  
  // MARK: filter values object
  const filters = {
    start_date: startDate,
    end_date: endDate,
    // ...other filters if needed...
  };


  // MARK: updateValue
  const updateValue = (field, value) => {
    if (field === 'start_date') setStartDate(value);
    if (field === 'end_date') setEndDate(value);
  };


  // MARK: hasActiveFilters
  const hasActiveFilters =
    selectedTypes.length !== 2 ||
    selectedCategoryIds.length > 0 ||
    selectedWalletIds.length > 0 ||
    startDate ||
    endDate;

  // MARK: render
  return (
    <Section size="3" className="p-4">
      <Container size="3">
        <Flex direction="column" gap="5">
          {/* MARK: header row with title and filters button */}
          <Flex align="center" justify="between" wrap="wrap" gap="3">
            <Heading size="7">All Spending</Heading>
            <Popover.Root>
              <Popover.Trigger>
                <Button variant={hasActiveFilters ? "solid" : "soft"}>
                  <MixerHorizontalIcon /> Filters
                </Button>
              </Popover.Trigger>
              <Popover.Content side="bottom" align="end" style={{ minWidth: 340, maxWidth: 480 }}>
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
                      onValueChange={handleTypeSegmented}
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
                      <Button variant="soft" color="gray" size="2" onClick={resetFilters}>
                        Reset filters
                      </Button>
                    </Flex>
                  )}
                </Flex>
              </Popover.Content>
            </Popover.Root>
          </Flex>

          {/* MARK: summary cards */}
          <Grid columns={{ initial: '1', md: '3' }} gap="4">
            <Card variant="surface" size="3">
              <Flex direction="column" gap="1" align="center">
                <Heading size="5">Expense</Heading>
                {loading ? <Spinner /> : <Heading color="tomato" size="7">{format(totals.expenses, baseCurrency)}</Heading>}
                <Text color="gray" size="2">{totals.expenseCount} transactions</Text>
              </Flex>
            </Card>
            <Card variant="surface" size="3">
              <Flex direction="column" gap="1" align="center">
                <Heading size="5">Income</Heading>
                {loading ? <Spinner /> : <Heading color="mint" size="7">{format(totals.incomes, baseCurrency)}</Heading>}
                <Text color="gray" size="2">{totals.incomeCount} transactions</Text>
              </Flex>
            </Card>
            <Card variant="surface" size="3">
              <Flex direction="column" gap="1" align="center">
                <Heading size="5">Balance</Heading>
                {loading ? <Spinner /> : (
                  <Heading color={totals.balance >= 0 ? 'jade' : 'tomato'} size="7">
                    {format(totals.balance, baseCurrency)}
                  </Heading>
                )}
                <Text color="gray" size="2">{totals.totalCount} transactions</Text>
              </Flex>
            </Card>
          </Grid>

          {/* MARK: net worth series */}
          <Card variant="surface" size="3">
            <Flex direction="column" gap="3">
              <Heading size="5" align="center">Net Worth Over Time</Heading>
              {loading ? (
                <Flex align="center" justify="center" style={{ minHeight: 240 }}><Spinner /></Flex>
              ) : netWorthSeries.data.length ? (
                <NetWorthChart labels={netWorthSeries.labels} data={netWorthSeries.data} color="#6C5CE7" title={null} currency={baseCurrency} />
              ) : (
                <Text align="center" color="gray">No transactions for the selected period</Text>
              )}
            </Flex>
          </Card>

          {/* MARK: charts */}
          <Grid columns={{ initial: '1', md: '2' }} gap="5">
            <Card variant="surface" size="3">
              <Flex direction="column" gap="3">
                <Heading size="5" align="center">Expenses by Category</Heading>
                {loading ? (
                  <Flex align="center" justify="center" style={{ minHeight: 200 }}><Spinner /></Flex>
                ) : expensePie.data.length ? (
                  <DonutPieChart data={expensePie.data} labels={expensePie.labels} colors={expensePie.colors} title={null} />
                ) : (
                  <Text align="center" color="gray">No expenses for selected filters</Text>
                )}
              </Flex>
            </Card>

            <Card variant="surface" size="3">
              <Flex direction="column" gap="3">
                <Heading size="5" align="center">Income by Category</Heading>
                {loading ? (
                  <Flex align="center" justify="center" style={{ minHeight: 200 }}><Spinner /></Flex>
                ) : incomePie.data.length ? (
                  <DonutPieChart data={incomePie.data} labels={incomePie.labels} colors={incomePie.colors} title={null} />
                ) : (
                  <Text align="center" color="gray">No income for selected filters</Text>
                )}
              </Flex>
            </Card>
          </Grid>

          
        </Flex>
      </Container>
    </Section>
  );
}

export default Spending;