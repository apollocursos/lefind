import { handlePaymentCheckout } from "../../server/paymentRoutes";

export default function handler(req: any, res: any) {
  return handlePaymentCheckout(req, res);
}
