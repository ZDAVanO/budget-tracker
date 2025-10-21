import {
  Box,
  Button,
  Callout,
  Container,
  Flex,
  Heading,
  Section,
  Text,
} from '@radix-ui/themes';

const NotFound = () => {
  return (
    <Section size="3">
      <Container size="2">
        <Callout.Root>
          <Callout.Text>
            <Flex direction="column" gap="3">
              <Heading size="7">404 • Сторінку не знайдено</Heading>
              <Text color="gray" size="3">
                Здається, ви опинилися на невідомій сторінці. Спробуйте повернутися на головну.
              </Text>
              <Flex>
                <Button asChild>
                  <a href="/">На головну</a>
                </Button>
              </Flex>
            </Flex>
          </Callout.Text>
        </Callout.Root>
      </Container>
    </Section>
  );
};

export default NotFound;