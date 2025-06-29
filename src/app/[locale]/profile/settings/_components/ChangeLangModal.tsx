'use client';

import { DialogClose } from '@/components/ui/dialog';
import React from 'react';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useLocale } from 'use-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const ChangeLangModal = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const { t, tImgAlts, tForm, tActions } = useCustomTranslations('profileSettings.changeLangModal');

  const formSchema = z.object({
    language: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: locale,
    },
  });

  return (
    <section className='fixed bottom-0 flex max-h-[95dvh] w-[672rem] flex-col gap-y-[40rem] rounded-[16rem] bg-white p-[24rem] desktop:relative desktop:rounded-[24rem]'>
      <DialogClose className='absolute right-[24rem] top-[24rem]'>
        <img src='/images/icon_close--black.svg' alt={tImgAlts('close')} className='size-[20rem]' />
      </DialogClose>

      <Form {...form}>
        <form className='flex w-[520rem] flex-col gap-y-[30rem] rounded-[24rem] bg-white pb-[20rem] shadow-card'>
          <h1 className='col-span-2 text-[20rem] font-medium leading-none'>{t('title')}</h1>

          <FormField
            name='language'
            control={form.control}
            render={({ field }) => (
              <FormItem className='flex flex-col gap-y-[8rem]'>
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

      <DialogClose>
        <div className='flex justify-start gap-x-[6rem]'>
          <Link
            href={form.getValues('language') === locale ? '#' : pathname}
            locale={form.getValues('language')}
            className='flex h-[50rem] items-center justify-center rounded-full bg-d-light-gray px-[32rem] hover:bg-d-green/40'
          >
            <span className='text-[14rem] font-medium leading-none'>{tActions('ok')}</span>
          </Link>
          <button type='button' className='flex h-[50rem] items-center justify-center rounded-full bg-white px-[32rem]'>
            <span className='text-[14rem] font-medium leading-none'>{tActions('cancel')}</span>
          </button>
        </div>
      </DialogClose>
    </section>
  );
};
