import type { DoctorDiagnosis } from '@nertura/types';

export function formatDiagnosisMessage(d: DoctorDiagnosis): string {
  return [
    `Diagnosis: ${d.diagnosis}`,
    `Symptoms: ${d.symptoms}`,
    `Risk Level: ${d.risk_level}`,
    `Treatment: ${d.treatment}`,
    `Prevention: ${d.prevention}`,
    `Notes: ${d.notes}`,
    `Disclaimer: ${d.disclaimer}`,
  ].join('\n\n');
}
