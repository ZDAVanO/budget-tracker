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
} from '@radix-ui/themes';
import { Cross2Icon, MixerHorizontalIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import api from '../services/api';
import TransactionFilters from '../components/TransactionFilters';
import TransactionList from '../components/TransactionList';


// MARK: getCurrentLocalDateTime
// функція для отримання локальної дати та часу у форматі YYYY-MM-DDTHH:MM
function getCurrentLocalDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


// MARK: Transactions
function Transactions() {

  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // <--- Додаємо стан для всіх транзакцій
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
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    datetime: getCurrentLocalDateTime(),
    title: '',
    description: '',
    category_id: '',
    wallet_id: '',
  });
  const [error, setError] = useState('');

  // Додаємо стан для вибраного місяця
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 }; // month: 1-12
  });

  // refs for auto-scroll Tabs
  const tabsListRef = useRef(null);
  const tabRefs = useRef({});



  // MARK: loadTransactions
  const loadTransactions = useCallback(async () => {
    try {
      const { response, data } = await api.transactions.getAll(filters);
      if (response.ok) {
        setTransactions(data);
        console.log('📄 Loaded transactions:', data);
      }
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
    }
  }, [filters]);


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
      loadTransactions(),
      loadCategories(),
      loadWallets(),
      loadAllTransactions(), // <--- Додаємо завантаження всіх транзакцій
    ]);
    setIsLoading(false);
  }, [loadTransactions, loadCategories, loadWallets, loadAllTransactions]);

  
  // MARK: useEffect
  useEffect(() => {
    loadData();
  }, [loadData]);


  // MARK: useEffect for form
  useEffect(() => {
    if (editingTransaction) {
      // Режим редагування - заповнюємо дані з транзакції
      let datetimeValue = getCurrentLocalDateTime();
      
      if (editingTransaction.date) {
        const dateObj = new Date(editingTransaction.date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        datetimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
      }
      
      setFormData({
        type: editingTransaction.type || 'expense',
        amount: editingTransaction.amount?.toString() || '',
        datetime: datetimeValue,
        title: editingTransaction.title || '',
        description: editingTransaction.description || '',
        category_id: editingTransaction.category_id?.toString() || '',
        wallet_id: editingTransaction.wallet_id?.toString() || '',
      });

    } else {
      // Режим створення - автоматично вибираємо перший гаманець
      if (wallets.length > 0 && !formData.wallet_id) {
        setFormData(prev => ({
          ...prev,
          wallet_id: wallets[0].id.toString()
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTransaction, wallets]);


  // MARK: updateField
  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  // MARK: handleSubmit
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      // Перевірка: категорія обов'язкова
      if (!formData.category_id) {
        setError('Category is required');
        return;
      }
      // Формуємо дату та час у форматі з секундами
      const dateTime = `${formData.datetime}:00`;

      const payload = {
        type: formData.type,
        amount: parseFloat(formData.amount || '0'),
        date: dateTime,
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        wallet_id: formData.wallet_id ? parseInt(formData.wallet_id, 10) : null,
      };

      let result;

      if (editingTransaction) {
        result = await api.transactions.update(editingTransaction.id, payload);
      } else {
        result = await api.transactions.create(payload);
      }

      if (result.response.ok) {
        // Скидаємо форму з вибраним першим гаманцем
        setFormData({
          type: 'expense',
          amount: '',
          datetime: getCurrentLocalDateTime(),
          title: '',
          description: '',
          category_id: '',
          wallet_id: wallets.length > 0 ? wallets[0].id.toString() : '',
        });

        setIsFormOpen(false);
        setEditingTransaction(null);
        loadTransactions();
      } else {
        setError(result.data?.msg || 'Error saving');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Server connection error');
    }
  };


  // MARK: handleFormOpenChange
  const handleFormOpenChange = (open) => {
    console.log('handleFormOpenChange:', open);
    setIsFormOpen(open);
    if (!open) {
      setEditingTransaction(null);
      setFormData({
        type: 'expense',
        amount: '',
        datetime: getCurrentLocalDateTime(),
        title: '',
        description: '',
        // category_id: '',
        category_id: categories.length > 0 ? categories[0].id.toString() : '',
        wallet_id: wallets.length > 0 ? wallets[0].id.toString() : '',
      });
      setError('');
    }
  };


  // MARK: handleCreateClick
  const handleCreateClick = () => {
    console.log('handleCreateClick');
    setEditingTransaction(null);
    setFormData({
      type: 'expense',
      amount: '',
      datetime: getCurrentLocalDateTime(),
      title: '',
      description: '',
      // category_id: '',
      category_id: categories.length > 0 ? categories[0].id.toString() : '',
      wallet_id: wallets.length > 0 ? wallets[0].id.toString() : '',
    });
    setError('');
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
        loadTransactions();
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
  const filteredTransactions = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getFullYear() === selectedMonth.year && (d.getMonth() + 1) === selectedMonth.month;
  });

  // MARK: summary for selected month
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

              {/* MARK: transaction form */}
              <Button onClick={handleCreateClick}>
                <PlusCircledIcon /> Add transaction
              </Button>
              <Dialog.Root open={isFormOpen} onOpenChange={handleFormOpenChange}>
                {/* <Dialog.Trigger asChild>
                  <Button onClick={handleCreateClick} tabIndex={-1}>
                    <PlusCircledIcon /> Add transaction
                  </Button>
                </Dialog.Trigger> */}
                <Dialog.Content maxWidth="520px">
                  <Flex direction="column" gap="4">
                    <Flex align="center" justify="between">

                      <Dialog.Title asChild>
                        <Text size="5">
                          {editingTransaction ? 'Edit transaction' : 'New transaction'}
                        </Text>
                      </Dialog.Title>

                      <Dialog.Close asChild>
                        <IconButton
                          variant="ghost"
                          color="gray"
                          aria-label="Close transaction form"
                        >
                          <Cross2Icon />
                        </IconButton>
                      </Dialog.Close>

                    </Flex>

                    
                    <form onSubmit={handleSubmit}>
                      <Flex direction="column" gap="4">
                        
                        <SegmentedControl.Root value={formData.type} onValueChange={(value) => updateField('type', value)}>
                          <SegmentedControl.Item value="expense">💸 Expense</SegmentedControl.Item>
                          <SegmentedControl.Item value="income">💰 Income</SegmentedControl.Item>
                        </SegmentedControl.Root>

                        <Grid columns={{ initial: '1', md: '2' }} gap="4">
                          <Flex direction="column" gap="2">
                            <Text as="label" htmlFor="amount">
                              Amount
                            </Text>
                            <TextField.Root
                              id="amount"
                              name="amount"
                              type="number"
                              required
                              min="0.01"
                              step="0.01"
                              value={formData.amount}
                              onChange={(event) => updateField('amount', event.target.value)}
                              placeholder="0.00"
                            />
                          </Flex>

                          <Flex direction="column" gap="2">
                            <Text as="label" htmlFor="datetime">
                              Date and Time
                            </Text>
                            <TextField.Root
                              id="datetime"
                              name="datetime"
                              type="datetime-local"
                              required
                              value={formData.datetime}
                              onChange={(event) => updateField('datetime', event.target.value)}
                            />
                          </Flex>
                        </Grid>

                        

                        <Grid columns={{ initial: '1', md: '2' }} gap="4">
                          <Flex direction="column" gap="2">
                            {/* <Text>Category <span style={{color:'red'}}>*</span></Text> */}
                            <Text>Category</Text>
                            <Select.Root
                              value={formData.category_id}
                              onValueChange={(value) => updateField('category_id', value)}
                              required
                            >
                              <Select.Trigger placeholder="Select category" />
                              <Select.Content>
                                {/* Expense categories */}
                                <Select.Group>
                                  <Select.Label>Expense</Select.Label>
                                  {categories
                                    .filter((cat) => cat.type === 'expense')
                                    .map((cat) => (
                                      <Select.Item key={cat.id} value={cat.id?.toString()}>
                                        {cat.icon} {cat.name}
                                      </Select.Item>
                                    ))}
                                </Select.Group>
                                {/* Income categories */}
                                <Select.Separator />
                                <Select.Group>
                                  <Select.Label>Income</Select.Label>
                                  {categories
                                    .filter((cat) => cat.type === 'income')
                                    .map((cat) => (
                                      <Select.Item key={cat.id} value={cat.id?.toString()}>
                                        {cat.icon} {cat.name}
                                      </Select.Item>
                                    ))}
                                </Select.Group>
                                {/* Both categories */}
                                <Select.Separator />
                                <Select.Group>
                                  <Select.Label>Both</Select.Label>
                                  {categories
                                    .filter((cat) => cat.type === 'both')
                                    .map((cat) => (
                                      <Select.Item key={cat.id} value={cat.id?.toString()}>
                                        {cat.icon} {cat.name}
                                      </Select.Item>
                                    ))}
                                </Select.Group>
                              </Select.Content>
                            </Select.Root>
                          </Flex>

                          <Flex direction="column" gap="2">
                            <Text>Wallet</Text>
                            <Select.Root
                              value={formData.wallet_id}
                              onValueChange={(value) => updateField('wallet_id', value)}
                            >
                              <Select.Trigger placeholder="Select wallet" />
                              <Select.Content>
                                {wallets.map((wallet) => (
                                  <Select.Item key={wallet.id} value={wallet.id?.toString()}>
                                    {wallet.icon} {wallet.name}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          </Flex>
                        </Grid>


                        <Flex direction="column" gap="2">
                          <Text as="label" htmlFor="title">
                            Title
                          </Text>
                          <TextField.Root
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={(event) => updateField('title', event.target.value)}
                            placeholder={formData.type === 'expense' ? 'E.g.: Grocery shopping' : 'E.g.: Salary'}
                          />
                        </Flex>




                        <Flex direction="column" gap="2">
                          <Text as="label" htmlFor="description">
                            Description
                          </Text>
                          <TextArea
                            id="description"
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={(event) => updateField('description', event.target.value)}
                            placeholder="Additional information (optional)"
                          />
                        </Flex>

                        {error && (
                          <Callout.Root color="red" variant="surface">
                            <Callout.Text>{error}</Callout.Text>
                          </Callout.Root>
                        )}

                        <Flex justify="between" gap="3">
                          <Flex gap="3">
                            <Button type="submit">{editingTransaction ? 'Save changes' : 'Add transaction'}</Button>
                            <Button type="button" variant="soft" color="gray" onClick={() => handleFormOpenChange(false)}>
                              Cancel
                            </Button>
                          </Flex>
                          
                          {/* Show Delete button only when editing */}
                          {editingTransaction && (
                            <Button
                              type="button"
                              variant="soft"
                              color="red"
                              onClick={() => setTransactionToDelete(editingTransaction)}
                            >
                              Delete
                            </Button>
                          )}
                        </Flex>
                        
                      </Flex>
                    </form>
                    
                  </Flex>
                </Dialog.Content>

              </Dialog.Root>

            </Flex>
          </Flex>


          {/* MARK: month selector */}
          <Tabs.Root
            value={tabValue}
            onValueChange={setTabValue}
            activationMode="manual"
          >
            <Tabs.List
              size="2"
              ref={tabsListRef}
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

          {/* MARK: filters */}
          <Card variant="surface" size="3">
            <Flex direction="column" gap="4">

              <Flex align="center" justify="between" wrap="wrap" gap="3">
                <Flex align="center" gap="2">
                  <MixerHorizontalIcon />
                  <Heading size="4">Filters</Heading>
                </Flex>
              </Flex>

              <TransactionFilters 
                filters={filters} 
                onFilterChange={setFilters} 
                categories={categories} 
                wallets={wallets} 
              />

            </Flex>
          </Card>

          {/* MARK: list */}
          <Card variant="surface" size="3">
            <Flex direction="column" gap="4">
              <Flex direction="row" gap="4">
                <Heading size="4">Transaction list</Heading>

                <Badge color="mint" variant="soft">
                  {filteredTransactions.length} records
                </Badge>
              </Flex>

              <TransactionList
                transactions={filteredTransactions}
                onEdit={handleEdit}
                onDelete={() => {}}
                isLoading={isLoading}
              />
            </Flex>
          </Card>

          {/* MARK: delete dialog */}
          <Dialog.Root open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
            <Dialog.Content maxWidth="400px">
              <Flex direction="column" gap="4">
                <Dialog.Title asChild>
                  <Heading size="5">Delete transaction?</Heading>
                </Dialog.Title>
                <Text>
                  Are you sure you want to delete the transaction{' '}
                  <b>{transactionToDelete?.title}</b>? This action cannot be undone.
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

        </Flex>
      </Container>
    </Section>
  );
}

export default Transactions;
