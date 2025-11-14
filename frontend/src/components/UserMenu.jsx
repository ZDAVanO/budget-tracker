import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  DropdownMenu,
  Text,
} from '@radix-ui/themes';
import { ExitIcon, GearIcon } from '@radix-ui/react-icons';

function UserMenu({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <div className="flex items-center gap-3 cursor-pointer">
          <Text size="3" color="gray">
            {user}
          </Text>
          <Avatar
            fallback={user ? user[0]?.toUpperCase() : 'U'}
            color="mint"
          />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" variant="soft">
        <DropdownMenu.Item onClick={() => navigate('/settings')}>
          <GearIcon /> Settings
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" onClick={handleLogout}>
          <ExitIcon /> Logout
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export default UserMenu;
