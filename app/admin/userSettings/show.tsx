import { BooleanField, ReferenceField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const UserSettingsShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" label="User">
                <TextField source="name" />
            </ReferenceField>
            <BooleanField source="lessonClock" label="Lesson Clock" />
            <BooleanField source="quizClock" label="Quiz Clock" />
            <BooleanField source="immediateResult" label="Immediate Result" />
            <TextField source="grade_class" label="Grade/Class" />
            <TextField source="gender" />
            <TextField source="avatar" />
        </SimpleShowLayout>
    </Show>
);
