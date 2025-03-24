import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertComplaintSchema, trackingSchema, type Language } from "@shared/schema";
import { analyzeIncidentType, extractComplaintInfo, sendFIREmail, getSafetyPrecautions } from "./ai";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import nodemailer from 'nodemailer';

// For development, use ethereal.email
let transporter: nodemailer.Transporter;

async function createTestAccount() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    
    // Create a SMTP transporter
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      }
    });
    console.log("Created test email account:", testAccount.user);
  } catch (error) {
    console.error("Failed to create test email account:", error);
    // Fallback to a dummy transporter that logs emails
    transporter = {
      sendMail: (options: any) => {
        console.log("Email would be sent:", options);
        return Promise.resolve({ messageId: "dummy-id" });
      }
    } as any;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize email transporter
  await createTestAccount();

  // API routes
  app.post('/api/complaints', async (req, res) => {
    try {
      // Validate the request body
      const complaintData = insertComplaintSchema.parse(req.body);
      
      // Analyze incident type if not provided
      if (!complaintData.incidentType || complaintData.incidentType === 'unknown') {
        complaintData.incidentType = await analyzeIncidentType(complaintData.incidentDescription);
      }
      
      // Create the complaint
      const complaint = await storage.createComplaint(complaintData);
      
      // Send FIR email with safety precautions
      try {
        await sendFIREmail(complaint);
      } catch (emailError) {
        console.error('Failed to send FIR email:', emailError);
        // Continue processing even if email fails
      }
      
      // Get safety precautions for frontend display in the user's chosen language
      let safetyPrecautions: string[] = [];
      try {
        // Use the user's selected language for safety precautions
        const language = complaint.language as Language || 'english';
        safetyPrecautions = await getSafetyPrecautions(complaint.incidentType, language);
      } catch (precautionsError) {
        console.error('Failed to get safety precautions:', precautionsError);
      }
      
      // Return the created complaint with tracking code and safety precautions
      res.status(201).json({
        success: true,
        complaint,
        safetyPrecautions
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      } else {
        console.error('Error creating complaint:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to create complaint' 
        });
      }
    }
  });

  app.get('/api/complaints/track/:trackingCode', async (req, res) => {
    try {
      const { trackingCode } = req.params;
      
      // Validate tracking code
      trackingSchema.parse({ trackingCode });
      
      // Get the complaint
      const complaint = await storage.getComplaintByTrackingCode(trackingCode);
      
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }
      
      res.json({
        success: true,
        complaint
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          success: false, 
          message: validationError.message 
        });
      } else {
        console.error('Error tracking complaint:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to track complaint'
        });
      }
    }
  });

  app.post('/api/analyze-text', async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Text is required'
        });
      }
      
      // Extract information from the text
      const extractedInfo = await extractComplaintInfo(text);
      
      res.json({
        success: true,
        extractedInfo
      });
    } catch (error) {
      console.error('Error analyzing text:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze text'
      });
    }
  });

  // Google Cloud Text-to-Speech endpoint
  app.post('/api/text-to-speech', async (req, res) => {
    try {
      const { text, language = 'en-US' } = req.body;
      
      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'Text is required'
        });
      }
      
      // In a real app, we would call Google Cloud Text-to-Speech API here
      // For now, we'll just return a mock response with the text to be synthesized
      res.json({
        success: true,
        audioContent: Buffer.from('Audio content would be here').toString('base64'),
        text
      });
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to convert text to speech'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function sendConfirmationEmail(complaint: any) {
  // Create email content
  const mailOptions = {
    from: '"CyberShield" <noreply@cybershield.com>',
    to: complaint.email,
    subject: 'Cybersecurity Complaint Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="background-color: #0A62D0; padding: 15px; border-radius: 5px 5px 0 0;">
          <h2 style="color: white; margin: 0;">Cybersecurity Complaint Confirmation</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear ${complaint.fullName},</p>
          <p>Thank you for submitting your cybersecurity complaint. We've received your report and will begin processing it shortly.</p>
          <p><strong>Your tracking code:</strong> ${complaint.trackingCode}</p>
          <p>Please keep this code for future reference as you'll need it to track the status of your complaint.</p>
          <h3>Complaint Summary:</h3>
          <ul>
            <li><strong>Incident Type:</strong> ${formatIncidentType(complaint.incidentType)}</li>
            <li><strong>Date Reported:</strong> ${new Date().toLocaleString()}</li>
            <li><strong>Status:</strong> Received</li>
          </ul>
          <p>You can track the status of your complaint by visiting our website and entering your tracking code.</p>
          <p>If you have any questions or need to provide additional information, please contact us at support@cybershield.com.</p>
          <p>Thank you for using CyberShield to report cybersecurity incidents.</p>
          <p>Sincerely,<br>The CyberShield Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 0 0 5px 5px; font-size: 12px; color: #666;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.messageId);
  
  // For development, log the URL where the email can be viewed (if available)
  if (typeof nodemailer.getTestMessageUrl === 'function') {
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
}

function formatIncidentType(type: string): string {
  const formattedType = type.replace(/_/g, ' ');
  return formattedType.charAt(0).toUpperCase() + formattedType.slice(1);
}
