# Organization Auto-Assignment Implementation

## Overview

This document describes the automatic organization assignment feature implemented for the Smarti educational platform.

## What Was Implemented

**Feature:** Automatic assignment of users to organization years when they save organization-specific coupons (Option A from the analysis).

**Implementation Date:** February 5, 2026

**Modified File:** `smarti-web/db/queries.ts` (function: `saveUserCoupon`)

## How It Works

### User Flow

1. **User receives organization coupon code** from their school/institution
2. **User enters coupon code** in the application
3. **System validates** the coupon (dates, active status, max uses, system step)
4. **Organization check** is performed:
   - If user has NO organization → Auto-assign to coupon's organization
   - If user has SAME organization → Allow coupon use
   - If user has DIFFERENT organization → Reject with error message
5. **Coupon is saved** to user's settings
6. **Analytics tracking** records the assignment event

### Technical Implementation

```typescript
// In saveUserCoupon() function (lines 647-673)

if (coupon.organizationYearId) {
    const currentUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    // Prevent cross-organization coupon use
    if (currentUser?.organizationYearId && 
        currentUser.organizationYearId !== coupon.organizationYearId) {
        return { success: false, error: "קופון זה מיועד לארגון אחר" };
    }

    // Auto-assign if user has no organization
    if (currentUser && !currentUser.organizationYearId) {
        await db.update(users)
            .set({ organizationYearId: coupon.organizationYearId })
            .where(eq(users.id, userId));

        // Track the assignment
        trackServerEvent(userId, "user_assigned_to_organization", {
            organizationYearId: coupon.organizationYearId,
            couponId: coupon.id,
            couponCode: coupon.code,
            systemStep: systemStep,
            assignmentMethod: "auto_coupon",
        });
    }
}
```

## Benefits

### 1. Automatic Organization Tracking
- **Before:** Users could use organization coupons but never appear in organization analytics
- **After:** Users are automatically linked and tracked in organization reports

### 2. Reduced Manual Work
- **Before:** Admins had to manually assign each user to their organization
- **After:** Assignment happens automatically when coupon is saved

### 3. Improved Data Consistency
- **Before:** Subscriptions had `couponId` but users had no `organizationYearId`
- **After:** Complete data trail from coupon → user → organization

### 4. Better Security
- **Before:** Any user could use any organization's coupon
- **After:** Users from Organization A cannot use Organization B's coupons

### 5. Accurate Analytics
- **Before:** Organization analytics incomplete - missing coupon users
- **After:** All students using organization coupons appear in analytics

## Behavior Matrix

| User State | Coupon Type | Action | Result |
|------------|-------------|--------|--------|
| No organization | Organization coupon | Save coupon | ✅ Auto-assigned to organization |
| No organization | General coupon | Save coupon | ✅ Coupon saved, no org assignment |
| Has Org A | Org A coupon | Save coupon | ✅ Coupon saved (already in org) |
| Has Org A | Org B coupon | Save coupon | ❌ Rejected: "קופון זה מיועד לארגון אחר" |
| Has Org A | General coupon | Save coupon | ✅ Coupon saved, org unchanged |

## Event Tracking

When a user is auto-assigned, the following event is tracked in PostHog:

**Event Name:** `user_assigned_to_organization`

**Properties:**
- `organizationYearId` - UUID of the organization year
- `couponId` - UUID of the coupon that triggered assignment
- `couponCode` - The coupon code used
- `systemStep` - System step (1, 2, or 3)
- `assignmentMethod` - Always "auto_coupon" for this flow

## Database Changes

### Updated Table: `users`

When auto-assignment occurs, the user's `organizationYearId` field is updated:

```sql
UPDATE users 
SET organization_year_id = '[coupon-org-year-id]'
WHERE id = '[user-id]' 
  AND organization_year_id IS NULL;
```

**Note:** Existing organization assignments are NEVER overwritten. This prevents accidentally moving users between organizations.

## Testing Scenarios

### Test Case 1: New User with Organization Coupon
1. Create new user account (no organization)
2. Enter organization coupon code
3. Verify user.organizationYearId is set
4. Verify event is tracked
5. Verify user appears in organization analytics

### Test Case 2: User Already in Organization
1. User already has organizationYearId set
2. Enter same organization's coupon
3. Verify coupon is saved
4. Verify organizationYearId unchanged
5. Verify NO assignment event (already assigned)

### Test Case 3: Cross-Organization Attempt
1. User has organizationYearId for Org A
2. Enter coupon for Org B
3. Verify error: "קופון זה מיועד לארגון אחר"
4. Verify organizationYearId unchanged
5. Verify coupon NOT saved

### Test Case 4: General Coupon
1. User has no organization
2. Enter general coupon (no organizationYearId)
3. Verify coupon is saved
4. Verify organizationYearId remains null

## Migration Considerations

### Existing Users

**Users who previously used organization coupons but weren't assigned:**

These users will NOT be retroactively assigned. To find and fix these users, use this query:

```sql
SELECT DISTINCT u.id, u.email, c.organizationYearId, c.code
FROM users u
JOIN subscriptions s ON s.userId = u.id
JOIN coupons c ON c.id = s.couponId
WHERE c.organizationYearId IS NOT NULL
  AND u.organizationYearId IS NULL;
```

To retroactively assign them:

```sql
UPDATE users u
SET organization_year_id = c.organizationYearId
FROM subscriptions s
JOIN coupons c ON c.id = s.couponId
WHERE s.userId = u.id
  AND c.organizationYearId IS NOT NULL
  AND u.organizationYearId IS NULL;
```

## API Impact

### Affected Endpoints

**POST /api/user-coupon**
- Now performs organization assignment
- Returns same success/error structure
- Additional validation for cross-organization attempts

**GET /api/organization-analytics**
- Will now include auto-assigned users
- No code changes needed
- Automatically benefits from complete data

**GET /api/organization-analytics/[orgId]/users**
- Will show all users including auto-assigned
- No code changes needed

## Error Messages

### Hebrew (User-Facing)
- `"קופון זה מיועד לארגון אחר"` - "This coupon is for a different organization"

### English (Log/Debug)
- Organization assignment tracked with `assignmentMethod: "auto_coupon"`

## Rollback Plan

If this feature needs to be rolled back:

1. **Revert the code change** in `smarti-web/db/queries.ts`
2. **Query tracking data** to find auto-assignments:
   ```sql
   SELECT * FROM posthog_events 
   WHERE event = 'user_assigned_to_organization'
   AND properties->>'assignmentMethod' = 'auto_coupon';
   ```
3. **Optionally reset assignments** (only if needed):
   ```sql
   UPDATE users 
   SET organization_year_id = NULL 
   WHERE id IN (/* user IDs from tracking */);
   ```

## Future Enhancements

### Potential Improvements

1. **Bulk Assignment Tool** - Admin panel tool to assign multiple users at once
2. **Organization Invite Links** - Direct registration URLs for organizations
3. **Organization Switching** - Allow users to request organization change
4. **Parent Organization** - Support for multi-level organization hierarchies
5. **Assignment History** - Track all organization changes over time

## Related Files

- **Implementation:** `smarti-web/db/queries.ts` (lines 636-713)
- **Schema:** `smarti-web/db/schemaSmarti.ts` (users table, coupons table)
- **Analysis Document:** `c:\Users\user\.cursor\plans\coupon_timing_&_organization_link_e89e7d2d.plan.md`
- **API Route:** `smarti-web/app/api/user-coupon/route.ts`
- **Action:** `smarti-web/actions/user-coupon.ts`

## Support & Troubleshooting

### Common Issues

**Issue:** User can't use organization coupon
- **Check:** Do they already belong to a different organization?
- **Solution:** Admin must manually change their organizationYearId

**Issue:** User not appearing in analytics
- **Check:** Was coupon saved successfully?
- **Check:** Is organizationYearId set correctly?
- **Solution:** Use SQL query to verify assignment

**Issue:** Wrong organization assigned
- **Check:** Was correct coupon code used?
- **Solution:** Admin must manually update organizationYearId

## Contact

For questions about this implementation, refer to:
- Original analysis: `coupon_timing_&_organization_link_e89e7d2d.plan.md`
- Database schema: `smarti-web/db/schemaSmarti.ts`
- Implementation code: `smarti-web/db/queries.ts`
