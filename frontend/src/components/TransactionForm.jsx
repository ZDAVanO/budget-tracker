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


// MARK: getTodayLocalDate
// функція для отримання локальної дати у форматі YYYY-MM-DD
function getTodayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


// MARK: TransactionForm
function TransactionForm({ 
  onSuccess, 
  editData = null, 
  onCancel, 
  showHeading = true,
  categories = [],
  wallets = []
}) {

  // MARK: state
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    date: getTodayLocalDate(),
    title: '',
    description: '',
    category_id: '',
    wallet_id: wallets.length > 0 ? wallets[0].id.toString() : '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isExpense = formData.type === 'expense';

  
  // MARK: useEffect
  useEffect(() => {
    if (editData) {
      // Режим редагування - заповнюємо дані з транзакції
      setFormData({
        type: editData.type || 'expense',
        amount: editData.amount?.toString() || '',
        date: editData.date ? editData.date.split('T')[0] : getTodayLocalDate(),
        title: editData.title || '',
        description: editData.description || '',
        category_id: editData.category_id?.toString() || '',
        wallet_id: editData.wallet_id?.toString() || '',
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
  }, [editData, wallets]);


  // MARK: handlers
  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  // MARK: handleSubmit
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // Формуємо дату у локальному форматі без UTC-зсуву
      const now = new Date();
      const [year, month, day] = formData.date.split('-');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const dateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

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

      if (editData) {
        result = await api.transactions.update(editData.id, payload);
      } else {
        result = await api.transactions.create(payload);
      }

      if (result.response.ok) {
        // Скидаємо форму з вибраним першим гаманцем
        setFormData({
          type: 'expense',
          amount: '',
          date: getTodayLocalDate(),
          title: '',
          description: '',
          category_id: '',
          wallet_id: wallets.length > 0 ? wallets[0].id.toString() : '',
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


  // MARK: filtered categories
  const filteredCategories = categories.filter((cat) => cat.type === formData.type || cat.type === 'both');


  // MARK: render
  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="5">
        {/* MARK: heading */}

          <Flex align="center" justify='between' wrap="wrap" gap="3">
            
            <Flex align="center" gap="2">
              {/* {editData ? <Pencil2Icon /> : <PlusCircledIcon />} */}
              <Heading size="5">{editData ? 'Edit transaction' : 'New transaction'}</Heading>
            </Flex>

            <SegmentedControl.Root value={formData.type} onValueChange={(value) => updateField('type', value)}>
              <SegmentedControl.Item value="expense">💸 Expense</SegmentedControl.Item>
              <SegmentedControl.Item value="income">💰 Income</SegmentedControl.Item>
            </SegmentedControl.Root>

          </Flex>

        {/* MARK: amount & date */}
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

        {/* MARK: title */}
        <Flex direction="column" gap="2">
          <Text as="label" htmlFor="title">
            Title
          </Text>
          <TextField.Root
            id="title"
            name="title"
            value={formData.title}
            onChange={(event) => updateField('title', event.target.value)}
            disabled={isLoading}
            placeholder={isExpense ? 'E.g.: Grocery shopping' : 'E.g.: Salary'}
          />
        </Flex>

        {/* MARK: category */}
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

          {/* MARK: wallet */}
          <Flex direction="column" gap="2">
            <Text>Wallet</Text>
            <Select.Root
              value={formData.wallet_id}
              onValueChange={(value) => updateField('wallet_id', value)}
              disabled={isLoading}
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

        {/* MARK: description */}
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

        {/* MARK: error */}
        {error && (
          <Callout.Root color="red" variant="surface">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}

        {/* MARK: buttons */}
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
