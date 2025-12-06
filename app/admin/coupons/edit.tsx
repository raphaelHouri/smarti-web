import {
    DateInput,
    Edit,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    BooleanInput,
    SelectArrayInput
} from 'react-admin';

export const CouponEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="code" />
            <SelectInput
                source="couponType"
                choices={[
                    { id: 'percentage', name: 'Percentage' },
                    { id: 'fixed', name: 'Fixed Amount' },
                    { id: 'free', name: 'Free' }
                ]}
            />
            <NumberInput source="value" />
            <DateInput source="validFrom" />
            <DateInput source="validUntil" />
            <BooleanInput source="isActive" />
            <NumberInput source="maxUses" />
            <NumberInput source="uses" disabled />
            <ReferenceInput source="planId" reference="plans" label="Plan">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="organizationYearId" reference="organizationYears" label="Organization Year">
                <SelectInput
                    optionText={(record) => record ? `${record.year}` : ''}
                />
            </ReferenceInput>
            <NumberInput
                source="systemStep"
                label="System Step"
                min={1}
                max={3}
                required
            />
            <DateInput source="createdAt" disabled />
        </SimpleForm>
    </Edit>
);
