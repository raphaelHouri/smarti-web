import { BooleanInput, Edit, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'react-admin';

export const UserWrongQuestionsEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <ReferenceInput source="userId" reference="users" label="User">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="questionId" reference="questions" label="Question">
                <SelectInput optionText="question" />
            </ReferenceInput>
            <BooleanInput source="isNull" label="Is Null" />
        </SimpleForm>
    </Edit>
);
