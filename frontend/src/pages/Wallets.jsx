import React, { useEffect, useState } from 'react';
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
  Select,
  Text,
  TextArea,
  TextField,
  Spinner,
} from '@radix-ui/themes';
import { PlusCircledIcon, Pencil2Icon, TrashIcon, Cross2Icon } from '@radix-ui/react-icons';
import api from '../services/api';

function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '💳',
    initial_balance: '0',
    currency: 'UAH',
  });
  const [error, setError] = useState('');
  const [walletToDelete, setWalletToDelete] = useState(null);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    setIsLoading(true);
    try {
      const { response, data } = await api.wallets.getAll();
      if (response.ok) {
        setWallets(data);
      }
    } catch (loadError) {
      console.error('Error loading wallets:', loadError);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = {
        ...formData,
        initial_balance: parseFloat(formData.initial_balance || '0'),
      };

      if (editingWallet) {
        const { response } = await api.wallets.update(editingWallet.id, payload);
        if (!response.ok) {
          setError('Error updating wallet');
          return;
        }
      } else {
        const { response } = await api.wallets.create(payload);
        if (!response.ok) {
          setError('Error creating wallet');
          return;
        }
      }

      setFormData({ name: '', description: '', icon: '💳', initial_balance: '0', currency: 'UAH' });
      setIsFormOpen(false);
      setEditingWallet(null);
      loadWallets();
    } catch (saveError) {
      console.error('Error saving wallet:', saveError);
      setError('Error saving');
    }
  };

  const handleEdit = (wallet) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      description: wallet.description || '',
      icon: wallet.icon || '💳',
      initial_balance: wallet.initial_balance?.toString() || '0',
      currency: wallet.currency || 'UAH',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (wallet) => {
    setWalletToDelete(wallet);
  };

  const confirmDelete = async () => {
    if (!walletToDelete) return;
    try {
      const { response, data } = await api.wallets.delete(walletToDelete.id);
      if (response.ok) {
        loadWallets();
      } else {
        alert(data?.msg || 'Error deleting wallet');
      }
    } catch (deleteError) {
      console.error('Error deleting wallet:', deleteError);
      alert('Error deleting wallet');
    } finally {
      setWalletToDelete(null);
    }
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingWallet(null);
    setFormData({ name: '', description: '', icon: '💳', initial_balance: '0', currency: 'UAH' });
    setError('');
  };

  const handleCreateClick = () => {
    setEditingWallet(null);
    setFormData({ name: '', description: '', icon: '💳', initial_balance: '0', currency: 'UAH' });
    setError('');
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingWallet(null);
      setFormData({ name: '', description: '', icon: '💳', initial_balance: '0', currency: 'UAH' });
      setError('');
    }
  };

  // const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance ?? 0), 0);

  const formatAmount = (amount, currency) =>
    `${amount >= 0 ? '+' : ''}${amount.toFixed(2)} ${currency || 'UAH'}`;

  return (
    <Section size="3" className="p-4">
      <Container size="3">
        <Flex direction="column" gap="6">
          <Flex align="center" justify="between" wrap="wrap" gap="3">

            <Flex direction="column" gap="1">
              <Heading as="h1" size="7">
                Wallets
              </Heading>
              <Text color="gray">Create wallets for different purposes and currencies.</Text>
            </Flex>

            <Dialog.Root open={isFormOpen} onOpenChange={handleFormOpenChange}>
              <Dialog.Trigger asChild>
                <Button onClick={handleCreateClick}>
                  <PlusCircledIcon /> Add Wallet
                </Button>
              </Dialog.Trigger>

              <Dialog.Content maxWidth="540px">

                <Flex direction="column" gap="4">

                  <Flex align="center" justify="between">
                    <Dialog.Title asChild>
                      <Heading size="5">
                        {editingWallet ? 'Edit Wallet' : 'New Wallet'}
                      </Heading>
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <IconButton
                        variant="ghost"
                        color="gray"
                        radius="full"
                        aria-label="Close wallet form"
                      >
                        <Cross2Icon />
                      </IconButton>
                    </Dialog.Close>

                  </Flex>

                  <form onSubmit={handleSubmit}>
                    <Flex direction="column" gap="4">
                      <Grid columns={{ initial: '1', md: '2' }} gap="4">
                        <Flex direction="column" gap="2">
                          <Text as="label" htmlFor="name">
                            Name
                          </Text>
                          <TextField.Root
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={(event) => updateField('name', event.target.value)}
                            placeholder="For example: Cash"
                          />
                        </Flex>

                        <Flex direction="column" gap="2">
                          <Text as="label" htmlFor="icon">
                            Icon
                          </Text>
                          <TextField.Root
                            id="icon"
                            name="icon"
                            value={formData.icon}
                            maxLength={5}
                            onChange={(event) => updateField('icon', event.target.value)}
                            placeholder="💳"
                          />
                        </Flex>
                      </Grid>

                      <Grid columns={{ initial: '1', md: '2' }} gap="4">
                        <Flex direction="column" gap="2">
                          <Text as="label" htmlFor="initial_balance">
                            Initial Balance
                          </Text>
                          <TextField.Root
                            id="initial_balance"
                            name="initial_balance"
                            type="number"
                            step="0.01"
                            value={formData.initial_balance}
                            onChange={(event) => updateField('initial_balance', event.target.value)}
                            placeholder="0.00"
                          />
                        </Flex>

                        <Flex direction="column" gap="2">
                          <Text>Currency</Text>
                          <Select.Root value={formData.currency} onValueChange={(value) => updateField('currency', value)}>
                            <Select.Trigger />
                            <Select.Content>
                              <Select.Item value="UAH">UAH (₴)</Select.Item>
                              <Select.Item value="USD">USD ($)</Select.Item>
                              <Select.Item value="EUR">EUR (€)</Select.Item>
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
                          placeholder="Additional information"
                        />
                      </Flex>

                      {error && (
                        <Callout.Root color="red" variant="surface">
                          <Callout.Text>{error}</Callout.Text>
                        </Callout.Root>
                      )}

                      <Flex justify="flex-end" gap="3">
                        <Button type="submit">{editingWallet ? 'Save Changes' : 'Add Wallet'}</Button>
                        <Button type="button" variant="soft" color="gray" onClick={handleCancelForm}>
                          Cancel
                        </Button>
                      </Flex>
                    </Flex>
                  </form>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>

          </Flex>

          {/* <Card size="2" variant="surface">
            <Flex align="center" justify="between" wrap="wrap" gap="3">
              <Flex align="center" gap="3">
                <Text size="5">💰</Text>
                <Flex direction="column" gap="1">
                  <Text color="gray" size="2">
                    Total Balance
                  </Text>
                  <Heading size="5">{totalBalance.toFixed(2)} ₴</Heading>
                </Flex>
              </Flex>
              <Badge variant="soft" color="mint">
                {wallets.length} wallets
              </Badge>
            </Flex>
          </Card> */}

          <Dialog.Root open={!!walletToDelete} onOpenChange={(open) => !open && setWalletToDelete(null)}>
            <Dialog.Content maxWidth="400px">
              <Flex direction="column" gap="4">
                <Dialog.Title asChild>
                  <Heading size="5">Delete wallet?</Heading>
                </Dialog.Title>
                <Text>
                  Are you sure you want to delete the wallet{' '}
                  <b>{walletToDelete?.name}</b>? This action cannot be undone.
                </Text>
                <Flex gap="3" justify="end">
                  <Button variant="soft" color="gray" onClick={() => setWalletToDelete(null)}>
                    Cancel
                  </Button>
                  <Button color="red" onClick={confirmDelete}>
                    Delete
                  </Button>
                </Flex>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>

          {isLoading ? (
            <Flex justify="center" align="center" style={{ height: '100px' }}>
                <Spinner size="3" />
            </Flex>
          ) : wallets.length === 0 ? (
            <Callout.Root>
              <Callout.Text color="gray">No wallets yet. Create your first one to get started.</Callout.Text>
            </Callout.Root>
          ) : (
            <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
              {wallets.map((wallet) => (
                <Card key={wallet.id} variant="classic" size="2">
                  <Flex direction="column" gap="3">

                    <Flex align="center" justify="between">
                      <Flex align="center" gap="3">
                        <Text size="5">{wallet.icon}</Text>
                        <Flex direction="column" gap="1">
                          <Text weight="medium">{wallet.name}</Text>
                          <Badge color="gray" style={{ width: 'fit-content', paddingRight: 8 }}>
                            {wallet.currency}
                          </Badge>
                        </Flex>
                      </Flex>

                      <Flex gap="2">
                        <IconButton size="2" variant="soft" onClick={() => handleEdit(wallet)}>
                          <Pencil2Icon />
                        </IconButton>
                        <IconButton size="2" variant="soft" color="red" onClick={() => handleDelete(wallet)}>
                          <TrashIcon />
                        </IconButton>
                      </Flex>

                    </Flex>

                    <Flex direction="column" gap="1">
                      <Text color="gray" size="2">
                        Current Balance
                      </Text>
                      <Heading size="5" color={wallet.balance >= 0 ? 'mint' : 'tomato'}>
                        {formatAmount(wallet.balance ?? 0, wallet.currency)}
                      </Heading>
                    </Flex>

                    {wallet.description && (
                      <Text size="2" color="gray">
                        {wallet.description}
                      </Text>
                    )}
                  </Flex>
                </Card>
              ))}
            </Grid>
          )}
        </Flex>
      </Container>
    </Section>
  );
}

export default Wallets;
