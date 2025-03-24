import { users, type User, type InsertUser, complaints, type Complaint, type InsertComplaint } from "@shared/schema";
import { nanoid } from 'nanoid';

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Complaint methods
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  getComplaintByTrackingCode(trackingCode: string): Promise<Complaint | undefined>;
  updateComplaintStatus(trackingCode: string, status: Complaint['status']): Promise<Complaint | undefined>;
  getAllComplaints(): Promise<Complaint[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private complaints: Map<string, Complaint>;
  currentUserId: number;
  currentComplaintId: number;

  constructor() {
    this.users = new Map();
    this.complaints = new Map();
    this.currentUserId = 1;
    this.currentComplaintId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    const id = this.currentComplaintId++;
    const trackingCode = insertComplaint.trackingCode || `CS-${nanoid(8)}`;
    
    // Create a properly-typed complaint object with all required fields
    const complaint = {
      id,
      trackingCode,
      fullName: insertComplaint.fullName,
      email: insertComplaint.email,
      phone: insertComplaint.phone || null,
      address: insertComplaint.address || null,
      incidentType: insertComplaint.incidentType,
      incidentDate: insertComplaint.incidentDate || null,
      incidentDescription: insertComplaint.incidentDescription,
      financialLoss: insertComplaint.financialLoss || null,
      partiesInvolved: insertComplaint.partiesInvolved || null,
      additionalNotes: insertComplaint.additionalNotes || null,
      contactConsent: insertComplaint.contactConsent || false,
      status: 'received' as const,
      createdAt: new Date(),
      lastUpdated: new Date(),
      language: insertComplaint.language || 'english'
    } as Complaint; // Use type assertion to ensure it matches the Complaint type
    
    this.complaints.set(trackingCode, complaint);
    return complaint;
  }

  async getComplaintByTrackingCode(trackingCode: string): Promise<Complaint | undefined> {
    return this.complaints.get(trackingCode);
  }

  async updateComplaintStatus(trackingCode: string, status: Complaint['status']): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(trackingCode);
    
    if (!complaint) {
      return undefined;
    }
    
    // Clone the complaint and only update the status and lastUpdated
    const updatedComplaint = {
      ...complaint,
      status,
      lastUpdated: new Date()
    };
    
    this.complaints.set(trackingCode, updatedComplaint);
    return updatedComplaint;
  }

  async getAllComplaints(): Promise<Complaint[]> {
    return Array.from(this.complaints.values());
  }
}

export const storage = new MemStorage();
