import { Create, NumberInput, SimpleForm, TextInput } from 'react-admin';

export const LessonCategoryCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="id" label="ID (Optional - leave empty for auto-generated UUID)" />
            <TextInput source="categoryType" required />
            <TextInput source="title" required />
            <TextInput source="description" required multiline rows={3} />
            <NumberInput
                source="systemStep"
                label="System Step"
                min={1}
                max={3}
                required
            />
            <TextInput source="imageSrc" required />
        </SimpleForm>
    </Create>
);

