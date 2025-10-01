import axiosInstance from '@/lib/axiosInstance';
import { IPaymentOrder } from '@/types/Payments';

interface IValues {
  service_id?: string;
  subscription_id?: string;
  subscription_plan_id?: string;
  promo_code?: string;
}

export const POST_payment_checkout_order = async (values: IValues): Promise<IPaymentOrder> => {
  const { data } = await axiosInstance.post('/checkout/orders', values, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  return data;
};
