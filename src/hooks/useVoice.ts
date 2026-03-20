import { useEffect, useRef, useState } from 'react';
import { Voice, Call, CallInvite } from '@twilio/voice-react-native-sdk';
import { BACKEND_URL, PATIENT_IDENTITY } from '../config';

export type CallState =
  | { status: 'idle' }
  | { status: 'incoming'; invite: CallInvite; callerIdentity: string }
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

  useEffect(() => {
    let registered = false;

    async function setup() {
      try {
        const token = await fetchToken(PATIENT_IDENTITY);
        await voice.register(token);
        registered = true;
        console.log('Twilio registrert for:', PATIENT_IDENTITY);
      } catch (e) {
        console.error('Twilio registrering feilet:', e);
      }
    }

    setup();

    // Lytter på innkommende anrop
    voice.on(Voice.Event.CallInvite, (invite: CallInvite) => {
      const callerIdentity = invite.from?.replace('client:', '') ?? 'Ukjent';
      setCallState({ status: 'incoming', invite, callerIdentity });
    });

    return () => {
      voice.removeAllListeners(Voice.Event.CallInvite);
      if (registered) voice.unregister().catch(() => {});
    };
  }, []);

  async function acceptCall(invite: CallInvite) {
    const call = await invite.accept();
    activeCallRef.current = call;
    const remoteIdentity = invite.from?.replace('client:', '') ?? 'Ukjent';
    setCallState({ status: 'active', call, remoteIdentity });
    call.on(Call.Event.Disconnected, () => {
      setCallState({ status: 'idle' });
      activeCallRef.current = null;
    });
  }

  async function rejectCall(invite: CallInvite) {
    await invite.reject();
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
