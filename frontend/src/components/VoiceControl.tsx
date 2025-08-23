import React, { useEffect, useRef, useState } from 'react';
import { API_ENDPOINTS } from '../utils/api';

const VoiceControl: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscription(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Microphone not supported in this browser');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = handleRecordingStop;

      recorder.start();
      setIsRecording(true);
    } catch (e: any) {
      setError(e.message || 'Failed to start recording');
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);

      // Stop mic
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    } catch (e: any) {
      setError(e.message || 'Failed to stop recording');
    }
  };

  const handleRecordingStop = async () => {
    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      chunksRef.current = [];

      // Send to backend
      setIsTranscribing(true);
      const form = new FormData();
      form.append('file', blob, 'voice.webm');

      const res = await fetch(API_ENDPOINTS.voice, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        throw new Error('Transcription failed');
      }

      const json = await res.json();
      setTranscription(json.transcription?.text || '');
    } catch (e: any) {
      setError(e.message || 'Error during transcription');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Stop Recording
          </button>
        )}

        {isTranscribing && (
          <span className="text-sm text-gray-500">Transcribing...</span>
        )}
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {transcription && (
        <div className="bg-gray-50 rounded-md p-3 text-sm">
          <div className="font-medium mb-1">Transcription</div>
          <div className="whitespace-pre-wrap">{transcription}</div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Note: Uses your browser microphone. Audio is sent to the backend for STT.
      </div>
    </div>
  );
};

export default VoiceControl; 