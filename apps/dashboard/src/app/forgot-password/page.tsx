import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { AUTH_COPY } from '@/lib/i18n/auth-copy';

export default function ForgotPasswordPage() {
  const copy = AUTH_COPY.forgotPassword;

  return (
    <AuthShell title={copy.title} description={copy.description}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
