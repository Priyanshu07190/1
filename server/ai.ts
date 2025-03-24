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
- financialLoss: Amount of financial loss (if mentioned)
- partiesInvolved: Other parties involved (if mentioned)

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

/**
 * Generates safety precautions based on the cybersecurity incident type
 */
export async function getSafetyPrecautions(incidentType: ComplaintType): Promise<string[]> {
  try {
    const prompt = `Provide 5 specific and actionable safety precautions for users who have experienced a ${incidentType.replace('_', ' ')} cybersecurity incident. 
    Make each precaution concise (1-2 sentences) and specific to this type of incident.
    Format the response as a JSON array of strings with just the precautions.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 500,
      },
    });

    const response = result.response;
    const responseText = response.text();
    
    // Extract JSON array from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : "[]";
    
    return JSON.parse(jsonString);
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

    // Get safety precautions for this incident type
    const precautions = await getSafetyPrecautions(complaint.incidentType);
    
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
