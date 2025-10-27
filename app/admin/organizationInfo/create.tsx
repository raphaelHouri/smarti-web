import { Create, SimpleForm, TextInput } from 'react-admin';

export const OrganizationInfoCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" required />
            <TextInput source="contactEmail" label="Contact Email" />
            <TextInput source="address" />
            <TextInput source="city" />
            <TextInput source="phone" />
        </SimpleForm>
    </Create>
);
