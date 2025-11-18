import {
    Create,
    DateInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    BooleanInput,
} from 'react-admin';

export const CouponCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="code" required />
            <SelectInput
                source="couponType"
                choices={[
                    { id: 'percentage', name: 'Percentage' },
                    { id: 'fixed', name: 'Fixed Amount' },
                ]}
                defaultValue="percentage"
                required
            />
            <NumberInput source="value" required />
            <DateInput source="validFrom" required />
            <DateInput source="validUntil" required />
            <BooleanInput source="isActive" defaultValue={true} />
            <NumberInput source="maxUses" required defaultValue={1} />
            <ReferenceInput source="planId" reference="plans" label="Plan" required>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="organizationYearId" reference="organizationYears" label="Organization Year" required>
                <SelectInput
                    optionText={(record) => record ? `${record.year}` : ''}
                />
            </ReferenceInput>
        </SimpleForm>
    </Create>
);

