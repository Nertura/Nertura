import { redirect } from 'next/navigation';

import { CreateFarmWizard } from '@/components/farm/create-farm-wizard';
import { PageHeader } from '@/components/dashboard/page-header';
import { getDashboardContext } from '@/lib/auth/context';

export default async function NewFarmPage({
  searchParams,
}: {
  searchParams: Promise<{ intake?: string }>;
}) {
  const ctx = await getDashboardContext();
  if (!ctx.canWrite) redirect('/farms');

  const { intake } = await searchParams;
  const isIntake = intake === '1';

  return (
    <div>
      <PageHeader
        title={isIntake ? 'Yeni çiftlik oluştur' : 'Çiftlik ekle'}
        description={
          isIntake
            ? 'Intake bilgilerin korunacak. Çiftliği oluşturduktan sonra tarla haritasına geçeceğiz.'
            : 'Çiftliğini kaydet, ardından haritada tarla sınırlarını çiz.'
        }
      />
      <CreateFarmWizard intakeMode={isIntake} />
    </div>
  );
}
