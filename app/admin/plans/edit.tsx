import { DateInput, Edit, NumberInput, SimpleForm, TextInput } from 'react-admin';

export const PlanEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" />
            <TextInput source="description" />
            <NumberInput source="days" />
            <NumberInput source="price" />
            <DateInput source="createdAt" disabled />
        </SimpleForm>
    </Edit>
);
