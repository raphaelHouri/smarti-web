import {
    DateField,
    NumberField,
    ReferenceField,
    Show,
    SimpleShowLayout,
    TextField,
    ReferenceArrayField,
    SingleFieldList,
    ChipField
} from 'react-admin';

export const LessonQuestionGroupShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="lessonId" reference="lessons" label="Lesson">
                <TextField source="id" />
            </ReferenceField>
            <ReferenceField source="categoryId" reference="lessonCategory" label="Category">
                <TextField source="categoryType" />
            </ReferenceField>
            <ReferenceArrayField source="questionList" reference="questions" label="Questions">
                <SingleFieldList>
                    <ChipField source="id" />
                </SingleFieldList>
            </ReferenceArrayField>
            <NumberField source="time" />
            <DateField source="createdAt" showTime />
        </SimpleShowLayout>
    </Show>
);
