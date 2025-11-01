import React from 'react';
import { Create, SimpleForm, TextInput, NumberInput, ReferenceInput, SelectInput, Button, CreateProps, useDataProvider, useNotify, useRedirect } from 'react-admin';

interface IMyDataProvider {
}

export const OnlineLessonCreate = (props: CreateProps) => {
    const dataProvider = useDataProvider() as IMyDataProvider;
    const notify = useNotify();
    const redirect = useRedirect();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            notify('No file selected.', { type: 'warning' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/onlineLessons/import', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                notify(result.message || 'File imported successfully!', { type: 'success' });
                redirect('list', 'onlineLessons');
            } else {
                notify(`Error importing file: ${result.message || 'An unknown error occurred'}`, { type: 'error' });
            }
        } catch (error: any) {
            console.error('File upload error:', error);
            notify(`Network or server error: ${error.message || 'Could not connect to the server.'}`, { type: 'error' });
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleDownloadTemplate = () => {
        const url = '/online_lesson_template.xlsx';
        const link = document.createElement('a');
        link.href = url;
        link.download = 'online_lesson_template.xlsx';
        link.click();
    };

    return (
        <Create {...props}>
            <SimpleForm>
                <ReferenceInput source="categoryId" reference="lessonCategory" label="Category">
                    <SelectInput optionText="categoryType" />
                </ReferenceInput>
                <TextInput source="topicType" />
                <TextInput source="title" required />
                <TextInput source="description" />
                <TextInput source="link" required />
                <NumberInput source="order" defaultValue={0} />

                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <p>Or import multiple online lessons from an Excel file:</p>
                    <Button onClick={handleButtonClick} label="Import Online Lessons from Excel" />
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".xlsx" />
                    <Button onClick={handleDownloadTemplate} label="Download Template" style={{ marginLeft: '10px' }} />
                </div>
            </SimpleForm>
        </Create>
    );
};


