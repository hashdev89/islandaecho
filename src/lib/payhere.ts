import crypto from 'crypto'

/**
 * Generate PayHere hash for checkout
 * hash = MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase())
 */
export function generatePayHereHash(
  merchantId: string,
  orderId: string,
  amount: number,
  currency: string,
  merchantSecret: string
): string {
  // Format amount to 2 decimal places
  const formattedAmount = amount.toFixed(2)
  
  // Hash the merchant secret and convert to uppercase
  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase()
  
  // Generate the main hash
  const hashString = merchantId + orderId + formattedAmount + currency + hashedSecret
  const hash = crypto
    .createHash('md5')
    .update(hashString)
    .digest('hex')
    .toUpperCase()
  
  return hash
}

/**
 * Verify PayHere payment notification
 * md5sig = MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + MD5(merchant_secret).toUpperCase())
 */
export function verifyPayHerePayment(
  merchantId: string,
  orderId: string,
  payhereAmount: string,
  payhereCurrency: string,
  statusCode: string,
  merchantSecret: string,
  receivedMd5sig: string
): boolean {
  // Hash the merchant secret and convert to uppercase
  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase()
  
  // Generate the verification hash
  const hashString = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret
  const localMd5sig = crypto
    .createHash('md5')
    .update(hashString)
    .digest('hex')
    .toUpperCase()
  
  return localMd5sig === receivedMd5sig.toUpperCase()
}

/**
 * PayHere payment status codes
 */
export enum PayHereStatus {
  SUCCESS = '2',
  PENDING = '0',
  CANCELLED = '-1',
  FAILED = '-2',
  CHARGEBACK = '-3'
}

/**
 * Map PayHere status code to payment status
 */
export function mapPayHereStatusToPaymentStatus(statusCode: string): 'pending' | 'paid' | 'refunded' | 'failed' {
  switch (statusCode) {
    case PayHereStatus.SUCCESS:
      return 'paid'
    case PayHereStatus.PENDING:
      return 'pending'
    case PayHereStatus.CANCELLED:
    case PayHereStatus.FAILED:
      return 'failed'
    case PayHereStatus.CHARGEBACK:
      return 'refunded'
    default:
      return 'pending'
  }
}

