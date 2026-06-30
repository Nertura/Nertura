import { ProvidersClient } from '@/components/growth/providers-client';
import { listProviders, syncResendProviderFromEnv } from '@/lib/growth/providers';

export default async function ProvidersPage() {
  let providers: Awaited<ReturnType<typeof listProviders>> = [];
  try {
    await syncResendProviderFromEnv();
    providers = await listProviders();
  } catch {
    providers = [];
  }
  return <ProvidersClient providers={providers} />;
}
