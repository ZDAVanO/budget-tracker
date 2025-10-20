import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Button,
  Callout,
  Card,
  Container,
  Flex,
  Heading,
  Section,
  Text,
  TextField,
} from '@radix-ui/themes';
import { LockClosedIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import api from '../services/api';

function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  console.log('🎨 Login page render', { formData: { ...formData, password: '***' } });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Login form change: ${name} =`, name === 'password' ? '***' : value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('🔐 Login: Спроба входу, username:', formData.username);

    try {
      const { response, data } = await api.auth.login(formData.username, formData.password);

      if (response.ok) {
        console.log('✅ Login: Вхід успішний, викликаємо onLoginSuccess');
        onLoginSuccess();
        navigate('/dashboard');
      } else {
        console.warn('⚠️ Login: Помилка входу', data);
        setError(data?.msg || 'Невірний логін або пароль');
      }
    } catch (err) {
      console.error('❌ Login: Виняток при вході', err);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section size="3">
      <Container size="2">
        <Flex align="center" justify="center" style={{ minHeight: '70vh' }}>
          <Card size="4" variant="surface" style={{ width: '100%' }}>
            <Flex direction="column" gap="5">
              <Flex direction="column" gap="2" align="center">
                <LockClosedIcon width={24} height={24} />
                <Heading size="6">Вхід до Budget Tracker</Heading>
                <Text color="gray" size="3">
                  Введіть облікові дані, щоб продовжити роботу.
                </Text>
              </Flex>

              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                  <Flex direction="column" gap="2">
                    <Text as="label" htmlFor="username">
                      Ім'я користувача
                    </Text>
                    <TextField.Root
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      autoComplete="username"
                      placeholder="Введіть ім'я користувача"
                    />
                  </Flex>

                  <Flex direction="column" gap="2">
                    <Text as="label" htmlFor="password">
                      Пароль
                    </Text>
                    <TextField.Root
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                      placeholder="********"
                    />
                  </Flex>

                  {error && (
                    <Callout.Root color="red" variant="surface">
                      <Callout.Text>{error}</Callout.Text>
                    </Callout.Root>
                  )}

                  <Button type="submit" size="3" loading={isLoading}>
                    {isLoading ? 'Вхід...' : 'Увійти'}
                  </Button>
                </Flex>
              </form>

              <Flex direction="column" gap="2" align="center">
                <Text size="2" color="gray">
                  Ще не маєте акаунту?
                </Text>
                <Button asChild variant="soft" size="2">
                  <Link to="/register">Зареєструватися</Link>
                </Button>
              </Flex>

              <Callout.Root color="mint" variant="soft">
                <Callout.Icon>
                  <CheckCircledIcon />
                </Callout.Icon>
                <Callout.Text>
                  Ваші дані захищено, а доступ можна отримати в будь-який момент.
                </Callout.Text>
              </Callout.Root>
            </Flex>
          </Card>
        </Flex>
      </Container>
    </Section>
  );
}

export default Login;
