import Link from 'next/link';

import type { ReactNode } from 'react';



import { AppCard, AppCardContent, NerturaLogo } from '@nertura/ui';



import { AuthFooterLinks } from '@/components/auth/auth-consent-links';

import { AUTH_COPY } from '@/lib/i18n/auth-copy';



interface AuthShellProps {

  title: string;

  description: string;

  children: ReactNode;

  footer?: ReactNode;

}



export function AuthShell({ title, description, children, footer }: AuthShellProps) {

  const copy = AUTH_COPY;



  return (

    <div className="flex min-h-screen bg-background">

      {/* Trust panel — desktop */}

      <div className="relative hidden w-1/2 flex-col justify-between border-r border-border/60 bg-muted/20 p-10 xl:p-14 lg:flex">

        <NerturaLogo size="md" />



        <div className="max-w-md space-y-6">

          <p className="text-sm font-medium text-primary">{copy.brandTagline}</p>

          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground xl:text-4xl">

            {copy.brandHeadline}

          </h2>

          <ul className="space-y-3 text-sm text-muted-foreground">

            {copy.brandBullets.map((item) => (

              <li key={item} className="flex items-center gap-3">

                <span

                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"

                  aria-hidden

                >

                  ✓

                </span>

                {item}

              </li>

            ))}

          </ul>

          <p className="text-xs leading-relaxed text-muted-foreground/90">

            Verileriniz güvenle korunur. Fotoğraflarınız yalnızca analiz için kullanılır.

          </p>

        </div>



        <p className="text-xs text-muted-foreground">

          © {new Date().getFullYear()} Nertura

        </p>

      </div>



      {/* Form panel */}

      <div className="flex w-full flex-col justify-center px-5 py-10 sm:px-8 lg:w-1/2 lg:px-14 xl:px-16">

        <div className="mx-auto w-full max-w-md space-y-6">

          <div className="lg:hidden">

            <Link

              href="/"

              className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"

            >

              <NerturaLogo size="sm" />

            </Link>

          </div>



          <AppCard className="p-0">

            <AppCardContent className="space-y-8 p-6 sm:p-8">

              <div className="space-y-2">

                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>

                <p className="text-sm text-muted-foreground">{description}</p>

              </div>



              <div>{children}</div>



              {footer ? (

                <div className="text-center text-sm text-muted-foreground">{footer}</div>

              ) : null}

            </AppCardContent>

          </AppCard>



          <AuthFooterLinks />

        </div>

      </div>

    </div>

  );

}

