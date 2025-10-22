import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Button,
  Callout,
  Card,
  Heading,
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
      setError('Passwords do not match');
      return;
    }

    // if (formData.password.length < 6) {
    //   console.warn('⚠️ Register: Пароль занадто короткий');
    //   setError('Password must be at least 6 characters');
    //   return;
    // }

    setIsLoading(true);

    try {
      const { response, data } = await api.auth.register(formData.username, formData.email, formData.password);

      if (response.ok) {
        console.log('✅ Register: Реєстрація успішна');
        setSuccess('Registration successful! Redirecting to login page...');
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });

        setTimeout(() => {
          console.log('🔐 Register: Перенаправлення на Login');
          navigate('/login');
        }, 2000);
      } else {
        console.warn('⚠️ Register: Помилка реєстрації', data);
        setError(data?.msg || 'Registration error');
      }
    } catch (err) {
      console.error('❌ Register: Виняток при реєстрації', err);
      setError('Server connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card size="4" variant="surface">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 items-center">
                <PersonIcon width={24} height={24} />
                <Heading size="6">Create a new account</Heading>
                <Text color="gray" size="3" className="text-center">
                  Fill out the form to start managing your finances.
                </Text>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Text as="label" htmlFor="username">
                      Username
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
                  </div>

                  <div className="flex flex-col gap-2">
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
                  </div>

                  <div className="flex flex-col gap-2">
                    <Text as="label" htmlFor="password">
                      Password
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
                      minLength={3}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Text as="label" htmlFor="confirmPassword">
                      Confirm password
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
                      minLength={3}
                    />
                  </div>

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
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                </div>
              </form>

              <div className="flex flex-row gap-2 items-center justify-center">
                <Text size="2" color="gray">
                  Already have an account?
                </Text>
                <Button asChild variant="soft" size="2">
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default Register;
