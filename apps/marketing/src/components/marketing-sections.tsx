import Link from 'next/link';

import { headers } from 'next/headers';



import { buttonVariants, cn } from '@nertura/ui';



import {

  dashboardContextFromHeaders,

  getDashboardLoginUrl,

  getDashboardRegisterUrl,

} from '@/lib/app-urls';



const STEPS = [

  {

    title: 'Ask or upload',

    description: 'Describe your crop problem or upload a plant photo for AI vision analysis.',

  },

  {

    title: 'Get a diagnosis',

    description: 'Nertura Intelligence Engine combines Knowledge Bank, farm memory, and regional context for grounded answers.',

  },

  {

    title: 'Act with confidence',

    description: 'Receive risk level, treatment plan, prevention steps, and evidence cards.',

  },

];



const FEATURES = [

  {

    title: 'AI Plant Doctor',

    description:

      'Diagnose diseases, pests, nutrient issues, and irrigation problems with structured agricultural guidance.',

  },

  {

    title: 'Farm Memory',

    description:

      'Your location, crops, and past analyses build a persistent intelligence profile for every answer.',

  },

  {

    title: 'Regional Intelligence',

    description:

      'Climate, soil, and disease-risk placeholders are architected for future weather and satellite APIs.',

  },

];



export async function MarketingSections() {

  const headerList = await headers();

  const context = dashboardContextFromHeaders(headerList);

  const registerUrl = getDashboardRegisterUrl({ next: '/doctor' }, context);

  const loginUrl = getDashboardLoginUrl({ next: '/doctor' }, context);



  return (

    <div className="border-t bg-muted/20">

      {/* How it works */}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="how-heading">

        <h2 id="how-heading" className="text-center text-2xl font-semibold text-void sm:text-3xl">

          How Nertura Works

        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">

          Three steps from question to actionable crop guidance.

        </p>

        <ol className="mt-12 grid gap-8 sm:grid-cols-3">

          {STEPS.map((step, i) => (

            <li key={step.title} className="relative rounded-xl border bg-card p-6 text-center">

              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-signal text-sm font-bold text-void">

                {i + 1}

              </span>

              <h3 className="mt-4 font-semibold text-void">{step.title}</h3>

              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>

            </li>

          ))}

        </ol>

      </section>



      {/* Features */}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="features-heading">

        <h2 id="features-heading" className="text-center text-2xl font-semibold text-void">

          Built for modern agriculture

        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">

          {FEATURES.map((f) => (

            <article key={f.title} className="rounded-xl border bg-card p-6">

              <h3 className="font-semibold text-void">{f.title}</h3>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>

            </article>

          ))}

        </div>

      </section>



      {/* Audience */}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="audience-heading">

        <div className="rounded-2xl border bg-gradient-to-br from-signal/10 via-card to-card p-8 sm:p-12">

          <h2 id="audience-heading" className="text-xl font-semibold text-void sm:text-2xl">

            Built for Farmers, Agronomists and Cooperatives

          </h2>

          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">

            From single-farm operations to agribusiness teams — Nertura scales from free guest

            questions to organization-wide AI intelligence with credits, history, and field management.

          </p>

        </div>

      </section>



      {/* FAQ */}

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6" aria-labelledby="faq-heading">

        <h2 id="faq-heading" className="text-center text-2xl font-semibold text-void">

          Frequently asked questions

        </h2>

        <dl className="mt-10 space-y-6">

          {[

            {

              q: 'Is Nertura just ChatGPT for plants?',

              a: 'No. Every answer flows through the Nertura Intelligence Engine — Knowledge Bank citations, farm memory, field context, and evidence cards. Never raw AI.',

            },

            {

              q: 'Can I describe my field in plain language?',

              a: 'Yes. Example: "10 dönüm wheat in Toprakkale, yellowing leaves." Nertura structures location, crop, and symptoms, then guides you to map the exact field.',

            },

            {

              q: 'Is treatment advice safe to follow blindly?',

              a: 'No. Nertura provides educational guidance. Always confirm pesticide and treatment decisions with a certified agronomist and local regulations.',

            },

          ].map((item) => (

            <div key={item.q} className="rounded-xl border bg-card p-5">

              <dt className="font-medium text-void">{item.q}</dt>

              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>

            </div>

          ))}

        </dl>

      </section>



      {/* Trust */}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="trust-heading">

        <h2 id="trust-heading" className="text-center text-lg font-semibold text-void">

          Trust & Disclaimer

        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground">

          Nertura AI advice does not replace a certified agricultural expert. Always verify

          pesticide, treatment, and regulatory decisions with qualified agronomists and local

          authorities.{' '}

          <Link href="/ai-disclaimer" className="text-primary underline hover:text-foreground">

            Read our AI Disclaimer

          </Link>

          .

        </p>

      </section>



      {/* Pricing CTA */}

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6" aria-labelledby="cta-heading">

        <div className="rounded-2xl border bg-void px-6 py-10 text-center text-void-foreground sm:px-12">

          <h2 id="cta-heading" className="text-xl font-semibold sm:text-2xl">

            Start with 10 free AI credits

          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-void-foreground/70">

            Create an account, complete farm setup, and unlock the full AI Plant Doctor with memory

            and regional context.

          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link href={registerUrl} className={cn(buttonVariants(), 'min-w-[160px]')}>

              Sign up free

            </Link>

            <Link

              href={loginUrl}

              className={cn(buttonVariants({ variant: 'outline' }), 'min-w-[160px] border-void-foreground/30 bg-transparent text-void-foreground hover:bg-void-foreground/10')}

            >

              Log in

            </Link>

          </div>

        </div>

      </section>

    </div>

  );

}

