import { useEffect, useState } from 'react';
import {
  Button,
  Callout,
  Dialog,
  Flex,
  Grid,
  IconButton,
  SegmentedControl,
  Select,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';

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

const TransactionForm = ({
  open,
  onOpenChange,
  transaction,
  categories,
  wallets,
  onSave,
  onDeleteRequest,
}) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    datetime: getCurrentLocalDateTime(),
    title: '',
    description: '',
    category_id: categories.length > 0 ? categories[0].id.toString() : '',
    wallet_id: wallets.length > 0 ? wallets[0].id.toString() : '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      let datetimeValue = getCurrentLocalDateTime();
      if (transaction.date) {
        const dateObj = new Date(transaction.date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        datetimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
      }
      setFormData({
        type: transaction.type || 'expense',
        amount: transaction.amount?.toString() || '',
        datetime: datetimeValue,
        title: transaction.title || '',
        description: transaction.description || '',
        category_id: transaction.category_id?.toString() || (categories.length > 0 ? categories[0].id.toString() : ''),
        wallet_id: transaction.wallet_id?.toString() || (wallets.length > 0 ? wallets[0].id.toString() : ''),
      });
    } else {
      setFormData({
        type: 'expense',
        amount: '',
        datetime: getCurrentLocalDateTime(),
        title: '',
        description: '',
        category_id: categories.length > 0 ? categories[0].id.toString() : '',
        wallet_id: wallets.length > 0 ? wallets[0].id.toString() : '',
      });
    }
    setError('');
  }, [transaction, categories, wallets]);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!formData.category_id) {
      setError('Category is required');
      return;
    }
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
    const result = await onSave(payload, !!transaction);
    if (!result.success) setError(result.error);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="520px">
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between">
            <Dialog.Title asChild>
              <Text size="5">
                {transaction ? 'Edit transaction' : 'New transaction'}
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
                  <Text>Category</Text>
                  <Select.Root
                    value={formData.category_id}
                    onValueChange={(value) => updateField('category_id', value)}
                    required
                  >
                    <Select.Trigger placeholder="Select category" />
                    <Select.Content>
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
                  <Button type="submit">{transaction ? 'Save changes' : 'Add transaction'}</Button>
                  <Button type="button" variant="soft" color="gray" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                </Flex>
                {transaction && (
                  <Button
                    type="button"
                    variant="soft"
                    color="red"
                    onClick={onDeleteRequest}
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
  );
};

export default TransactionForm;
