import React from 'react';
import { Container, Heading, Section, Text, Flex, Select, Callout } from '@radix-ui/themes';
import { useCurrency } from '../contexts/CurrencyContext.jsx';

function Settings() {
  const { baseCurrency, setBaseCurrency, supported, rates } = useCurrency();

  return (
    <Section size="3" className="p-4">
      <Container size="3">
        <Heading size="7" mb="4">Settings</Heading>
        <Text color="gray">Here you can manage your profile and app preferences.</Text>

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
          <Callout.Root color="gray">
            <Callout.Text>
              <Flex direction="column" gap="1">
                <Text size="2">Base: {rates?.base || 'UAH'}</Text>
                <Text size="2">UAH: {rates?.rates?.UAH ?? 1}</Text>
                <Text size="2">USD: {rates?.rates?.USD ?? 40}</Text>
                <Text size="2">EUR: {rates?.rates?.EUR ?? 43}</Text>
              </Flex>
            </Callout.Text>
          </Callout.Root>
        </div>
      </Container>
    </Section>
  );
}

export default Settings;
