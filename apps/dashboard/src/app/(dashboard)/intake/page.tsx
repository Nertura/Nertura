import { Suspense } from 'react';



import { PageHeader } from '@/components/dashboard/page-header';

import { FarmIntakeFlow } from '@/components/intake/farm-intake-flow';



export default function IntakePage() {

  return (

    <div>

      <PageHeader

        title="Tarla sorunu anlat"

        description="Konum, ürün, alan ve belirtileri doğal dille yaz. Nertura senin için düzenler ve haritada tarlanı bulmana yardım eder."

      />

      <Suspense fallback={<p className="text-sm text-muted-foreground">Yükleniyor…</p>}>

        <FarmIntakeFlow />

      </Suspense>

    </div>

  );

}


