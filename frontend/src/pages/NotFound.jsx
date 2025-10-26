import {
  Box,
  Button,
  Callout,
  Flex,
  Heading,
  Text,
} from '@radix-ui/themes';

const NotFound = () => {
  return (
    <div className="py-12 p-4">
      <div className="max-w-md mx-auto">
        <Callout.Root>
          <Callout.Text>
            <Flex direction="column" gap="3">
              <Heading size="7">404 • Page Not Found</Heading>
              <Text color="gray" size="3">
                It looks like you've landed on an unknown page. Try returning to the homepage.
              </Text>
              <Flex>
                <Button asChild>
                  <a href="/">Go to Homepage</a>
                </Button>
              </Flex>
            </Flex>
          </Callout.Text>
        </Callout.Root>
      </div>
    </div>
  );
};

export default NotFound;