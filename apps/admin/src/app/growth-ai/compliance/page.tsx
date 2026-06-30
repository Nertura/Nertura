import { ComplianceClient } from '@/components/growth/compliance-client';
import { getComplianceSettings, listAuditLog, listSuppressionList } from '@/lib/growth/compliance';

export default async function CompliancePage() {
  let settings = null;
  let suppression: Awaited<ReturnType<typeof listSuppressionList>> = [];
  let auditLog: Awaited<ReturnType<typeof listAuditLog>> = [];
  try {
    [settings, suppression, auditLog] = await Promise.all([
      getComplianceSettings(),
      listSuppressionList(),
      listAuditLog(50),
    ]);
  } catch {
    /* empty */
  }
  return <ComplianceClient settings={settings} suppression={suppression} auditLog={auditLog} />;
}
