import type { LucideIcon } from 'lucide-react';
import {
  CreditCard,
  History,
  Home,
  Map,
  MessageSquarePlus,
  Settings,
  Sprout,
  Stethoscope,
  Tractor,
  User,
} from 'lucide-react';

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shorter label for mobile bottom nav */
  shortLabel?: string;
}

/** Primary sidebar / navigation — shared by shell and mobile nav */
export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: '/', label: 'Home', shortLabel: 'Home', icon: Home },
  { href: '/fields', label: 'Fields', shortLabel: 'Fields', icon: Map },
  { href: '/doctor', label: 'AI Doctor', shortLabel: 'Doctor', icon: Stethoscope },
  { href: '/intake', label: 'Describe problem', shortLabel: 'Intake', icon: MessageSquarePlus },
  { href: '/history', label: 'History', shortLabel: 'History', icon: History },
  { href: '/farms', label: 'My Farm', shortLabel: 'Farm', icon: Tractor },
  { href: '/crops', label: 'Crops', shortLabel: 'Crops', icon: Sprout },
  { href: '/account#credits', label: 'Credits', icon: CreditCard },
  { href: '/account', label: 'Account', shortLabel: 'Account', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const MOBILE_NAV: DashboardNavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/fields', label: 'Fields', icon: Map },
  { href: '/doctor', label: 'Doctor', icon: Stethoscope },
  { href: '/account', label: 'Account', icon: User },
];

export function isNavActive(pathname: string, href: string): boolean {
  const path = href.split('#')[0] ?? href;
  if (path === '/') return pathname === '/';
  if (path === '/doctor') return pathname === '/doctor' || pathname.startsWith('/doctor/');
  if (path === '/intake') return pathname.startsWith('/intake');
  if (path === '/account') return pathname.startsWith('/account') || pathname.startsWith('/billing');
  if (path === '/settings') return pathname.startsWith('/settings');
  if (path === '/farms') return pathname === '/farms' || pathname.startsWith('/farms/');
  return pathname === path || pathname.startsWith(`${path}/`);
}
