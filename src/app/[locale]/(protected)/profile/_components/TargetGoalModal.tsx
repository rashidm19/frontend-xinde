'use client';

import React from 'react';

import { postUser } from '@/api/POST_user';
import { ProfileUpdateRequest, ProfileUpdateResponse } from '@/api/profile';
import { BottomSheetContent } from '@/components/ui/bottom-sheet';
import { DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { cn } from '@/lib/utils';
import { refreshProfile, setProfile } from '@/stores/profileStore';
import { useMutation } from '@tanstack/react-query';
import { BottomSheetHeader } from '@/components/mobile/MobilePageHeader';

interface Props {
  grade: number;
}

interface TargetGoalModalProps extends Props {
  variant?: 'desktop' | 'mobile';
  open?: boolean;
  onClose?: () => void;
}

export default function TargetGoalModal({ grade, variant = 'desktop', open, onClose }: TargetGoalModalProps) {
  const vm = useTargetGoalViewModel({ grade, open, onClose });

  if (variant === 'mobile') {
    return <TargetGoalMobile vm={vm} />;
  }

  return <TargetGoalDesktop vm={vm} />;
}

export function TargetGoalContent({ grade }: Props) {
  return <TargetGoalModal grade={grade} />;
}

interface TargetGoalViewModel {
  t: ReturnType<typeof useCustomTranslations>['t'];
  tImgAlts: ReturnType<typeof useCustomTranslations>['tImgAlts'];
  tActions: ReturnType<typeof useCustomTranslations>['tActions'];
  scores: number[];
  selectedScore: number;
  handleScoreSelect: (score: number) => void;
  isScoreSelected: (score: number) => boolean;
  loading: boolean;
  handleSubmit: () => void;
  handleClose: () => void;
}

const SCORE_PRESETS = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

const useTargetGoalViewModel = ({ grade, open, onClose }: { grade: number; open?: boolean; onClose?: () => void }): TargetGoalViewModel => {
  const translations = useCustomTranslations('profile.targetGoalModal');
  const { t, tImgAlts, tActions } = translations;

  const normalizedGrade = React.useMemo(() => {
    return Number.isFinite(grade) ? grade : 6.0;
  }, [grade]);

  const [selectedScore, setSelectedScore] = React.useState(normalizedGrade);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setSelectedScore(normalizedGrade);
  }, [normalizedGrade, open]);

  const mutation = useMutation<ProfileUpdateResponse, Error, ProfileUpdateRequest>({
    mutationFn: postUser,
    onSuccess: async updatedUser => {
      setProfile(updatedUser);
      try {
        await refreshProfile();
      } catch (error) {
        console.error(error);
      }
    },
  });

  const handleSubmit = React.useCallback(async () => {
    setLoading(true);
    try {
      await mutation.mutateAsync({ grade: selectedScore.toString() });
      onClose?.();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [mutation, onClose, selectedScore]);

  const handleScoreSelect = React.useCallback((score: number) => {
    setSelectedScore(score);
  }, []);

  const isScoreSelected = React.useCallback(
    (score: number) => {
      return score <= selectedScore;
    },
    [selectedScore]
  );

  const handleClose = React.useCallback(() => {
    onClose?.();
  }, [onClose]);

  return {
    t,
    tImgAlts,
    tActions,
    scores: SCORE_PRESETS,
    selectedScore,
    handleScoreSelect,
    isScoreSelected,
    loading,
    handleSubmit,
    handleClose,
  };
};

const TargetGoalDesktop = ({ vm }: { vm: TargetGoalViewModel }) => (
  <section className='relative flex max-h-[95dvh] w-[672rem] flex-col gap-y-[40rem] rounded-[16rem] bg-white p-[40rem] desktop:rounded-[40rem]'>
    <DialogClose onClick={vm.handleClose} className='absolute right-[24rem] top-[24rem]'>
      <img src='/images/icon_close--black.svg' alt={vm.tImgAlts('close')} className='size-[20rem]' />
    </DialogClose>

    <div className='mx-auto flex w-[544rem] flex-1 flex-col text-[14rem]'>
      <h2 className='mb-[14rem] text-center text-[20rem] font-semibold text-d-black'>{vm.t('title')}</h2>
      <p className='mb-[70rem] text-center text-[14rem] text-d-black'>{vm.t('selectGoal')}</p>
      <TargetGoalSelection vm={vm} />
      <TargetGoalFooter vm={vm} className='mx-auto mt-[60rem]' />
    </div>
  </section>
);

const TargetGoalMobile = ({ vm }: { vm: TargetGoalViewModel }) => (
  <BottomSheetContent>
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      <BottomSheetHeader
        title={vm.t('title')}
        subtitle={vm.t('selectGoal')}
        closeLabel={vm.tImgAlts('close')}
        onClose={vm.handleClose}
      />

      <ScrollArea className='flex-1 px-[20rem]'>
        <div className='pb-[24rem] pt-[8rem] text-[14rem] text-d-black'>
          <TargetGoalSelection vm={vm} />
        </div>
      </ScrollArea>

      <div className='border-t border-white/60 bg-white/95 px-[20rem] pb-[calc(16rem+env(safe-area-inset-bottom))] pt-[16rem] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]'>
        <TargetGoalFooter vm={vm} className='w-full' fullWidth />
      </div>
    </div>
  </BottomSheetContent>
);

const TargetGoalSelection = ({ vm }: { vm: TargetGoalViewModel }) => (
  <div className='flex flex-col gap-y-[16rem]'>
    <div className='relative flex h-[20rem] items-center'>
      {vm.scores.map((score, index) => (
        <button
          key={score}
          type='button'
          onClick={() => vm.handleScoreSelect(score)}
          className={cn(
            'relative h-full flex-1 transition-colors first:rounded-l-full last:rounded-r-full',
            vm.isScoreSelected(score) ? 'bg-d-black' : 'bg-d-light-gray'
          )}
        >
          <div
            className={cn(
              'absolute -right-[0rem] -top-[2rem] z-20 h-[24rem] transition-all',
              vm.selectedScore === score ? '-right-[10rem] w-[24rem] rounded-full bg-d-black' : `w-[4rem] bg-d-gray ${index === vm.scores.length - 1 ? 'hidden' : ''}`
            )}
          />
        </button>
      ))}
    </div>

    <div className='-mr-[8rem] flex justify-between gap-x-[28rem] pl-[48rem]'>
      {vm.scores.map(score => (
        <button
          key={score}
          type='button'
          onClick={() => vm.handleScoreSelect(score)}
          className={cn('text-[14rem] text-d-black transition-colors', score === vm.selectedScore ? 'font-extrabold' : 'font-normal')}
        >
          {score.toFixed(1)}
        </button>
      ))}
    </div>
  </div>
);

const TargetGoalFooter = ({ vm, className, fullWidth = false }: { vm: TargetGoalViewModel; className?: string; fullWidth?: boolean }) => (
  <button
    type='button'
    onClick={vm.handleSubmit}
    disabled={vm.loading}
    className={cn(
      'relative flex h-[50rem] items-center justify-center rounded-full bg-d-green px-[24rem] py-[8rem] font-semibold text-slate-900 transition-colors hover:bg-d-green-secondary disabled:cursor-not-allowed disabled:opacity-70 dark:text-slate-950',
      fullWidth ? 'w-full' : 'w-[280rem]',
      className
    )}
  >
    {vm.loading ? <TargetGoalSpinner /> : <span className='text-[14rem] leading-none'>{vm.tActions('confirm')}</span>}
  </button>
);

const TargetGoalSpinner = () => (
  <svg className='size-[20rem] animate-spin text-slate-900 dark:text-slate-950' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
    <path
      className='opacity-75'
      fill='currentColor'
      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    />
  </svg>
);
