import {
    Create,
    DateInput,
    NumberInput,
    SimpleForm,
    TextInput,
} from 'react-admin';

export const SystemConfigCreate = () => (
    <Create>
        <SimpleForm>
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
            <DateInput
                source="examEndDate"
                label="Exam End Date"
            />
            <NumberInput
                source="numQuestion"
                label="Number of Questions"
                min={0}
            />
        </SimpleForm>
    </Create>
);

