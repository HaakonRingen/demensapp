import { useEffect, useRef, useState } from 'react';
import { Voice, Call, CallInvite } from '@twilio/voice-react-native-sdk';
import { BACKEND_URL, PATIENT_IDENTITY } from '../config';

export type CallState =
  | { status: 'idle' }
  | { status: 'incoming'; callId: string; callerIdentity: string; invite?: CallInvite }
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
  const pushKitRegistered = useRef(false);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    async function setup() {
      try {
        const token = await fetchToken(PATIENT_IDENTITY);

        // Prøv PushKit-registrering (krever VoIP-sertifikat)
        try {
          await voice.register(token);
          pushKitRegistered.current = true;
          console.log('PushKit registrert – innkommende anrop via push aktivt');
        } catch (e) {
          console.warn('PushKit feilet – bruker polling som fallback');
          startPolling();
        }

        // Lytter på innkommende anrop via PushKit
        voice.on(Voice.Event.CallInvite, (invite: CallInvite) => {
          const callerIdentity = invite.from?.replace('client:', '') ?? 'Ukjent';
          setCallState({
            status: 'incoming',
            callId: invite.callSid ?? Date.now().toString(),
            callerIdentity,
            invite,
          });
        });

      } catch (e) {
        console.error('Twilio setup feilet:', e);
        startPolling();
      }
    }

    setup();

    return () => {
      voice.removeAllListeners(Voice.Event.CallInvite);
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (pushKitRegistered.current) voice.unregister().catch(() => {});
    };
  }, []);

  function startPolling() {
    if (pollingRef.current) return;
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
          });
        }
      } catch (_) {}
    }, 2000);
  }

  async function acceptCall(callId: string, callerIdentity: string, invite?: CallInvite) {
    try {
      setCallState({ status: 'connecting', remoteIdentity: callerIdentity });

      if (invite) {
        // PushKit-anrop: aksepter direkte
        const call = await invite.accept();
        activeCallRef.current = call;
        setCallState({ status: 'active', call, remoteIdentity: callerIdentity });
        call.on(Call.Event.Disconnected, () => {
          setCallState({ status: 'idle' });
          activeCallRef.current = null;
        });
      } else {
        // Polling-anrop: koble til via konferanse
        const token = await fetchToken(PATIENT_IDENTITY);
        const call = await voice.connect(token, {
          params: { To: 'conference', Identity: PATIENT_IDENTITY, CallId: callId },
        });
        activeCallRef.current = call;
        setCallState({ status: 'active', call, remoteIdentity: callerIdentity });
        call.on(Call.Event.Disconnected, () => {
          setCallState({ status: 'idle' });
          activeCallRef.current = null;
        });
      }
    } catch (e) {
      console.error('Svar feilet:', e);
      setCallState({ status: 'idle' });
    }
  }

  async function rejectCall() {
    if (callState.status === 'incoming' && callState.invite) {
      await callState.invite.reject();
    } else {
      await fetch(`${BACKEND_URL}/reject-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: PATIENT_IDENTITY }),
      });
    }
    setCallState({ status: 'idle' });
  }

  async function makeCall(to: string) {
    try {
      setCallState({ status: 'connecting', remoteIdentity: to });
      const token = await fetchToken(PATIENT_IDENTITY);
      // Telefonnummer sendes direkte, app-identiteter pakkes i client:
      const toParam = to.startsWith('+') || to.match(/^\d/) ? to : `client:${to}`;
      const call = await voice.connect(token, {
        params: { To: toParam },
      });
      activeCallRef.current = call;
      setCallState({ status: 'active', call, remoteIdentity: to });
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
    if (activeCallRef.current) await activeCallRef.current.disconnect();
    setCallState({ status: 'idle' });
  }

  return { callState, makeCall, acceptCall, rejectCall, hangUp };
}
