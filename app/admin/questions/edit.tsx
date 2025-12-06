import { DateInput, Edit, NumberInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'react-admin';

export const QuestionEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="content" />
            <TextInput source="question" />
            <TextInput source="format" />
            <TextInput source="options.a" />
            <TextInput source="options.b" />
            <TextInput source="options.c" />
            <TextInput source="options.d" />
            <ReferenceInput source="category_id" reference="lessonCategory" label="Category">
                <SelectInput optionText="categoryType" />
            </ReferenceInput>
            <TextInput source="topicType" />
            <TextInput source="explanation" />
            <TextInput source="managerId" required label="Manager ID" />
            <DateInput source="createdAt" disabled />
            <NumberInput
                source="systemStep"
                label="System Step"
                min={1}
                max={3}
                required
            />
        </SimpleForm>
    </Edit>
);