import { BooleanInput, Edit, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'react-admin';

export const UserSettingsEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <ReferenceInput source="userId" reference="users" label="User">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <BooleanInput source="lessonClock" label="Lesson Clock" />
            <BooleanInput source="quizClock" label="Quiz Clock" />
            <BooleanInput source="immediateResult" label="Immediate Result" />
            <TextInput source="grade_class" label="Grade/Class" />
            <TextInput source="gender" />
            <TextInput source="avatar" />
        </SimpleForm>
    </Edit>
);
