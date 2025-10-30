import * as React from 'react';
import { BooleanInput, Create, NumberInput, ReferenceInput, SelectInput, SimpleForm, useNotify, useRedirect, Button } from 'react-admin';

export const LessonCreate = () => {
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
            const response = await fetch('/api/lessons/import', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                notify(result.message || 'File imported successfully!', { type: 'success' });
                redirect('list', 'lessons');
            } else {
                notify(`Error importing file: ${result.message || 'An unknown error occurred'}`, { type: 'error' });
            }
        } catch (error: any) {
            console.error('File upload error:', error);
            notify(`Network or server error: ${error.message || 'Could not connect to the server.'}`, { type: 'error' });
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleButtonClick = () => fileInputRef.current?.click();

    const handleDownloadTemplate = async () => {
        const XLSX = await import('xlsx');
        const data = [
            ['questionIds', 'categoryType', 'order', 'time', 'premium'],
            ['11111111-1111-1111-1111-111111111111;22222222-2222-2222-2222-222222222222', 'MATH_BASICS', 1, 600, true],
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
        XLSX.writeFile(workbook, 'lessons_template.xlsx');
    };

    return (
        <Create>
            <SimpleForm>
                <ReferenceInput source="lessonCategoryId" reference="lessonCategory" label="Category">
                    <SelectInput optionText="categoryType" />
                </ReferenceInput>
                <NumberInput source="lessonOrder" />
                <BooleanInput source="isPremium" label="Premium" defaultValue={true} />

                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <p>Or import lessons and groups from an Excel/CSV file:</p>
                    <Button onClick={handleButtonClick} label="Import Lessons from File" />
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept=".xlsx"
                    />
                    <Button onClick={handleDownloadTemplate} label="Download Template (.xlsx)" style={{ marginLeft: '10px' }} />
                </div>
            </SimpleForm>
        </Create>
    );
};

