import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { WalletKitProvider, ConnectButton, useWalletKit } from '@mysten/wallet-kit';
import { useState } from 'react';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });
const PACKAGE_ID = '0xd35d2b3725ec198e590c596d8b17c86fac48c2fa96df05478730d5727296d9e6';
const MODULE = 'guestbook';
const FUNC = 'post_message';
const GUESTBOOK_ID = '0x3ccd67edaa07e29b731877d7165c9d8711452b2b3826149f090f745c565750cc';

function PostMessage() {
  const [msg, setMsg] = useState('');
  const { signAndExecuteTransactionBlock } = useWalletKit();

  const post = async () => {
    const tx = {
      kind: 'moveCall',
      data: {
        packageObjectId: PACKAGE_ID,
        module: MODULE,
        function: FUNC,
        arguments: [
          GUESTBOOK_ID,
          Array.from(new TextEncoder().encode(msg)),
        ],
        typeArguments: [],
        gasBudget: 10000000,
      },
    };

    try {
      await signAndExecuteTransactionBlock({ transactionBlock: tx });
      alert('✅ Message posted!');
    } catch (err) {
      console.error('Failed:', err);
      alert('❌ Failed to post');
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <textarea rows="4" cols="40" onChange={e => setMsg(e.target.value)} />
      <br />
      <button onClick={post}>Post to Guestbook</button>
    </div>
  );
}

export default function App() {
  return (
    <WalletKitProvider>
      <div style={{ padding: 30 }}>
        <h1>📖 Sui Guestbook</h1>
        <ConnectButton />
        <PostMessage />
      </div>
    </WalletKitProvider>
  );
}
