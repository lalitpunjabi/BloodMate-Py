import { useState, useEffect } from 'react';
import { Mic, MicOff, Settings, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [supported, setSupported] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    
    rec.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const tr = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += tr;
          processCommand(tr.toLowerCase().trim());
        } else {
          interimTranscript += tr;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
    };

    rec.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    rec.onend = () => {
      // Auto-restart if it was manually triggered
      if (isListening) {
        rec.start();
      }
    };

    setRecognition(rec);
  }, []);

  useEffect(() => {
    if (recognition) {
      if (isListening) {
        try { recognition.start(); } catch(e) {}
      } else {
        recognition.stop();
      }
    }
  }, [isListening, recognition]);

  const processCommand = (command) => {
    console.log("Voice Command Recognized:", command);
    
    if (command.includes('inventory') || command.includes('stock') || command.includes('emergency')) {
      navigate('/inventory');
    } else if (command.includes('donor') || command.includes('search')) {
      navigate('/donors');
    } else if (command.includes('dashboard') || command.includes('home') || command.includes('overview')) {
      navigate('/dashboard');
    } else if (command.includes('stop listening') || command.includes('turn off')) {
      setIsListening(false);
    }
  };

  const toggleListen = () => {
    if (!supported) {
      alert("Voice Recognition is not supported in your current browser.");
      return;
    }
    setIsListening(!isListening);
  };

  return (
    <>
      {/* Floating Microphone Button */}
      <button 
        onClick={toggleListen}
        title="Voice Assistant Navigation"
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${
          isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105'
        }`}
      >
        {isListening ? <Mic size={24} /> : <MicOff size={24} />}
      </button>

      {/* Live Transcript Display */}
      {isListening && (
        <div className="fixed bottom-24 right-6 z-50 w-64 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl p-4 animate-in fade-in slide-in-from-bottom-5">
           <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                 </span>
                 Listening...
              </span>
           </div>
           <p className="text-sm text-foreground min-h-[40px] italic">
             {transcript || (
                 <span className="text-muted-foreground">Try saying "Go to Inventory", "Show Donors"</span>
             )}
           </p>
        </div>
      )}
    </>
  );
}

export default VoiceAssistant;
