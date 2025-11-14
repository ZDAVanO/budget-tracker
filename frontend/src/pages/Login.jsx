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
import { LockClosedIcon } from '@radix-ui/react-icons';
import api from '../services/api';

// MARK: constants
const INITIAL_FORM = { username: '', password: '' };

// MARK: Login 
function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  console.log('🎨 Login page render');

  // MARK: handleChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Login form change: ${name} =`, name === 'password' ? '***' : value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  // MARK: handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('🔐 Login: Attempting login, username:', formData.username);

    try {
      const { response, data } = await api.auth.login(formData.username, formData.password);

      if (response.ok) {
        console.log('✅ Login: Login successful, calling onLoginSuccess');
        onLoginSuccess();
        navigate('/dashboard');
      } else {
        console.warn('⚠️ Login: Login error', data);
        setError(data?.msg || 'Invalid username or password');
      }

    } catch (err) {
      console.error('❌ Login: Exception during login', err);
      setError('Failed to connect to server');

    } finally {
      setIsLoading(false);
    }
  };


  // MARK: render
  return (

    <section className="py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-center min-h-[70vh]">
          <Card size="4" variant="surface" >
            <div className="flex flex-col gap-5">

              {/* MARK: header */}
              <div className="flex flex-col gap-2 items-center">
                <LockClosedIcon width={24} height={24} />
                <Heading size="6">Sign in to Budget Tracker</Heading>
                <Text color="gray" size="3">
                  Enter your credentials to continue.
                </Text>
              </div>

              {/* MARK: form */}
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  {/* MARK: username */}
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
                      placeholder="Enter your username"
                    />
                  </div>

                  {/* MARK: password */}
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
                      autoComplete="current-password"
                      placeholder="********"
                    />
                  </div>

                  {/* MARK: error */}
                  {error && (
                    <Callout.Root color="red" variant="surface">
                      <Callout.Text>{error}</Callout.Text>
                    </Callout.Root>
                  )}

                  {/* MARK: submit button */}
                  <Button type="submit" size="3" loading={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </form>

              {/* MARK: register link */}
              <div className="flex flex-row gap-2 items-center justify-center">
                <Text size="2" color="gray">
                  Don't have an account?
                </Text>
                <Button asChild variant="soft" size="2">
                  <Link to="/register">Register</Link>
                </Button>
              </div>
              
            </div>
          </Card>
        </div>
      </div>
    </section>

  );
}

export default Login;
