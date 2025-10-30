import * as React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    ReferenceInput,
    SelectInput,
    NumberInput,
    useDataProvider,
    useNotify,
    useRedirect,
    Button,
    CreateProps,
    RaRecord,
    Identifier,
} from 'react-admin';
import { FieldValues } from 'react-hook-form';

// Define the shape for a LessonQuestionGroup if useful for future extension
interface LessonQuestionGroup extends RaRecord {
    id: Identifier;
    lessonId: string;
    categoryId: string;
    questionList?: string;
    time?: number;
    createdAt?: string;
}

export const LessonQuestionGroupCreate = (props: CreateProps) => {
    const dataProvider = useDataProvider();
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
            // Use lessons import to create lessons and their question groups
            const response = await fetch('/api/lessons/import', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            if (response.ok) {
                notify(result.message || 'File imported successfully!', { type: 'success' });
                redirect('list', 'lessonQuestionGroups');
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
        const link = document.createElement('a');
        link.href = '/lessons_import_template.xlsx';
        link.download = 'lessons_import_template.xlsx';
        link.click();
    };

    const handleSubmit = async (values: FieldValues) => {
        try {
            await dataProvider.create<LessonQuestionGroup>('lessonQuestionGroups', { data: values as LessonQuestionGroup });
            notify('Lesson Question Group created successfully!', { type: 'success' });
            redirect('list', 'lessonQuestionGroups');
        } catch (error: unknown) {
            notify(`Error creating lesson group: ${(error as Error).message}`, { type: 'error' });
        }
    };

    return (
        <Create {...props}>
            <SimpleForm onSubmit={handleSubmit}>
                <ReferenceInput source="lessonId" reference="lessons" label="Lesson">
                    <SelectInput optionText="id" />
                </ReferenceInput>
                <ReferenceInput source="categoryId" reference="lessonCategory" label="Category">
                    <SelectInput optionText="categoryType" />
                </ReferenceInput>
                <TextInput source="questionList" label="Question IDs (comma or semicolon separated)" />
                <NumberInput source="time" />

                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <p>Or import lessons and groups from an Excel file:</p>
                    <Button
                        onClick={handleButtonClick}
                        label="Import from Excel (.xlsx)"
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept=".xlsx"
                    />
                    <Button
                        onClick={handleDownloadTemplate}
                        label="Download Import Template (.xlsx)"
                        style={{ marginLeft: '10px' }}
                    />
                </div>
            </SimpleForm>
        </Create>
    );
};
