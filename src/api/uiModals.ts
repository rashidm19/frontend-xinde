import { isAxiosError } from 'axios';
import { z } from 'zod';

import http from '@/lib/axiosInstance';

const MODALS_BASE_PATH = '/ui/modals';

export const modalKeySchema = z.enum(['FREE_PRACTICE_TEST_MODAL', 'FEEDBACK_MODAL']);

export type ModalKey = z.infer<typeof modalKeySchema>;

const freePracticeTestPayloadSchema = z
  .object({
    hasFreeTest: z.boolean().optional().default(true),
    startPracticeRoute: z.string().min(1).optional(),
  })
  .passthrough();

const feedbackModalPayloadSchema = z.object({}).passthrough();

const modalPayloadParsers: Record<ModalKey, z.ZodTypeAny> = {
  FREE_PRACTICE_TEST_MODAL: freePracticeTestPayloadSchema,
  FEEDBACK_MODAL: feedbackModalPayloadSchema,
};

const activeModalItemSchema = z.object({
  key: modalKeySchema,
  version: z.number().min(1),
  payload: z.unknown().optional(),
});

const activeModalsResponseSchema = z.array(activeModalItemSchema);

export type FreePracticeTestModalPayload = z.infer<typeof freePracticeTestPayloadSchema>;
export type FeedbackModalPayload = z.infer<typeof feedbackModalPayloadSchema>;

export type ModalPayloadMap = {
  FREE_PRACTICE_TEST_MODAL: FreePracticeTestModalPayload;
  FEEDBACK_MODAL: FeedbackModalPayload;
};

export interface ActiveModal<K extends ModalKey = ModalKey> {
  key: K;
  version: number;
  payload: ModalPayloadMap[K];
}

const mapModalPayload = (modal: z.infer<typeof activeModalItemSchema>): ActiveModal => {
  const parser = modalPayloadParsers[modal.key];
  const parsedPayload = parser.safeParse(modal.payload ?? {});

  return {
    key: modal.key,
    version: modal.version,
    payload: (parsedPayload.success ? parsedPayload.data : parser.parse({})) as ModalPayloadMap[typeof modal.key],
  } as ActiveModal;
};

export const getActiveModals = async (): Promise<ActiveModal[]> => {
  try {
    const response = await http.get(`${MODALS_BASE_PATH}/active`);
    const data = activeModalsResponseSchema.parse(response.data);
    return data.map(mapModalPayload);
  } catch (error) {
    return [];
  }
};

const modalEventPayloadSchema = z.object({
  key: modalKeySchema,
});

export type ModalEventPayload = z.infer<typeof modalEventPayloadSchema>;

const buildEventPath = (event: 'view' | 'dismiss' | 'complete'): string => `${MODALS_BASE_PATH}/${event}`;

export const postModalEvent = async (event: 'view' | 'dismiss' | 'complete', payload: ModalEventPayload) => {
  const body = modalEventPayloadSchema.parse(payload);
  await http.post(buildEventPath(event), body);
};

export interface ModalApiError {
  message?: string;
}

const getModalApiErrorMessage = (error: unknown): string | undefined => {
  if (isAxiosError(error)) {
    const data = error.response?.data as ModalApiError | undefined;
    if (data?.message) {
      return data.message;
    }
  }

  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message?: string }).message;
  }

  return undefined;
};

export const isModalNotAvailableError = (error: unknown): boolean => getModalApiErrorMessage(error) === 'modal_not_available';

export const isModalNotTrackedError = (error: unknown): boolean => getModalApiErrorMessage(error) === 'modal_not_tracked';
