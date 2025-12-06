import { DateInput, Edit, NumberInput, ReferenceInput, SelectInput, SimpleForm, TextInput } from 'react-admin';

export const LessonQuestionGroupEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" />
            <ReferenceInput source="lessonId" reference="lessons" label="Lesson">
                <SelectInput optionText="lessonCategoryId" />
            </ReferenceInput>
            <ReferenceInput source="lessonCategoryId" reference="lessonCategory" label="Category">
                <SelectInput optionText="categoryType" />
            </ReferenceInput>
            <TextInput source="questionList" />
            <NumberInput source="time" />
            <NumberInput
                source="systemStep"
                label="System Step"
                min={1}
                max={3}
                required
            />
            <DateInput source="createdAt" />
        </SimpleForm>
    </Edit>
);