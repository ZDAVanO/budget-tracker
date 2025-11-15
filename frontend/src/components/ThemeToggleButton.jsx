import { IconButton, Tooltip, DropdownMenu } from '@radix-ui/themes';
import { MoonIcon, SunIcon, GearIcon } from '@radix-ui/react-icons';
import { useThemeMode } from '../contexts/ThemeContext';

function ThemeToggleButton() {
  const { appearance, effectiveAppearance, setAppearance } = useThemeMode();

  const themes = [
    { value: 'light', label: 'Light theme', icon: <SunIcon /> },
    { value: 'dark', label: 'Dark theme', icon: <MoonIcon /> },
    { value: 'system', label: 'System default', icon: <GearIcon /> },
  ];

  const currentTheme = themes.find(theme => theme.value === appearance) || themes[0];
  // when user selected 'system' we want the main button to reflect the
  // currently active appearance (sun/moon) so pick icon from effectiveAppearance
  const displayIcon = appearance === 'system'
    ? (effectiveAppearance === 'dark' ? <MoonIcon /> : <SunIcon />)
    : currentTheme.icon;

  return (
    <DropdownMenu.Root>
      <Tooltip content="Change theme" side="bottom" align="center">
        <DropdownMenu.Trigger asChild>
          <IconButton
            variant="soft"
            color="gray"
            radius="full"
            aria-label="Change theme"
          >
            {displayIcon}
          </IconButton>
        </DropdownMenu.Trigger>
      </Tooltip>
      <DropdownMenu.Content>
        {themes.map((theme) => (
          <DropdownMenu.Item
            key={theme.value}
            onClick={() => setAppearance(theme.value)}
            disabled={appearance === theme.value}
          >
            {theme.icon}
            {theme.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export default ThemeToggleButton;