import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import { HorseshoeProgressBar } from './HorseshoeProgressBar';
import TargetGoalModal from './TargetGoalModal';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import React from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { withHydrationGuard } from '@/hooks/useHasMounted';

interface Props {
  grade?: number | string;
}

const IeltsGoalComponent = ({ grade }: Props) => {
  const { t, tImgAlts } = useCustomTranslations('profile.ieltsGoal');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [goalModalOpen, setGoalModalOpen] = React.useState(false);

  const numericGrade = React.useMemo(() => {
    if (typeof grade === 'string') {
      const parsed = Number(grade);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return typeof grade === 'number' && Number.isFinite(grade) ? grade : undefined;
  }, [grade]);

  const canOpenTargetGoal = typeof numericGrade === 'number';

  React.useEffect(() => {
    if (!canOpenTargetGoal) {
      setGoalModalOpen(false);
    }
  }, [canOpenTargetGoal]);

  const triggerClassName = 'group mt-[12rem] flex h-[54rem] w-full items-center justify-center gap-x-[8rem] rounded-[40rem] bg-d-light-gray transition-colors hover:bg-d-green/40 disabled:cursor-not-allowed disabled:opacity-60';

  const TriggerContent = () => (
    <>
      {canOpenTargetGoal ? (
        <>
          <img src='/images/icon_rotate.svg' className='size-[14rem]' alt={tImgAlts('rotate')} />
          <span className='text-[14rem] font-semibold'>{t('changeTarget')}</span>
        </>
      ) : (
        <>
          <img src='/images/icon_trophy.svg' className='size-[14rem]' alt={tImgAlts('trophy')} />
          <span className='text-[14rem] font-semibold'>{t('setTarget')}</span>
        </>
      )}
    </>
  );

  const handleMobileTrigger = () => {
    if (!canOpenTargetGoal) {
      return;
    }
    setGoalModalOpen(true);
  };

  return (
    <section className='relative flex flex-col items-center rounded-[16rem] bg-white p-[20rem] text-center tablet:p-[24rem] tablet:text-left'>
      <h3 className='mb-[32rem] text-[20rem] font-medium leading-tight'>{t('title')}</h3>

      <HorseshoeProgressBar
        width={200}
        height={128}
        maxValue={9.0}
        strokeWidth={14.5}
        textColor='#383838'
        circleColor='#F4F4F4'
        value={grade ? +grade : 0}
        containerClassName='mx-auto flex tablet:mx-0'
        no_results_text={t('noResults')}
        progressGradient={{
          startColor: '#C9FF56',
          endColor: '#E3F8B4',
        }}
      />

      {isMobile ? (
        <>
          <button type='button' className={triggerClassName} onClick={handleMobileTrigger} disabled={!canOpenTargetGoal}>
            <TriggerContent />
          </button>

          {canOpenTargetGoal ? (
            <BottomSheet open={goalModalOpen} onOpenChange={setGoalModalOpen}>
              <TargetGoalModal grade={numericGrade!} variant='mobile' open={goalModalOpen} onClose={() => setGoalModalOpen(false)} />
            </BottomSheet>
          ) : null}
        </>
      ) : (
        <Dialog open={goalModalOpen} onOpenChange={setGoalModalOpen}>
          <DialogTrigger asChild>
            <button type='button' className={triggerClassName} disabled={!canOpenTargetGoal}>
              <TriggerContent />
            </button>
          </DialogTrigger>

          {canOpenTargetGoal ? (
            <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center backdrop-brightness-90'>
              <TargetGoalModal grade={numericGrade!} variant='desktop' open={goalModalOpen} onClose={() => setGoalModalOpen(false)} />
            </DialogContent>
          ) : null}
        </Dialog>
      )}
    </section>
  );
};

export const IeltsGoal = withHydrationGuard(IeltsGoalComponent);
