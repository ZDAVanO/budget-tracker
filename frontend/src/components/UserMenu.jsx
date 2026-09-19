import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  DropdownMenu,
  Text,
} from '@radix-ui/themes';
import { ExitIcon, GearIcon, ReloadIcon } from '@radix-ui/react-icons';
import { isDemoMode, mockApi } from '../services/api';

function UserMenu({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleResetDemo = () => {
    if (mockApi?.resetDemoData) {
      mockApi.resetDemoData();
      window.location.reload();
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <div className="flex items-center gap-2 cursor-pointer">
          <Text size="2" color="gray" className="hidden sm:inline font-medium">
            {user}
          </Text>
          <Avatar
            size="2"
            fallback={user ? user[0]?.toUpperCase() : 'U'}
            color="mint"
          />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" variant="soft">
        <DropdownMenu.Item onClick={() => navigate('/settings')}>
          <GearIcon /> Settings
        </DropdownMenu.Item>
        {isDemoMode && (
          <DropdownMenu.Item color="amber" onClick={handleResetDemo}>
            <ReloadIcon /> Reset Demo Data
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" onClick={handleLogout}>
          <ExitIcon /> Logout
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export default UserMenu;

