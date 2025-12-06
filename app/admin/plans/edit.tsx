import { DateInput, Edit, NumberInput, SimpleForm, TextInput, BooleanInput } from 'react-admin';

export const PlanEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" />
            <TextInput source="description" />
            <NumberInput source="days" />
            <NumberInput source="price" />
            <BooleanInput source="isActive" defaultValue={true} />
            <NumberInput
                source="systemStep"
                label="System Step"
                min={1}
                max={3}
                required
            />
            <DateInput source="createdAt" disabled />
        </SimpleForm>
    </Edit>
);
