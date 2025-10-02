'use client';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { PROFILE_REGIONS } from '@/types/types';
import { ProfileEditFormValues } from './profileEditSchema';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { useMemo } from 'react';

const REGION_LABEL_KEYS: Record<string, string> = {
  kz: 'regionKZ',
  kg: 'regionKG',
  md: 'regionMD',
};

interface Props {
  form: UseFormReturn<ProfileEditFormValues>;
  isChangingPassword: boolean;
  setIsChangingPassword: (v: boolean) => void;
  onSubmit: SubmitHandler<ProfileEditFormValues>;
  isSubmitting: boolean;
}

export const ProfileEditForm = ({ form, isChangingPassword, setIsChangingPassword, onSubmit, isSubmitting }: Props) => {
  const { tImgAlts, tForm, t } = useCustomTranslations('profileSettings.profileEditForm');

  const currentRegion = form.watch('region');

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getRegionLabel = (code: string) => {
    const key = REGION_LABEL_KEYS[code];
    if (key) {
      return tForm(key);
    }

    return code.toUpperCase();
  };

  const regionOptions = useMemo(() => {
    const codes = new Set<string>(PROFILE_REGIONS);
    const normalizedRegion = currentRegion?.toLowerCase().trim();
    if (normalizedRegion) {
      codes.add(normalizedRegion);
    }
    return Array.from(codes);
  }, [currentRegion]);

  const handleEnablePasswordChange = () => {
    if (isSubmitting) {
      return;
    }

    setIsChangingPassword(true);
    form.setValue('oldPassword', '', { shouldDirty: false, shouldValidate: false });
    form.setValue('newPassword', '', { shouldDirty: false, shouldValidate: false });
    form.clearErrors(['oldPassword', 'newPassword']);
  };

  return (
    <Form {...form}>
      <form className='grid grid-cols-2 gap-[24rem]' onSubmit={handleFormSubmit}>
        {/* // * Title */}
        <h1 className='col-span-2 text-[20rem] font-medium leading-none'>{t('title')}</h1>

        {/* // * Input fields */}
        {/* // * Name */}
        <FormField
          name='name'
          control={form.control}
          render={({ field }) => (
            <FormItem className='relative flex flex-col gap-y-[12rem]'>
              <div className='flex flex-row justify-between'>
                <FormLabel className='font-poppins text-[14rem] leading-none'>{tForm('labels.name')}</FormLabel>
                <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
              </div>
              <FormControl>
                <input
                  {...field}
                  type='text'
                  placeholder={tForm('placeholders.name')}
                  disabled={isSubmitting}
                  className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-none placeholder:text-d-black/60 focus-within:bg-white disabled:opacity-70'
                />
              </FormControl>
              <div className='absolute bottom-[12rem] right-[12rem] flex size-[30rem] items-center justify-center'>
                <img src='/images/icon_edit.svg' alt={tImgAlts('edit')} className='size-[14rem]' />
              </div>
            </FormItem>
          )}
        />

        {/* // * Region */}
        <FormField
          name='region'
          control={form.control}
          render={({ field }) => (
            <FormItem className='flex flex-col gap-y-[12rem]'>
              <div className='flex flex-row justify-between'>
                <FormLabel className='font-poppins text-[14rem] leading-none'>{tForm('labels.region')}</FormLabel>
                <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
              </div>
              <Select
                onValueChange={value => field.onChange(value.toLowerCase())}
                value={typeof field.value === 'string' ? field.value.toLowerCase() : undefined}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-normal data-[state=open]:rounded-b-none'>
                    <SelectValue placeholder={tForm('placeholders.select')} className='placeholder:text-d-black/60' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='mt-0 max-h-[250rem] rounded-b-[40rem]'>
                  {regionOptions.map(regionCode => (
                    <SelectItem
                      key={regionCode}
                      value={regionCode}
                      className='h-[50rem] px-[18rem] text-[14rem] font-medium leading-none last:rounded-b-[8rem] hover:bg-d-light-gray'
                    >
                      <span className='mr-[8rem] text-d-black/60'>{regionCode.toUpperCase()} </span>
                      {getRegionLabel(regionCode)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* // * Current password, not-editable, works as a button to reveal password change fields */}
        {!isChangingPassword && (
          <div className='relative flex flex-col gap-y-[12rem]'>
            <div className='flex flex-row justify-between'>
              <FormLabel className='font-poppins text-[14rem] leading-none'>{tForm('labels.password')}</FormLabel>
            </div>
            <input
              type='password'
              value='**********'
              disabled
              className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-none placeholder:text-d-black/60 focus-within:bg-white'
            />
            <button
              type='button'
              onClick={handleEnablePasswordChange}
              disabled={isSubmitting}
              className='absolute bottom-[12rem] right-[12rem] flex size-[30rem] items-center justify-center disabled:opacity-70'
            >
              <img src='/images/icon_edit.svg' alt={tImgAlts('edit')} className='size-[14rem]' />
            </button>
          </div>
        )}

        {/* // * Old password */}
        {isChangingPassword && (
          <FormField
            name='oldPassword'
            control={form.control}
            render={({ field }) => (
              <FormItem className='relative flex flex-col gap-y-[12rem]'>
                <div className='flex flex-row justify-between'>
                  <FormLabel className='font-poppins text-[14rem] leading-none'>{tForm('labels.oldPassword')}</FormLabel>
                  <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
                </div>
                <FormControl>
                  <input
                    {...field}
                    type='password'
                    placeholder={tForm('placeholders.oldPassword')}
                    disabled={isSubmitting}
                    className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-none placeholder:text-d-black/60 focus-within:bg-white disabled:opacity-70'
                  />
                </FormControl>
                {/* <button type='button' className='absolute bottom-[12rem] right-[12rem] flex size-[30rem] items-center justify-center'>
                          <img src='/images/icon_edit.svg' alt='edit' className='size-[14rem]' />
                        </button> */}
              </FormItem>
            )}
          />
        )}

        {/* // * Email, not-editable */}
        <FormField
          name='email'
          control={form.control}
          render={({ field }) => (
            <FormItem className='flex flex-col gap-y-[12rem]'>
              <div className='flex flex-row justify-between'>
                <FormLabel className='font-poppins text-[14rem] leading-none'>{tForm('labels.email')}</FormLabel>
                <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
              </div>
              <FormControl>
                <input
                  {...field}
                  disabled
                  type='text'
                  placeholder={tForm('placeholders.email')}
                  className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-none placeholder:text-d-black/60 focus-within:bg-white'
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* // * New password */}
        {isChangingPassword && (
          <FormField
            control={form.control}
            name='newPassword'
            render={({ field }) => (
              <FormItem className='relative flex flex-col gap-y-[12rem]'>
                <div className='flex flex-row justify-between'>
                  <FormLabel className='font-poppins text-[14rem] leading-none'>{tForm('labels.newPassword')}</FormLabel>
                  <FormMessage className='font-poppins text-[10rem] leading-none text-d-red' />
                </div>
                <FormControl>
                  <input
                    {...field}
                    type='password'
                    placeholder={tForm('placeholders.newPassword')}
                    disabled={isSubmitting}
                    className='h-[50rem] rounded-[8rem] bg-d-light-gray px-[18rem] text-[14rem] font-medium leading-none placeholder:text-d-black/60 focus-within:bg-white disabled:opacity-70'
                  />
                </FormControl>
                {/* <button type='button' className='absolute bottom-[12rem] right-[12rem] flex size-[30rem] items-center justify-center'>
                          <img src='/images/icon_edit.svg' alt='edit' className='size-[14rem]' />
                        </button> */}
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  );
};
