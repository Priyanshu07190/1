import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Shield, ArrowLeft, Globe, HelpCircle, Mic, Volume2, VolumeX, Send, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatBot from "./ChatBot";
import ComplaintForm from "./ComplaintForm";
import SuccessModal from "./SuccessModal";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { apiRequest } from "@/lib/queryClient";
import { Language } from "@shared/schema";

const INITIAL_COMPLAINT_DATA = {
  trackingCode: "",
  fullName: "",
  email: "",
  phone: "",
  address: "",
  incidentType: "unknown", // Will be determined automatically from the description
  incidentDate: "",
  incidentDescription: "",
  financialLoss: "",
  partiesInvolved: "",
  additionalNotes: "",
  contactConsent: false,
  language: "english" as Language
};

// Messages in different languages
const welcomeMessages: Record<Language, string> = {
  english: "Hello! I'm your CyberShield assistant. I'll help you file a cybersecurity complaint. Can you please tell me your full name?",
  hindi: "नमस्ते! मैं आपका साइबर शील्ड सहायक हूँ। मैं आपको साइबर सुरक्षा शिकायत दर्ज करने में मदद करूँगा। कृपया अपना पूरा नाम बताएं?",
  bengali: "হ্যালো! আমি আপনার সাইবার শিল্ড সহায়ক। আমি আপনাকে সাইবার নিরাপত্তা অভিযোগ দাখিল করতে সাহায্য করব। অনুগ্রহ করে আপনার পুরো নাম বলুন?",
  marathi: "नमस्कार! मी तुमचा सायबर शील्ड सहाय्यक आहे. मी तुम्हाला सायबर सुरक्षा तक्रार दाखल करण्यात मदत करेन. कृपया तुमचे पूर्ण नाव सांगा?",
  telugu: "హలో! నేను మీ సైబర్ షీల్డ్ సహాయకుడిని. నేను మీకు సైబర్ సెక్యూరిటీ ఫిర్యాదు దాఖలు చేయడంలో సహాయం చేస్తాను. దయచేసి మీ పూర్తి పేరు చెప్పండి?",
  tamil: "வணக்கம்! நான் உங்கள் சைபர் ஷீல்ட் உதவியாளர். இணையப் பாதுகாப்பு புகாரைத் தாக்கல் செய்ய நான் உங்களுக்கு உதவுவேன். உங்கள் முழுப் பெயரைச் சொல்லுங்கள்?",
  gujarati: "હેલો! હું તમારો સાયબર શિલ્ડ સહાયક છું. હું તમને સાયબર સુરક્ષા ફરિયાદ દાખલ કરવામાં મદદ કરીશ. કૃપા કરીને તમારું પૂરું નામ જણાવો?",
  urdu: "ہیلو! میں آپ کا سائبر شیلڈ اسسٹنٹ ہوں۔ میں آپ کو سائبر سیکیورٹی شکایت درج کرنے میں مدد کروں گا۔ براہ کرم اپنا پورا نام بتائیں؟",
  kannada: "ಹಲೋ! ನಾನು ನಿಮ್ಮ ಸೈಬರ್ ಶೀಲ್ಡ್ ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಸೈಬರ್ ಸೆಕ್ಯುರಿಟಿ ದೂರನ್ನು ಸಲ್ಲಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ಹೇಳಿ?",
  odia: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର ସାଇବର ସିଲ୍ଡ ସହାୟକ। ମୁଁ ଆପଣଙ୍କୁ ସାଇବର ସୁରକ୍ଷା ଅଭିଯୋଗ ଦାଖଲ କରିବାରେ ସାହାଯ୍ୟ କରିବି। ଦୟାକରି ଆପଣଙ୍କ ପୂର୍ଣ୍ଣ ନାମ କୁହନ୍ତୁ?",
  punjabi: "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਸਾਈਬਰ ਸ਼ੀਲਡ ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਤੁਹਾਨੂੰ ਸਾਈਬਰ ਸੁਰੱਖਿਆ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਦੱਸੋ?",
  malayalam: "ഹലോ! ഞാൻ നിങ്ങളുടെ സൈബർ ഷീൽഡ് അസിസ്റ്റന്റ് ആണ്. ഞാൻ നിങ്ങളെ സൈബർ സെക്യൂരിറ്റി പരാതി ഫയൽ ചെയ്യാൻ സഹായിക്കും. ദയവായി നിങ്ങളുടെ മുഴുവൻ പേര് പറയുക?",
  assamese: "নমস্কাৰ! মই আপোনাৰ চাইবাৰ শ্বীল্ড সহায়ক। মই আপোনাক চাইবাৰ সুৰক্ষা অভিযোগ দাখিল কৰাত সহায় কৰিম। অনুগ্ৰহ কৰি আপোনাৰ সম্পূৰ্ণ নাম কওক?",
  maithili: "हेलौ! हम अहाँक साइबर शील्ड सहायक छी। हम अहाँकेँ साइबर सुरक्षा शिकायत दर्ज करबामे मदद करब। कृपया अपन पूरा नाम बताउ?",
  sanskrit: "नमस्ते! अहं भवतः साइबरशील्ड सहायकः अस्मि। अहं भवन्तं साइबर सुरक्षा अभियोगं दाखिल कर्तुं सहायं करिष्यामि। कृपया भवतः पूर्णं नाम वदतु?",
  kashmiri: "سلام! میں تُہاں دا سائبر شیلڈ مدد گار آں۔ میں تہانوں سائبر سکیورٹی شکایت داخل کرن وچ مدد کراں گا۔ مہربانی کر کے اپنا پورا ناں دسو؟",
  nepali: "नमस्कार! म तपाईंको साइबर शिल्ड सहायक हुँ। म तपाईंलाई साइबर सुरक्षा उजुरी दायर गर्न मद्दत गर्नेछु। कृपया तपाईंको पूरा नाम बताउनुहोस्?",
  konkani: "नमस्कार! हांव तुमचो सायबर शील्ड सहाय्यक आसा. हांव तुमकां सायबर सुरक्षा तक्रार दाखल करपाक मदत करतलो. कृपया तुमचें संपूर्ण नांव सांगचें?",
  sindhi: "سلام! مان توهان جو سائبر شيلڊ مددگار آهيان. مان توهان کي سائبر سيڪيورٽي شڪايت داخل ڪرڻ ۾ مدد ڪندس. مهرباني ڪري پنهنجو پورو نالو ٻڌايو؟",
  bodo: "हालो! आं नोंनि cybershield मददगिरि। आं नोंखौ साइबार रैखा हानजायनाय दाखिल खालामनो हेफाजाब होगोन। अन्नानै नोंनि आखाय मुं बुङो?",
  dogri: "हैलो! मैं तुसेंदा साइबर शील्ड सहायक आं। मैं तुसेंगी साइबर सुरक्षा शिकायत दायर करने च मदद करांगा। किरपा करी अपना पूरा नां दस्सो?",
  manipuri: "হেল্লো! ঐ নঙগী সাইবর শীল্দ মতেং পাঙবনি। ঐনা নঙবু সাইবর সেকুরিটি ৱাকৎ ফাইল তৌবদা মতেং পাঙগনি। নঙগী মপূং ফাবা মিং হায়বিয়ু?",
  santhali: "जोहार! इञ आमाक् साइबर शील्ड गोड़ो कानाञ। इञ आमके साइबर सुरक्षा दुख दाखिल लागित् गोड़ो इञाम। दया कात्ते आमाक् पुरा ञुतुम मेन मे?"
};

// Dialog messages in different languages
// Note: In a production environment, we would include all 22 languages
const dialogMessages: Partial<Record<Language, Record<string, string>>> = {
  english: {
    askEmail: "Thank you. Could you please provide your email address so we can send you confirmation and updates about your complaint?",
    askPhone: "Got your email. Now, could you please provide your phone number?",
    askIncident: "Thank you. Could you please describe what happened in the cybersecurity incident?",
    askDate: "I understand. When did this incident occur? Please provide a date if possible.",
    askFinancialLoss: "Thank you for all the information. Did you experience any financial loss? If so, please indicate the amount.",
    formComplete: "Thank you for all this information. I've filled out your complaint form. Would you like to review and submit it now, or would you like to edit any section?",
    editName: "Please provide your new full name.",
    editEmail: "Please provide your new email address.",
    editPhone: "Please provide your new phone number.",
    editIncident: "Please provide a new description of the incident.",
    editWhich: "Which section would you like to edit? You can say 'personal information', 'incident details', or 'additional information'.",
    submitting: "Submitting your complaint. Please wait...",
    additional: "Thank you for that information. Is there anything specific you'd like to add or edit?"
  },
  hindi: {
    askEmail: "धन्यवाद। क्या आप कृपया अपना ईमेल पता प्रदान कर सकते हैं ताकि हम आपकी शिकायत के बारे में पुष्टि और अपडेट भेज सकें?",
    askPhone: "आपका ईमेल मिल गया। अब, क्या आप कृपया अपना फोन नंबर प्रदान कर सकते हैं?",
    askIncident: "धन्यवाद। कृपया बताएं कि साइबर सुरक्षा घटना में क्या हुआ था?",
    askDate: "मैं समझता हूं। यह घटना कब हुई? यदि संभव हो तो कृपया एक तिथि प्रदान करें।",
    askFinancialLoss: "सभी जानकारी के लिए धन्यवाद। क्या आपको कोई वित्तीय नुकसान हुआ? यदि हां, तो कृपया राशि बताएं।",
    formComplete: "इस सभी जानकारी के लिए धन्यवाद। मैंने आपका शिकायत फॉर्म भर दिया है। क्या आप इसे अभी समीक्षा करके जमा करना चाहेंगे, या आप किसी भी अनुभाग को संपादित करना चाहेंगे?",
    editName: "कृपया अपना नया पूरा नाम प्रदान करें।",
    editEmail: "कृपया अपना नया ईमेल पता प्रदान करें।",
    editPhone: "कृपया अपना नया फोन नंबर प्रदान करें।",
    editIncident: "कृपया घटना का एक नया विवरण प्रदान करें।",
    editWhich: "आप किस अनुभाग को संपादित करना चाहेंगे? आप कह सकते हैं 'व्यक्तिगत जानकारी', 'घटना विवरण', या 'अतिरिक्त जानकारी'।",
    submitting: "आपकी शिकायत जमा की जा रही है। कृपया प्रतीक्षा करें...",
    additional: "उस जानकारी के लिए धन्यवाद। क्या कोई विशिष्ट चीज है जिसे आप जोड़ना या संपादित करना चाहेंगे?"
  },
  // I'll include a few more languages as examples, but in a real implementation, all 22 languages would be included
  bengali: {
    askEmail: "ধন্যবাদ। আপনার ইমেল ঠিকানা দিন যাতে আমরা আপনার অভিযোগ সম্পর্কে নিশ্চিতকরণ এবং আপডেট পাঠাতে পারি?",
    askPhone: "আপনার ইমেল পেয়েছি। এখন, আপনার ফোন নম্বর দিন?",
    askIncident: "ধন্যবাদ। অনুগ্রহ করে বলুন সাইবার নিরাপত্তা ঘটনায় কী ঘটেছিল?",
    askDate: "আমি বুঝতে পারছি। এই ঘটনা কখন ঘটেছিল? সম্ভব হলে একটি তারিখ প্রদান করুন।",
    askFinancialLoss: "সমস্ত তথ্যের জন্য ধন্যবাদ। আপনি কি কোনো আর্থিক ক্ষতির সম্মুখীন হয়েছেন? যদি হ্যাঁ, তাহলে পরিমাণ উল্লেখ করুন।",
    formComplete: "এই সমস্ত তথ্যের জন্য ধন্যবাদ। আমি আপনার অভিযোগ ফর্ম পূরণ করেছি। আপনি কি এখন এটি পর্যালোচনা করে জমা দিতে চান, নাকি কোন বিভাগ সম্পাদনা করতে চান?",
    editName: "আপনার নতুন পূর্ণ নাম প্রদান করুন।",
    editEmail: "আপনার নতুন ইমেল ঠিকানা প্রদান করুন।",
    editPhone: "আপনার নতুন ফোন নম্বর প্রদান করুন।",
    editIncident: "ঘটনার একটি নতুন বিবরণ প্রদান করুন।",
    editWhich: "আপনি কোন বিভাগ সম্পাদনা করতে চান? আপনি বলতে পারেন 'ব্যক্তিগত তথ্য', 'ঘটনার বিবরণ', বা 'অতিরিক্ত তথ্য'।",
    submitting: "আপনার অভিযোগ জমা দেওয়া হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন...",
    additional: "সেই তথ্যের জন্য ধন্যবাদ। আপনি কি কিছু নির্দিষ্ট যোগ করতে বা সম্পাদনা করতে চান?"
  },
  // For brevity in this example, we're not including all 22 languages, but in production all would be included
  // Use the dialogMessages for each language to provide appropriate responses
  tamil: {
    askEmail: "நன்றி. உங்கள் புகாரைப் பற்றிய உறுதிப்படுத்தல் மற்றும் புதுப்பிப்புகளை நாங்கள் அனுப்ப உங்கள் மின்னஞ்சல் முகவரியை வழங்கவும்?",
    askPhone: "உங்கள் மின்னஞ்சலைப் பெற்றோம். இப்போது, உங்கள் தொலைபேசி எண்ணை வழங்கவும்?",
    askIncident: "நன்றி. சைபர் பாதுகாப்பு சம்பவத்தில் என்ன நடந்தது என்பதை விவரிக்கவும்?",
    askDate: "நான் புரிந்துகொள்கிறேன். இந்த சம்பவம் எப்போது நடந்தது? முடிந்தால் ஒரு தேதியை வழங்கவும்.",
    askFinancialLoss: "எல்லா தகவலுக்கும் நன்றி. நீங்கள் ஏதேனும் நிதி இழப்பை சந்தித்தீர்களா? அப்படியானால், தொகையைக் குறிப்பிடவும்.",
    formComplete: "இந்த அனைத்து தகவலுக்கும் நன்றி. நான் உங்கள் புகார் படிவத்தை நிரப்பியுள்ளேன். நீங்கள் இப்போது அதை மதிப்பாய்வு செய்து சமர்ப்பிக்க விரும்புகிறீர்களா, அல்லது ஏதேனும் பிரிவைத் திருத்த விரும்புகிறீர்களா?",
    editName: "உங்கள் புதிய முழுப் பெயரை வழங்கவும்.",
    editEmail: "உங்கள் புதிய மின்னஞ்சல் முகவரியை வழங்கவும்.",
    editPhone: "உங்கள் புதிய தொலைபேசி எண்ணை வழங்கவும்.",
    editIncident: "சம்பவத்தின் புதிய விளக்கத்தை வழங்கவும்.",
    editWhich: "எந்தப் பிரிவைத் திருத்த விரும்புகிறீர்கள்? நீங்கள் 'தனிப்பட்ட தகவல்', 'சம்பவ விவரங்கள்' அல்லது 'கூடுதல் தகவல்' என்று சொல்லலாம்.",
    submitting: "உங்கள் புகார் சமர்ப்பிக்கப்படுகிறது. தயவுசெய்து காத்திருக்கவும்...",
    additional: "அந்தத் தகவலுக்கு நன்றி. நீங்கள் சேர்க்க அல்லது திருத்த விரும்பும் ஏதேனும் குறிப்பிட்ட விஷயம் உள்ளதா?"
  }
};

interface ComplaintFilingProps {
  selectedLanguage: string;
  onChangeLanguage: () => void;
}

export default function ComplaintFiling({ selectedLanguage, onChangeLanguage }: ComplaintFilingProps) {
  const [_, navigate] = useLocation();
  const [showInputMethodSelection, setShowInputMethodSelection] = useState(true);
  const [showComplaintInterface, setShowComplaintInterface] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [inputMethod, setInputMethod] = useState<"text" | "voice">("text");
  const [complaintData, setComplaintData] = useState({
    ...INITIAL_COMPLAINT_DATA,
    language: selectedLanguage.toLowerCase() as Language
  });
  const [messages, setMessages] = useState<{ content: string; sender: "user" | "bot" }[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [formComplete, setFormComplete] = useState(false);
  const [isSpeakerActive, setIsSpeakerActive] = useState(true);
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");

  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening,
    hasRecognitionSupport,
    currentLanguage,
    setLanguage
  } = useSpeechRecognition();

  const { 
    speak, 
    cancel, 
    speaking, 
    supported: hasSpeechSynthesisSupport,
    setLanguage: setSpeechLanguage 
  } = useSpeechSynthesis();

  // Set current language when selectedLanguage changes
  useEffect(() => {
    const languageCode = selectedLanguage.toLowerCase() as Language;
    setLanguage(languageCode);
    setSpeechLanguage(languageCode);
    
    // Update complaint data with the new language
    setComplaintData(prev => ({
      ...prev,
      language: languageCode
    }));
  }, [selectedLanguage, setLanguage, setSpeechLanguage]);

  // Initialize chat with a welcome message in the selected language
  useEffect(() => {
    const selectedLang = selectedLanguage.toLowerCase() as Language;
    const welcomeMsg = welcomeMessages[selectedLang] || welcomeMessages.english;
    
    const welcomeMessage = {
      content: welcomeMsg,
      sender: "bot" as const
    };
    
    setMessages([welcomeMessage]);
    
    if (isSpeakerActive && hasSpeechSynthesisSupport) {
      speak(welcomeMsg, selectedLang as Language);
    }
  }, [selectedLanguage]);

  // Listen for transcript changes when voice input is active and update in real-time
  useEffect(() => {
    if (inputMethod === "voice") {
      // Always update the current input with the transcript while listening
      if (transcript) {
        setCurrentInput(transcript);
      }
    }
  }, [transcript, inputMethod]);

  // Handle voice input when the transcript is updated
  // Using a ref to track the previous state to avoid unnecessary calls
  const prevIsListeningRef = React.useRef(isListening);
  const lastTranscriptRef = React.useRef(transcript);
  
  useEffect(() => {
    // Only trigger when transitioning from listening to not listening (speech ended)
    // and if we have a transcript to process
    if (prevIsListeningRef.current && !isListening && transcript && 
        transcript === lastTranscriptRef.current && inputMethod === "voice") {
      // Submit the message when speaking ends
      handleSendMessage();
    }
    
    // Update the refs with the current state for the next render
    prevIsListeningRef.current = isListening;
    if (transcript) {
      lastTranscriptRef.current = transcript;
    }
  }, [isListening, transcript, inputMethod]);

  const selectInputMethod = (method: "text" | "voice") => {
    setInputMethod(method);
    setShowInputMethodSelection(false);
    setShowComplaintInterface(true);
    
    if (method === "voice" && hasRecognitionSupport) {
      startListening();
    }
  };

  const toggleInputMethod = () => {
    const newMethod = inputMethod === "text" ? "voice" : "text";
    setInputMethod(newMethod);
    
    if (newMethod === "voice" && hasRecognitionSupport) {
      startListening();
    } else {
      stopListening();
    }
  };

  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerActive(!isSpeakerActive);
    if (speaking) {
      cancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;
    
    // Store the current input value in a variable to prevent issues with state updates
    const inputText = currentInput;
    
    // Add user message to chat
    const userMessage = {
      content: inputText,
      sender: "user" as const
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input immediately to provide better user feedback
    setCurrentInput("");
    
    // Process the message - extract information
    try {
      // Get the language in lowercase for consistency
      const languageCode = selectedLanguage.toLowerCase() as Language;
      
      // Send both the text and the current language to the server
      // This allows the server to know which language to translate from
      const response = await apiRequest("POST", "/api/analyze-text", { 
        text: inputText,
        language: languageCode
      });
      
      const data = await response.json();
      
      if (data.success && data.extractedInfo) {
        // Update complaint data with extracted information (which will be in English)
        setComplaintData(prev => ({
          ...prev,
          ...data.extractedInfo
        }));
        
        console.log("Extracted information:", data.extractedInfo);
      }
    } catch (error) {
      console.error("Error analyzing text:", error);
    }
    
    // Determine bot response based on current state
    let botResponse = "";
    let formUpdated = false;
    
    // Get the appropriate language messages 
    const languageCode = selectedLanguage.toLowerCase() as Language;
    // Make sure we have messages for this language, fall back to English if not
    const dialogMessagesForLanguage = dialogMessages[languageCode];
    // Add null check for dialogMessages to fix TypeScript errors
    const messagesForLanguage = dialogMessagesForLanguage ? dialogMessagesForLanguage : (dialogMessages.english || {});
    const messages = messagesForLanguage;
    
    // Very simple state machine for the conversation flow
    if (!complaintData.fullName && inputText.length > 0) {
      const newData = { ...complaintData, fullName: inputText };
      setComplaintData(newData);
      botResponse = messages.askEmail;
      formUpdated = true;
    } else if (!complaintData.email && inputText.includes("@")) {
      const newData = { ...complaintData, email: inputText };
      setComplaintData(newData);
      botResponse = messages.askPhone;
      formUpdated = true;
    } else if (!complaintData.phone && /\d/.test(inputText)) {
      const newData = { ...complaintData, phone: inputText };
      setComplaintData(newData);
      botResponse = messages.askIncident;
      formUpdated = true;
    } else if (!complaintData.incidentDescription && inputText.length > 10) {
      const newData = { ...complaintData, incidentDescription: inputText };
      setComplaintData(newData);
      botResponse = messages.askDate;
      formUpdated = true;
    } else if (!complaintData.incidentDate) {
      // Try to parse a date or just use today's date
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const newData = { ...complaintData, incidentDate: today };
      setComplaintData(newData);
      botResponse = messages.askFinancialLoss;
      formUpdated = true;
    } else if (!complaintData.financialLoss) {
      const newData = { ...complaintData, financialLoss: inputText };
      setComplaintData(newData);
      
      // Enable buttons since we have the minimum required info
      setFormComplete(true);
      
      botResponse = messages.formComplete;
      formUpdated = true;
    } else if (inputText.toLowerCase().includes("edit")) {
      if (inputText.toLowerCase().includes("name")) {
        botResponse = messages.editName;
      } else if (inputText.toLowerCase().includes("email")) {
        botResponse = messages.editEmail;
      } else if (inputText.toLowerCase().includes("phone")) {
        botResponse = messages.editPhone;
      } else if (inputText.toLowerCase().includes("description") || inputText.toLowerCase().includes("incident")) {
        botResponse = messages.editIncident;
      } else {
        botResponse = messages.editWhich;
      }
    } else if (inputText.toLowerCase().includes("submit")) {
      handleSubmitForm();
      botResponse = messages.submitting;
    } else {
      botResponse = messages.additional;
    }
    
    // Add bot response with slight delay
    setTimeout(() => {
      const botMessage = {
        content: botResponse,
        sender: "bot" as const
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response if speaker is active, using the selected language
      if (isSpeakerActive && hasSpeechSynthesisSupport) {
        const selectedLang = selectedLanguage.toLowerCase() as Language;
        speak(botResponse, selectedLang);
      }
    }, 1000);
    
    // Clear input
    setCurrentInput("");
    
    // Start listening again if using voice input
    if (inputMethod === "voice" && hasRecognitionSupport) {
      setTimeout(() => {
        startListening();
      }, 3000); // Give time for the bot to speak before listening again
    }
  };

  const handleSubmitForm = async () => {
    setSubmitInProgress(true);
    
    try {
      const response = await apiRequest("POST", "/api/complaints", complaintData);
      const data = await response.json();
      
      if (data.success) {
        setTrackingCode(data.complaint.trackingCode);
        setShowSuccessModal(true);
      } else {
        console.error("Error submitting complaint:", data.message);
        // Add error message to chat
        setMessages(prev => [...prev, {
          content: "There was an error submitting your complaint. Please try again.",
          sender: "bot"
        }]);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      // Add error message to chat
      setMessages(prev => [...prev, {
        content: "There was an error submitting your complaint. Please try again.",
        sender: "bot"
      }]);
    } finally {
      setSubmitInProgress(false);
    }
  };

  const fileNewComplaint = () => {
    setShowSuccessModal(false);
    
    // Set complaint data with current language
    const languageCode = selectedLanguage.toLowerCase() as Language;
    setComplaintData({
      ...INITIAL_COMPLAINT_DATA,
      language: languageCode
    });
    
    // Get welcome message in selected language
    const welcomeMsg = welcomeMessages[languageCode] || welcomeMessages.english;
    
    setMessages([{
      content: welcomeMsg,
      sender: "bot"
    }]);
    
    setFormComplete(false);
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
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-secondary">File a Cybersecurity Complaint</h2>
          <p className="text-gray-600">Our AI assistant will guide you through the process</p>
        </div>
        
        {/* Input Method Selection */}
        {showInputMethodSelection && (
          <div className="max-w-lg mx-auto mb-8 p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-center">How would you like to provide information?</h3>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 py-6"
                onClick={() => selectInputMethod("voice")}
              >
                <Mic className="mr-2" />
                Voice Input
              </Button>
              
              <Button 
                variant="outline"
                className="flex-1 text-primary border-primary py-6"
                onClick={() => selectInputMethod("text")}
              >
                <Keyboard className="mr-2" />
                Text Input
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4 text-center">You can switch between input methods at any time</p>
          </div>
        )}
        
        {/* Chatbot and Form Interface */}
        {showComplaintInterface && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Chatbot */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              {/* Chat Header */}
              <div className="bg-primary text-white p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                    <Shield className="text-primary text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium">CyberShield Assistant</h3>
                    <div className="flex items-center text-xs text-primary-light">
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
                
                {/* Voice Controls */}
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`text-white hover:bg-primary-dark ${isListening ? 'bg-primary-dark' : ''}`}
                    onClick={toggleMicrophone}
                    disabled={!hasRecognitionSupport}
                  >
                    <Mic className={isListening ? 'text-accent animate-pulse' : ''} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-primary-dark"
                    onClick={toggleSpeaker}
                  >
                    {isSpeakerActive ? <Volume2 /> : <VolumeX />}
                  </Button>
                </div>
              </div>
              
              {/* Chat Messages Area */}
              <ChatBot
                messages={messages}
                isListening={isListening}
              />
              
              {/* Chat Input Area */}
              <div className="border-t p-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    value={currentInput}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                    {/* Voice Status */}
                    {isListening && (
                      <div className="mr-2">
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-3 bg-accent rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 h-5 bg-accent rounded animate-pulse" style={{ animationDelay: '100ms' }}></div>
                          <div className="w-1 h-7 bg-accent rounded animate-pulse" style={{ animationDelay: '200ms' }}></div>
                          <div className="w-1 h-4 bg-accent rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
                          <div className="w-1 h-2 bg-accent rounded animate-pulse" style={{ animationDelay: '400ms' }}></div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:text-primary/80"
                      onClick={handleSendMessage}
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <div>
                    <span>
                      {inputMethod === "text" ? (
                        <>
                          <Keyboard className="inline mr-1 h-3 w-3" />
                          Text input mode
                        </>
                      ) : (
                        <>
                          <Mic className="inline mr-1 h-3 w-3" />
                          Voice input mode
                        </>
                      )}
                    </span>
                  </div>
                  
                  <Button 
                    variant="link"
                    size="sm"
                    className="text-primary hover:text-primary/80 h-5 p-0 text-xs font-medium"
                    onClick={toggleInputMethod}
                  >
                    Switch to {inputMethod === "text" ? "voice" : "text"} input
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right Column: Form */}
            <ComplaintForm 
              complaintData={complaintData}
              setComplaintData={setComplaintData}
              isComplete={formComplete}
              onEdit={() => {
                setMessages(prev => [...prev, {
                  content: "Which section would you like to edit? You can say 'personal information', 'incident details', or 'additional information'.",
                  sender: "bot"
                }]);
                if (isSpeakerActive && hasSpeechSynthesisSupport) {
                  const selectedLang = selectedLanguage.toLowerCase() as Language;
                  speak("Which section would you like to edit? You can say 'personal information', 'incident details', or 'additional information'.", selectedLang);
                }
              }}
              onSubmit={handleSubmitForm}
              isSubmitting={submitInProgress}
            />
          </div>
        )}
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

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          trackingCode={trackingCode}
          email={complaintData.email}
          onFileNew={fileNewComplaint}
          onReturnHome={() => navigate("/")}
        />
      )}
    </div>
  );
}
