import {
    DateField,
    NumberField,
    ReferenceField,
    Show,
    SimpleShowLayout,
    TextField,
    BooleanField
} from 'react-admin';

export const CouponShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="code" />
            <TextField source="couponType" label="Type" />
            <NumberField source="value" />
            <DateField source="validFrom" />
            <DateField source="validUntil" />
            <BooleanField source="isActive" />
            <NumberField source="maxUses" label="Max Uses" />
            <ReferenceField source="planId" reference="plans" label="Plan">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="organizationYearId" reference="organizationYears" label="Organization Year">
                <TextField source="year" />
            </ReferenceField>
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);
