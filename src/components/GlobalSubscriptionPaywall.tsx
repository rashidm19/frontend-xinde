'use client';

import { Dialog, DialogContent } from './ui/dialog';
import { PricesModal } from './PricesModal';

import { useSubscriptionStore } from '@/stores/subscriptionStore';

export const GlobalSubscriptionPaywall = () => {
  const isOpen = useSubscriptionStore(state => state.isPaywallOpen);
  const setPaywallOpen = useSubscriptionStore(state => state.setPaywallOpen);

  return (
    <Dialog open={isOpen} onOpenChange={setPaywallOpen}>
      <DialogContent className='fixed left-1/2 top-1/2 flex h-auto w-[1280rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center [&_button[data-radix-dialog-close]]:hidden'>
        <PricesModal />
      </DialogContent>
    </Dialog>
  );
};
