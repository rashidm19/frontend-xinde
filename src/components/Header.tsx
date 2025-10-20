import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import Link from 'next/link';
import { PromoPromptModal } from './PromoPromptModal';
import React from 'react';
import { useRouter } from 'next/navigation';
import nProgress from 'nprogress';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useSubscription } from '@/hooks/useSubscription';
import { ChangeLangModal } from '@/app/[locale]/profile/settings/_components/ChangeLangModal';
import { ProfileEditFormModal } from '@/app/[locale]/profile/settings/_components/ProfileEditFormModal';
import { logout } from '@/lib/logout';
import { SubscriptionDetailsModal } from '@/components/SubscriptionDetailsModal';
import { PricesModal } from '@/components/PricesModal';

interface Props {
  name?: string;
  email?: string;
  avatar?: string;
}

export const Header = ({ name, email, avatar }: Props) => {
  const router = useRouter();
  const { t, tImgAlts, tActions } = useCustomTranslations('header');
  const { hasActiveSubscription, subscription, balance, balanceStatus } = useSubscription();

  const [isUserMenuOpen, setUserMenuOpen] = React.useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = React.useState(false);
  const [isLangModalOpen, setLangModalOpen] = React.useState(false);
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);

  const [isPricesModalOpen, setPricesModalOpen] = React.useState(false);
  const [isPromoModalOpen, setPromoModalOpen] = React.useState(false);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [planDiscounts, setPlanDiscounts] = React.useState<Record<string, { amount: number; currency: string }>>({});
  const [promoMessage, setPromoMessage] = React.useState<string | null>(null);
  const [promoError, setPromoError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isUserMenuOpen]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setPromoModalOpen(true);
    setPricesModalOpen(false);
    setPromoMessage(null);
    setPromoError(null);
  };

  const handlePricesModalOpenChange = (open: boolean) => {
    setPricesModalOpen(open);

    if (open) {
      setPromoModalOpen(false);
      setPromoError(null);
    }
  };

  const handlePromoModalClose = () => {
    setPromoModalOpen(false);
    setSelectedPlanId(null);
  };

  const handleSuccessMessage = (message: string | null) => {
    setPromoMessage(message);

    if (message) {
      setPricesModalOpen(true);
    }
  };

  const closeUserMenu = () => setUserMenuOpen(false);

  const openSettingsModal = () => {
    closeUserMenu();
    setSettingsModalOpen(true);
  };

  const openLanguageModal = () => {
    closeUserMenu();
    setLangModalOpen(true);
  };

  const handleLogout = () => {
    closeUserMenu();
    logout();
    nProgress.start();
    router.push('/');
  };

  const displayName = name?.trim() || t('accountMenu.user');
  const displayEmail = email?.trim() || null;
  const planName = subscription?.plan?.name ?? subscription?.subscription_plan?.name ?? null;
  const practiceBalance = Math.max(0, balance?.practice_balance ?? 0);
  const isBalanceReady = balanceStatus === 'success' || balanceStatus === 'error';

  const headerChip = React.useMemo(() => {
    if (hasActiveSubscription) {
      return (
        <button
          type='button'
          onClick={() => setSubscriptionModalOpen(true)}
          className='inline-flex items-center rounded-full bg-d-green px-[18rem] py-[10rem] text-[13rem] font-semibold text-d-black transition-all duration-200 hover:-translate-y-[1rem] hover:shadow-[0_8rem_20rem_rgba(0,0,0,0.08)]'
        >
          <span>{t('chips.subscription')}</span>
          {planName ? <span className='ml-[8rem] text-[12rem] font-medium text-d-black/70'>• {planName}</span> : null}
        </button>
      );
    }

    if (!isBalanceReady) {
      return null;
    }

    return (
      <Dialog open={isPricesModalOpen} onOpenChange={handlePricesModalOpenChange}>
        <DialogTrigger
          className='inline-flex w-full items-center justify-center gap-x-[4rem] rounded-[40rem] bg-d-green px-[20rem] py-[12rem] text-left text-black transition-colors duration-200 hover:bg-d-green'
          onClick={() => {
            setPromoMessage(null);
            setPromoError(null);
          }}
        >
          <span className='text-[13rem] font-semibold leading-tight'>{tActions('upgradePlan')}</span>
          <img src='/images/icon_stars--black.svg' alt={tImgAlts('star')} className='size-[14rem]' />
        </DialogTrigger>

        <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center'>
          <PricesModal onSelectPlan={handlePlanSelect} promoMessage={promoMessage} promoError={promoError} planDiscounts={planDiscounts} />
        </DialogContent>
      </Dialog>
    );
  }, [hasActiveSubscription, isBalanceReady, planName, practiceBalance, t, tActions]);

  return (
    <header className='h-[93rem] rounded-b-[32rem] bg-white'>
      <nav className='container flex h-full max-w-[1200rem] items-center'>
        <Link href='/profile' className='mr-[90rem] flex items-center gap-x-[6rem]'>
          <img src='/images/logo.svg' className='size-[36rem]' alt={tImgAlts('logo')} />
          <div className='font-poppins text-[21rem] font-semibold'>studybox</div>
        </Link>

        {/*<div className='flex h-full'>*/}
        {/*  {links.map((link, index) =>*/}
        {/*    link.includes('practice') ? (*/}
        {/*      <Link*/}
        {/*        key={index}*/}
        {/*        href={link}*/}
        {/*        className={`${pathname.includes(link) ? 'border-d-black' : 'border-transparent'} flex h-full items-center border-b-2 px-[20rem] text-[14rem] font-medium`}*/}
        {/*      >*/}
        {/*        {t(`menu.link_${index + 1}`)}*/}
        {/*      </Link>*/}
        {/*    ) : (*/}
        {/*      <span*/}
        {/*        key={index}*/}
        {/*        style={{ userSelect: 'none', color: '#9C9C9C' }}*/}
        {/*        className='flex h-full items-center border-b-2 border-transparent px-[20rem] text-[14rem] font-medium'*/}
        {/*      >*/}
        {/*        <span className="relative">*/}
        {/*          <div className='opacity-65 font-light absolute left-auto right-[-75%] top-[-75%] flex h-[20rem] w-[40rem] items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-d-violet to-[#6fdbfa6b] text-[10rem] text-white'>*/}
        {/*            {tCommon('soon')}*/}
        {/*          </div>*/}
        {/*          {t(`menu.link_${index + 1}`)}*/}
        {/*        </span>*/}
        {/*      </span>*/}
        {/*    )*/}
        {/*  )}*/}
        {/*</div>*/}

        <div className='ml-auto flex items-center gap-x-[22rem]'>
          {headerChip}

          <div className='relative flex items-center' ref={userMenuRef}>
            <button
              type='button'
              className='flex h-[93rem] items-center gap-x-[12rem] px-[16rem] transition-colors'
              onClick={() => setUserMenuOpen(prev => !prev)}
              aria-haspopup='menu'
              aria-expanded={isUserMenuOpen}
              aria-label={t('accountMenu.open')}
            >
              <Avatar className='size-[46rem] border border-d-gray bg-d-gray'>
                <AvatarImage src={avatar} />
                <AvatarFallback className='text-[14rem]'>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className='flex flex-col items-start gap-y-[2rem]'>
                <span className='text-[14rem] font-semibold leading-none text-d-black'>{displayName}</span>
                {displayEmail ? <span className='text-[12rem] leading-none text-d-black/60'>{displayEmail}</span> : null}
              </div>
              <img
                src='/images/icon_chevron--down.svg'
                alt={tImgAlts('chevronDown')}
                className={`size-[14rem] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isUserMenuOpen ? (
              <div
                className='absolute right-0 top-full z-10 mt-[12rem] w-[280rem] rounded-[16rem] border border-d-light-gray/60 bg-white p-[16rem] shadow-[0_20rem_40rem_rgba(0,0,0,0.08)]'
                role='menu'
              >
                <div className='mb-[12rem] border-b border-d-light-gray/60 pb-[12rem]'>
                  <div className='text-[16rem] font-semibold leading-tight text-d-black'>{displayName}</div>
                  {displayEmail ? <div className='mt-[4rem] text-[12rem] leading-tight text-d-black/60'>{displayEmail}</div> : null}
                </div>

                {!hasActiveSubscription && (
                  <div className='mb-[12rem] border-b border-d-light-gray/60 pb-[12rem]'>
                    <Dialog open={isPricesModalOpen} onOpenChange={handlePricesModalOpenChange}>
                      <DialogTrigger
                        className='inline-flex w-full items-center justify-center gap-x-[4rem] rounded-[40rem] bg-d-green px-[20rem] py-[12rem] text-left text-black transition-colors duration-200 hover:bg-d-green'
                        onClick={() => {
                          setPromoMessage(null);
                          setPromoError(null);
                        }}
                      >
                        <span className='text-[13rem] font-semibold leading-tight'>{tActions('upgradePlan')}</span>
                        <img src='/images/icon_stars--black.svg' alt={tImgAlts('star')} className='size-[14rem]' />
                      </DialogTrigger>

                      <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center'>
                        <PricesModal onSelectPlan={handlePlanSelect} promoMessage={promoMessage} promoError={promoError} planDiscounts={planDiscounts} />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                <button
                  type='button'
                  onClick={() => {
                    closeUserMenu();
                    setSubscriptionModalOpen(true);
                  }}
                  className='mb-[4rem] flex w-full items-center justify-between rounded-[12rem] px-[12rem] py-[12rem] text-left text-[14rem] font-medium text-d-black hover:bg-d-light-gray/40'
                  role='menuitem'
                >
                  {t('accountMenu.subscription')}
                  <img src='/images/icon_stars--black.svg' alt={tImgAlts('star')} className='size-[16rem]' />
                </button>
                <button
                  type='button'
                  onClick={openSettingsModal}
                  className='flex w-full items-center justify-between rounded-[12rem] px-[12rem] py-[12rem] text-left text-[14rem] font-medium text-d-black hover:bg-d-light-gray/40'
                  role='menuitem'
                >
                  {t('accountMenu.settings')}
                  <img src='/images/icon_gear.svg' alt={tImgAlts('settings')} className='size-[16rem]' />
                </button>
                <button
                  type='button'
                  onClick={openLanguageModal}
                  className='mt-[4rem] flex w-full items-center justify-between rounded-[12rem] px-[12rem] py-[12rem] text-left text-[14rem] font-medium text-d-black hover:bg-d-light-gray/40'
                  role='menuitem'
                >
                  {t('accountMenu.language')}
                  <img src='/images/icon_globe.svg' alt={tImgAlts('globe')} className='size-[16rem]' />
                </button>
                <button
                  type='button'
                  onClick={handleLogout}
                  className='mt-[4rem] flex w-full items-center justify-between rounded-[12rem] px-[12rem] py-[12rem] text-left text-[14rem] font-medium text-d-black hover:bg-d-light-gray/40'
                  role='menuitem'
                >
                  {t('accountMenu.logout')}
                  <img src='/images/icon_door.svg' alt={tImgAlts('logout')} className='size-[16rem]' />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      <Dialog open={isLangModalOpen} onOpenChange={setLangModalOpen}>
        <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center backdrop-brightness-90'>
          <ChangeLangModal />
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center backdrop-brightness-90'>
          <ProfileEditFormModal />
        </DialogContent>
      </Dialog>

      <SubscriptionDetailsModal open={isSubscriptionModalOpen} onOpenChange={setSubscriptionModalOpen} />

      <PromoPromptModal
        open={isPromoModalOpen}
        planId={selectedPlanId}
        onClose={handlePromoModalClose}
        onBackToPlans={() => {
          handlePromoModalClose();
          setPricesModalOpen(true);
        }}
        onDiscountUpdate={(planId, info) => setPlanDiscounts(prev => ({ ...prev, [planId]: info }))}
        onSuccessMessage={handleSuccessMessage}
        onErrorMessage={setPromoError}
      />
    </header>
  );
};
