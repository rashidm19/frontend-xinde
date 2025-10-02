export interface IPaymentOrder {
  orderId: number;
  invoiceId?: string | null;
  amount: number;
  discount_amount?: number | null;
  token?: {
    access_token: string;
  } | null;
  backLink?: string | null;
  failureBackLink?: string | null;
  postLink?: string | null;
  postLinkParams?: {
    auth: string;
  } | null;
  terminal?: string | null;
  currency: string;
  isSandbox?: boolean;
}

export interface ICheckoutOrderResponse extends IPaymentOrder {
  requiresPayment: boolean;
}
