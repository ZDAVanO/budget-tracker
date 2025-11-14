import { useState } from 'react';
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

const INITIAL_FORM = { username: '', email: '', password: '', confirmPassword: '' };

// MARK: Register
function Register() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  console.log('🎨 Register page render');


  // MARK: handleChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Register form change: ${name} =`, name.includes('password') ? '***' : value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  // MARK: handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { username, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      console.warn('⚠️ Register: Паролі не співпадають');
      setError('Passwords do not match');
      return;
    }

    // MARK: password.length
    if (formData.password.length < 6) {
      console.warn('⚠️ Register: Пароль занадто короткий');
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const { response, data } = await api.auth.register(username, email, password);

      if (response.ok) {
        console.log('✅ Register: Реєстрація успішна');
        setSuccess('Registration successful! Redirecting to login page...');
        setFormData(INITIAL_FORM);

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

  
  // MARK: Render
  return (
    <section className="py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card size="4" variant="surface">
            <div className="flex flex-col gap-5">
              {/* MARK: Header */}
              <div className="flex flex-col gap-2 items-center">
                <PersonIcon width={24} height={24} />
                <Heading size="6">Create a new account</Heading>
                <Text color="gray" size="3" className="text-center">
                  Fill out the form to start managing your finances.
                </Text>
              </div>

              {/* MARK: Form */}
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  {/* MARK: Username */}
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

                  {/* MARK: Email */}
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

                  {/* MARK: Password */}
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

                  {/* MARK: Confirm Password */}
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

                  {/* MARK: Error */}
                  {error && (
                    <Callout.Root color="red" variant="surface">
                      <Callout.Text>{error}</Callout.Text>
                    </Callout.Root>
                  )}

                  {/* MARK: Success */}
                  {success && (
                    <Callout.Root color="mint" variant="soft">
                      <Callout.Icon>
                        <CheckCircledIcon />
                      </Callout.Icon>
                      <Callout.Text>{success}</Callout.Text>
                    </Callout.Root>
                  )}

                  {/* MARK: Submit Button */}
                  <Button type="submit" size="3" loading={isLoading}>
                    {isLoading ? 'Registering...' : 'Register'}
                  </Button>
                </div>
              </form>

              {/* MARK: Login Link */}
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
