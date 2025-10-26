import React from 'react';
import { Link as RadixLink, Text, Separator } from '@radix-ui/themes';
import { GitHubLogoIcon } from '@radix-ui/react-icons';


const footerLinks = [
  { href: 'https://github.com', label: 'GitHub', icon: <GitHubLogoIcon /> },
];

function Footer() {
  return (
    <footer>
      <Separator orientation="horizontal" size="4" />
      <div className="py-5 md:py-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Text size="3" color="gray">
              &copy; 2025 Budget Tracker.
            </Text>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              {footerLinks.map((link) => (
                <RadixLink
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="2"
                  color="gray"
                >
                  <span className="flex items-center gap-2">
                    {link.icon}
                    {link.label}
                  </span>
                </RadixLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
