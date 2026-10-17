import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';

const TREASURY = 'EDZjEbRAtqyC8z6ta6PYHX161Xynt13tWpd7orKERkbz';
const VALUE_PER_STAR = 0.1;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, paymentMethod, txReference, usdAmount } = body || {};

    if (!userId || !paymentMethod || !txReference || !usdAmount) {
      return NextResponse.json(
        { success: false, error: 'Malformed payload parameter vectors.' },
        { status: 400 }
      );
    }

    const starsToCredit = Math.floor(Number(usdAmount) / VALUE_PER_STAR);
    if (starsToCredit < 1) {
      return NextResponse.json(
        { success: false, error: 'Amount too low to credit any Stars.' },
        { status: 422 }
      );
    }

    const method = String(paymentMethod).toUpperCase();
    let valid = false;

    if (method === 'SOLANA') {
      try {
        const rpc = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
        const conn = new Connection(rpc, 'confirmed');
        const tx = await conn.getTransaction(txReference, {
          maxSupportedTransactionVersion: 0
        });
        if (tx) {
          const keys = tx.transaction.message.getAccountKeys().staticAccountKeys.map((k) =>
            k.toBase58()
          );
          valid = keys.includes(TREASURY);
        }
      } catch {
        valid = false;
      }
    } else if (method === 'MPESA') {
      valid = /^[A-Z0-9]{8,}$/i.test(String(txReference));
    } else if (method === 'FONBNK') {
      valid = String(txReference).length >= 6;
    }

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment verification failed. Invalid transaction token signature.'
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      creditedStars: starsToCredit,
      platformShare: Math.floor(starsToCredit * 0.4),
      authorShare: starsToCredit - Math.floor(starsToCredit * 0.4)
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 }
    );
  }
}
