import axiosInstance from '@/lib/axiosInstance';

export interface IOrderStatus {
  id: number;
  status: string;
  payment_status: string;
}

export const GET_orders_id = async (orderId: number | string): Promise<IOrderStatus> => {
  const { data } = await axiosInstance.get(`/orders/${orderId}`);
  return data;
};
