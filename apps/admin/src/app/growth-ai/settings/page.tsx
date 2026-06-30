import { GrowthSettingsClient } from '@/components/growth/growth-settings-client';
import { getGrowthSettings } from '@/lib/growth/scheduler';

export default async function GrowthSettingsPage() {
  let settings = null;
  try {
    settings = await getGrowthSettings();
  } catch {
    settings = null;
  }
  return <GrowthSettingsClient settings={settings} />;
}
