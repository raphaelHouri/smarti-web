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
                    { id: 'free', name: 'Free' },
                ]}
                defaultValue="percentage"
                required
            />
            <NumberInput source="value" defaultValue={0} helperText="Set to 0 for free coupons" />
            <DateInput source="validFrom" required />
            <DateInput source="validUntil" required />
            <BooleanInput source="isActive" defaultValue={true} />
            <NumberInput source="maxUses" required defaultValue={1} />
            <ReferenceInput source="planId" reference="plans" label="Plan" required filter={{ isActive: true }}>
                <SelectInput optionText={(record) => record ? `Step ${record.systemStep} - ${record.name}` : ''} />
            </ReferenceInput>
            <ReferenceInput source="organizationYearId" reference="organizationYears" label="Organization Year" required>
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
        </SimpleForm>
    </Create>
);

