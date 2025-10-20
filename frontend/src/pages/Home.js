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
    title: 'Повний контроль бюджету',
    description: 'Відстежуйте доходи, витрати та баланси у реальному часі з наочними графіками.',
    icon: <BarChartIcon />,
  },
  {
    title: 'Розумні категорії',
    description: 'Групуйте транзакції за категоріями, щоб помічати тренди та оптимізувати витрати.',
    icon: <LightningBoltIcon />,
  },
  {
    title: 'Гнучкі інструменти',
    description: 'Фільтри, звіти, гаманці та багато іншого для продуманого керування фінансами.',
    icon: <RocketIcon />,
  },
];

const highlights = [
  'Безпечна авторизація та зберігання даних',
  'Підтримка різних валют та гаманців',
  'Адаптивний інтерфейс на Radix UI Themes',
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
              Радісний контроль фінансів
            </Badge>
            <Heading as="h1" size="9">
              Budget Tracker
            </Heading>
            <Text size="5" color="gray">
              Плануйте витрати, досягайте цілей та будуйте фінансову свободу.
            </Text>
            <Flex gap="3" wrap="wrap" justify="center">
              <Button asChild size="3">
                <Link to="/register">Розпочати безкоштовно</Link>
              </Button>
              <Button asChild variant="soft" color="gray" size="3">
                <Link to="/login">У мене вже є акаунт</Link>
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Section>

      <Section size="3">
        <Container size="3">
          <Flex direction="column" gap="5">
            <Heading as="h2" size="7">
              Все, що потрібно для управління бюджетом
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

      <Section size="3" style={{ backgroundColor: 'var(--color-surface)' }}>
        <Container size="2">
          <Card size="4" variant="classic">
            <Flex direction="column" gap="4">
              <Heading as="h2" size="6">
                Чому користувачі обирають Budget Tracker?
              </Heading>
              <Flex direction="column" gap="3">
                {highlights.map((point) => (
                  <Flex key={point} align="start" gap="3">
                    <CheckCircledIcon />
                    <Text color="gray">{point}</Text>
                  </Flex>
                ))}
              </Flex>
              <Flex justify="start">
                <Button asChild>
                  <Link to="/dashboard">Оглянути можливості</Link>
                </Button>
              </Flex>
            </Flex>
          </Card>
        </Container>
      </Section>
    </>
  );
}

export default Home;
