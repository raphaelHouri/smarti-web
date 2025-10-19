import { DateInput, Edit, NumberInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'react-admin';

export const UserLessonResultsEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <ReferenceInput source="userId" reference="users" label="User">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="lessonId" reference="lessons" label="Lesson">
                <SelectInput optionText="lessonOrder" />
            </ReferenceInput>
            <NumberInput source="rightQuestions" label="Right Questions" />
            <NumberInput source="totalQuestions" label="Total Questions" />
            <DateInput source="startedAt" />
            <DateInput source="completedAt" />
            <DateInput source="createdAt" disabled />
        </SimpleForm>
    </Edit>
);
