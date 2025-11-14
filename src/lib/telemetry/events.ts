import { track } from './index';
import type { TelemetryTrackProperties } from './types';

export const TelemetryEvents = {
  PAGE_VIEW: 'page_view',
  PRACTICE_STARTED: 'practice_started',
  WRITING_SUBMITTED: 'writing_submitted',
  SPEAKING_RECORDED: 'speaking_recorded',
  AI_FEEDBACK_INTERACTED: 'ai_feedback_interacted',
  PAYMENT_SUCCEEDED: 'payment_succeeded',
  PAYMENT_FAILED: 'payment_failed',
} as const;

type PageViewPayload = {
  path: string;
  title: string;
  referrer?: string;
  language?: string;
};

export const trackPageView = (payload: PageViewPayload) => {
  track(TelemetryEvents.PAGE_VIEW, payload satisfies TelemetryTrackProperties);
};

type PracticeStartedPayload = {
  section: string;
  practice_id: string | number;
  mode?: 'mock' | 'practice';
  source?: string;
};

export const trackPracticeStarted = (payload: PracticeStartedPayload) => {
  track(TelemetryEvents.PRACTICE_STARTED, payload satisfies TelemetryTrackProperties);
};

type WritingSubmittedPayload = {
  writing_id: string | number;
  words: number;
  task_type: string;
  duration_ms?: number;
};

export const trackWritingSubmitted = (payload: WritingSubmittedPayload) => {
  track(TelemetryEvents.WRITING_SUBMITTED, payload satisfies TelemetryTrackProperties);
};

type SpeakingRecordedPayload = {
  practice_id: string | number;
  question_id: string | number;
  duration_s?: number;
  codec?: string;
};

export const trackSpeakingRecorded = (payload: SpeakingRecordedPayload) => {
  track(TelemetryEvents.SPEAKING_RECORDED, payload satisfies TelemetryTrackProperties);
};

type AiFeedbackInteractedPayload = {
  section: string;
  source: string;
  latency_ms?: number;
  band?: string;
};

export const trackAiFeedbackInteracted = (payload: AiFeedbackInteractedPayload) => {
  track(TelemetryEvents.AI_FEEDBACK_INTERACTED, payload satisfies TelemetryTrackProperties);
};

type PaymentBasePayload = {
  provider: string;
  order_id: string;
  service_id?: string;
  plan_id?: string;
};

type PaymentSucceededPayload = PaymentBasePayload & {
  amount: number;
  currency: string;
};

export const trackPaymentSucceeded = (payload: PaymentSucceededPayload) => {
  track(TelemetryEvents.PAYMENT_SUCCEEDED, payload satisfies TelemetryTrackProperties);
};

type PaymentFailedPayload = PaymentBasePayload & {
  failure_reason: string;
  retry?: boolean;
};

export const trackPaymentFailed = (payload: PaymentFailedPayload) => {
  track(TelemetryEvents.PAYMENT_FAILED, payload satisfies TelemetryTrackProperties);
};
