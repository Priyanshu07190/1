import { apiRequest } from "./queryClient";

interface ExtractedInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  incidentType?: string;
  incidentDate?: string;
  incidentDescription?: string;
  financialLoss?: string;
  partiesInvolved?: string;
  additionalNotes?: string;
}

/**
 * Extracts structured information from user text input using the OpenAI API
 */
export async function extractInfoFromText(text: string): Promise<ExtractedInfo> {
  try {
    const response = await apiRequest("POST", "/api/analyze-text", { text });
    const data = await response.json();
    
    if (data.success && data.extractedInfo) {
      return data.extractedInfo;
    }
    
    return {};
  } catch (error) {
    console.error("Error extracting information:", error);
    return {};
  }
}

/**
 * Detects command intents from user input
 */
export function detectCommandIntent(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("edit") || lowerText.includes("change") || lowerText.includes("modify")) {
    return "edit";
  }
  
  if (lowerText.includes("submit") || lowerText.includes("send") || lowerText.includes("complete")) {
    return "submit";
  }
  
  if (lowerText.includes("cancel") || lowerText.includes("stop") || lowerText.includes("quit")) {
    return "cancel";
  }
  
  if (lowerText.includes("help") || lowerText.includes("assist") || lowerText.includes("support")) {
    return "help";
  }
  
  return null;
}

/**
 * Identifies which form section the user wants to edit
 */
export function detectEditSection(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("name") || lowerText.includes("full name")) {
    return "fullName";
  }
  
  if (lowerText.includes("email") || lowerText.includes("e-mail") || lowerText.includes("mail")) {
    return "email";
  }
  
  if (lowerText.includes("phone") || lowerText.includes("telephone") || lowerText.includes("mobile")) {
    return "phone";
  }
  
  if (lowerText.includes("address") || lowerText.includes("location")) {
    return "address";
  }
  
  if (lowerText.includes("incident") || lowerText.includes("description") || lowerText.includes("what happened")) {
    return "incidentDescription";
  }
  
  if (lowerText.includes("date") || lowerText.includes("when")) {
    return "incidentDate";
  }
  
  if (lowerText.includes("type") || lowerText.includes("category")) {
    return "incidentType";
  }
  
  if (lowerText.includes("financial") || lowerText.includes("money") || lowerText.includes("loss")) {
    return "financialLoss";
  }
  
  if (lowerText.includes("parties") || lowerText.includes("involved") || lowerText.includes("who")) {
    return "partiesInvolved";
  }
  
  if (lowerText.includes("notes") || lowerText.includes("additional")) {
    return "additionalNotes";
  }
  
  if (lowerText.includes("personal") || lowerText.includes("information")) {
    return "personal";
  }
  
  return null;
}
