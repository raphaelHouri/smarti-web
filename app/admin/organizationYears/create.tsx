import { Create, NumberInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'react-admin';

export const OrganizationYearsCreate = () => (
    <Create>
        <SimpleForm>
            <ReferenceInput source="organizationId" reference="organizationInfo" label="Organization">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <NumberInput source="year" required />
            <TextInput source="notes" />
        </SimpleForm>
    </Create>
);
