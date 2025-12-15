import {
    DateInput,
    Edit,
    NumberInput,
    SimpleForm,
    TextInput,
} from 'react-admin';

export const SystemConfigEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <NumberInput
                source="systemStep"
                label="System Step"
                min={1}
                max={3}
                required
            />
            <TextInput
                source="linkWhatsappGroup"
                label="WhatsApp Group Link"
                fullWidth
            />
            <DateInput
                source="examDate"
                label="Exam Date"
            />
            <NumberInput
                source="numQuestion"
                label="Number of Questions"
                min={0}
            />
            <DateInput source="createdAt" disabled />
            <DateInput source="updatedAt" disabled />
        </SimpleForm>
    </Edit>
);

