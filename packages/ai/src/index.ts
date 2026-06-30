export {
  runNerturaDoctorProvider,
  runDoctorPipeline,
  answerToDiagnosis,
  searchKnowledgeItems,
  knowledgeHitToAnswer,
  jsonToText,
  analyzeWithGeminiVision,
  askGemini,
  askGeminiAgricultureDoctor,
  isGeminiConfigured,
  getGeminiKeyStatus,
  listGeminiModels,
  GeminiError,
  getGeminiModel,
  runKnowledgeBankDoctor,
  runIntelligenceEngine,
  KB_HIGH_CONFIDENCE_THRESHOLD,
  classifyIntent,
  extractEntities,
  buildEvidenceCards,
  rankSimilarCases,
  adjustConfidenceFromOutcomes,
  FOLLOW_UP_DAYS,
  OUTCOME_TYPE_VALUES,
  analyzeWithOpenAI,
  synthesizeWithBrain,
  buildMockAnswer,
  getAiProviderConfig,
  formatKnowledgeContext,
  GUEST_QUESTION_LIMIT,
  REGISTERED_FREE_LIMIT,
  DOCTOR_DISCLAIMER,
  FEEDBACK_TYPE_VALUES,
} from './pipeline';

export type {
  DoctorAnswer,
  DoctorPipelineInput,
  DoctorPipelineOutput,
  DoctorSource,
  KnowledgeHit,
  RiskLevel,
} from './types';

export type {
  AgricultureIntent,
  EvidenceCard,
  EvidenceCardType,
  ExtractedEntities,
  FeedbackType,
  IntelligenceContext,
  IntelligenceEngineOutput,
  MemoryEventPayload,
  ReasoningStep,
  UrgencyLevel,
  DiagnosisOutcomeType,
  RankedSimilarCase,
  FollowUpDay,
  FarmIntakeParseResult,
  FarmIntakeLocation,
  FarmAreaUnit,
} from './pipeline';

export type { ConversationLanguage } from './conversation-language';

export {
  parseFarmIntake,
  statedAreaToM2,
  formatAreaTriple,
  areaMismatchRatio,
  runContentIntelligence,
  formatNaturalDoctorSummary,
  parseVisionAnalysis,
  resolveCropIdFromLabel,
  cropsConflict,
  VISION_MIN_CONFIDENCE,
  normalizeLocaleToLanguage,
  parseAcceptLanguage,
  resolveInitialConversationLanguage,
  detectExplicitLanguageSwitch,
  isImageOnlySubmission,
  getImageOnlyPrompt,
  buildStrictLanguageBlock,
  hasKbContentInLanguage,
  detectMessageLanguage,
  PHOTO_QUICK_ACTIONS,
} from './pipeline';

export {
  friendlyDoctorError,
  userFacingUploadError,
  type ImageValidationErrorCode as UploadErrorCode,
} from './upload-messages';

export {
  resolveDoctorLanguage,
  normalizeDoctorAnswerLanguage,
  normalizeEvidenceCardsLanguage,
  disclaimerForLanguage,
  canServeKbDirectly,
  pickLocalizedKbName,
  pickLocalizedKbSummary,
  buildTurkishKbDiagnosis,
  collectDoctorVisibleText,
  findEnglishLeaks,
  containsFarmerVisibleEnglish,
  BANNED_ENGLISH_VISIBLE_PATTERNS,
} from './language-output-normalizer';

export { formatVisionSummaryForEvidence } from './vision-analysis';

export type { ContentDraftResult, ContentCitation } from './content-engine';

export type { DoctorDiagnosis } from './pipeline';
export type { AiProviderConfig } from './env';
export type { GeminiTextResult } from './gemini';
export type { FarmIntelligenceProfile, FieldIntelligenceContext, SiteType } from './farm-profile';
export { formatFarmProfileForPrompt, mergeCropsForDoctor } from './farm-profile';
