import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import { HorseshoeProgressBar } from './HorseshoeProgressBar';
import TargetGoalModal from './TargetGoalModal';

interface Props {
  grade?: number;
}

export const IeltsGoal = ({ grade }: Props) => {
  return (
    <section className='relative rounded-[16rem] bg-white p-[24rem]'>
      <h3 className='mb-[32rem] text-[20rem] font-medium leading-tight'>IELTS Target Assesment</h3>

      <HorseshoeProgressBar
        value={grade ? +grade : 0}
        maxValue={9.0}
        width={220}
        height={140}
        strokeWidth={14.5}
        circleColor='#F4F4F4'
        progressGradient={{
          startColor: '#C9FF56',
          endColor: '#E3F8B4',
        }}
        textColor='#383838'
        no_results_text='set your goal'
        containerClassName='mx-auto flex'
      />

      <Dialog>
        <DialogTrigger className='group mt-[12rem] flex h-[54rem] w-full items-center justify-center gap-x-[8rem] rounded-[40rem] bg-d-light-gray hover:bg-d-green/40'>
          {grade ? (
            <>
              <img src='/images/icon_rotate.svg' className={`size-[14rem]`} alt='copy' />
              <span className='text-[14rem] font-semibold'>Change target score</span>
            </>
          ) : (
            <>
              <img src='/images/icon_trophy.svg' className={`size-[14rem]`} alt='copy' />
              <span className='text-[14rem] font-semibold'>Set target score</span>
            </>
          )}
        </DialogTrigger>

        <DialogContent className='fixed left-0 top-0 flex h-full min-h-[100dvh] w-full max-w-full flex-col items-start justify-start overflow-hidden backdrop-brightness-90 desktop:items-center desktop:justify-center'>
          <TargetGoalModal />
        </DialogContent>
      </Dialog>
    </section>
  );
};
