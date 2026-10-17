'use client';

import React, { useState } from 'react';

interface DraftwellFintechProps {
  userId: string;
  authorId?: string;
}

export const DraftwellFintech: React.FC<DraftwellFintechProps> = ({ userId, authorId }) => {
  const [paymentMethod, setPaymentMethod] = useState<'SOLANA' | 'MPESA' | 'FONBNK'>('MPESA');
  const [usdValue, setUsdValue] = useState<number>(5.0);
  const [txInput, setTxInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');

  const estimatedStars = Math.floor(usdValue / 0.1);
  const mpesaKshEquivalent = Math.floor(usdValue * 130);

  const processBillingForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Transmitting payment data parameters to Draftwell server array...');

    try {
      const response = await fetch('/api/billing/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          paymentMethod,
          txReference: txInput || (paymentMethod === 'MPESA' ? 'PENDING_MPESA' : ''),
          usdAmount: usdValue,
          authorId: authorId || null
        })
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setStatus(`Success! Credited ⭐ ${data.creditedStars} Stars to your account balance.`);
        setTxInput('');
      } else {
        setStatus(`Verification Blocked: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setLoading(false);
      setStatus(`Network error: ${err.message}`);
    }
  };

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '40px auto',
        padding: '24px',
        fontFamily: 'system-ui, sans-serif',
        color: '#111',
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: '#111827',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '10px'
        }}
      >
        🪙 Draftwell Premium Star Terminal
      </h2>

      {status && (
        <div
          style={{
            background: status.startsWith('Success') ? '#f0fdf4' : '#fef2f2',
            borderLeft: `4px solid ${status.startsWith('Success') ? '#166534' : '#991b1b'}`,
            padding: '12px',
            margin: '14px 0',
            fontWeight: 'bold'
          }}
        >
          {status}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', marginTop: '20px' }}>
        <section>
          <form onSubmit={processBillingForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ fontWeight: 'bold' }}>Select Your Funding Route:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('MPESA')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: paymentMethod === 'MPESA' ? '#10b981' : '#f3f4f6',
                  color: paymentMethod === 'MPESA' ? '#fff' : '#000',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🇰🇪 M-Pesa
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('SOLANA')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: paymentMethod === 'SOLANA' ? '#7000FF' : '#f3f4f6',
                  color: paymentMethod === 'SOLANA' ? '#fff' : '#000',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ⚛️ Phantom (SOL)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('FONBNK')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: paymentMethod === 'FONBNK' ? '#0066cc' : '#f3f4f6',
                  color: paymentMethod === 'FONBNK' ? '#fff' : '#000',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                💳 Card / Fonbnk
              </button>
            </div>

            <label style={{ fontWeight: 'bold' }}>Purchase Value (USD):</label>
            <input
              type="number"
              min="1"
              step="0.5"
              value={usdValue}
              onChange={(e) => setUsdValue(parseFloat(e.target.value) || 1)}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />

            <div
              style={{
                padding: '12px',
                background: '#fffbeb',
                borderRadius: '6px',
                fontSize: '15px',
                color: '#b45309',
                fontWeight: 'bold'
              }}
            >
              Yields Estimation: ⭐ {estimatedStars} Draftwell Stars
              {paymentMethod === 'MPESA' && ` (~ KSh ${mpesaKshEquivalent})`}
            </div>

            {paymentMethod === 'MPESA' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                  Send funds to manual M-Pesa tracking destination: <strong>+254793760799</strong>
                </p>
                <input
                  type="text"
                  placeholder="Enter M-Pesa Receipt Code (e.g., QGH8XYZ76)"
                  value={txInput}
                  onChange={(e) => setTxInput(e.target.value.toUpperCase())}
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
            )}

            {paymentMethod === 'SOLANA' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                  Broadcast equivalent SOL value to master storage account:{' '}
                  <strong>EDZjEbRAtqyC8z6ta6PYHX161Xynt13tWpd7orKERkbz</strong>
                </p>
                <input
                  type="text"
                  placeholder="Paste Solana Transaction Signature"
                  value={txInput}
                  onChange={(e) => setTxInput(e.target.value)}
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
            )}

            {paymentMethod === 'FONBNK' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                  Use the interactive Fonbnk widget on the right to buy crypto with a card, then paste the reference.
                </p>
                <input
                  type="text"
                  placeholder="Enter successful Fonbnk reference code"
                  value={txInput}
                  onChange={(e) => setTxInput(e.target.value)}
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#111827',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Verifying Transaction parameters...' : 'CONFIRM & SUBMIT TOP-UP RECORD'}
            </button>
          </form>
        </section>

        <section
          style={{
            background: '#f9fafb',
            padding: '20px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            fontSize: '14px',
            lineHeight: '1.6'
          }}
        >
          <h3 style={{ marginTop: 0, color: '#1e3a8a' }}>💡 New to Crypto? Open Account Guide</h3>
          <p>
            Draftwell uses decentralized Solana liquidity so creators receive their 60% revenue share with minimal
            friction. 1 Star = $0.10 USD.
          </p>

          <h4 style={{ marginBottom: '4px', color: '#1e3a8a' }}>Option A: Direct Card Conversion via Fonbnk</h4>
          <p style={{ margin: '0 0 12px 0' }}>
            Choose <strong>Card / Fonbnk</strong>. Fonbnk purchases equivalent SOL and deposits it to the platform
            treasury address behind the scenes.
          </p>

          <h4 style={{ marginBottom: '4px', color: '#1e3a8a' }}>Option B: Setting Up Your Own Phantom Web Wallet</h4>
          <ol style={{ paddingLeft: '20px', margin: 0 }}>
            <li>Download the official Phantom Wallet from the app store or browser extension.</li>
            <li>Back up and safely store your 12-word seed phrase. Never share it.</li>
            <li>Copy your public Solana address.</li>
            <li>Use a fiat-to-crypto ramp to load SOL into your wallet, then send the equivalent value to the treasury.</li>
          </ol>
        </section>
      </div>
    </div>
  );
};
