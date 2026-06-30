export { CookieConsentBanner, type CookieConsentLegalLinks } from './components/cookie-consent-banner';
export {
  acceptAllCookieConsent,
  applyConsentToTracking,
  COOKIE_CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
  hasAnalyticsConsent,
  hasMarketingConsent,
  readCookieConsentFromStorage,
  rejectOptionalCookieConsent,
  type CookieConsentPreferences,
  writeCookieConsent,
} from './lib/cookie-consent';
export { Alert, AlertTitle, AlertDescription } from './components/alert';
export { Button, buttonVariants, type ButtonProps } from './components/button';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/card';
export { Input, type InputProps } from './components/input';
export {
  AppBadge,
  AppButton,
  AppCard,
  AppCardContent,
  AppCardDescription,
  AppCardFooter,
  AppCardHeader,
  AppCardTitle,
  AppComposerShell,
  AppEmptyState,
  AppInput,
  AppTextarea,
  composerTextareaClassName,
  type AppButtonProps,
  type AppTextareaProps,
} from './components/app';
export { Label, type LabelProps } from './components/label';
export { cn } from './lib/utils';
export {
  DOCTOR_UI_COPY,
  getDoctorUiCopy,
  type UiLanguage,
} from './lib/i18n/doctor-ui-copy';

export { NerturaLogo, AiChatHero } from './components/ai-chat/logo-hero';
export {
  AiChatShell,
  AiChatHeader,
  AiChatHistoryDrawer,
  type HistoryItem,
} from './components/ai-chat/shell';
export { DoctorAnswerCard } from './components/doctor-answer-card';
export { EvidenceCardsPanel, DoctorFeedbackButtons } from './components/doctor-intelligence';
export { OutcomeFollowUpPanel } from './components/outcome-follow-up';
export type { PendingFollowUpItem, OutcomeType } from './components/outcome-follow-up';
export {
  AiChatComposer,
  AiChatThinking,
  friendlyAiError,
} from './components/ai-chat/composer';
export { ThemeProvider, useTheme } from './components/theme-provider';
export { ThemeToggle } from './components/theme-toggle';
export {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './components/dropdown-menu';
export { SkipLink } from './components/skip-link';
export { OverlayPortal } from './components/overlay-portal';
export {
  MapView,
  type MapViewProps,
  type MapViewLabels,
  type MapViewportTarget,
} from './components/map-view';
