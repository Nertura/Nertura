import { AuthShell } from '@/components/auth/auth-shell';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { AUTH_COPY } from '@/lib/i18n/auth-copy';

export default function ResetPasswordPage() {
  const copy = AUTH_COPY.resetPassword;

  return (
    <AuthShell title={copy.title} description={copy.description}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
