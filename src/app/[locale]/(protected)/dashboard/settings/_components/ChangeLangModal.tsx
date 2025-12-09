'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import React from 'react';
import { z } from 'zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale } from 'use-intl';

import { BottomSheetContent } from '@/components/ui/bottom-sheet';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { Link, usePathname } from '@/i18n/navigation';
import { BottomSheetHeader } from '@/components/mobile/MobilePageHeader';

const formSchema = z.object({
  language: z.string(),
});

type ChangeLangFormValues = z.infer<typeof formSchema>;

type Translations = ReturnType<typeof useCustomTranslations>;

interface SharedRenderProps {
  form: UseFormReturn<ChangeLangFormValues>;
  locale: string;
  pathname: string;
  t: Translations['t'];
  tImgAlts: Translations['tImgAlts'];
  tForm: Translations['tForm'];
  tActions: Translations['tActions'];
}

interface ChangeLangModalProps {
  variant?: 'desktop' | 'mobile';
}

const useChangeLangState = (): SharedRenderProps => {
  const locale = useLocale();
  const pathname = usePathname();
  const { t, tImgAlts, tForm, tActions } = useCustomTranslations('profileSettings.changeLangModal');

  const form = useForm<ChangeLangFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: locale,
    },
  });

  return { form, locale, pathname, t, tImgAlts, tForm, tActions };
};

interface ChangeLangFormFieldsProps {
  form: UseFormReturn<ChangeLangFormValues>;
  t: SharedRenderProps['t'];
  tForm: SharedRenderProps['tForm'];
  className?: string;
  showTitle?: boolean;
}

const ChangeLangFormFields = ({ form, t, tForm, className, showTitle = true }: ChangeLangFormFieldsProps) => (
  <Form {...form}>
    <form className={cn('flex flex-col gap-y-[24rem]', className)}>
      {showTitle ? <h1 className='text-[20rem] font-medium leading-none text-d-black'>{t('title')}</h1> : null}
      <FormField
        name='language'
        control={form.control}
        render={({ field }) => (
          <FormItem className='flex flex-col gap-y-[8rem] px-[4rem]'>
            <div className='flex flex-row justify-between'>
              <FormMessage className='font-poppins text-[14rem] font-medium leading-none text-d-red' />
            </div>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className='h-[54rem] rounded-[40rem] bg-d-light-gray px-[32rem] text-[18rem] font-medium leading-normal data-[state=open]:rounded-b-none'>
                  <SelectValue placeholder={tForm('placeholders.select')} className='placeholder:text-d-black/60' />
                </SelectTrigger>
              </FormControl>
              <SelectContent className='z-[10000] mt-0 max-h-[250rem] rounded-b-[40rem]'>
                <SelectItem value='en' className='h-[54rem] px-[32rem] text-[18rem] font-medium leading-none last:rounded-b-[40rem] hover:bg-d-light-gray'>
                  English
                </SelectItem>
                <SelectItem value='ru' className='h-[54rem] px-[32rem] text-[18rem] font-medium leading-none last:rounded-b-[40rem] hover:bg-d-light-gray'>
                  Русский
                </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </form>
  </Form>
);

interface ChangeLangActionsProps {
  form: UseFormReturn<ChangeLangFormValues>;
  locale: string;
  pathname: string;
  tActions: SharedRenderProps['tActions'];
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
}

const ChangeLangActions = ({ form, locale, pathname, tActions, className, primaryClassName, secondaryClassName }: ChangeLangActionsProps) => {
  const selectedLanguage = form.watch('language');

  return (
    <div className={cn('flex flex-col gap-y-[12rem] tablet:flex-row tablet:items-center tablet:gap-x-[12rem]', className)}>
      <DialogPrimitive.Close asChild>
        <Link
          href={selectedLanguage === locale ? '#' : pathname}
          locale={selectedLanguage}
          className={cn(
            'flex h-[50rem] items-center justify-center rounded-full bg-d-green px-[32rem] text-[14rem] font-semibold leading-none text-black transition-colors hover:bg-d-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-d-green/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
            primaryClassName
          )}
        >
          {tActions('ok')}
        </Link>
      </DialogPrimitive.Close>
      <DialogPrimitive.Close asChild>
        <button
          type='button'
          className={cn(
            'mt-[8rem] flex h-[50rem] items-center justify-center rounded-full border border-slate-200 bg-white px-[32rem] text-[14rem] font-medium leading-none text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white tablet:mt-0',
            secondaryClassName
          )}
        >
          {tActions('cancel')}
        </button>
      </DialogPrimitive.Close>
    </div>
  );
};

const DesktopChangeLang = ({ form, locale, pathname, t, tImgAlts, tForm, tActions }: SharedRenderProps) => (
  <section className='fixed bottom-0 flex max-h-[95dvh] w-[672rem] flex-col gap-y-[40rem] rounded-[16rem] bg-white p-[24rem] desktop:relative desktop:rounded-[24rem]'>
    <DialogPrimitive.Close asChild>
      <button
        type='button'
        className='absolute right-[24rem] top-[24rem] rounded-full p-[6rem] transition hover:bg-d-light-gray/70'
        aria-label={tActions('cancel')}
      >
        <img src='/images/icon_close--black.svg' alt={tImgAlts('close')} className='size-[20rem]' />
      </button>
    </DialogPrimitive.Close>

    <ChangeLangFormFields
      form={form}
      t={t}
      tForm={tForm}
      className='w-[520rem] rounded-[24rem] bg-white pb-[20rem] shadow-card'
    />

    <ChangeLangActions form={form} locale={locale} pathname={pathname} tActions={tActions} />
  </section>
);

const MobileChangeLang = ({ form, locale, pathname, t, tForm, tActions }: SharedRenderProps) => (
  <BottomSheetContent>
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      <BottomSheetHeader title={t('title')} closeLabel={tActions('cancel')} closeButton />

      <ScrollArea className='flex-1 px-[20rem]'>
        <div className='pb-[24rem] pt-[12rem]'>
          <ChangeLangFormFields form={form} t={t} tForm={tForm} showTitle={false} className='w-full gap-y-[20rem]' />
        </div>
      </ScrollArea>

      <div className='border-t border-white/60 bg-white/95 px-[20rem] pb-[calc(18rem+env(safe-area-inset-bottom))] pt-[16rem] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]'>
        <ChangeLangActions
          form={form}
          locale={locale}
          pathname={pathname}
          tActions={tActions}
          className='flex flex-col gap-y-[12rem]'
          primaryClassName='h-[48rem] w-full'
          secondaryClassName='h-[48rem] w-full'
        />
      </div>
    </div>
  </BottomSheetContent>
);

export const ChangeLangModal = ({ variant = 'desktop' }: ChangeLangModalProps = {}) => {
  const state = useChangeLangState();

  if (variant === 'mobile') {
    return <MobileChangeLang {...state} />;
  }

  return <DesktopChangeLang {...state} />;
};

export const ChangeLangContent = () => {
  const { form, t, tForm } = useChangeLangState();

  return <ChangeLangFormFields form={form} t={t} tForm={tForm} className='w-[520rem] rounded-[24rem] bg-white pb-[20rem] shadow-card' />;
};
