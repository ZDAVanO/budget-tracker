import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Container,
  DropdownMenu,
  Flex,
  IconButton,
  Tooltip,
  Separator,
  Text,
} from '@radix-ui/themes';
import { ExitIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useThemeMode } from '../../contexts/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', emoji: '📊' },
  { to: '/transactions', label: 'Транзакції', emoji: '📝' },
  { to: '/wallets', label: 'Гаманці', emoji: '💳' },
  { to: '/categories', label: 'Категорії', emoji: '📂' },
];

function Header({ isLoggedIn, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { appearance, toggleAppearance } = useThemeMode();
  const isDark = appearance === 'dark';

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header>
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(12px) saturate(120%)',
          backgroundColor: 'color-mix(in srgb, var(--color-panel-solid) 80%, transparent)',
          borderBottom: '1px solid var(--gray-a5)',
        }}
      >
        <Container size="3" px="4" py={{ initial: '3', md: '4' }}>
          <Flex align="center" justify="between" gap="4" wrap="wrap">
            <Flex align="center" gap="4" wrap="wrap">
              <Link
                to="/"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <Text size="6" weight="bold" color="mint">
                  <span role="img" aria-label="монета">💰</span>
                </Text>
                <Text size="5" weight="bold">Budget Tracker</Text>
              </Link>
              {isLoggedIn && <Separator orientation="vertical" />}
              {isLoggedIn && (
                <Flex align="center" gap="3" wrap="wrap" style={{ color: 'var(--gray-11)' }}>
                  {navItems.map((item) => (
                    <Button
                      key={item.to}
                      asChild
                      variant={isActive(item.to) ? 'solid' : 'soft'}
                      size="2"
                      color={isActive(item.to) ? 'mint' : 'gray'}
                      radius="full"
                    >
                      <Link
                        to={item.to}
                        style={{
                          color: 'inherit',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          paddingInline: '0.25rem',
                        }}
                      >
                        <span>{item.emoji}</span>
                        <span>{item.label}</span>
                      </Link>
                    </Button>
                  ))}
                </Flex>
              )}
            </Flex>

            <Flex align="center" gap="3">
              <Tooltip content={isDark ? 'Світла тема' : 'Темна тема'} side="bottom" align="center">
                <IconButton
                  variant="soft"
                  color="gray"
                  radius="full"
                  onClick={toggleAppearance}
                  aria-label={isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
                >
                  {isDark ? <SunIcon /> : <MoonIcon />}
                </IconButton>
              </Tooltip>

              {isLoggedIn ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Flex align="center" gap="3" style={{ cursor: 'pointer' }}>
                      <Text size="3" color="gray">
                        {user}
                      </Text>
                      <Avatar
                        radius="full"
                        fallback={user ? user[0]?.toUpperCase() : 'U'}
                        color="mint"
                      />
                    </Flex>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end" variant="soft">
                    <DropdownMenu.Label>{user}</DropdownMenu.Label>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item onClick={() => navigate('/dashboard')}>
                      Перейти в Dashboard
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item color="red" onClick={handleLogout}>
                      <Flex align="center" gap="2">
                        <ExitIcon />
                        Вийти
                      </Flex>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              ) : (
                <Flex align="center" gap="2">
                  <Button asChild variant="soft" color="gray" size="2">
                    <Link to="/login">Вхід</Link>
                  </Button>
                  <Button asChild size="2">
                    <Link to="/register">Реєстрація</Link>
                  </Button>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>
    </header>
  );
}

export default Header;
