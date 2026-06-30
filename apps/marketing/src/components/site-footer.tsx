import Link from 'next/link';

import { headers } from 'next/headers';



import {

  getDashboardLoginUrl,

  getDashboardRegisterUrl,

  dashboardContextFromHeaders,

} from '@/lib/app-urls';



const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nertura.com';



const LEGAL_LINKS = [

  { href: '/privacy', label: 'Gizlilik Politikası' },

  { href: '/terms', label: 'Kullanım Koşulları' },

  { href: '/kvkk', label: 'KVKK' },

  { href: '/cookies', label: 'Çerez Politikası' },

  { href: '/ai-disclaimer', label: 'AI Sorumluluk Reddi' },

  { href: '/photo-consent', label: 'Fotoğraf Onayı' },

  { href: '/data-export', label: 'Veri Dışa Aktarma' },

  { href: '/delete-account', label: 'Hesap Silme' },

  { href: '/contact', label: 'İletişim' },

] as const;



export async function SiteFooter() {

  const headerList = await headers();

  const context = dashboardContextFromHeaders(headerList);

  const registerUrl = getDashboardRegisterUrl({ next: '/doctor' }, context);

  const loginUrl = getDashboardLoginUrl({ next: '/doctor' }, context);



  return (

    <footer className="border-t bg-card" role="contentinfo">

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">

          <div>

            <div className="flex items-center gap-2">

              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-signal text-sm font-bold text-void">

                N

              </span>

              <span className="font-semibold text-void">Nertura</span>

            </div>

            <p className="mt-3 max-w-xs text-sm text-muted-foreground">

              Tarımın yapay zekâ beyni. Bitki sorunlarını teşhis edin, güvenilir tarım rehberliği alın.

            </p>

          </div>



          <div>

            <p className="text-sm font-medium text-void">Ürün</p>

            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">

              <li>

                <Link href="/" className="hover:text-foreground">

                  AI Tarım Doktoru

                </Link>

              </li>

              <li>

                <a href={registerUrl} className="hover:text-foreground">

                  Ücretsiz kayıt

                </a>

              </li>

              <li>

                <a href={loginUrl} className="hover:text-foreground">

                  Giriş yap

                </a>

              </li>

            </ul>

          </div>



          <div>

            <p className="text-sm font-medium text-void">Yasal</p>

            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">

              {LEGAL_LINKS.map(({ href, label }) => (

                <li key={href}>

                  <Link href={href} className="hover:text-foreground">

                    {label}

                  </Link>

                </li>

              ))}

            </ul>

          </div>

        </div>



        <div className="mt-10 flex flex-col gap-2 border-t pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">

          <p>&copy; {new Date().getFullYear()} Nertura. Tüm hakları saklıdır.</p>

          <p>

            <a href={siteUrl} className="hover:text-foreground">

              {siteUrl.replace(/^https?:\/\//, '')}

            </a>

          </p>

        </div>

      </div>

    </footer>

  );

}

