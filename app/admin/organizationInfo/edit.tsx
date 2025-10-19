import { DateInput, Edit, SimpleForm, TextInput } from 'react-admin';

export const OrganizationInfoEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" />
            <TextInput source="contactEmail" label="Contact Email" />
            <TextInput source="address" />
            <TextInput source="city" />
            <TextInput source="phone" />
            <DateInput source="createdAt" disabled />
        </SimpleForm>
    </Edit>
);
