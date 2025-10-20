import React from 'react';
import { Box, Container, Flex, Link as RadixLink, Text } from '@radix-ui/themes';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import './style.css';

const footerLinks = [
  { href: 'https://github.com', label: 'GitHub', icon: <GitHubLogoIcon /> },
];

function Footer() {
  return (
    <footer>
      <Box className="footer" py={{ initial: '5', md: '6' }}>
        <Container size="3">
          <Flex align="center" justify="between" wrap="wrap" gap="3">
            <Text size="3" color="gray">
              &copy; 2025 Budget Tracker. Всі права захищено.
            </Text>
            <Flex align="center" gap="3">
              {footerLinks.map((link) => (
                <RadixLink
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="2"
                  color="gray"
                >
                  <Flex align="center" gap="2">
                    {link.icon}
                    {link.label}
                  </Flex>
                </RadixLink>
              ))}
            </Flex>
          </Flex>
        </Container>
      </Box>
    </footer>
  );
}

export default Footer;
