import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, MicOff, Play, Square, Copy, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Voice: React.FC = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [textToSpeak, setTextToSpeak] = useState('');
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      setSuccess('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Simulate transcription (in real app, send to backend)
        setTimeout(() => {
          setTranscription('Voice recording transcribed successfully. This is a simulated transcription for demonstration purposes.');
          setSuccess('Recording completed and transcribed!');
        }, 1000);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setSuccess('Recording started! Speak now...');
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Microphone access error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const speakText = () => {
    if (!textToSpeak.trim()) {
      setError('Please enter text to speak');
      return;
    }

    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      utterance.volume = speechVolume;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (event) => {
        setError('Speech synthesis error: ' + event.error);
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
      setSuccess('Speaking...');
    } else {
      setError('Speech synthesis not supported in this browser');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setSuccess('Speech stopped');
    }
  };

  const copyTranscription = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription);
      setSuccess('Transcription copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const askFollowUp = () => {
    if (transcription) {
      navigate('/ai-chat', { state: { initialQuery: `Based on this transcription: "${transcription}", please provide insights or answer questions about it.` } });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001F3F] via-[#001F3F] to-[#001F3F]">
      {/* Header */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/')}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="bg-[#0074D9]/20 border border-[#39CCCC]/30 p-3 rounded-xl">
              <Mic className="w-8 h-8 text-[#39CCCC]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Voice Controls</h1>
              <p className="text-[#ADB5BD] text-lg">Speech recognition & Text-to-Speech</p>
            </div>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-200">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Speech Recognition */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl shadow-black/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Mic className="w-6 h-6 text-[#39CCCC]" />
                Speech Recognition
              </h2>
              
              <div className="space-y-6">
                {/* Recording Controls */}
                <div className="flex items-center justify-center gap-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="p-6 bg-gradient-to-r from-[#0074D9] to-[#39CCCC] text-white rounded-full hover:shadow-2xl hover:shadow-[#0074D9]/30 transition-all duration-300 transform hover:scale-105"
                    >
                      <Mic className="w-8 h-8" />
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="p-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105"
                    >
                      <Square className="w-8 h-8" />
                    </button>
                  )}
                </div>

                {/* Recording Timer */}
                {isRecording && (
                  <div className="text-center">
                    <div className="text-3xl font-mono text-white mb-2">
                      {formatTime(recordingTime)}
                    </div>
                    <div className="text-[#ADB5BD]">Recording in progress...</div>
                  </div>
                )}

                {/* Transcription Display */}
                {transcription && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Transcription:</h3>
                    <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-xl p-4">
                      <p className="text-white leading-relaxed">{transcription}</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={copyTranscription}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0074D9]/20 border border-[#39CCCC]/30 rounded-lg hover:bg-[#0074D9]/30 transition-all duration-300 text-white"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      <button
                        onClick={askFollowUp}
                        className="flex items-center gap-2 px-4 py-2 bg-[#39CCCC]/20 border border-[#39CCCC]/30 rounded-lg hover:bg-[#39CCCC]/30 transition-all duration-300 text-white"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Ask Follow-up
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Text-to-Speech */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl shadow-black/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Play className="w-6 h-6 text-[#39CCCC]" />
                Text-to-Speech
              </h2>
              
              <div className="space-y-6">
                {/* Text Input */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Enter text to speak:
                  </label>
                  <textarea
                    value={textToSpeak}
                    onChange={(e) => setTextToSpeak(e.target.value)}
                    placeholder="Type or paste text here..."
                    className="w-full h-32 bg-white/5 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white placeholder-[#ADB5BD] focus:ring-2 focus:ring-[#39CCCC] focus:border-transparent resize-none"
                  />
                </div>

                {/* Speech Controls */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Speed</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-[#ADB5BD] text-sm">{speechRate}x</div>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Pitch</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={speechPitch}
                        onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-[#ADB5BD] text-sm">{speechPitch}x</div>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Volume</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={speechVolume}
                        onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-[#ADB5BD] text-sm">{Math.round(speechVolume * 100)}%</div>
                    </div>
                  </div>

                  {/* Play/Stop Buttons */}
                  <div className="flex gap-4">
                    {!isPlaying ? (
                      <button
                        onClick={speakText}
                        disabled={!textToSpeak.trim()}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0074D9] to-[#39CCCC] text-white rounded-xl hover:shadow-2xl hover:shadow-[#0074D9]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-5 h-5" />
                        Speak
                      </button>
                    ) : (
                      <button
                        onClick={stopSpeaking}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300"
                      >
                        <Square className="w-5 h-5" />
                        Stop
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Info */}
          <div className="mt-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl shadow-black/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Voice Control Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-[#0074D9]/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-[#39CCCC]/30 rounded-xl">
                  <Mic className="w-8 h-8 text-[#39CCCC]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">High-Quality Recording</h3>
                <p className="text-[#ADB5BD]">Crystal clear audio capture with real-time feedback</p>
              </div>
              <div className="text-center">
                <div className="bg-[#39CCCC]/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-[#39CCCC]/30 rounded-xl">
                  <Play className="w-8 h-8 text-[#39CCCC]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Customizable Speech</h3>
                <p className="text-[#ADB5BD]">Adjust speed, pitch, and volume for perfect delivery</p>
              </div>
              <div className="text-center">
                <div className="bg-[#E91E63]/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-[#39CCCC]/30 rounded-xl">
                  <MessageCircle className="w-8 h-8 text-[#39CCCC]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Integration</h3>
                <p className="text-[#ADB5BD]">Seamlessly connect voice commands to AI chat</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voice; 