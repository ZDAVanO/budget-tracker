import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Callout,
  Card,
  Container,
  Dialog,
  Flex,
  Grid,
  Heading,
  IconButton,
  Section,
  SegmentedControl,
  Select,
  Tabs,
  Text,
  TextArea,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import api from '../services/api';
import TransactionFilters from '../components/TransactionFilters';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import { useCurrency } from '../contexts/CurrencyContext.jsx';

// Debounce hook
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// MARK: filterTransactions
function filterTransactions(transactions, { filters, selectedMonth, searchQuery }) {
  const debouncedQuery = searchQuery.trim().toLowerCase();
  if (debouncedQuery) {
    return transactions.filter(tx =>
      tx.title?.toLowerCase().includes(debouncedQuery) ||
      tx.description?.toLowerCase().includes(debouncedQuery) ||
      tx.amount?.toString().includes(debouncedQuery)
    );
  }
  return transactions.filter(tx => {
    const d = new Date(tx.date);
    // Month filter
    if (!(d.getFullYear() === selectedMonth.year && (d.getMonth() + 1) === selectedMonth.month)) return false;
    // Type filter (multi)
    if (filters.type && filters.type.length && !filters.type.includes(tx.type)) return false;
    // Category filter (multi)
    if (filters.category_id && filters.category_id.length && !filters.category_id.includes(String(tx.category_id))) return false;
    // Wallet filter (multi)
    if (filters.wallet_id && filters.wallet_id.length && !filters.wallet_id.includes(String(tx.wallet_id))) return false;
    // Date range
    if (filters.start_date && new Date(tx.date) < new Date(filters.start_date)) return false;
    if (filters.end_date && new Date(tx.date) > new Date(filters.end_date)) return false;
    return true;
  });
}

// MARK: calculateSummary
function calculateSummary(transactions, convert, baseCurrency) {
  return transactions.reduce(
    (acc, tx) => {
      const fromCur = tx.wallet?.currency || 'USD';
      const value = convert(tx.amount, fromCur, baseCurrency);
      if (tx.type === 'expense') acc.expense += value;
      else if (tx.type === 'income') acc.income += value;
      return acc;
    },
    { expense: 0, income: 0, balance: 0 }
  );
}

// MARK: getAvailableMonths
function getAvailableMonths(transactions) {
  if (!transactions.length) {
    const now = new Date();
    return [{ year: now.getFullYear(), month: now.getMonth() + 1 }];
  }
  let minDate = new Date();
  let maxTxDate = new Date(0);
  transactions.forEach(tx => {
    const d = new Date(tx.date);
    if (d < minDate) minDate = d;
    if (d > maxTxDate) maxTxDate = d;
  });
  minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const now = new Date();
  const maxDate = (maxTxDate > now)
    ? new Date(maxTxDate.getFullYear(), maxTxDate.getMonth(), 1)
    : new Date(now.getFullYear(), now.getMonth(), 1);

  const months = [];
  let cur = new Date(minDate);
  while (cur <= maxDate) {
    months.push({ year: cur.getFullYear(), month: cur.getMonth() + 1 });
    cur.setMonth(cur.getMonth() + 1);
  }
  return months.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
}

// MARK: useTransactionsData
function useTransactionsData() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAllTransactions = useCallback(async () => {
    try {
      const { response, data } = await api.transactions.getAll({});
      if (response.ok) {
        setAllTransactions(data);
      } else {
        setError('Error loading transactions');
      }
    } catch (error) {
      setError('❌ Error loading transactions');
      console.error(error);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const { response, data } = await api.categories.getAll();
      if (response.ok) {
        setCategories(data);
      } else {
        setError('Error loading categories');
      }
    } catch (error) {
      setError('❌ Error loading categories');
      console.error(error);
    }
  }, []);

  const loadWallets = useCallback(async () => {
    try {
      const { response, data } = await api.wallets.getAll();
      if (response.ok) {
        setWallets(data);
      } else {
        setError('Error loading wallets');
      }
    } catch (error) {
      setError('❌ Error loading wallets');
      console.error(error);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await Promise.all([
      loadAllTransactions(),
      loadCategories(),
      loadWallets(),
    ]);
    setIsLoading(false);
  }, [loadAllTransactions, loadCategories, loadWallets]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    allTransactions,
    categories,
    wallets,
    isLoading,
    error,
    reload: loadData,
    reloadTransactions: loadAllTransactions,
  };
}

// MARK: Transactions
function Transactions() {

  const {
    allTransactions,
    categories,
    wallets,
    isLoading,
    error,
    reloadTransactions,
  } = useTransactionsData();

  const [filters, setFilters] = useState({
    type: ['expense', 'income'],
    category_id: [],
    wallet_id: [],
    start_date: '',
    end_date: '',
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  // const [showFilters, setShowFilters] = useState(false);

  // State for selected month
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 }; // month: 1-12
  });

  // refs for auto-scroll Tabs
  const tabsListRef = useRef(null);
  const tabRefs = useRef({});

  const { baseCurrency, convert, format } = useCurrency();


  // Filter transactions by selected month and filters
  const filteredTransactions = filterTransactions(allTransactions, {
    filters,
    selectedMonth,
    searchQuery: debouncedSearchQuery,
  });

  // Summary
  const summaryObj = calculateSummary(filteredTransactions, convert, baseCurrency);
  summaryObj.balance = summaryObj.income - summaryObj.expense;
  const summary = summaryObj;

  // Available months
  const availableMonths = getAvailableMonths(allTransactions);
  const [tabValue, setTabValue] = useState(() => {
    const m = availableMonths.find(m => m.year === selectedMonth.year && m.month === selectedMonth.month);
    return m ? `${m.year}-${String(m.month).padStart(2, '0')}` : '';
  });


  // Get tab value for each month
  const getMonthTabValue = (m) => `${m.year}-${String(m.month).padStart(2, '0')}`;
  const availableTabValues = availableMonths.map(getMonthTabValue);


  // Sync selectedMonth <-> tabValue
  useEffect(() => {
    // Якщо selectedMonth змінився зовні (наприклад, після додавання транзакції)
    const newTabValue = getMonthTabValue(selectedMonth);
    if (tabValue !== newTabValue) setTabValue(newTabValue);
    // eslint-disable-next-line
  }, [selectedMonth]);
  useEffect(() => {
    // Якщо tabValue змінився (через Tabs)
    const idx = availableTabValues.indexOf(tabValue);
    if (idx !== -1) {
      setSelectedMonth(availableMonths[idx]);
    }
    // eslint-disable-next-line
  }, [tabValue, availableTabValues.join(',')]);

  // Auto-scroll Tabs.List to selected/current month tab
  useEffect(() => {
    let cancelled = false;
    const maxAttempts = 10;
    const delayMs = 40;

    function tryScroll(attempt = 0) {
      // console.log('tryScroll attempt:', attempt); 
      if (cancelled) return;
      const container = tabsListRef.current;
      const tab = tabRefs.current[tabValue];
      if (container && tab) {
        const offsetLeft = tab.offsetLeft - container.offsetLeft;
        const scrollTo = offsetLeft - (container.clientWidth / 2) + (tab.clientWidth / 2);
        container.scrollTo({ left: scrollTo, behavior: 'smooth' });
        return;
      }
      if (attempt < maxAttempts) {
        setTimeout(() => tryScroll(attempt + 1), delayMs);
      }
    }

    tryScroll(0);
    return () => { cancelled = true; };
  }, [tabValue, availableTabValues.length,]);

  // Re-center tab on window resize
  useEffect(() => {
    function handleResize() {
      if (!tabsListRef.current || !tabRefs.current[tabValue]) return;
      const container = tabsListRef.current;
      const tab = tabRefs.current[tabValue];
      const offsetLeft = tab.offsetLeft - container.offsetLeft;
      const scrollTo = offsetLeft - (container.clientWidth / 2) + (tab.clientWidth / 2);
      container.scrollTo({ left: scrollTo, behavior: 'auto' });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [tabValue, availableTabValues.length]);


  // MARK: handleFormOpenChange
  const handleFormOpenChange = (open) => {
    setIsFormOpen(open);
    if (!open) setEditingTransaction(null);
  };


  // MARK: handleCreateClick
  const handleCreateClick = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };


  // MARK: handleEdit
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };


  // MARK: confirmDelete
  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      const { response } = await api.transactions.delete(transactionToDelete.id);
      if (response.ok) {
        reloadTransactions(); // Reload list
        setIsFormOpen(false);
        setEditingTransaction(null);
      } else {
        alert('Error deleting transaction');
      }
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      alert('Error deleting transaction');
    } finally {
      setTransactionToDelete(null);
    }
  };

  if (error) {
    return (
      <Section size="3" className="p-4">
        <Container size="3">
          <Flex direction="column" gap="4">
            <Callout.Root color="red" style={{ marginBottom: 16 }}>
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          </Flex>
        </Container>
      </Section>
    );
  }

  // MARK: render
  return (
    <Section size="3" className="p-4">
      <Container size="3">
        <Flex direction="column" gap="4">

          {/* MARK: header */}
          <Flex align="center" justify="between" wrap="wrap" gap="3">
            
            <Flex direction="column" gap="1">
              <Heading size="7">
                Transactions
              </Heading>
              <Text color="gray">Manage all your transactions in one place.</Text>
            </Flex>

            <Flex align="center" gap="3">
              {/* Search field with clear button */}
              <TextField.Root
                placeholder="Search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                size="2"
                style={{ minWidth: 220 }}
              >
                {/* Clear button, shown if something is entered */}
                {searchQuery && (
                  <TextField.Slot pr="3" side="right">
                    <Tooltip content="Clear">
                      <IconButton
                        size="2"
                        variant="ghost"
                        color="gray"
                        onClick={() => setSearchQuery('')}
                        type="button"
                        aria-label="Clear search"
                      >
                        <Cross2Icon height="16" width="16" />
                      </IconButton>
                    </Tooltip>
                  </TextField.Slot>
                )}
              </TextField.Root>
              <TransactionFilters 
                filters={filters} 
                onFilterChange={setFilters} 
                categories={categories} 
                wallets={wallets} 
              />
            </Flex>

          </Flex>

          {/* Show Tabs and summary only if search is empty */}
            {!debouncedSearchQuery.trim() && !isLoading && (
              <>
                {/* MARK: month selector */}
                <Tabs.Root
                  value={tabValue}
                  onValueChange={setTabValue}
                  activationMode="manual"
                  style={{
                    width: '100%',
                    overflow: "hidden",
                  }}
                >
                  <Tabs.List
                    size="2"
                    ref={tabsListRef}
                    style={{
                      display: "flex",
                      flexWrap: "nowrap",
                      overflowX: "auto",
                      overflowY: "hidden",
                      width: "100%",
                    }}
                  >
                    {availableMonths.map((m) => {
                      const value = getMonthTabValue(m);
                      const now = new Date();
                      const isCurrentMonth = m.year === now.getFullYear() && m.month === (now.getMonth() + 1);
                      const isCurrentYear = m.year === now.getFullYear();
                      return (
                        <Tabs.Trigger
                          key={value}
                          value={value}
                          ref={el => { tabRefs.current[value] = el; }}
                          style={{
                            minWidth: 70,
                            flex: "0 0 auto",
                          }}
                        >
                          <span style={isCurrentMonth ? { color: "var(--accent-11)", fontWeight: "bold" } : undefined}>
                            {new Date(m.year, m.month - 1, 1).toLocaleString('en-US', { month: 'short' })}
                          </span>
                        
                          {!isCurrentYear && (
                            <span style={{ fontSize: 10, marginLeft: 2 }}>
                              {String(m.year).slice(2)}
                            </span>
                          )}
                        </Tabs.Trigger>
                      );
                    })}
                  </Tabs.List>
                </Tabs.Root>

                {/* MARK: summary bar */}
                <Card variant="surface" size="1">
                  <div className="flex flex-row items-center justify-around gap-6">
                    <Flex direction="row" align="center" gap="1">
                      <Text color="red">-</Text>
                      <Text color="red">{format(summary.expense, baseCurrency)}</Text>
                    </Flex>
                    <Flex direction="row" align="center" gap="1">
                      <Text color="green">+</Text>
                      <Text color="green">{format(summary.income, baseCurrency)}</Text>
                    </Flex>
                    <Flex direction="row" align="center" gap="1">
                      <Text>=</Text>
                      <Text color={summary.balance >= 0 ? "green" : "red"}>{format(summary.balance, baseCurrency)}</Text>
                    </Flex>
                  </div>
                </Card>
              </>
            )}

          {/* MARK: list */}
          <Flex direction="column" gap="4">
            {debouncedSearchQuery.trim() && (
              <Text size="3" color="gray">
                Found {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} matching "{debouncedSearchQuery.trim()}"
              </Text>
            )}
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEdit}
              onDelete={() => {}}
              isLoading={isLoading}
            />


            <Flex direction="column" justify="center" align="center" mt="2" gap="3" style={{ height: 120 }}>
              <Text size="5" className="show-on-mobile">
                Total cash flow:&nbsp;
                <span>
                  {format(summary.balance, baseCurrency)}
                </span>
              </Text>
              {/* Badge with transaction count */}
              <Badge color="gray" className="show-on-mobile">
                {filteredTransactions.length} transactions
              </Badge>
            </Flex>

          </Flex>

          {/* MARK: delete dialog */}
          <Dialog.Root open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
            <Dialog.Content maxWidth="400px">
              <Flex direction="column" gap="4">
                <Dialog.Title asChild>
                  <Heading size="5">Delete transaction?</Heading>
                </Dialog.Title>
                <Text>
                  Are you sure you want to delete the transaction 
                  <b> {transactionToDelete?.title}</b>? This action cannot be undone.
                </Text>
                <Flex gap="3" justify="end">
                  <Button variant="soft" color="gray" onClick={() => setTransactionToDelete(null)}>
                    Cancel
                  </Button>
                  <Button color="red" onClick={confirmDelete}>
                    Delete
                  </Button>
                </Flex>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>

          {/* Fixed Add transaction button in bottom right corner */}
          <Tooltip content="Add Transaction">
            <Button
              size="3"
              radius="large"
              className="add-transaction-btn"
              style={{
                boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
                position: 'fixed',
                right: 16,
                bottom: 32,
                zIndex: 100,
                width: 72,
                height: 72,
                fontSize: 30,
              }}
              onClick={handleCreateClick}
            >
              +
            </Button>
          </Tooltip>

          {/* TransactionForm dialog */}
          <TransactionForm
            open={isFormOpen}
            onOpenChange={handleFormOpenChange}
            transaction={editingTransaction}
            categories={categories}
            wallets={wallets}
            onSave={async (payload, isEdit) => {
              let result;
              if (isEdit) {
                result = await api.transactions.update(editingTransaction.id, payload);
              } else {
                result = await api.transactions.create(payload);
              }
              if (result.response.ok) {
                setIsFormOpen(false);
                setEditingTransaction(null);
                reloadTransactions();
                return { success: true };
              }
              return { success: false, error: result.data?.msg || 'Error saving' };
            }}
            onDeleteRequest={() => setTransactionToDelete(editingTransaction)}
          />

        </Flex>
      </Container>
    </Section>
  );
}

export default Transactions;
