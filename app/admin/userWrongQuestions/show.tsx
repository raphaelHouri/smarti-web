import { BooleanField, ReferenceField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const UserWrongQuestionsShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" label="User">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="questionId" reference="questions" label="Question">
                <TextField source="question" />
            </ReferenceField>
            <BooleanField source="isNull" label="Is Null" />
        </SimpleShowLayout>
    </Show>
);
