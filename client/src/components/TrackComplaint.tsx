import { useState } from "react";
import { useLocation } from "wouter";
import { Shield, ArrowLeft, Globe, HelpCircle, ClipboardCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TrackComplaintProps {
  selectedLanguage: string;
  onChangeLanguage: () => void;
}

interface TimelineItem {
  status: string;
  date: string;
  isActive: boolean;
  isPending: boolean;
}

export default function TrackComplaint({ selectedLanguage, onChangeLanguage }: TrackComplaintProps) {
  const [_, navigate] = useLocation();
  const [trackingCode, setTrackingCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [complaintData, setComplaintData] = useState<any>(null);
  const { toast } = useToast();

  // Dummy timeline data - would be generated based on real complaint status in a full implementation
  const getTimelineItems = (status: string): TimelineItem[] => {
    const statusOrder = ['received', 'under_review', 'under_investigation', 'resolved', 'closed'];
    const statusIndex = statusOrder.indexOf(status);
    
    return [
      {
        status: 'Complaint Received',
        date: new Date(complaintData?.createdAt || new Date()).toLocaleString(),
        isActive: statusIndex >= 0,
        isPending: false
      },
      {
        status: 'Initial Assessment',
        date: status === 'received' ? 'Pending' : new Date(new Date(complaintData?.createdAt || new Date()).getTime() + 24 * 60 * 60 * 1000).toLocaleString(),
        isActive: statusIndex >= 1,
        isPending: statusIndex < 1
      },
      {
        status: 'Under Investigation',
        date: statusIndex <= 1 ? 'Pending' : 'In Progress',
        isActive: statusIndex >= 2,
        isPending: statusIndex < 2
      },
      {
        status: 'Resolution',
        date: 'Pending',
        isActive: statusIndex >= 3,
        isPending: statusIndex < 3
      },
      {
        status: 'Case Closed',
        date: 'Pending',
        isActive: statusIndex >= 4,
        isPending: statusIndex < 4
      }
    ];
  };

  const handleTrackComplaint = async () => {
    if (!trackingCode.trim()) {
      toast({
        title: "Tracking code required",
        description: "Please enter a valid tracking code",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest("GET", `/api/complaints/track/${trackingCode.trim()}`);
      const data = await response.json();
      
      if (data.success) {
        setComplaintData(data.complaint);
      } else {
        toast({
          title: "Not found",
          description: data.message || "Could not find a complaint with that tracking code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error tracking complaint:", error);
      toast({
        title: "Error",
        description: "An error occurred while trying to track your complaint",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-3 hover:bg-primary-dark rounded-full text-white"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
              <Shield className="text-primary text-xl" />
            </div>
            <h1 className="text-2xl font-bold">CyberShield</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:text-white hover:bg-primary-dark"
              onClick={onChangeLanguage}
            >
              <Globe className="h-4 w-4 mr-1" />
              <span>{selectedLanguage}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:text-white hover:bg-primary-dark"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              <span>Help</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-secondary">Track Your Complaint</h2>
            <p className="text-gray-600">Enter your tracking code to check the status of your complaint</p>
          </div>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="mb-6">
                <label htmlFor="tracking-code" className="block text-sm font-medium text-gray-700 mb-2">Tracking Code</label>
                <div className="flex">
                  <input 
                    type="text" 
                    id="tracking-code" 
                    placeholder="e.g., CS-123456-789" 
                    className="flex-1 p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrackComplaint()}
                  />
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white px-4 rounded-r-md transition-colors"
                    onClick={handleTrackComplaint}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="animate-spin">↻</span>
                    ) : (
                      <span>Track</span>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">The tracking code was sent to your email when you filed the complaint</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Results */}
          {complaintData && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary text-white p-4">
                <CardTitle className="text-lg">Complaint Details</CardTitle>
                <p className="text-xs text-primary-light">Tracking Code: <span className="font-mono">{complaintData.trackingCode}</span></p>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Status */}
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-primary flex items-center justify-center mr-4">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Current Status</h4>
                    <p className="text-sm text-primary font-medium">
                      {formatStatus(complaintData.status)}
                    </p>
                  </div>
                </div>
                
                {/* Timeline */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold uppercase text-gray-500 mb-4">Progress Timeline</h4>
                  
                  <div className="space-y-4">
                    {getTimelineItems(complaintData.status).map((item, index, array) => (
                      <div className="flex" key={index}>
                        <div className="flex flex-col items-center mr-4">
                          <div className={`w-3 h-3 rounded-full ${item.isActive ? (index === array.findIndex(i => i.isActive && !i.isPending) ? 'bg-primary ring-4 ring-blue-100' : 'bg-success') : 'bg-gray-300'}`}></div>
                          {index < array.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200"></div>
                          )}
                        </div>
                        <div className="pb-4">
                          <p className={`text-sm font-medium ${item.isPending ? 'text-gray-500' : ''}`}>{item.status}</p>
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Complaint Summary */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-semibold uppercase text-gray-500 mb-3">Complaint Summary</h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-500">Filed By</p>
                        <p className="font-medium">{complaintData.fullName}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">Incident Type</p>
                        <p className="font-medium">{formatIncidentType(complaintData.incidentType)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Date Filed</p>
                      <p className="font-medium">
                        {new Date(complaintData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Case Handler</p>
                      <p className="font-medium">Cybersecurity Team #42</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Estimated Resolution</p>
                      <p className="font-medium">Within 15 working days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary-dark text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">&copy; 2023 CyberShield. All rights reserved.</p>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-300 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-300 hover:text-white">Terms of Service</a>
              <a href="#" className="text-sm text-gray-300 hover:text-white">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'received': 'Complaint Received',
    'under_review': 'Under Review',
    'under_investigation': 'Under Investigation',
    'resolved': 'Resolved',
    'closed': 'Case Closed'
  };
  
  return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatIncidentType(type: string): string {
  const typeMap: Record<string, string> = {
    'phishing_attack': 'Phishing Attack',
    'ransomware': 'Ransomware',
    'data_breach': 'Data Breach',
    'identity_theft': 'Identity Theft',
    'unknown': 'Under Assessment'
  };
  
  return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
