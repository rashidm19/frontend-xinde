import { useTranslations } from 'next-intl';

type tValuesType = Record<string, string | number | Date> | undefined;

/**
 * Custom hook to access localized strings for common namespaces.
 */
export function useCustomTranslations(namespace?: string) {
  const t = useTranslations(namespace);
  const tActions = useTranslations('actions');
  const tImgAlts = useTranslations('imgAlts');
  const tCommon = useTranslations('common');
  const tCommonRich = tCommon.rich;
  const tForm = useTranslations('form');
  const tMessages = useTranslations('messages');

  return {
    t,
    tActions: (key: string, values?: tValuesType) => tActions(key, values),
    tImgAlts: (key: string, values?: tValuesType) => tImgAlts(key, values),
    tCommon: (key: string, values?: tValuesType) => tCommon(key, values),
    tCommonRich: (key: string, values?: any) => tCommonRich(key, values),
    tForm: (key: string, values?: tValuesType) => tForm(key, values),
    tMessages: (key: string, values?: tValuesType) => tMessages(key, values),
  };
}
