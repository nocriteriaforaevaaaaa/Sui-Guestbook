import { useState, useEffect } from 'react';
import { WalletKitProvider, ConnectButton, useWalletKit } from '@mysten/wallet-kit';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

const PACKAGE_ID = '0xd35d2b3725ec198e590c596d8b17c86fac48c2fa96df05478730d5727296d9e6';
const MODULE = 'guestbook';
const FUNC = 'post_message';
const GUESTBOOK_ID = '0x4dfda3225ab9a849316157e1300de6b258317ee1df1cd0e73e53a680ae8384fe';

function PostMessage({ onPost }) {
  const [message, setMessage] = useState('');
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();

  const handlePost = async () => {
    if (!currentAccount) return alert('⚠️ Connect wallet first!');
    if (!message.trim()) return alert('⚠️ Message is empty');

    try {
      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE}::${FUNC}`,
        arguments: [
          tx.object(GUESTBOOK_ID),
          tx.pure(Array.from(new TextEncoder().encode(message))),
        ],
      });

      const result = await signAndExecuteTransactionBlock({ transactionBlock: tx });
      console.log(' Success:', result);
      alert('✅ Message posted!');
      setMessage('');
      onPost(); 
    } catch (err) {
      console.error('❌ Failed to post:', err);
      alert('❌ Failed to post message');
    }
  };

  return (
    <div style={{
      background: '#ffffffcc',
      padding: '1.5rem',
      borderRadius: '1rem',
      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
      maxWidth: '750px',
      width: '100%'
    }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}> Message Box</h2>
      <textarea
        placeholder="Please leave a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{
          width: '90%',
          height: '100px',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #ccc',
          marginBottom: '1rem',
          fontSize: '1rem'
        }}
      />
      <button
        onClick={handlePost}
        style={{
          background: 'linear-gradient(to right,rgb(60, 184, 229),rgb(214, 152, 70))',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
         Post Message
      </button>
    </div>
  );
}

function GuestbookViewer({ refreshFlag }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const result = await client.getObject({
          id: GUESTBOOK_ID,
          options: { showContent: true },
        });

        const guestbook = result.data?.content?.fields;
        const rawMessages = guestbook?.messages || [];

        const decoded = rawMessages.map((msg) => ({
          sender: msg.fields.sender,
          text: String.fromCharCode(...msg.fields.content),
        }));

        setMessages(decoded.reverse());
      } catch (err) {
        console.error('❌ Failed to fetch messages:', err);
      }
    }

    fetchMessages();
  }, [refreshFlag]);

  return (
    <div style={{ maxWidth: '600px', width: '100%' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '	ff0' }}> Messages</h2>
      {messages.length === 0 ? (
        <p style={{ color: '#fff' }}>No messages yet.</p>
      ) : (
        messages.map((m, i) => (
          <div key={i} style={{
            background: '#ffffffdd',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontWeight: 'bold', color: '#333' }}>
              {m.sender.slice(0, 6)}...{m.sender.slice(-4)}
            </div>
            <div style={{ color: '#444', marginTop: '0.5rem' }}>
              {m.text}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function App() {
  const [refreshFlag, setRefreshFlag] = useState(0);
  const refreshMessages = () => setRefreshFlag((f) => f + 1);

  return (
    <WalletKitProvider>
      <div style={{
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(to right, #4facfe, #00f2fe)',
        fontFamily: 'Inter, Arial, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        boxSizing: 'border-box',
      }}>
        <div style={{
          background:'#ffffffcc',
          padding: '2rem',
          borderRadius: '1.5rem',
          maxWidth: '800px',
          width: '100%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          overflowY: 'auto',
          maxHeight: '90vh',
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#333',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            Welcome To Sui Guestbook
          </h1>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <ConnectButton />
          </div>

          <PostMessage onPost={refreshMessages} />
          <hr style={{
            border: 'black',
            borderTop: '1px solid #ddd',
            margin: '2rem 0'
          }} />
          <GuestbookViewer refreshFlag={refreshFlag} />
        </div>
      </div>
    </WalletKitProvider>
  );
}


export default App;
