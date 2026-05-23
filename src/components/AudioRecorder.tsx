import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioRecorderProps {
  maxDuration?: number;
  onRecordingComplete: (blob: Blob, duration: number) => void;
}

type RecorderState = 'idle' | 'recording' | 'recorded';

function AudioRecorder({ maxDuration = 30, onRecordingComplete }: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blobRef = useRef<Blob | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState('recorded');
        onRecordingComplete(blob, elapsed);
      };

      mediaRecorder.start();
      setState('recording');
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= maxDuration) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Microphone permission denied. Please allow microphone access and try again.');
        } else {
          setError(`Error accessing microphone: ${err.message}`);
        }
      } else {
        setError('An unexpected error occurred while accessing the microphone.');
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const reRecord = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    blobRef.current = null;
    setElapsed(0);
    setState('idle');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Error Message */}
      {error && (
        <div className="w-full p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Idle State */}
      {state === 'idle' && (
        <button
          onClick={startRecording}
          className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
          aria-label="Start recording"
        >
          <div className="w-8 h-8 rounded-full bg-white" />
        </button>
      )}

      {/* Recording State */}
      {state === 'recording' && (
        <>
          <div className="w-20 h-20 rounded-full bg-red-500 animate-pulse flex items-center justify-center shadow-lg">
            <div className="w-8 h-8 rounded-sm bg-white" />
          </div>
          <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">
            {formatTime(elapsed)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Max: {formatTime(maxDuration)}
          </p>
          <button
            onClick={stopRecording}
            className="px-5 py-2 rounded-lg font-medium bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
          >
            Stop
          </button>
        </>
      )}

      {/* Recorded State */}
      {state === 'recorded' && audioUrl && (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Duration: {formatTime(elapsed)}
          </p>
          <audio controls src={audioUrl} className="w-full max-w-xs" />
          <button
            onClick={reRecord}
            className="px-5 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Re-record
          </button>
        </>
      )}
    </div>
  );
}

export default AudioRecorder;
