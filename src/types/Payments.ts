export interface IPaymentOrder {
  orderId: number;
  invoiceId: string;
  amount: number;
  token: {
    access_token: string;
  };
  backLink: string;
  failureBackLink: string;
  postLink: string;
  postLinkParams: {
    auth: string;
  };
  terminal: string;
  currency: string;
  isSandbox: boolean;
}
