const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeImage(imageBase64) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        Identify the food items in this image. 
        For each item, estimate the portion size in grams (make a reasonable guess based on standard serving sizes).
        Return a JSON array where each object has:
        - label: Food name
        - confidence: Confidence score (0-1)
        - weight: Estimated weight in grams
        - calories: Estimated calories for this portion
        - protein: Estimated protein in grams
        - carbs: Estimated carbs in grams
        - fat: Estimated fat in grams
        
        Return ONLY the JSON array. Do not include markdown formatting like \`\`\`json.
        `;

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown formatting if Gemini adds it despite instructions
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw new Error("Failed to analyze image");
    }
}

module.exports = { analyzeImage };
