import { useState } from 'react';
import { User, Settings, LogOut, Key } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileMenuProps {
  onSettingsClick: () => void;
}

export function ProfileMenu({ onSettingsClick }: ProfileMenuProps) {
  const { user } = useAuth();

  if (!user) return null;

  const getInitials = () => {
    if (user && typeof user === 'object' && 'firstName' in user && 'lastName' in user) {
      const firstName = user.firstName as string;
      const lastName = user.lastName as string;
      if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      }
    }
    if (user && typeof user === 'object' && 'email' in user && user.email) {
      return (user.email as string).charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user && typeof user === 'object' && 'firstName' in user && 'lastName' in user) {
      const firstName = user.firstName as string;
      const lastName = user.lastName as string;
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      }
    }
    return 'User';
  };

  const getUserEmail = () => {
    if (user && typeof user === 'object' && 'email' in user && typeof user.email === 'string') {
      return user.email;
    }
    return '';
  };

  const getProfileImage = () => {
    if (user && typeof user === 'object' && 'profileImageUrl' in user && typeof user.profileImageUrl === 'string') {
      return user.profileImageUrl;
    }
    return '';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getProfileImage()} alt={getUserName()} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getUserName()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {getUserEmail()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
            <Key className="mr-2 h-4 w-4" />
            <span>API Keys</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => window.location.href = '/api/logout'}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}