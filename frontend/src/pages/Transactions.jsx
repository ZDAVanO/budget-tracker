import React, { useCallback, useEffect, useRef, useState } from 'react';

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
import { Cross2Icon, MixerHorizontalIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import api from '../services/api';
import TransactionFilters from '../components/TransactionFilters';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';


// MARK: Transactions
function Transactions() {

  const [allTransactions, setAllTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  // const [filters] = useState({ 
  const [filters, setFilters] = useState({ 
    category_id: '', 
    wallet_id: '',
    type: '', // 'expense', 'income', або ''
    start_date: '', 
    end_date: '' 
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // const [showFilters, setShowFilters] = useState(false);

  // Додаємо стан для вибраного місяця
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 }; // month: 1-12
  });

  // refs for auto-scroll Tabs
  const tabsListRef = useRef(null);
  const tabRefs = useRef({});


  // MARK: loadAllTransactions
  // Завантажуємо всі транзакції без фільтрів для місячної смуги
  const loadAllTransactions = useCallback(async () => {
    try {
      const { response, data } = await api.transactions.getAll({});
      if (response.ok) {
        setAllTransactions(data);
      }
    } catch (error) {
      console.error('❌ Error loading all transactions:', error);
    }
  }, []);


  // MARK: loadCategories
  const loadCategories = useCallback(async () => {
    try {
      const { response, data } = await api.categories.getAll();
      if (response.ok) {
        setCategories(data);
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
    }
  }, []);


  // MARK: loadWallets
  const loadWallets = useCallback(async () => {
    try {
      const { response, data } = await api.wallets.getAll();
      if (response.ok) {
        setWallets(data);
      }
    } catch (error) {
      console.error('❌ Error loading wallets:', error);
    }
  }, []);


  // MARK: loadData
  const loadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      loadAllTransactions(),
      loadCategories(),
      loadWallets(),
    ]);
    setIsLoading(false);
  }, [loadAllTransactions, loadCategories, loadWallets]);

  
  // MARK: useEffect
  useEffect(() => {
    loadData();
  }, [loadData]);


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
        // loadTransactions();
        loadAllTransactions(); // Оновлюємо всі транзакції
        setIsFormOpen(false); // Закриваємо форму після видалення
        setEditingTransaction(null); // Скидаємо редаговану транзакцію
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


  // Допоміжна функція для отримання діапазону місяців від найстарішої до найновішої транзакції (включно з майбутніми)
  const getAvailableMonths = () => {
    if (!allTransactions.length) return []; // <--- використовуємо allTransactions
    // Знаходимо найстарішу та найновішу дату серед транзакцій
    let minDate = new Date();
    let maxDate = new Date(0);
    allTransactions.forEach(tx => {
      const d = new Date(tx.date);
      if (d < minDate) minDate = d;
      if (d > maxDate) maxDate = d;
    });
    // Початок: перше число найстарішого місяця
    minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    // Кінець: перше число місяця після найновішої транзакції
    maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    const months = [];
    let cur = new Date(minDate);
    while (cur <= maxDate) {
      months.push({ year: cur.getFullYear(), month: cur.getMonth() + 1 });
      cur.setMonth(cur.getMonth() + 1);
    }
    // Сортуємо від старих до нових (зліва - старі, справа - нові)
    return months.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  };

  // Фільтруємо транзакції за вибраним місяцем
  const filteredTransactions = searchQuery.trim()
    ? allTransactions.filter(tx => {
        const q = searchQuery.trim().toLowerCase();
        return (
          tx.title?.toLowerCase().includes(q) ||
          tx.description?.toLowerCase().includes(q) ||
          tx.amount?.toString().includes(q)
        );
      })
    : allTransactions.filter(tx => {
        const d = new Date(tx.date);
        return d.getFullYear() === selectedMonth.year && (d.getMonth() + 1) === selectedMonth.month
          // додаткові фільтри, якщо потрібно
          && (!filters.category_id || tx.category_id === Number(filters.category_id))
          && (!filters.wallet_id || tx.wallet_id === Number(filters.wallet_id))
          && (!filters.type || tx.type === filters.type)
          && (!filters.start_date || new Date(tx.date) >= new Date(filters.start_date))
          && (!filters.end_date || new Date(tx.date) <= new Date(filters.end_date));
      });

  // summary для вибраного місяця або для пошуку
  const summary = filteredTransactions.reduce(
    (acc, tx) => {
      if (tx.type === 'expense') acc.expense += tx.amount;
      else if (tx.type === 'income') acc.income += tx.amount;
      return acc;
    },
    { expense: 0, income: 0 }
  );
  summary.balance = summary.income - summary.expense;

  // Для перемикання місяців
  const availableMonths = getAvailableMonths();
  const [tabValue, setTabValue] = useState(() => {
    const m = availableMonths.find(m => m.year === selectedMonth.year && m.month === selectedMonth.month);
    return m ? `${m.year}-${String(m.month).padStart(2, '0')}` : '';
  });


  // Для Tabs: значення для кожного місяця
  const getMonthTabValue = (m) => `${m.year}-${String(m.month).padStart(2, '0')}`;
  // Якщо selectedMonth не входить у availableMonths, вибираємо останній (найновіший)
  // const selectedTabValue = getMonthTabValue(selectedMonth);
  const availableTabValues = availableMonths.map(getMonthTabValue);


  // Синхронізуємо selectedMonth <-> tabValue
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
    if (!tabsListRef.current || !tabRefs.current[tabValue]) return;
    // Scroll so that the selected/current tab is visible (centered if possible)
    tabRefs.current[tabValue].scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
    // eslint-disable-next-line
  }, [availableTabValues.length]);


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
              {/* Поле пошуку з кнопкою очистити справа */}
              <TextField.Root
                placeholder="Search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                size="2"
                style={{ minWidth: 220 }}
              >
                {/* Кнопка очистити справа, показується якщо щось введено */}
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

          {/* Показуємо Tabs та summary тільки якщо пошук порожній */}
            {!searchQuery.trim() && !isLoading && (
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
                      // scrollbarWidth: "thin",
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
                      <Text color="red">{summary.expense.toFixed(2)}</Text>
                    </Flex>
                    <Flex direction="row" align="center" gap="1">
                      <Text color="green">+</Text>
                      <Text color="green">{summary.income.toFixed(2)}</Text>
                    </Flex>
                    <Flex direction="row" align="center" gap="1">
                      <Text>=</Text>
                      <Text color={summary.balance >= 0 ? "green" : "red"}>{summary.balance.toFixed(2)}</Text>
                    </Flex>
                  </div>
                </Card>
              </>
            )}

          {/* MARK: list */}
          <Flex direction="column" gap="4">
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
                  {summary.balance.toFixed(2)}
                </span>
              </Text>
              {/* Badge з кількістю транзакцій */}
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

          {/* Фіксована кнопка Add transaction у правому нижньому куті */}
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
                loadAllTransactions();
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
