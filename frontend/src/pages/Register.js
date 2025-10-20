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
import { PersonIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import api from '../services/api';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  console.log('🎨 Register page render', {
    formData: { ...formData, password: '***', confirmPassword: '***' },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Register form change: ${name} =`, name.includes('password') ? '***' : value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('📝 Register: Спроба реєстрації, username:', formData.username, 'email:', formData.email);

    if (formData.password !== formData.confirmPassword) {
      console.warn('⚠️ Register: Паролі не співпадають');
      setError('Паролі не співпадають');
      return;
    }

    if (formData.password.length < 6) {
      console.warn('⚠️ Register: Пароль занадто короткий');
      setError('Пароль має містити мінімум 6 символів');
      return;
    }

    setIsLoading(true);

    try {
      const { response, data } = await api.auth.register(formData.username, formData.email, formData.password);

      if (response.ok) {
        console.log('✅ Register: Реєстрація успішна');
        setSuccess('Реєстрація успішна! Перенаправлення на сторінку входу...');
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });

        setTimeout(() => {
          console.log('🔐 Register: Перенаправлення на Login');
          navigate('/login');
        }, 2000);
      } else {
        console.warn('⚠️ Register: Помилка реєстрації', data);
        setError(data?.msg || 'Помилка реєстрації');
      }
    } catch (err) {
      console.error('❌ Register: Виняток при реєстрації', err);
      setError('Помилка з\'єднання з сервером');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section size="3">
      <Container size="2">
        <Flex align="center" justify="center" style={{ minHeight: '80vh' }}>
          <Card size="4" variant="surface" style={{ width: '100%' }}>
            <Flex direction="column" gap="5">
              <Flex direction="column" gap="2" align="center">
                <PersonIcon width={24} height={24} />
                <Heading size="6">Створіть новий акаунт</Heading>
                <Text color="gray" size="3">
                  Заповніть форму, щоб розпочати керування своїми фінансами.
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
                      placeholder="finance_pro"
                    />
                  </Flex>

                  <Flex direction="column" gap="2">
                    <Text as="label" htmlFor="email">
                      Email
                    </Text>
                    <TextField.Root
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      autoComplete="email"
                      placeholder="you@example.com"
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
                      autoComplete="new-password"
                      placeholder="********"
                      minLength={6}
                    />
                  </Flex>

                  <Flex direction="column" gap="2">
                    <Text as="label" htmlFor="confirmPassword">
                      Підтвердьте пароль
                    </Text>
                    <TextField.Root
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      autoComplete="new-password"
                      placeholder="********"
                      minLength={6}
                    />
                  </Flex>

                  {error && (
                    <Callout.Root color="red" variant="surface">
                      <Callout.Text>{error}</Callout.Text>
                    </Callout.Root>
                  )}

                  {success && (
                    <Callout.Root color="mint" variant="soft">
                      <Callout.Icon>
                        <CheckCircledIcon />
                      </Callout.Icon>
                      <Callout.Text>{success}</Callout.Text>
                    </Callout.Root>
                  )}

                  <Button type="submit" size="3" loading={isLoading}>
                    {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
                  </Button>
                </Flex>
              </form>

              <Flex direction="column" gap="2" align="center">
                <Text size="2" color="gray">
                  Вже маєте акаунт?
                </Text>
                <Button asChild variant="soft" size="2">
                  <Link to="/login">Увійти</Link>
                </Button>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Container>
    </Section>
  );
}

export default Register;
