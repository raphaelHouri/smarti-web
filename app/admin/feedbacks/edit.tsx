import { DateInput, Edit, ReferenceInput, SimpleForm, TextInput } from 'react-admin';

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
            <DateInput source="createdAt" />
        </SimpleForm>
    </Edit>
);