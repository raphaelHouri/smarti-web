import { DateField, NumberField, Show, SimpleShowLayout, TextField, BooleanField } from 'react-admin';

export const PlanShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="description" />
            <NumberField source="days" />
            <NumberField source="price" />
            <BooleanField source="isActive" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);
