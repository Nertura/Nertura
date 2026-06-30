/**
 * Notification hooks — architecture only (v1).
 * Timeline events with notify_at + notification_channels feed future workers.
 */

import type { CaseNotificationChannel, CaseTimelineEventType } from '@nertura/types';

export interface PendingCaseNotification {
  timelineEventId: string;
  fieldCaseId: string;
  channels: CaseNotificationChannel[];
  notifyAt: string;
  title: string;
  summary: string | null;
  eventType: CaseTimelineEventType;
}

export interface CaseNotificationDispatcher {
  /** Future: process due timeline events and dispatch email/push/calendar. */
  dispatchDue(now?: Date): Promise<{ processed: number; failed: number }>;
}

/** Placeholder dispatcher — no-op until notification center ships. */
export const noopCaseNotificationDispatcher: CaseNotificationDispatcher = {
  async dispatchDue() {
    return { processed: 0, failed: 0 };
  },
};
