'use client';



import { useState, type ReactNode } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';



import {

  buildCompactDoctorView,

  normalizeDoctorPunctuation,

} from '../lib/doctor-display-polish';

import { getDoctorUiCopy, type UiLanguage } from '../lib/i18n/doctor-ui-copy';

import { cn } from '../lib/utils';



type RiskLevel = 'low' | 'medium' | 'high' | 'critical';



export interface DoctorAnswerCardProps {

  diagnosis: {

    diagnosis: string;

    symptoms: string;

    risk_level: RiskLevel;

    treatment: string;

    prevention: string;

    notes: string;

    disclaimer: string;

    source: string;

    confidence?: number;

    language?: 'tr' | 'en';

    sections?: {

      short_diagnosis: string;

      possible_causes: string;

      risk_level: RiskLevel;

      immediate_action: string;

      treatment_plan: string;

      prevention: string;

      expert_warning: string;

    };

  };

  /** Overrides diagnosis.language for label rendering (conversation locale). */

  language?: UiLanguage;

  /** When true, photo retake hint assumes an image was provided. */

  hasImage?: boolean;

  /** Inline evidence slot — rendered after follow-up, before expand. */

  evidenceSlot?: ReactNode;

}



const RISK_STYLES: Record<RiskLevel, string> = {

  low: 'border-l-[3px] border-l-emerald-500/50 bg-muted/25',

  medium: 'border-l-[3px] border-l-amber-500/50 bg-muted/30',

  high: 'border-l-[3px] border-l-orange-500/55 bg-muted/35',

  critical: 'border-l-[3px] border-l-destructive/60 bg-destructive/[0.04]',

};



function SectionLabel({ children }: { children: ReactNode }) {

  return (

    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">

      {children}

    </p>

  );

}



function BulletList({ items }: { items: string[] }) {

  if (!items.length) return null;

  return (

    <ul className="mt-2 space-y-2.5">

      {items.map((item) => (

        <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-foreground/90">

          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />

          <span>{item}</span>

        </li>

      ))}

    </ul>

  );

}



function DetailBlock({ title, children }: { title: string; children: ReactNode }) {

  const text = typeof children === 'string' ? children.trim() : children;

  if (!text) return null;

  return (

    <div className="space-y-1.5">

      <SectionLabel>{title}</SectionLabel>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{children}</p>

    </div>

  );

}



export function DoctorAnswerCard({

  diagnosis,

  language,

  hasImage,

  evidenceSlot,

}: DoctorAnswerCardProps) {

  const [expanded, setExpanded] = useState(false);

  const isFallback = diagnosis.source === 'fallback';

  const lang: UiLanguage = language ?? diagnosis.language ?? 'tr';

  const labels = getDoctorUiCopy(lang).answerCard;

  const view = buildCompactDoctorView({ ...diagnosis, language: lang }, { hasImage });



  const pct =

    diagnosis.confidence != null ? Math.round(diagnosis.confidence * 100) : null;

  const sourceLabel =

    labels.sources[diagnosis.source as keyof typeof labels.sources] ?? diagnosis.source;

  const riskLevel = view.expanded.riskLevel as RiskLevel;

  const riskLabel =

    labels.riskLevels[riskLevel as keyof typeof labels.riskLevels] ?? riskLevel;



  const showMixNote =

    lang === 'tr' &&

    view.expanded.possibleCauses &&

    diagnosis.confidence != null &&

    diagnosis.confidence < 0.78;



  return (

    <article

      className={cn(

        'chat-message-assistant animate-slide-up max-w-full space-y-4 rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:space-y-5 sm:p-5',

        isFallback && 'border-amber-200/70 bg-amber-50/30 dark:bg-amber-950/20'

      )}

    >

      {isFallback && (

        <p className="text-xs font-medium text-amber-800/90 dark:text-amber-200/90">

          {labels.fallback}

        </p>

      )}



      <div className="flex flex-wrap items-center gap-2">

        {pct != null && (

          <span className="rounded-full bg-muted/80 px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground">

            {labels.confidence}: {pct}%

          </span>

        )}

        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">

          {sourceLabel}

        </span>

      </div>



      {/* 1. Olası durum */}

      <section className="space-y-1.5">

        <SectionLabel>{labels.possibleCondition}</SectionLabel>

        <p className="text-[15px] leading-relaxed text-foreground">{view.shortDiagnosis}</p>

        {showMixNote && (

          <p className="text-xs leading-relaxed text-muted-foreground">{labels.mixNote}</p>

        )}

      </section>



      {/* 2. Risk seviyesi */}

      <section className={cn('rounded-xl px-3 py-2.5', RISK_STYLES[riskLevel] ?? RISK_STYLES.medium)}>

        <SectionLabel>{labels.risk}</SectionLabel>

        <p className="mt-1 text-sm font-medium text-foreground">{riskLabel}</p>

      </section>



      {/* 3. Bugün ne yapın */}

      {view.todayActions.length > 0 && (

        <section className="rounded-xl border border-border/40 bg-muted/20 px-3 py-3">

          <SectionLabel>{labels.today}</SectionLabel>

          <BulletList items={view.todayActions} />

        </section>

      )}



      {/* 4. Dikkat edin */}

      {view.expanded.expertWarning && (

        <section className="space-y-1.5 rounded-xl border border-border/40 px-3 py-3">

          <SectionLabel>{labels.watchOut}</SectionLabel>

          <p className="text-sm leading-relaxed text-foreground/90">{view.expanded.expertWarning}</p>

        </section>

      )}



      {/* 5. Ne zaman yeni fotoğraf? */}

      <section className="space-y-1.5 rounded-xl border border-dashed border-border/50 px-3 py-3">

        <SectionLabel>{labels.photo}</SectionLabel>

        <p className="text-sm leading-relaxed text-foreground/90">{view.photoHint}</p>

      </section>



      {/* 6. Bilimsel dayanak / Kanıtlar */}

      {evidenceSlot ? (

        <section className="space-y-2">

          <SectionLabel>{labels.scientificBasis}</SectionLabel>

          {evidenceSlot}

        </section>

      ) : null}



      {/* 7. Daha fazla detay */}

      {expanded && (

        <div className="space-y-4 border-t border-border/40 pt-4">

          <DetailBlock title={labels.causes}>

            {view.expanded.possibleCauses || '—'}

          </DetailBlock>

          <DetailBlock title={labels.treatment}>

            {normalizeDoctorPunctuation(view.expanded.treatmentPlan)}

          </DetailBlock>

          <DetailBlock title={labels.prevention}>{view.expanded.prevention}</DetailBlock>

        </div>

      )}



      <button

        type="button"

        onClick={() => setExpanded((v) => !v)}

        className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"

      >

        {expanded ? (

          <>

            <ChevronUp className="h-4 w-4" aria-hidden />

            {labels.less}

          </>

        ) : (

          <>

            <ChevronDown className="h-4 w-4" aria-hidden />

            {labels.more}

          </>

        )}

      </button>



      <p className="border-t border-border/40 pt-3 text-xs leading-relaxed text-muted-foreground">

        {diagnosis.disclaimer}

      </p>

    </article>

  );

}

