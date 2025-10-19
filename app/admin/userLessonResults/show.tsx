import { DateField, NumberField, ReferenceField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const UserLessonResultsShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" label="User">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="lessonId" reference="lessons" label="Lesson">
                <TextField source="lessonOrder" />
            </ReferenceField>
            <NumberField source="rightQuestions" label="Right Questions" />
            <NumberField source="totalQuestions" label="Total Questions" />
            <DateField source="startedAt" />
            <DateField source="completedAt" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);
