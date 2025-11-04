import { NextResponse } from 'next/server';
import axios from 'axios';
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import QRCode from "qrcode";
import { createFileName } from '@/lib/book_utils';

export const runtime = 'nodejs';

const templatePath = path.resolve(path.join(process.cwd(), "public", "template.docx"));
const zipCachePath = path.resolve("public", "template.zip");

const readTemplate = async (templatePathLocal: string): Promise<Buffer> => {
    if (fs.existsSync(zipCachePath)) {
        return fs.readFileSync(zipCachePath);
    }
    const content = fs.readFileSync(templatePathLocal, "binary");
    const zip = new PizZip(content);
    const buf = zip.generate({ type: "nodebuffer" });
    fs.writeFileSync(zipCachePath, buf);
    return buf;
};

const generateQRCodeBuffer = async (data: string): Promise<Buffer> => {
    return QRCode.toBuffer(data);
};

async function generate(StudentName?: string, vat_id?: string): Promise<Buffer | void> {
    const imageModule = new ImageModule({
        centered: false,
        getImage: (tagValue: Buffer | string) => {
            if (typeof tagValue === 'string') {
                // Treat as base64 or utf8 string
                try {
                    // If data URL, strip prefix
                    const base64 = tagValue.startsWith('data:') ? tagValue.split(',')[1] ?? '' : tagValue;
                    return Buffer.from(base64, 'base64');
                } catch {
                    return Buffer.from(tagValue, 'utf8');
                }
            }
            return tagValue;
        },
        getSize: () => [150, 150],
    });
    try {
        const zipContent = await readTemplate(templatePath);
        const zip = new PizZip(zipContent);
        const qrCodeBuffer = await generateQRCodeBuffer(`https://chat.whatsapp.com/DysJXGAm6OJIBV1KvwVcDw?id=kdskl?vat_id=${vat_id}`);
        const doc = new Docxtemplater(zip, { modules: [imageModule] });

        const now = new Date();
        let yearString: string;
        if (now.getMonth() >= 0 && now.getMonth() < 5) {
            yearString = `${now.getFullYear() - 1} - ${now.getFullYear()}`;
        } else {
            yearString = `${now.getFullYear()} - ${now.getFullYear() + 1}`;
        }

        await doc.renderAsync({
            UserFullNameXXXX: StudentName || "",
            YEARXXXX: yearString,
            URLXXXX: "https://supergifted.co.il/book",
            image: qrCodeBuffer
        });

        const docxBuf = doc.getZip().generate({ type: "nodebuffer" });
        return docxBuf;
    } catch (error: any) {
        console.error("Error occurred while generating document:", error.message);
    }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: Request) {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const vat_id = params.get("vat_id");
    const email = params.get("email");
    const StudentName = params.get("StudentName");

    if (!vat_id || !email || !StudentName) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.CLOUDCONVERT_API_KEY;
    const gcsProjectId = process.env.GCS_PROJECT_ID;
    const gcsBucket = process.env.GCS_BUCKET_NAME;
    const gcsClientEmail = process.env.GCS_CLIENT_EMAIL;
    const gcsPrivateKey = process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!apiKey || !gcsProjectId || !gcsBucket || !gcsClientEmail || !gcsPrivateKey) {
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    try {
        const generatedBuffer = await generate(StudentName, vat_id);

        if (process.env.NEXT_ENV === "development") {
            return NextResponse.json({ message: 'File generated successfully in development mode' });
        }

        if (!generatedBuffer) {
            throw new Error("Failed to generate document buffer.");
        }

        const jobPayload = {
            tasks: {
                'import-file': { operation: 'import/upload' },
                'convert-to-pdf': { operation: 'convert', input: 'import-file', output_format: 'pdf', engine: 'office' },
                'encrypt-pdf': {
                    operation: 'pdf/encrypt', input: 'convert-to-pdf', set_password: vat_id || 'password123',
                    set_owner_password: 'super-secret-owner-password', allow_print: 'full', allow_modify: 'none', allow_extract: false, allow_accessibility: true,
                },
                'export-to-gcs': {
                    operation: 'export/google-cloud-storage', input: 'encrypt-pdf', project_id: gcsProjectId, bucket: gcsBucket,
                    client_email: gcsClientEmail, private_key: gcsPrivateKey,
                },
            },
            tag: 'pdf-encryption-gcs-job',
        } as const;

        const jobResponse = await axios.post('https://api.cloudconvert.com/v2/jobs', jobPayload, {
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        });
        const job = jobResponse.data.data;
        const uploadTask = job.tasks.find((task: any) => task.name === 'import-file');
        const uploadUrl = uploadTask.result.form.url;
        const formParams = uploadTask.result.form.parameters;

        const uploadFormData = new FormData();
        for (const key in formParams) {
            uploadFormData.append(key, formParams[key]);
        }

        const fileBlob = new Blob([generatedBuffer as BlobPart], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        const fileName = createFileName(vat_id || "unknown");
        uploadFormData.append('file', fileBlob, `${fileName}.docx`);

        await axios.post(uploadUrl, uploadFormData, { headers: { 'Content-Type': 'multipart/form-data' } });

        let currentJobStatus;
        const maxAttempts = 40;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await wait(1500);
            const statusResponse = await axios.get(`https://api.cloudconvert.com/v2/jobs/${job.id}`, { headers: { Authorization: `Bearer ${apiKey}` } });
            currentJobStatus = statusResponse.data.data;
            if (currentJobStatus.status === 'finished') break;
            if (currentJobStatus.status === 'error') {
                throw new Error(`Job failed with status: error.`);
            }
        }

        if (currentJobStatus.status !== 'finished') {
            throw new Error(`Job failed or timed out. Final status: ${currentJobStatus.status}`);
        }

        const exportTask = currentJobStatus.tasks.find((task: any) => task.name === 'export-to-gcs');
        const uploadedFile = exportTask?.result?.files[0];
        if (!uploadedFile) {
            throw new Error('Could not retrieve uploaded file details from the GCS export task.');
        }

        return NextResponse.json({
            message: 'File successfully converted, encrypted, and uploaded to Google Cloud Storage.',
            bucket: gcsBucket,
            filename: uploadedFile.filename,
            size: uploadedFile.size,
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'An error occurred during the file conversion process.' }, { status: 500 });
    }
}


