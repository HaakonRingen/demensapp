import { Voice, Call } from '@twilio/voice-react-native-sdk';

const BACKEND_URL = 'https://8eb3-129-241-236-69.ngrok-free.app';

export const voice = new Voice();

export async function fetchToken(identity: string): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity }),
  });
  const data = await res.json();
  return data.token;
}

export async function registerVoice(identity: string) {
  const token = await fetchToken(identity);
  await voice.register(token);
}

export async function makeCall(to: string, from: string): Promise<Call> {
  const token = await fetchToken(from);
  const call = await voice.connect(token, {
    params: { To: `client:${to}`, From: from },
  });
  return call;
}
