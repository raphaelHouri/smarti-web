import { DateField, ReferenceField, RichTextField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const QuestionShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <RichTextField source="content" />
            <TextField source="question" />
            <TextField source="format" />
            <TextField source="options.a" />
            <TextField source="options.b" />
            <TextField source="options.c" />
            <TextField source="options.d" />
            <ReferenceField source="categoryId" reference="lessonCategory" label="Category">
                <TextField source="categoryType" /> {/* <-- Added TextField to display categoryType */}
            </ReferenceField>
            <TextField source="topicType" />
            <TextField source="explanation" />
            <DateField source="createdAt" />
        </SimpleShowLayout>
    </Show>
);