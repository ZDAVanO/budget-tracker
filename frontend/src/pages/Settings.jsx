import { useState } from 'react';
import { Container, Heading, Section, Text, Flex, Select, Callout, Button, Spinner } from '@radix-ui/themes';
import { useCurrency } from '../contexts/CurrencyContext.jsx';
import api from '../services/api.js';

function Settings() {
  const { baseCurrency, setBaseCurrency, supported, rates } = useCurrency();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { response, data: transactions } = await api.transactions.getAll();
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const csvHeaders = ['type', 'amount', 'date', 'title', 'description', 'category_id', 'wallet_id', 'wallet_name', 'wallet_currency', 'category_name', 'category_type'];
      const csvRows = transactions.map(tx => [
        // tx.id,
        tx.type,
        tx.amount,
        tx.date,
        tx.title || '',
        tx.description || '',
        tx.category_id,
        tx.wallet_id,
        tx.wallet?.name || '',
        tx.wallet?.currency || '',
        tx.category?.name || '',
        tx.category?.type || ''
      ]);
      const csvContent = '\ufeff' + [csvHeaders, ...csvRows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'transactions.csv';
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Section size="3" className="p-4">

      <Container size="3">
        <Heading size="7" mb="4">Settings</Heading>
        {/* <Text color="gray">Here you can manage your profile and app preferences.</Text> */}

        <div className="mt-6">
          <Heading size="5" mb="3">Display currency</Heading>
          <Text color="gray" size="2">Totals, balances and statistics will be converted to this currency.</Text>
          <div className="mt-3">
            <Select.Root value={baseCurrency} onValueChange={(v) => setBaseCurrency(v)}>
              <Select.Trigger placeholder="Select currency" />
              <Select.Content>
                {supported.map((cur) => (
                  <Select.Item key={cur} value={cur}>{cur}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        <div className="mt-8">
          <Heading size="5" mb="3">Exchange rates</Heading>

            <div
              style={{
                maxHeight: 250,
                overflowY: 'auto',
                scrollbarWidth: 'thin',
              }}
            >
              <Flex direction="column" gap="1">
                {supported.map((cur) => (
                  <Text size="2" key={cur}>
                    {cur}: {rates?.rates?.[cur] ?? '-'}
                  </Text>
                ))}
              </Flex>
            </div>

        </div>

        <div className="mt-8">
          <Heading size="5" mb="3">Export Data</Heading>
          <Text color="gray" size="2">Download all your transactions as a CSV file.</Text>
          <div className="mt-3">
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting && <Spinner size="1" />}
              Export Transactions to CSV
            </Button>
          </div>
        </div>

      </Container>

    </Section>
  );
}

export default Settings;
