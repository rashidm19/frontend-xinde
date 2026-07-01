import axiosInstance from '@/lib/axiosInstance';
import { ICheckoutOrderResponse } from '@/types/Payments';

interface IValues {
  product: 'hsk';
  plan: string;
  uid: string;
  return_url: string;
  cancel_url: string;
}

// Public, no-auth: starts a one-time HSK charge on pay.studybox.kz.
// `email` is intentionally not sent — it's frontend prefill only (backend doesn't use it).
export const POST_hsk_checkout_order = async (values: IValues): Promise<ICheckoutOrderResponse> => {
  const { data } = await axiosInstance.post('/checkout/hsk/orders', values, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  return data;
};
