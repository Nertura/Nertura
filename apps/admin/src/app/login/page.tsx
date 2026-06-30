import { Suspense } from 'react';

import { AdminLoginForm } from '@/components/admin-login-form';

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
