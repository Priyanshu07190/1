import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface SuccessModalProps {
  trackingCode: string;
  email: string;
  onFileNew: () => void;
  onReturnHome: () => void;
}

export default function SuccessModal({ trackingCode, email, onFileNew, onReturnHome }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8" />
          </div>
          
          <h3 className="text-xl font-bold mb-2">Complaint Submitted Successfully!</h3>
          <p className="text-gray-600 mb-6">Your cybersecurity complaint has been received and is being processed.</p>
          
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50 mb-6">
            <p className="text-sm text-gray-500 mb-2">Your Tracking Code:</p>
            <p className="font-mono font-bold text-lg text-secondary">{trackingCode}</p>
            <p className="text-xs text-gray-500 mt-2">Please save this code to track your complaint status</p>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            A confirmation email has been sent to <span className="font-medium">{email}</span> with all the details.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline"
              className="border-primary text-primary"
              onClick={onFileNew}
            >
              File Another Complaint
            </Button>
            
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={onReturnHome}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
