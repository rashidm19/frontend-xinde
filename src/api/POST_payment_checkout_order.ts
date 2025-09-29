import { API_URL } from '@/lib/config';
import { IPaymentOrder } from '@/types/Payments';

interface IValues {
  service_id: string;
  promo_code?: string;
}

export const POST_payment_checkout_order = async (values: IValues): Promise<IPaymentOrder> => {
  const res = await fetch(`${API_URL}/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(values),
  });

  return await res.json();
};
