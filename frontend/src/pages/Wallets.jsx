import { useEffect, useState } from 'react';
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
import { useCurrency } from '../contexts/CurrencyContext';

// Custom hook for wallet management
function useWallets() {
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletToDelete, setWalletToDelete] = useState(null);

  const loadWallets = async () => {
    setIsLoading(true);
    try {
      const { response, data } = await api.wallets.getAll();
      if (response.ok) {
        setWallets(data);
        console.log('📂 Loaded wallets:', data);
      }
    } catch (loadError) {
      console.error('Error loading wallets:', loadError);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWallet = async (walletId) => {
    try {
      const { response, data } = await api.wallets.delete(walletId);
      if (response.ok) {
        loadWallets();
      } else {
        alert(data?.msg || 'Error deleting wallet');
      }
    } catch (deleteError) {
      console.error('Error deleting wallet:', deleteError);
      alert('Error deleting wallet');
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  return { wallets, isLoading, error, setError, walletToDelete, setWalletToDelete, loadWallets, deleteWallet };
}

// Component for wallet form dialog
function WalletFormDialog({ isOpen, onOpenChange, editingWallet, onSave, supportedCurrencies, formatCurrency }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '💳',
    initial_balance: '0',
    currency: 'USD',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingWallet) {
      setFormData({
        name: editingWallet.name,
        description: editingWallet.description || '',
        icon: editingWallet.icon || '💳',
        initial_balance: (editingWallet.balance ?? 0).toFixed(2).toString(),
        currency: editingWallet.currency || 'USD',
      });
    } else {
      setFormData({ name: '', description: '', icon: '💳', initial_balance: '0', currency: 'USD' });
    }
    setError('');
  }, [editingWallet, isOpen]);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    await onSave(formData, setError);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="540px">
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between">
            <Dialog.Title>
              <Text size="5" weight="bold">
                {editingWallet ? 'Edit Wallet' : 'New Wallet'}
              </Text>
            </Dialog.Title>
            <Dialog.Close asChild>
              <IconButton variant="ghost" color="gray" radius="full" aria-label="Close wallet form">
                <Cross2Icon />
              </IconButton>
            </Dialog.Close>
          </Flex>
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              <Grid columns={{ initial: '1', md: '2' }} gap="4">
                <Flex direction="column" gap="2">
                  <Text as="label" htmlFor="name">Name</Text>
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
                  <Text as="label" htmlFor="icon">Icon</Text>
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
                    {editingWallet ? 'Adjust Balance' : 'Initial Balance'}
                  </Text>
                  <TextField.Root
                    id="initial_balance"
                    name="initial_balance"
                    type="number"
                    step="0.01"
                    value={formData.initial_balance}
                    onChange={(event) => updateField('initial_balance', event.target.value)}
                    placeholder={editingWallet ? 'Amount to adjust' : '0.00'}
                  />
                </Flex>
                <Flex direction="column" gap="2">
                  <Text>Currency</Text>
                  <Select.Root value={formData.currency} onValueChange={(value) => updateField('currency', value)}>
                    <Select.Trigger />
                    <Select.Content>
                      {supportedCurrencies.map((cur) => (
                        <Select.Item key={cur} value={cur}>
                          {formatCurrency(0, cur).replace(/^0\.00\s*/, `${cur} (`).replace(/\s*$/, ')')}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Grid>
              <Flex direction="column" gap="2">
                <Text as="label" htmlFor="description">Description</Text>
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
                <Button type="button" variant="soft" color="gray" onClick={handleCancel}>
                  Cancel
                </Button>
              </Flex>
            </Flex>
          </form>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// Component for wallet card
function WalletCard({ wallet, onEdit, onDelete, formatAmount }) {
  return (
    <Card key={wallet.id} variant="classic" size="2">
      <Flex direction="column" gap="3">
        <Flex align="center" justify="between">
          <Flex align="center" gap="3">
            <Text size="8">{wallet.icon}</Text>
            <Flex direction="column" gap="1">
              <Text weight="medium">{wallet.name}</Text>
              <Badge color="gray" style={{ width: 'fit-content', paddingRight: 8 }}>
                {wallet.currency}
              </Badge>
            </Flex>
          </Flex>
          <Flex gap="2">
            <IconButton size="2" variant="soft" onClick={() => onEdit(wallet)}>
              <Pencil2Icon />
            </IconButton>
            <IconButton size="2" variant="soft" color="red" onClick={() => onDelete(wallet)}>
              <TrashIcon />
            </IconButton>
          </Flex>
        </Flex>
        <Flex direction="column" gap="1">
          <Text color="gray" size="2">Current Balance</Text>
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
  );
}

// MARK: Wallets
function Wallets() {
  const { supported, format } = useCurrency();
  const { wallets, isLoading, walletToDelete, setWalletToDelete, loadWallets, deleteWallet } = useWallets();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);

  const handleSave = async (formData, setError) => {
    try {
      let result;
      if (editingWallet) {
        const newBalance = parseFloat(formData.initial_balance || '0');
        const currentBalance = parseFloat(editingWallet.balance || 0);
        const adjustment = Number((newBalance - currentBalance).toFixed(2));
        const payload = {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          currency: formData.currency,
        };
        if (adjustment !== 0) payload.adjustment = adjustment;
        console.log('💾 Submitting wallet update:', { walletId: editingWallet.id, payload });
        result = await api.wallets.update(editingWallet.id, payload);
        if (!result.response.ok) {
          setError(result.data?.msg || 'Error updating wallet');
          return;
        }
      } else {
        const payload = {
          ...formData,
          initial_balance: parseFloat(formData.initial_balance || '0'),
        };
        console.log('💾 Submitting wallet create:', payload);
        result = await api.wallets.create(payload);
        if (!result.response.ok) {
          setError(result.data?.msg || 'Error creating wallet');
          return;
        }
      }
      setIsFormOpen(false);
      setEditingWallet(null);
      loadWallets();
    } catch (saveError) {
      console.error('❌ Error saving wallet:', saveError);
      setError(`Error saving: ${saveError.message}`);
    }
  };

  const handleEdit = (wallet) => {
    setEditingWallet(wallet);
    setIsFormOpen(true);
  };

  const handleDelete = (wallet) => {
    setWalletToDelete(wallet);
  };

  const confirmDelete = async () => {
    if (!walletToDelete) return;
    await deleteWallet(walletToDelete.id);
    setWalletToDelete(null);
  };

  const handleCreateClick = () => {
    setEditingWallet(null);
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingWallet(null);
    }
  };

  const formatAmount = (amount, currency) =>
    `${amount >= 0 ? '' : ''}${amount.toFixed(2)} ${currency || 'USD'}`;

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
            <Button onClick={handleCreateClick}>
              <PlusCircledIcon /> Add Wallet
            </Button>
            <WalletFormDialog
              isOpen={isFormOpen}
              onOpenChange={handleFormOpenChange}
              editingWallet={editingWallet}
              onSave={handleSave}
              supportedCurrencies={supported}
              formatCurrency={format}
            />
          </Flex>
          <Dialog.Root open={!!walletToDelete} onOpenChange={(open) => !open && setWalletToDelete(null)}>
            <Dialog.Content maxWidth="400px">
              <Flex direction="column" gap="4">
                <Dialog.Title>
                  <Text size="5" weight="bold">Delete wallet?</Text>
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
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  formatAmount={formatAmount}
                />
              ))}
            </Grid>
          )}
        </Flex>
      </Container>
    </Section>
  );
}

// MARK: export
export default Wallets;
