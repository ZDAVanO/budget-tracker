import moneyBagIcon from '../assets/money-bag-noto.svg';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  DropdownMenu,
  IconButton,
  Tooltip,
  Separator,
  Text,
  Heading,
} from '@radix-ui/themes';

import ThemeToggleButton from './ThemeToggleButton';
import UserMenu from './UserMenu';
import { isDemoMode } from '../services/api';


// MARK: Header
function Header({ isLoggedIn, user, onLogout }) {

  // MARK: Render
  return (
    <header className="sticky top-0 z-50 h-16">
      <div
        className="backdrop-blur-md backdrop-saturate-150 bg-[color-mix(in_srgb,var(--color-panel-solid)_80%,transparent)] border-b border-(--gray-a5) h-full"
      >
        <div className="w-full px-4 h-full">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-full">
            
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link
                to="/"
                className="inline-flex items-center gap-2 sm:gap-3 text-inherit no-underline min-w-0"
              >
                <img
                  src={moneyBagIcon}
                  alt="Money Bag"
                  className="inline align-middle w-7 h-7 sm:w-9 sm:h-9 shrink-0"
                  style={{ verticalAlign: 'middle' }}
                />
                <Heading size={{ initial: "3", sm: "5" }} className="truncate">
                  Budget Tracker
                </Heading>
              </Link>

              {isDemoMode && (
                <Badge color="amber" variant="surface" size="1" className="shrink-0">
                  Demo
                </Badge>
              )}
            </div>


            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggleButton />
              {isLoggedIn ? (
                <UserMenu user={user} onLogout={onLogout} />
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="soft" color="gray" size="2">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild size="2">
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
