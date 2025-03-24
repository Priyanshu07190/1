import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { ComplaintType } from "@shared/schema";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI("AIzaSyDdTA7Ad2g06dyybP5RrsOKsOiGh5bl8ZA");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Safety settings to ensure appropriate responses
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Analyzes the incident description to determine the cybersecurity complaint type
 */
export async function analyzeIncidentType(description: string): Promise<ComplaintType> {
  try {
    const prompt = `You are a cybersecurity incident classifier. Based on the incident description, classify it into one of these categories: 'phishing_attack', 'ransomware', 'data_breach', 'identity_theft', or 'unknown'. Respond with only the category name.

Description: ${description}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 50,
      },
    });

    const response = result.response;
    const text = response.text().trim().toLowerCase();
    
    if (text === 'phishing_attack' || 
        text === 'ransomware' || 
        text === 'data_breach' || 
        text === 'identity_theft') {
      return text as ComplaintType;
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Error analyzing incident type:', error);
    return 'unknown';
  }
}

/**
 * Extracts complaint information from user text input
 */
export async function extractComplaintInfo(text: string): Promise<any> {
  try {
    const prompt = `You are an information extraction assistant for cybersecurity complaints. Extract the following information from the user's text if present:
- fullName: The person's full name
- email: The email address
- phone: The phone number
- address: The physical address
- incidentDate: When the incident happened
- incidentDescription: Description of what happened
- financialLoss: Amount of financial loss
- partiesInvolved: Other parties involved

Return the extracted information as a JSON object with these fields. If a field is not found in the text, exclude it from the response.

User text: ${text}

Response format example:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "incidentDescription": "My account was hacked..."
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    });

    const response = result.response;
    const responseText = response.text();
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : "{}";
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error extracting information:', error);
    return {};
  }
}
