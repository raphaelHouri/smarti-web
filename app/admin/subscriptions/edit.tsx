import { DateInput, Edit, NumberInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'react-admin';

export const SubscriptionsEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <ReferenceInput source="userId" reference="users" label="User">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="couponId" reference="coupons" label="Coupon">
                <SelectInput optionText="code" />
            </ReferenceInput>
            <ReferenceInput source="planId" reference="plans" label="Plan">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <NumberInput source="price" />
            <TextInput source="receiptId" label="Receipt ID" />
            <DateInput source="systemUntil" />
            <DateInput source="createdAt" disabled />
        </SimpleForm>
    </Edit>
);
