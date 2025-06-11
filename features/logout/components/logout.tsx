import { useRouter } from 'next/navigation';

import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { LogOut } from 'lucide-react';

import { useLogout } from '../hooks';

export function Logout() {
  const router = useRouter();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <DropdownMenuItem
      onClick={handleLogout}
      className="align-items: center flex cursor-pointer text-red-600"
    >
      <LogOut className="mr-2 mt-1 h-4 w-4" />
      <span>Выйти</span>
    </DropdownMenuItem>
  );
}
