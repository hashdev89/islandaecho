# PayHere Payment Gateway Integration Setup

This guide will help you set up PayHere payment gateway integration for your booking system.

## Prerequisites

1. **PayHere Account**: You need a PayHere merchant account
2. **Merchant ID**: Found in Side Menu > Integrations of your PayHere Account
3. **Merchant Secret**: Generated for your domain/app (see steps below)

## Step 1: Get Your Merchant Secret

1. Go to your PayHere Account Dashboard
2. Navigate to Side Menu > Integrations
3. Click 'Add Domain/App'
4. Enter your top-level domain (e.g., `isleandecho.com`) or App package name
5. Click 'Request to Allow'
6. Wait for approval (up to 24 hours)
7. Copy the Merchant Secret shown for your domain/app

## Step 2: Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# PayHere Configuration
PAYHERE_MERCHANT_ID=your_merchant_id_here
PAYHERE_MERCHANT_SECRET=your_merchant_secret_here
PAYHERE_SANDBOX=true  # Set to 'false' for production

# Base URL for payment callbacks (must be publicly accessible)
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Change to your production URL
```

**Important Notes:**
- For production, set `PAYHERE_SANDBOX=false`
- `NEXT_PUBLIC_BASE_URL` must be a publicly accessible URL (not localhost) for production
- The `notify_url` callback requires a public domain/IP

## Step 3: Update Database Schema

Run the SQL migration to add payment tracking columns:

```sql
-- Run this in your Supabase SQL Editor
-- File: supabase_add_payment_id.sql
```

This adds:
- `payment_id` - PayHere payment ID
- `payment_method` - Payment method used (VISA, MASTER, etc.)

## Step 4: Testing

### Sandbox Testing

1. Set `PAYHERE_SANDBOX=true` in your `.env.local`
2. Use PayHere sandbox test cards:
   - Card: 5123456789012346
   - CVV: 123
   - Expiry: Any future date

### Production Testing

1. Set `PAYHERE_SANDBOX=false`
2. Ensure `NEXT_PUBLIC_BASE_URL` points to your production domain
3. Test with real payment methods

## Payment Flow

1. **Customer Books Tour**: Creates booking with `payment_status: 'pending'`
2. **Redirect to Payment**: Customer redirected to `/payments/checkout?booking_id=XXX`
3. **PayHere Checkout**: Customer redirected to PayHere payment gateway
4. **Payment Processing**: Customer completes payment on PayHere
5. **Notification Callback**: PayHere sends POST to `/api/payments/notify`
6. **Database Update**: Booking `payment_status` updated based on payment result
7. **Return Redirect**: Customer redirected to `/payments/return?booking_id=XXX`
8. **Status Display**: Customer sees payment status on return page

## API Endpoints

### POST `/api/payments/checkout`
Creates PayHere checkout form data and returns checkout URL.

**Request Body:**
```json
{
  "bookingId": "B001",
  "amount": 1000,
  "currency": "LKR",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "0771234567",
  "customerAddress": "123 Main St",
  "customerCity": "Colombo",
  "customerCountry": "Sri Lanka",
  "tourName": "Cultural Triangle Tour"
}
```

### POST `/api/payments/notify`
PayHere callback endpoint (server-to-server). Updates booking payment status.

**Note:** This endpoint receives form data from PayHere, not JSON.

## Payment Status Codes

- `2` - Success (paid)
- `0` - Pending
- `-1` - Cancelled (failed)
- `-2` - Failed
- `-3` - Chargeback (refunded)

## Security

- Hash verification is implemented to ensure payment notifications are genuine
- Merchant secret is never exposed to client-side code
- All payment processing happens server-side

## Troubleshooting

### Payment notification not received

1. Ensure `notify_url` is publicly accessible (not localhost)
2. Check server logs for notification errors
3. Verify merchant secret is correct
4. Check PayHere dashboard for payment status

### Hash verification fails

1. Verify merchant secret matches PayHere dashboard
2. Check amount formatting (must be 2 decimal places)
3. Ensure currency code matches (LKR, USD, etc.)

### Booking not updating

1. Check Supabase connection
2. Verify booking ID matches order_id
3. Check database permissions for bookings table

## Support

For PayHere-specific issues, contact PayHere support:
- Email: support@payhere.lk
- Website: https://www.payhere.lk

