import React, { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Container,
  Dialog,
  Flex,
  Grid,
  Heading,
  IconButton,
  Section,
  Text,
} from '@radix-ui/themes';
import { Cross2Icon, MixerHorizontalIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import api from '../services/api';
import TransactionFilters from '../components/TransactionFilters';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
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

  // loaders are defined below; loadData and effect will be set after them

  const loadTransactions = useCallback(async () => {
    try {
      const { response, data } = await api.transactions.getAll(filters);
      if (response.ok) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
    }
  }, [filters]);

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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      loadTransactions(),
      loadCategories(),
      loadWallets()
    ]);
    setIsLoading(false);
  }, [loadTransactions, loadCategories, loadWallets]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTransactionSuccess = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
    loadTransactions();
  };

  const handleFormOpenChange = (open) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingTransaction(null);
    }
  };

  const handleCreateClick = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = (transaction) => {
    setTransactionToDelete(transaction);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      const { response } = transactionToDelete.type === 'expense'
        ? await api.expenses.delete(transactionToDelete.id)
        : await api.incomes.delete(transactionToDelete.id);

      if (response.ok) {
        loadTransactions();
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

  // const stats = transactions.reduce((acc, t) => {
  //   if (t.type === 'expense') {
  //     acc.totalExpenses += t.amount;
  //   } else {
  //     acc.totalIncomes += t.amount;
  //   }
  //   return acc;
  // }, { totalExpenses: 0, totalIncomes: 0 });

  // const balance = stats.totalIncomes - stats.totalExpenses;

  return (
    <Section size="3" className="p-4">
      <Container size="3">
        <Flex direction="column" gap="6">
          <Flex align="center" justify="between" wrap="wrap" gap="3">
            <Flex direction="column" gap="1">
              <Heading as="h1" size="7">
                Transactions
              </Heading>
              <Text color="gray">Manage all your transactions in one place.</Text>
            </Flex>
            <Flex align="center" gap="3">
              <Badge color="mint" variant="soft">
                {transactions.length} records
              </Badge>
              <Dialog.Root open={isFormOpen} onOpenChange={handleFormOpenChange}>
                <Dialog.Trigger asChild>
                  <Button onClick={handleCreateClick}>
                    <PlusCircledIcon /> Add transaction
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content maxWidth="520px">
                  <Flex direction="column" gap="4">
                    <Flex align="center" justify="between">
                      <Dialog.Title asChild>
                        <Heading size="5">
                          {editingTransaction ? 'Edit transaction' : 'New transaction'}
                        </Heading>
                      </Dialog.Title>
                      <Dialog.Close asChild>
                        <IconButton
                          variant="ghost"
                          color="gray"
                          radius="full"
                          aria-label="Close transaction form"
                        >
                          <Cross2Icon />
                        </IconButton>
                      </Dialog.Close>
                    </Flex>
                    <TransactionForm
                      onSuccess={handleTransactionSuccess}
                      editData={editingTransaction}
                      onCancel={() => handleFormOpenChange(false)}
                      showHeading={false}
                    />
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
            </Flex>
          </Flex>
          {/* <Grid columns={{ initial: '1', md: '3' }} gap="4">
            <Card variant="surface" size="3">
              <Flex direction="column" gap="2">
                <Text color="gray">Income</Text>
                <Heading size="6" color="mint">+{stats.totalIncomes.toFixed(2)} UAH</Heading>
                <Text size="2" color="gray">All income for the selected period</Text>
              </Flex>
            </Card>
            <Card variant="surface" size="3">
              <Flex direction="column" gap="2">
                <Text color="gray">Expenses</Text>
                <Heading size="6" color="tomato">-{stats.totalExpenses.toFixed(2)} UAH</Heading>
                <Text size="2" color="gray">Financial obligations and purchases</Text>
              </Flex>
            </Card>
            <Card variant="surface" size="3">
              <Flex direction="column" gap="2">
                <Text color="gray">Balance</Text>
                <Heading size="6" color={balance >= 0 ? 'jade' : 'tomato'}>
                  {balance >= 0 ? '+' : ''}{balance.toFixed(2)} UAH
                </Heading>
                <Text size="2" color="gray">Difference between income and expenses</Text>
              </Flex>
            </Card>
          </Grid> */}

          <Card variant="surface" size="3">
            <Flex direction="column" gap="4">
              <Flex align="center" justify="between" wrap="wrap" gap="3">
                <Flex align="center" gap="2">
                  <MixerHorizontalIcon />
                  <Heading size="4">Filters</Heading>
                </Flex>
              </Flex>
              <TransactionFilters filters={filters} onFilterChange={setFilters} categories={categories} wallets={wallets} />
            </Flex>
          </Card>
          <Card variant="surface" size="3">
            <Flex direction="column" gap="4">
              <Heading size="4">Transaction list</Heading>
              <TransactionList transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} isLoading={isLoading} />
            </Flex>
          </Card>
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
