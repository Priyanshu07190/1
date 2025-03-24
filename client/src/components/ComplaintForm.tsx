import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, AlertTriangle, Info, FileEdit, Send, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ComplaintFormProps {
  complaintData: any;
  setComplaintData: (data: any) => void;
  isComplete: boolean;
  onEdit: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function ComplaintForm({ 
  complaintData, 
  setComplaintData, 
  isComplete, 
  onEdit, 
  onSubmit,
  isSubmitting 
}: ComplaintFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setComplaintData({ ...complaintData, [id]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setComplaintData({ ...complaintData, [id]: checked });
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Form Header */}
      <CardHeader className="bg-secondary text-white p-4">
        <CardTitle className="text-lg flex items-center">
          <FileEdit className="mr-2 h-5 w-5" />
          Complaint Form
        </CardTitle>
        <p className="text-xs text-gray-300 mt-1">This form will be auto-filled based on your conversation</p>
      </CardHeader>
      
      {/* Form Content */}
      <CardContent className="p-4 overflow-y-auto" style={{ height: "500px" }}>
        <form id="complaint-form">
          {/* Personal Information Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold uppercase text-gray-500 mb-3 flex items-center">
              <User className="mr-2 h-4 w-4" />
              Personal Information
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="mb-1">Full Name</Label>
                  <input 
                    type="text" 
                    id="fullName" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                    value={complaintData.fullName || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="mb-1">Email Address</Label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                    value={complaintData.email || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="mb-1">Phone Number</Label>
                  <input 
                    type="tel" 
                    id="phone" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                    value={complaintData.phone || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address" className="mb-1">Address</Label>
                  <input 
                    type="text" 
                    id="address" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                    value={complaintData.address || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Incident Details Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold uppercase text-gray-500 mb-3 flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Incident Details
            </h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="incidentType" className="mb-1">Type of Incident</Label>
                <select 
                  id="incidentType" 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                  value={complaintData.incidentType || 'unknown'}
                  onChange={handleInputChange}
                >
                  <option value="unknown">Not yet detected</option>
                  <option value="phishing_attack">Phishing Attack</option>
                  <option value="ransomware">Ransomware</option>
                  <option value="data_breach">Data Breach</option>
                  <option value="identity_theft">Identity Theft</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="incidentDate" className="mb-1">Date of Incident</Label>
                <input 
                  type="date" 
                  id="incidentDate" 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                  value={complaintData.incidentDate || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="incidentDescription" className="mb-1">Incident Description</Label>
                <textarea 
                  id="incidentDescription" 
                  rows={4} 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                  value={complaintData.incidentDescription || ''}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Additional Information Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold uppercase text-gray-500 mb-3 flex items-center">
              <Info className="mr-2 h-4 w-4" />
              Additional Information
            </h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="financialLoss" className="mb-1">Financial Loss (if any)</Label>
                <input 
                  type="text" 
                  id="financialLoss" 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                  value={complaintData.financialLoss || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="partiesInvolved" className="mb-1">Other Parties Involved</Label>
                <input 
                  type="text" 
                  id="partiesInvolved" 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                  value={complaintData.partiesInvolved || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="additionalNotes" className="mb-1">Additional Notes</Label>
                <textarea 
                  id="additionalNotes" 
                  rows={3} 
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                  value={complaintData.additionalNotes || ''}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="contactConsent" 
                  checked={complaintData.contactConsent || false}
                  onCheckedChange={(checked) => {
                    setComplaintData({
                      ...complaintData,
                      contactConsent: checked === true
                    });
                  }}
                />
                <Label htmlFor="contactConsent" className="text-sm text-gray-700">
                  I consent to be contacted regarding this complaint
                </Label>
              </div>
            </div>
          </div>
        </form>
        
        {/* Form Actions */}
        <div className="pt-4 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-3 sm:mb-0 text-sm text-gray-500">
              <Lock className="inline-block mr-1 h-4 w-4" />
              Your information is encrypted and secure
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                className="border-primary text-primary"
                onClick={onEdit}
                disabled={!isComplete || isSubmitting}
              >
                <FileEdit className="mr-1 h-4 w-4" />
                Edit
              </Button>
              
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={onSubmit}
                disabled={!isComplete || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="animate-spin mr-1">↻</span>
                ) : (
                  <Send className="mr-1 h-4 w-4" />
                )}
                Submit
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
