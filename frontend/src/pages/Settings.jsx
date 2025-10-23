import React from 'react';
import { Container, Heading, Section, Text } from '@radix-ui/themes';

function Settings() {
  return (
    <Section size="3" className="p-4">
      <Container size="3">
        <Heading size="7" mb="4">Settings</Heading>
        <Text color="gray">Here you can manage your profile and app preferences.</Text>
        {/* TODO: Add settings controls here */}
      </Container>
    </Section>
  );
}

export default Settings;
