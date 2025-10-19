import { DateField, ReferenceField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const FeedbackShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" />
            <TextField source="screenName" />
            <TextField source="identifier" />
            <TextField source="rate" />
            <TextField source="title" />
            <TextField source="description" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);