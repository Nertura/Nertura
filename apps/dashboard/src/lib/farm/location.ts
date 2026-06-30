import type { Farm } from '@nertura/types';

export function formatFarmLocation(farm: Pick<Farm, 'address'>): string | null {
  const address = (farm.address ?? {}) as {
    city?: string;
    district?: string;
    country?: string;
    country_code?: string;
  };
  const country = address.country ?? address.country_code;
  const line = [address.district, address.city, country].filter(Boolean).join(', ');
  return line || null;
}
