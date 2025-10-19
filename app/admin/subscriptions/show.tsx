import { DateField, NumberField, ReferenceField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const SubscriptionsShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" label="User">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="couponId" reference="coupons" label="Coupon">
                <TextField source="code" />
            </ReferenceField>
            <ReferenceField source="planId" reference="plans" label="Plan">
                <TextField source="name" />
            </ReferenceField>
            <NumberField source="price" />
            <TextField source="receiptId" label="Receipt ID" />
            <DateField source="systemUntil" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);
