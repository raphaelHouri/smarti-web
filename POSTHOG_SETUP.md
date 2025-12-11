# PostHog Analytics Integration

This document describes the PostHog analytics integration for tracking user behavior, split by systemStep, and focusing on the purchase process.

## Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_POSTHOG_KEY=your_posthog_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

Replace `your_posthog_project_api_key` with your actual PostHog project API key from your PostHog dashboard.

### 2. Installation

PostHog packages are already installed:

- `posthog-js` - Client-side tracking
- `posthog-node` - Server-side tracking

## Architecture

### Client-Side Tracking

- **Provider**: `components/posthog-provider.tsx` - Initializes PostHog and identifies users
- **Utilities**: `lib/posthog.ts` - Helper functions for client-side event tracking
- **Integration**: Automatically identifies users when they log in via Clerk

### Server-Side Tracking

- **Utilities**: `lib/posthog-server.ts` - Helper functions for server-side event tracking
- Used in API routes for payment processing

## Tracked Events

### Purchase Funnel Events

1. **`shop_page_viewed`**

   - Properties: `systemStep`, `category`, `packageType`
   - Triggered: When user visits shop page

2. **`shop_category_changed`**

   - Properties: `systemStep`, `category`, `packageType`
   - Triggered: When user switches between system/books categories

3. **`coupon_applied`**

   - Properties: `systemStep`, `couponCode`, `couponType`, `discountValue`
   - Triggered: When a coupon is successfully loaded/applied

4. **`plan_selected`**

   - Properties: `systemStep`, `planId`, `planName`, `planType`, `category`, `price`, `discountedPrice`, `hasBookOption`, `bookOptionSelected`, `couponCode`, etc.
   - Triggered: When user clicks purchase button

5. **`purchase_initiated`** (Server-side)

   - Properties: `systemStep`, `planId`, `planName`, `planType`, `category`, `totalPrice`, `couponCode`, `bookIncluded`, `transactionId`
   - Triggered: When payment transaction is created

6. **`payment_redirected`** (Server-side)

   - Properties: `systemStep`, `transactionId`, `amount`, `planId`
   - Triggered: After redirect to payment gateway

7. **`payment_success`** (Server-side)

   - Properties: `systemStep`, `transactionId`, `amount`, `planId`, `planType`, `couponId`, `bookIncluded`, `paymentMethod`
   - Triggered: When payment is successfully approved

8. **`payment_failed`** (Server-side)

   - Properties: `systemStep`, `transactionId`, `errorCode`, `planId`
   - Triggered: When payment fails

9. **`subscription_created`** (Server-side)
   - Properties: `systemStep`, `subscriptionId`, `productId`, `productType`, `validUntil`, `planId`
   - Triggered: When subscription is successfully created

### Learning Events

1. **`system_step_changed`**

   - Properties: `systemStep`
   - Triggered: When user changes system step

2. **`lesson_started`**

   - Properties: `systemStep`, `lessonId`, `totalQuestions`
   - Triggered: When user starts a lesson

3. **`lesson_completed`**

   - Properties: `systemStep`, `lessonId`, `totalQuestions`, `answeredQuestions`, `duration`
   - Triggered: When user completes a lesson

4. **`practice_mode_started`**

   - Properties: `systemStep`, `totalQuestions`
   - Triggered: When user starts practice mode

5. **`practice_mode_completed`**
   - Properties: `systemStep`, `totalQuestions`, `answeredQuestions`, `duration`
   - Triggered: When user completes practice mode

## User Properties

PostHog automatically tracks the following user properties:

- `systemStep` - Current system step (1, 2, or 3)
- `email` - User email (from Clerk)
- `name` - User name (from Clerk)

These properties are updated automatically when:

- User logs in
- System step changes
- User properties are explicitly updated

## PostHog Dashboard Setup

### Recommended Insights

1. **Purchase Funnel**

   - Create a funnel: `shop_page_viewed` → `plan_selected` → `purchase_initiated` → `payment_success`
   - Split by `systemStep` to see conversion rates per step

2. **Conversion Rate by SystemStep**

   - Compare conversion rates across systemStep 1, 2, 3
   - Filter: `event = payment_success` grouped by `systemStep`

3. **Plan Popularity**

   - Which plans are most viewed/selected by systemStep
   - Filter: `event = plan_selected` grouped by `planId` and `systemStep`

4. **Coupon Usage**

   - Track coupon application rates and impact on conversion
   - Filter: `event = coupon_applied` and `event = payment_success`

5. **Drop-off Analysis**
   - Where users drop off in the purchase process
   - Use funnel analysis with drop-off points

### Recommended Cohorts

- Users by SystemStep (1, 2, 3)
- Purchasers by SystemStep
- Coupon users vs non-coupon users
- Lesson completers by SystemStep

## Usage Examples

### Client-Side Event Tracking

```typescript
import { trackEvent } from "@/lib/posthog";

// Track a custom event
trackEvent("custom_event_name", {
  systemStep: 1,
  customProperty: "value",
});
```

### Server-Side Event Tracking

```typescript
import { trackServerEvent } from "@/lib/posthog-server";

// Track a server-side event
trackServerEvent(userId, "server_event_name", {
  systemStep: 1,
  customProperty: "value",
});
```

## Privacy & Compliance

- PostHog respects `Do Not Track` headers
- User data is handled according to PostHog's privacy policy
- Consider adding a privacy notice if required by your jurisdiction
- Review PostHog's data retention policies

## Troubleshooting

### Events Not Appearing

1. Check that `NEXT_POSTHOG_KEY` is set correctly
2. Verify PostHog host URL is correct
3. Check browser console for PostHog initialization messages
4. Ensure PostHog provider is included in root layout

### Server-Side Events Not Tracking

1. Verify `NEXT_POSTHOG_KEY` is available server-side
2. Check server logs for PostHog errors
3. Ensure PostHog Node SDK is properly initialized

## Additional Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog JavaScript SDK](https://posthog.com/docs/integrate/client/js)
- [PostHog Node SDK](https://posthog.com/docs/integrate/server/node)
