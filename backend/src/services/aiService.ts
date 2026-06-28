import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateDiagnosisSuggestions = async (symptoms: string, gender: string, age: number) => {
    try {
        const prompt = `
      Act as a clinical assistant. 
      Patient Profile: ${age} year old ${gender}.
      Symptoms: ${symptoms}.
      
      Provide 3 potential diagnoses based on these symptoms.
      Format the output as a JSON array of objects with keys: "diagnosis" (string), "confidence" (string like "High", "Medium"), and "reasoning" (short explanation).
      Do not include any other text, just the JSON.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown formatting in response
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Error generating diagnosis suggestions:", error);
        throw new Error("Failed to generate suggestions");
    }
};

export const summarizeClinicalNotes = async (notes: string[]) => {
    try {
        const prompt = `
      Summarize the following clinical notes into a concise patient history summary:
      ${notes.join("\n")}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error summarizing notes:", error);
        throw new Error("Failed to summarize notes");
    }
}

export const analyzeLabReport = async (fileBuffer: Buffer, mimeType: string) => {
    try {
        const prompt = `
            Analyze this lab report image. Extract the test results into a structured JSON format.
            Return a JSON array where each object has:
            - "test_name" (string)
            - "result_value" (string)
            - "unit" (string, if present)
            - "reference_range" (string, if present)
            - "status" (string: "Normal", "High", "Low", "Abnormal") using your medical knowledge and the reference range.

            Do not include any other text, just the raw JSON.
        `;

        const imagePart = {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanText);

    } catch (error) {
        console.error("Error analyzing lab report:", error);
        throw new Error("Failed to analyze lab report");
    }
};
