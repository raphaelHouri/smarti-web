import { DateField, NumberField, ReferenceField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const OrganizationYearsShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="organizationId" reference="organizationInfo" label="Organization">
                <TextField source="name" />
            </ReferenceField>
            <NumberField source="year" />
            <TextField source="notes" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);
