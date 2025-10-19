import { DateInput, Edit, NumberInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'react-admin';

export const OrganizationYearsEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <ReferenceInput source="organizationId" reference="organizationInfo" label="Organization">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <NumberInput source="year" />
            <TextInput source="notes" />
            <DateInput source="createdAt" disabled />
        </SimpleForm>
    </Edit>
);
