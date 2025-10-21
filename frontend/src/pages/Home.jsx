import React from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Section,
  Text,
} from '@radix-ui/themes';
import { RocketIcon, LightningBoltIcon, BarChartIcon, CheckCircledIcon } from '@radix-ui/react-icons';

const features = [
  {
    title: 'Full budget control',
    description: 'Track income, expenses, and balances in real time with visual charts.',
    icon: <BarChartIcon />,
  },
  {
    title: 'Smart categories',
    description: 'Group transactions by category to spot trends and optimize spending.',
    icon: <LightningBoltIcon />,
  },
  {
    title: 'Flexible tools',
    description: 'Filters, reports, wallets, and more for thoughtful financial management.',
    icon: <RocketIcon />,
  },
];



function Home() {
  return (
    <>
      <Section
        size="3"
        style={{
          background:
            'radial-gradient(160% 120% at 50% -20%, var(--accent-a3) 0%, transparent 55%)',
        }}
      >
        <Container size="3">
          <Flex direction="column" align="center" gap="5" style={{ textAlign: 'center' }}>
            <Badge size="2" color="mint" variant="soft">
              Joyful financial control
            </Badge>
            <Heading as="h1" size="9">
              Budget Tracker
            </Heading>
            <Text size="5" color="gray">
              Plan expenses, achieve goals, and build financial freedom.
            </Text>
            <Flex gap="3" wrap="wrap" justify="center">
              <Button asChild size="3">
                <Link to="/register">Start for free</Link>
              </Button>
              <Button asChild variant="soft" color="gray" size="3">
                <Link to="/login">I already have an account</Link>
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Section>

      <Section size="3">
        <Container size="3">
          <Flex direction="column" gap="5">
            <Heading as="h2" size="7" style={{ textAlign: 'center' }}>
              Everything you need for budget management
            </Heading>
            <Grid columns={{ initial: '1', md: '3' }} gap="4">
              {features.map((feature) => (
                <Card key={feature.title} size="4" variant="surface">
                  <Flex direction="column" gap="3">
                    <Flex align="center" gap="2">
                      {feature.icon}
                      <Heading as="h3" size="4">
                        {feature.title}
                      </Heading>
                    </Flex>
                    <Text color="gray">{feature.description}</Text>
                  </Flex>
                </Card>
              ))}
            </Grid>
          </Flex>
        </Container>
      </Section>

    </>
  );
}

export default Home;
