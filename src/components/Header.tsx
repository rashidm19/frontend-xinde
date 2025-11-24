'use client';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { BottomSheet } from './ui/bottom-sheet';
import { Dialog, DialogContent } from './ui/dialog';
import Link from 'next/link';
import { PromoPromptModal } from './PromoPromptModal';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useCustomTranslations } from '@/hooks/useCustomTranslations';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionDetailsModal } from '@/components/SubscriptionDetailsModal';
import { PricesModal } from '@/components/PricesModal';
import { Skeleton, SkeletonAvatar, SkeletonButton, SkeletonText } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useMediaQuery } from 'usehooks-ts';
import { withHydrationGuard } from '@/hooks/useHasMounted';
import { useLocale } from 'next-intl';
import { useLogout } from '@/hooks/useLogout';

// Lazy-load protected modals so public routes don't eagerly bundle authenticated-only UI.
const ChangeLangModal = dynamic(() => import('@/app/[locale]/(protected)/profile/settings/_components/ChangeLangModal').then(module => module.ChangeLangModal), {
  ssr: false,
  loading: () => null,
});

const ProfileEditFormModal = dynamic(
  () => import('@/app/[locale]/(protected)/profile/settings/_components/ProfileEditFormModal').then(module => module.ProfileEditFormModal),
  { ssr: false, loading: () => null }
);

interface Props {
  name?: string;
  email?: string;
  avatar?: string;
  title?: string;
  onOpenSubscription?: () => void;
  onOpenProfileSettings?: () => void;
  onOpenLanguage?: () => void;
  onLogout?: () => void;
}

const HeaderComponent = ({ name, email, avatar, title: _title, onOpenSubscription, onOpenProfileSettings, onOpenLanguage, onLogout }: Props) => {
  const router = useRouter();
  const { t, tImgAlts, tActions } = useCustomTranslations('header');
  const { hasActiveSubscription, subscription, balanceStatus } = useSubscription();
  const locale = useLocale();
  const { logout: performLogout } = useLogout();

  const [isUserMenuOpen, setUserMenuOpen] = React.useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = React.useState(false);
  const [isLangModalOpen, setLangModalOpen] = React.useState(false);
  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = React.useState(false);
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement | null>(null);

  const [isPricesModalOpen, setPricesModalOpen] = React.useState(false);
  const [isPromoModalOpen, setPromoModalOpen] = React.useState(false);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(null);
  const [planDiscounts, setPlanDiscounts] = React.useState<Record<string, { amount: number; currency: string }>>({});
  const [promoError, setPromoError] = React.useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');

  React.useEffect(() => {
    if (!isUserMenuOpen || typeof document === 'undefined') {
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

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      setHasScrolled(window.scrollY > 4);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    setPromoModalOpen(true);
    setPricesModalOpen(false);
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

  const closeUserMenu = () => setUserMenuOpen(false);

  const handleUpgradeClick = React.useCallback(() => {
    setPromoError(null);

    if (isMobile) {
      router.push(`/${locale}/pricing`);
      return;
    }

    setPricesModalOpen(true);
  }, [isMobile, locale, router, setPricesModalOpen, setPromoError]);

  const triggerSubscriptionModal = React.useCallback(() => {
    if (onOpenSubscription) {
      onOpenSubscription();
    } else {
      setSubscriptionModalOpen(true);
    }
  }, [onOpenSubscription]);

  const triggerProfileSettings = React.useCallback(() => {
    if (onOpenProfileSettings) {
      onOpenProfileSettings();
    } else {
      if (isMobile) {
        router.push(`/${locale}/profile/edit`);
        return;
      }

      setSettingsModalOpen(true);
    }
  }, [onOpenProfileSettings, isMobile, router, locale]);

  const triggerLanguageModal = React.useCallback(() => {
    if (onOpenLanguage) {
      onOpenLanguage();
    } else {
      setLangModalOpen(true);
    }
  }, [onOpenLanguage]);

  const triggerLogout = React.useCallback(() => {
    if (onLogout) {
      onLogout();
      return;
    }

    void performLogout();
  }, [onLogout, performLogout]);

  const openSettingsModal = () => {
    closeUserMenu();
    triggerProfileSettings();
  };

  const openLanguageModal = () => {
    closeUserMenu();
    triggerLanguageModal();
  };

  const handleLogout = () => {
    closeUserMenu();
    triggerLogout();
  };
  const trimmedName = name?.trim() ?? null;
  const trimmedEmail = email?.trim() ?? null;
  const isAccountInfoLoading = name === undefined && email === undefined;
  const displayName = trimmedName ?? t('accountMenu.user');
  const displayEmail = trimmedEmail;
  const accountInitials = displayName.slice(0, 2).toUpperCase();
  const planName = subscription?.plan?.name ?? subscription?.subscription_plan?.name ?? null;
  const isSubscriptionReady = subscription !== undefined || balanceStatus === 'success' || balanceStatus === 'error';

  const toggleUserMenu = () => {
    if (isAccountInfoLoading) {
      return;
    }

    setUserMenuOpen(prev => !prev);
  };

  const upgradeTrigger = (
    <button
      type='button'
      onClick={handleUpgradeClick}
      className='inline-flex w-full items-center justify-center gap-x-[4rem] rounded-[40rem] bg-d-green px-[20rem] py-[12rem] text-left text-black transition-colors duration-200 hover:bg-d-green'
    >
      <span className='text-[13rem] font-semibold leading-tight'>{tActions('upgradePlan')}</span>
      <img src='/images/icon_stars--black.svg' alt={tImgAlts('star')} className='size-[14rem]' />
    </button>
  );

  const headerChip = hasActiveSubscription ? (
    <button
      type='button'
      onClick={triggerSubscriptionModal}
      className='inline-flex items-center rounded-full bg-d-green px-[18rem] py-[10rem] text-[13rem] font-semibold text-d-black transition-all duration-200 hover:-translate-y-[1rem] hover:shadow-[0_8rem_20rem_rgba(0,0,0,0.08)]'
    >
      <span>{t('chips.subscription')}</span>
      {planName ? <span className='ml-[8rem] text-[12rem] font-medium text-d-black/70'>• {planName}</span> : null}
    </button>
  ) : !isSubscriptionReady ? (
    <SkeletonButton />
  ) : (
    upgradeTrigger
  );

  const headerClass = cn(
    'sticky top-0 z-40 border-b border-d-light-gray/60 bg-white/90 backdrop-blur-md transition-shadow duration-200',
    hasScrolled ? 'shadow-[0_10rem_24rem_-20rem_rgba(56,56,56,0.45)]' : ''
  );
  const showUpgradeChip = isSubscriptionReady && !hasActiveSubscription;

  return (
    <header className={headerClass}>
      <nav className='container flex h-[60rem] max-w-[1200rem] items-center px-[16rem] tablet:hidden'>
        <Link href='/profile' className='flex items-center gap-x-[8rem]'>
          <img src='/images/logo.svg' className='size-[32rem]' alt={tImgAlts('logo')} />
          <span className='font-poppins text-[18rem] font-semibold text-d-black'>Studybox</span>
        </Link>
        <span className='flex-1' />
        {!isSubscriptionReady ? (
          <div className='mx-[12rem]'>
            <SkeletonButton />
          </div>
        ) : showUpgradeChip ? (
          <Link
            href='/pricing'
            className='mx-[12rem] rounded-[16rem] border border-d-violet/50 px-[12rem] py-[6rem] text-[12rem] font-semibold text-d-violet transition-colors hover:border-d-violet'
          >
            {tActions('upgradePlan')}
          </Link>
        ) : null}

        <div className='ml-auto flex items-center gap-[12rem]'>
          <button
            type='button'
            onClick={triggerLanguageModal}
            className='flex size-[40rem] items-center justify-center rounded-full bg-d-light-gray/80 text-d-black transition hover:bg-d-light-gray'
            aria-label={t('accountMenu.language')}
          >
            <img src='/images/icon_globe.svg' alt={tImgAlts('globe')} className='size-[18rem]' />
          </button>
          {/*<button*/}
          {/*  type='button'*/}
          {/*  className='flex size-[40rem] items-center justify-center rounded-full bg-d-light-gray/40 text-d-black/70 transition hover:bg-d-light-gray/70'*/}
          {/*  aria-label='Notifications'*/}
          {/*>*/}
          {/*  <Bell className='size-[18rem]' />*/}
          {/*</button>*/}
          <button
            type='button'
            className='relative flex size-[42rem] items-center justify-center rounded-full border border-d-gray/60 bg-white'
            aria-label={t('accountMenu.open')}
            disabled={isAccountInfoLoading}
            aria-disabled={isAccountInfoLoading}
          >
            {isAccountInfoLoading ? (
              <SkeletonAvatar className='size-[36rem]' />
            ) : (
              <>
                <Avatar className='size-[36rem] border border-transparent bg-d-light-gray'>
                  <AvatarImage src={avatar} />
                  <AvatarFallback className='text-[14rem]'>{accountInitials}</AvatarFallback>
                </Avatar>
                {hasActiveSubscription ? (
                  <span className='absolute right-[4rem] top-[4rem] size-[8rem] rounded-full bg-d-green shadow-[0_0_0_2rem_#fff]' aria-hidden />
                ) : null}
              </>
            )}
          </button>
        </div>
      </nav>

      <nav className='container hidden h-[93rem] max-w-[1200rem] items-center tablet:flex'>
        <Link href='/profile' className='mr-[16rem] flex items-center gap-x-[6rem] tablet:mr-[90rem]'>
          <img src='/images/logo.svg' className='size-[36rem]' alt={tImgAlts('logo')} />
          <div className='hidden font-poppins text-[21rem] font-semibold tablet:block'>studybox</div>
        </Link>

        <button
          type='button'
          onClick={triggerLanguageModal}
          className='ml-auto flex size-[44rem] items-center justify-center rounded-full bg-d-light-gray transition hover:bg-d-light-gray/60 tablet:hidden'
          aria-label={t('accountMenu.language')}
        >
          <img src='/images/icon_globe.svg' alt={tImgAlts('globe')} className='size-[20rem]' />
        </button>

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

        <div className='ml-auto hidden items-center gap-x-[22rem] tablet:flex'>
          {headerChip}

          <div className='relative flex items-center' ref={userMenuRef}>
            <button
              type='button'
              className='flex h-[93rem] items-center gap-x-[12rem] px-[16rem] transition-colors'
              onClick={toggleUserMenu}
              aria-haspopup='menu'
              aria-expanded={isUserMenuOpen}
              aria-label={t('accountMenu.open')}
              disabled={isAccountInfoLoading}
              aria-disabled={isAccountInfoLoading}
            >
              {isAccountInfoLoading ? (
                <>
                  <SkeletonAvatar className='h-[46rem] w-[46rem]' />
                  <div className='flex flex-col items-start gap-y-[4rem]'>
                    <SkeletonText className='h-[14rem] w-[120rem]' />
                    <SkeletonText className='h-[12rem] w-[160rem]' />
                  </div>
                  <Skeleton className='h-[14rem] w-[14rem] rounded-full' />
                </>
              ) : (
                <>
                  <Avatar className='size-[46rem] border border-d-gray bg-d-gray'>
                    <AvatarImage src={avatar} />
                    <AvatarFallback className='text-[14rem]'>{accountInitials}</AvatarFallback>
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
                </>
              )}
            </button>

            {isUserMenuOpen ? (
              <div
                className='absolute right-0 top-full z-10 mt-[12rem] w-[280rem] rounded-[16rem] border border-d-light-gray/60 bg-white p-[16rem] shadow-[0_20rem_40rem_rgba(0,0,0,0.08)]'
                role='menu'
              >
                {isAccountInfoLoading ? (
                  <div className='space-y-[12rem]'>
                    <div className='space-y-[6rem] border-b border-d-light-gray/60 pb-[12rem]'>
                      <SkeletonText className='h-[16rem] w-[140rem]' />
                      <SkeletonText className='h-[12rem] w-[180rem]' />
                    </div>
                    <div className='space-y-[10rem]'>
                      <SkeletonButton className='w-full' />
                      <SkeletonButton className='w-full' />
                      <SkeletonButton className='w-full' />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='mb-[12rem] border-b border-d-light-gray/60 pb-[12rem]'>
                      <div className='text-[16rem] font-semibold leading-tight text-d-black'>{displayName}</div>
                      {displayEmail ? <div className='mt-[4rem] text-[12rem] leading-tight text-d-black/60'>{displayEmail}</div> : null}
                    </div>

                    {isSubscriptionReady && !hasActiveSubscription ? (
                      <div className='mb-[12rem] border-b border-d-light-gray/60 pb-[12rem]'>
                        <button
                          type='button'
                          onClick={() => {
                            closeUserMenu();
                            handleUpgradeClick();
                          }}
                          className='inline-flex w-full items-center justify-center gap-x-[4rem] rounded-[40rem] bg-d-green px-[20rem] py-[12rem] text-left text-black transition-colors duration-200 hover:bg-d-green'
                        >
                          <span className='text-[13rem] font-semibold leading-tight'>{tActions('upgradePlan')}</span>
                          <img src='/images/icon_stars--black.svg' alt={tImgAlts('star')} className='size-[14rem]' />
                        </button>
                      </div>
                    ) : null}

                    <button
                      type='button'
                      onClick={() => {
                        closeUserMenu();
                        triggerSubscriptionModal();
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
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {!onOpenLanguage ? (
        isMobile ? (
          <BottomSheet open={isLangModalOpen} onOpenChange={setLangModalOpen}>
            <ChangeLangModal variant='mobile' />
          </BottomSheet>
        ) : (
          <Dialog open={isLangModalOpen} onOpenChange={setLangModalOpen}>
            <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center backdrop-brightness-90'>
              <ChangeLangModal variant='desktop' />
            </DialogContent>
          </Dialog>
        )
      ) : null}

      {!onOpenProfileSettings ? (
        <Dialog open={isSettingsModalOpen} onOpenChange={setSettingsModalOpen}>
          <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center backdrop-brightness-90'>
            <ProfileEditFormModal />
          </DialogContent>
        </Dialog>
      ) : null}

      {!onOpenSubscription ? <SubscriptionDetailsModal open={isSubscriptionModalOpen} onOpenChange={setSubscriptionModalOpen} /> : null}

      {!isMobile ? (
        <Dialog open={isPricesModalOpen} onOpenChange={handlePricesModalOpenChange}>
          <DialogContent className='fixed left-[50%] top-[50%] flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center backdrop-brightness-90'>
            <PricesModal onSelectPlan={handlePlanSelect} promoError={promoError} planDiscounts={planDiscounts} />
          </DialogContent>
        </Dialog>
      ) : null}

      <PromoPromptModal
        open={isPromoModalOpen}
        planId={selectedPlanId}
        onClose={handlePromoModalClose}
        onBackToPlans={() => {
          handlePromoModalClose();
          setPricesModalOpen(true);
        }}
        onDiscountUpdate={(planId, info) => setPlanDiscounts(prev => ({ ...prev, [planId]: info }))}
        onErrorMessage={setPromoError}
      />
    </header>
  );
};

export const Header = withHydrationGuard(HeaderComponent);
