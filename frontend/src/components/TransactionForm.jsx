import React, { useEffect, useState } from 'react';
import {
  Button,
  Callout,
  Flex,
  Grid,
  Heading,
  SegmentedControl,
  Select,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { Pencil2Icon, PlusCircledIcon } from '@radix-ui/react-icons';
import api from '../services/api';

function TransactionForm({ onSuccess, editData = null, onCancel, showHeading = true }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    category_id: '',
    wallet_id: '',
  });
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isExpense = formData.type === 'expense';

  const loadCategories = async () => {
    try {
      const { response, data } = await api.categories.getAll();
      if (response.ok) {
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadWallets = async () => {
    try {
      const { response, data } = await api.wallets.getAll();
      if (response.ok) {
        setWallets(data || []);
        const defaultWallet = data.find((wallet) => wallet.is_default);
        if (defaultWallet && !editData) {
          setFormData((prev) => ({ ...prev, wallet_id: defaultWallet.id.toString() }));
        }
      }
    } catch (err) {
      console.error('Error loading wallets:', err);
    }
  };

  useEffect(() => {
    loadCategories();
    loadWallets();

    if (editData) {
      setFormData({
        type: editData.type || 'expense',
        amount: editData.amount?.toString() || '',
        date: editData.date ? editData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        title: editData.title || '',
        description: editData.description || '',
        category_id: editData.category_id?.toString() || '',
        wallet_id: editData.wallet_id?.toString() || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const dateTime = new Date(`${formData.date}T12:00:00`).toISOString();

      const payload = {
        amount: parseFloat(formData.amount || '0'),
        date: dateTime,
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        wallet_id: formData.wallet_id ? parseInt(formData.wallet_id, 10) : null,
      };

      let result;
      const isExpenseType = formData.type === 'expense';

      if (editData) {
        result = isExpenseType
          ? await api.expenses.update(editData.id, payload)
          : await api.incomes.update(editData.id, payload);
      } else {
        result = isExpenseType ? await api.expenses.create(payload) : await api.incomes.create(payload);
      }

      if (result.response.ok) {
        setFormData({
          type: 'expense',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          title: '',
          description: '',
          category_id: '',
          wallet_id: wallets.find((wallet) => wallet.is_default)?.id?.toString() || '',
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.data?.msg || 'Error saving');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Server connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) => cat.type === formData.type || cat.type === 'both');

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="5">
        
        {(showHeading || !editData) && (
          <Flex align="center" justify={showHeading ? 'between' : 'start'} wrap="wrap" gap="3">
            {showHeading && (
              <Flex align="center" gap="2">
                {editData ? <Pencil2Icon /> : <PlusCircledIcon />}
                <Heading size="5">{editData ? 'Edit transaction' : 'New transaction'}</Heading>
              </Flex>
            )}
            {!editData && (
              <SegmentedControl.Root value={formData.type} onValueChange={(value) => updateField('type', value)}>
                <SegmentedControl.Item value="expense">💸 Expense</SegmentedControl.Item>
                <SegmentedControl.Item value="income">💰 Income</SegmentedControl.Item>
              </SegmentedControl.Root>
            )}
          </Flex>
        )}

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
              disabled={isLoading}
              placeholder="0.00"
            />
          </Flex>

          <Flex direction="column" gap="2">
            <Text as="label" htmlFor="date">
              Date
            </Text>
            <TextField.Root
              id="date"
              name="date"
              type="date"
              required
              value={formData.date}
              onChange={(event) => updateField('date', event.target.value)}
              disabled={isLoading}
            />
          </Flex>
        </Grid>

        <Flex direction="column" gap="2">
          <Text as="label" htmlFor="title">
            Title
          </Text>
          <TextField.Root
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={(event) => updateField('title', event.target.value)}
            disabled={isLoading}
            placeholder={isExpense ? 'E.g.: Grocery shopping' : 'E.g.: Salary'}
          />
        </Flex>

        <Grid columns={{ initial: '1', md: '2' }} gap="4">
          <Flex direction="column" gap="2">
            <Text>Category</Text>
            <Select.Root
              value={formData.category_id || 'none'}
              onValueChange={(value) => updateField('category_id', value === 'none' ? '' : value)}
              disabled={isLoading}
            >
              <Select.Trigger placeholder="No category" />
              <Select.Content>
                <Select.Item value="none">No category</Select.Item>
                {filteredCategories.map((cat) => (
                  <Select.Item key={cat.id} value={cat.id?.toString()}>
                    {cat.icon} {cat.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>

          <Flex direction="column" gap="2">
            <Text>Wallet</Text>
            <Select.Root
              value={formData.wallet_id || 'none'}
              onValueChange={(value) => updateField('wallet_id', value === 'none' ? '' : value)}
              disabled={isLoading}
            >
              <Select.Trigger placeholder="No wallet" />
              <Select.Content>
                <Select.Item value="none">No wallet</Select.Item>
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
          <Text as="label" htmlFor="description">
            Description
          </Text>
          <TextArea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={(event) => updateField('description', event.target.value)}
            disabled={isLoading}
            placeholder="Additional information (optional)"
          />
        </Flex>

        {error && (
          <Callout.Root color="red" variant="surface">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        <Flex justify="between" gap="3" wrap="wrap">
          <Button type="submit" loading={isLoading}>
            {editData ? 'Save changes' : 'Add transaction'}
          </Button>
          {onCancel && (
            <Button type="button" variant="soft" color="gray" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
        </Flex>
      </Flex>
    </form>
  );
}

export default TransactionForm;
