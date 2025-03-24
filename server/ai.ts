import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { ComplaintType, Language } from "@shared/schema";
import nodemailer from "nodemailer";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI("AIzaSyDdTA7Ad2g06dyybP5RrsOKsOiGh5bl8ZA");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Email configuration for sending complaint copies
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "ethereal.user@ethereal.email", // We'll get these from environment variables or from the user
    pass: "ethereal.password",
  },
});

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
 * This enhanced version automatically detects the type from the description without asking the user
 */
export async function analyzeIncidentType(description: string): Promise<ComplaintType> {
  try {
    const prompt = `You are a cybersecurity incident classifier specializing in Indian cybersecurity incidents. 
Based on the incident description, classify it into one of these categories: 'phishing_attack', 'ransomware', 'data_breach', 'identity_theft', or 'unknown'.
Even if the description is in an Indian language, try to identify keywords that might indicate the type of attack.
Respond with only the category name, nothing else.

Description: ${description}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.2, // Lower temperature for more deterministic responses
        maxOutputTokens: 50,
      },
    });

    const response = result.response;
    const text = response.text().trim().toLowerCase();
    
    // Check if the response contains any of our categories (even if it's not an exact match)
    if (text.includes('phishing')) return 'phishing_attack';
    if (text.includes('ransom')) return 'ransomware';
    if (text.includes('data') && text.includes('breach')) return 'data_breach';
    if (text.includes('identity') && text.includes('theft')) return 'identity_theft';
    
    // If we have a direct match
    if (text === 'phishing_attack' || 
        text === 'ransomware' || 
        text === 'data_breach' || 
        text === 'identity_theft') {
      return text as ComplaintType;
    }
    
    // If no valid category is detected
    return 'unknown';
  } catch (error) {
    console.error('Error analyzing incident type:', error);
    return 'unknown';
  }
}

/**
 * Extracts complaint information from user text input in any language
 * This enhanced version also determines the complaint type from the description
 */
export async function extractComplaintInfo(text: string): Promise<any> {
  try {
    const prompt = `You are an information extraction assistant specializing in cybersecurity complaints in India. 
The user's text may be in any of the 22 official Indian languages. Regardless of the language, extract the following information if present:

- fullName: The person's full name
- email: The email address (if present)
- phone: The phone number (if present)
- address: The physical address (if present)
- incidentDate: When the incident happened (if present)
- incidentDescription: Detailed description of what happened
- financialLoss: Amount of financial loss (if mentioned)
- partiesInvolved: Other parties involved (if mentioned)

Additionally, analyze the incident description to determine the cybersecurity complaint type. Classify it into one of these categories:
- phishing_attack: Attempts to deceive users to reveal sensitive information
- ransomware: Malware that encrypts files and demands ransom
- data_breach: Unauthorized access to sensitive data
- identity_theft: Theft of personal information for fraudulent purposes
- unknown: If the incident doesn't clearly fit into the above categories

Return all extracted information as a JSON object. If a field is not found in the text, exclude it from the response.

User text: ${text}

Response format:
{
  "fullName": "User's name if provided",
  "email": "user@example.com",
  "incidentDescription": "Description of what happened...",
  "incidentType": "one of: phishing_attack, ransomware, data_breach, identity_theft, or unknown"
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800,
      },
    });

    const response = result.response;
    const responseText = response.text();
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : "{}";
    
    try {
      const extractedInfo = JSON.parse(jsonString);
      
      // If incidentDescription is present but incidentType is not,
      // attempt to determine the incident type
      if (extractedInfo.incidentDescription && !extractedInfo.incidentType) {
        extractedInfo.incidentType = await analyzeIncidentType(extractedInfo.incidentDescription);
      }
      
      return extractedInfo;
    } catch (jsonError) {
      console.error('Error parsing JSON from response:', jsonError);
      return {};
    }
  } catch (error) {
    console.error('Error extracting information:', error);
    return {};
  }
}

/**
 * Generates safety precautions based on the cybersecurity incident type in the user's selected language
 */
export async function getSafetyPrecautions(incidentType: ComplaintType, language: Language = 'english'): Promise<string[]> {
  try {
    const prompt = `Provide 5 specific and actionable safety precautions for users who have experienced a ${incidentType.replace('_', ' ')} cybersecurity incident.
    The precautions should be in ${language} language.
    If the language is not English, also provide an English translation for record-keeping purposes.
    Make each precaution concise (1-2 sentences) and specific to this type of incident.
    Format the response as a JSON array of strings with just the precautions in the requested language.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 800,
      },
    });

    const response = result.response;
    const responseText = response.text();
    
    // Extract JSON array from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : "[]";
    
    // Try to parse the JSON
    try {
      return JSON.parse(jsonString);
    } catch (jsonError) {
      console.error('Error parsing JSON for safety precautions:', jsonError);
      
      // Fallback precautions
      if (language === 'english') {
        return [
          "Change passwords for all your accounts immediately.",
          "Enable two-factor authentication where available.",
          "Monitor your financial statements regularly for unusual activity.",
          "Be cautious of suspicious emails, messages, or calls.",
          "Report the incident to relevant authorities if necessary."
        ];
      } else {
        // Get translated fallback precautions
        const fallbackPrompt = `Translate the following 5 cybersecurity safety precautions into ${language} language:
        1. Change passwords for all your accounts immediately.
        2. Enable two-factor authentication where available.
        3. Monitor your financial statements regularly for unusual activity.
        4. Be cautious of suspicious emails, messages, or calls.
        5. Report the incident to relevant authorities if necessary.
        
        Respond with ONLY a JSON array of the 5 translated strings.`;
        
        try {
          const fallbackResult = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: fallbackPrompt }] }],
            safetySettings,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
            },
          });
          
          const fallbackResponse = fallbackResult.response;
          const fallbackText = fallbackResponse.text();
          
          // Extract JSON array
          const fallbackJsonMatch = fallbackText.match(/\[[\s\S]*\]/);
          const fallbackJsonString = fallbackJsonMatch ? fallbackJsonMatch[0] : "[]";
          
          const fallbackPrecautions = JSON.parse(fallbackJsonString);
          if (Array.isArray(fallbackPrecautions) && fallbackPrecautions.length > 0) {
            return fallbackPrecautions;
          }
        } catch (fallbackError) {
          console.error('Error generating fallback translated precautions:', fallbackError);
        }
        
        // If all else fails, return English precautions
        return [
          "Change passwords for all your accounts immediately.",
          "Enable two-factor authentication where available.",
          "Monitor your financial statements regularly for unusual activity.",
          "Be cautious of suspicious emails, messages, or calls.",
          "Report the incident to relevant authorities if necessary."
        ];
      }
    }
  } catch (error) {
    console.error('Error generating safety precautions:', error);
    return [
      "Change passwords for all your accounts immediately.",
      "Enable two-factor authentication where available.",
      "Monitor your financial statements regularly for unusual activity.",
      "Be cautious of suspicious emails, messages, or calls.",
      "Report the incident to relevant authorities if necessary."
    ];
  }
}

/**
 * Sends an email with the FIR copy to the complainant
 */
export async function sendFIREmail(complaint: any): Promise<boolean> {
  try {
    // Format the FIR content
    const formatDate = (date: string) => {
      return new Date(date).toLocaleString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const firContent = `
    CYBERSECURITY INCIDENT REPORT
    ----------------------------
    Tracking Code: ${complaint.trackingCode}
    Date Filed: ${formatDate(complaint.createdAt)}
    
    COMPLAINANT DETAILS:
    Full Name: ${complaint.fullName}
    Email: ${complaint.email}
    Phone: ${complaint.phone || 'Not provided'}
    Address: ${complaint.address || 'Not provided'}
    
    INCIDENT DETAILS:
    Type: ${formatIncidentType(complaint.incidentType)}
    Date of Incident: ${complaint.incidentDate || 'Not specified'}
    Description: ${complaint.incidentDescription}
    
    Financial Loss: ${complaint.financialLoss || 'Not specified'}
    Parties Involved: ${complaint.partiesInvolved || 'Not specified'}
    Additional Notes: ${complaint.additionalNotes || 'None'}
    
    CURRENT STATUS: ${formatStatus(complaint.status)}
    
    This is an official copy of your cybersecurity incident report. 
    Please keep this for your records and reference your tracking code 
    for any follow-up inquiries.
    `;

    // Get safety precautions for this incident type in the user's language
    const language = complaint.language as Language || 'english';
    const precautions = await getSafetyPrecautions(complaint.incidentType, language);
    
    // HTML email template with precautions
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <div style="text-align: center; background-color: #1a56db; color: white; padding: 15px; border-radius: 5px 5px 0 0;">
        <h1 style="margin: 0;">Cybersecurity Incident Report</h1>
        <p>Tracking Code: ${complaint.trackingCode}</p>
      </div>
      
      <div style="padding: 20px;">
        <h2>Complaint Confirmation</h2>
        <p>Dear ${complaint.fullName},</p>
        <p>Your cybersecurity incident report has been successfully filed. Below is a copy of your report for your records.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #1a56db; margin: 20px 0;">
          <pre style="font-family: monospace; white-space: pre-wrap;">${firContent}</pre>
        </div>
        
        <h3>Safety Precautions</h3>
        <p>Based on the nature of your incident, we recommend the following precautions:</p>
        <ul>
          ${precautions.map(precaution => `<li>${precaution}</li>`).join('')}
        </ul>
        
        <p>Please keep this email for your records. You can check the status of your complaint using your tracking code on our website.</p>
        
        <p>Regards,<br>CyberShield Team</p>
      </div>
    </div>
    `;

    // Send the email
    const info = await transporter.sendMail({
      from: '"CyberShield" <cybershield@example.com>',
      to: complaint.email,
      subject: `Your Cybersecurity Incident Report [${complaint.trackingCode}]`,
      text: `${firContent}\n\nSAFETY PRECAUTIONS:\n${precautions.map((p, i) => `${i + 1}. ${p}`).join('\n')}`,
      html: htmlContent,
    });

    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending FIR email:', error);
    return false;
  }
}

// Helper functions for formatting
function formatIncidentType(type: string): string {
  const formatted = type.replace(/_/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatStatus(status: string): string {
  const formatted = status.replace(/_/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
