import { useEffect, useRef, useState } from 'react';
import { Voice, Call } from '@twilio/voice-react-native-sdk';
import { BACKEND_URL, PATIENT_IDENTITY } from '../config';

export type CallState =
  | { status: 'idle' }
  | { status: 'incoming'; callId: string; callerIdentity: string; conferenceName: string }
  | { status: 'active'; call: Call; remoteIdentity: string }
  | { status: 'connecting'; remoteIdentity: string };

const voice = new Voice();

async function fetchToken(identity: string): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity }),
  });
  const data = await res.json();
  return data.token;
}

export function useVoice() {
  const [callState, setCallState] = useState<CallState>({ status: 'idle' });
  const activeCallRef = useRef<Call | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callStateRef = useRef<CallState>({ status: 'idle' });

  // Hold callStateRef synkronisert
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    // Poll etter innkommende anrop hvert 2. sekund
    pollingRef.current = setInterval(async () => {
      if (callStateRef.current.status !== 'idle') return;
      try {
        const res = await fetch(`${BACKEND_URL}/pending-call/${PATIENT_IDENTITY}`);
        const data = await res.json();
        if (data.hasPendingCall && data.call) {
          setCallState({
            status: 'incoming',
            callId: data.call.callId,
            callerIdentity: data.call.callerIdentity,
            conferenceName: data.call.conferenceName,
          });
        }
      } catch (_) {}
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  async function acceptCall(callId: string, callerIdentity: string) {
    try {
      setCallState({ status: 'connecting', remoteIdentity: callerIdentity });
      const token = await fetchToken(PATIENT_IDENTITY);

      // Koble til konferansen via /answer-call
      const call = await voice.connect(token, {
        params: {
          To: 'conference',
          Identity: PATIENT_IDENTITY,
          CallId: callId,
        },
      });

      activeCallRef.current = call;
      setCallState({ status: 'active', call, remoteIdentity: callerIdentity });

      call.on(Call.Event.Disconnected, () => {
        setCallState({ status: 'idle' });
        activeCallRef.current = null;
      });
    } catch (e) {
      console.error('Svar feilet:', e);
      setCallState({ status: 'idle' });
    }
  }

  async function rejectCall() {
    await fetch(`${BACKEND_URL}/reject-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: PATIENT_IDENTITY }),
    });
    setCallState({ status: 'idle' });
  }

  async function makeCall(toIdentity: string) {
    try {
      setCallState({ status: 'connecting', remoteIdentity: toIdentity });
      const token = await fetchToken(PATIENT_IDENTITY);
      const call = await voice.connect(token, {
        params: { To: `client:${toIdentity}` },
      });
      activeCallRef.current = call;
      setCallState({ status: 'active', call, remoteIdentity: toIdentity });
      call.on(Call.Event.Disconnected, () => {
        setCallState({ status: 'idle' });
        activeCallRef.current = null;
      });
    } catch (e) {
      console.error('Ring feilet:', e);
      setCallState({ status: 'idle' });
    }
  }

  async function hangUp() {
    if (activeCallRef.current) {
      await activeCallRef.current.disconnect();
    }
    setCallState({ status: 'idle' });
  }

  return { callState, makeCall, acceptCall, rejectCall, hangUp };
}
