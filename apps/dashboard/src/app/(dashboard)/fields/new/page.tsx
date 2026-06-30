import { redirect } from 'next/navigation';

/** Manual field form deprecated — canonical path is intake → map boundary draw. */
export default async function NewFieldPage() {
  redirect('/intake?from=fields-new');
}