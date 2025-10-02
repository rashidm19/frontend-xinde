import axiosInstance from '@/lib/axiosInstance';
import { ICheckoutOrderResponse } from '@/types/Payments';

interface IValues {
  service_id?: string;
  subscription_id?: string;
  subscription_plan_id?: string;
  promo_code?: string;
}

export const POST_payment_checkout_order = async (values: IValues): Promise<ICheckoutOrderResponse> => {
  const payload = {
    ...values,
    promo_code: values.promo_code?.trim() || undefined,
  };

  const { data } = await axiosInstance.post('/checkout/orders', payload, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  return data;
};
