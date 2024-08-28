import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import os from 'os';
import path from 'path';
import uuidv4 from 'uuid';

const { GEMINI_API_KEY } = process.env;

if (!GEMINI_API_KEY) {
    throw new Error("Chave de API faltando. Por favor, atribuia um valor à variável de ambiente GEMINI_API_KEY.");
}

const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);

export default async function uploadFile(base64String: string, displayName: string) {
    try {
        const buffer = Buffer.from(base64String, 'base64');

        const tempFilePath = path.join(os.tmpdir(), `${uuidv4}.tmp`);

        fs.writeFileSync(tempFilePath, buffer);

        const uploadResponse = await fileManager.uploadFile(
            tempFilePath,
            {
                mimeType: "image/jpeg",
                displayName: displayName,
            }
        );

        return uploadResponse;
    } catch (error: any) {
        throw new Error("Erro ao fazer upload de arquivo");
    }
}
