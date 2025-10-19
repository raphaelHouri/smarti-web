import { DateField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const OrganizationInfoShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="contactEmail" label="Contact Email" />
            <TextField source="address" />
            <TextField source="city" />
            <TextField source="phone" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);
