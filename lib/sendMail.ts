import FormData from 'form-data';
import fetch from 'node-fetch';

export const sendEmail = (email: string, htmlContent: string, subject: string, textContent?: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const form = new FormData();
            form.append('from', 'mehunanim@mg.supergifted.co.il');
            form.append('to', email);
            form.append('subject', subject);
            form.append('text', textContent || "");
            form.append('html', htmlContent);

            const url = `https://api.eu.mailgun.net/v3/mg.supergifted.co.il/messages`;
            const credentials = Buffer.from(process.env.MAILGUM_TOKEN || "").toString('base64');

            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    "Authorization": `Basic ${credentials}`
                },

                body: form
            });

            if (resp.status <= 201) {
                const output = await resp.json();
                resolve(output);
            } else {
                reject(new Error(`Mailgun error: ${resp.statusText}`));
            }
        } catch (error) {
            reject(error);
        }
    });
};


