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
            <NumberField source="uses" label="Uses" />
            <ReferenceField source="planId" reference="plans" label="Plan">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="organizationYearId" reference="organizationYears" label="Organization Year">
                <ReferenceField source="organizationId" reference="organizationInfo" link={false}>
                    <TextField source="name" />
                </ReferenceField>
                <span> - </span>
                <TextField source="year" />
            </ReferenceField>
            <NumberField source="systemStep" label="System Step" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);
