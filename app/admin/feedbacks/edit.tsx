import { DateInput, Edit, NumberInput, ReferenceInput, SimpleForm, TextInput } from 'react-admin';

export const FeedbackEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <ReferenceInput source="userId" reference="users" />
            <TextInput source="screenName" />
            <TextInput source="identifier" />
            <TextInput source="rate" />
            <TextInput source="title" />
            <TextInput source="description" />
            <NumberInput source="systemStep" label="System Step" required min={1} max={3} />
            <DateInput source="createdAt" />
        </SimpleForm>
    </Edit>
);