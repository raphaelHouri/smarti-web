import React from 'react';
import {
    DateField,
    NumberField,
    Show,
    SimpleShowLayout,
    TextField,
} from 'react-admin';

export const SystemConfigShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <NumberField source="systemStep" label="System Step" />
            <TextField source="linkWhatsappGroup" label="WhatsApp Group Link" />
            <DateField source="examDate" label="Exam Date" />
            <NumberField source="numQuestion" label="Number of Questions" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" />
        </SimpleShowLayout>
    </Show>
);

