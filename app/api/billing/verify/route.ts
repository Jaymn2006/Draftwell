import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { Connection } from '@solana/web3.js';

const MASTER_TREASURY_SOL_WALLET = 'EDZjEbRAtqyC8z6ta6PYHX161Xynt13tWpd7orKERkbz';
const VALUE_PER_STAR_USD = 0.1;

const solanaConnection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, paymentMethod, txReference, usdAmount, authorId } = body;

    if (!userId || !txReference || usdAmount == null) {
      return NextResponse.json({ error: 'Malformed payload parameter vectors.' }, { status: 400 });
    }

    const starsToCredit = Math.floor(Number(usdAmount) / VALUE_PER_STAR_USD);
    if (starsToCredit < 1) {
      return NextResponse.json({ error: 'Amount too low to credit any Stars.' }, { status: 400 });
    }

    const csharpBackend = process.env.BILLING_BACKEND_URL;
    if (csharpBackend) {
      try {
        const backendRes = await fetch(`${csharpBackend}/api/billing/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, paymentMethod, txReference, usdAmount, authorId })
        });
        const backendData = await backendRes.json();
        if (backendRes.ok && backendData.success) {
          return NextResponse.json(backendData);
        }
      } catch {
        // Continue with local path
      }
    }

    let isTxValid = false;

    if (paymentMethod === 'SOLANA') {
      const txDetails = await solanaConnection.getParsedTransaction(txReference, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });
      if (txDetails) {
        const accountKeys = txDetails.transaction.message.accountKeys.map((k) =>
          typeof k === 'string' ? k : k.pubkey.toBase58()
        );
        if (accountKeys.includes(MASTER_TREASURY_SOL_WALLET)) {
          isTxValid = true;
        }
      }
    } else if (paymentMethod === 'MPESA') {
      if (typeof txReference === 'string' && txReference.length >= 8 && /^[A-Z0-9]+$/.test(txReference)) {
        isTxValid = true;
      }
    } else if (paymentMethod === 'FONBNK') {
      if (typeof txReference === 'string' && txReference.length >= 6) {
        isTxValid = true;
      }
    }

    if (!isTxValid) {
      return NextResponse.json(
        { error: 'Payment verification failed. Invalid transaction token signature.' },
        { status: 422 }
      );
    }

    const supabase = createServiceClient();
    const platformShareStars = Math.floor(starsToCredit * 0.4);
    const authorShareStars = starsToCredit - platformShareStars;

    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('star_balance')
      .eq('id', userId)
      .single();

    const newStarBalance = (currentProfile?.star_balance || 0) + starsToCredit;

    await supabase.from('user_profiles').update({ star_balance: newStarBalance }).eq('id', userId);

    await supabase.from('payment_intents').insert([
      {
        user_id: userId,
        payment_method: paymentMethod,
        transaction_reference: txReference,
        fiat_amount_usd: usdAmount,
        stars_credited: starsToCredit,
        status: 'COMPLETED'
      }
    ]);

    if (authorId) {
      const { data: authorProfile } = await supabase
        .from('author_earnings')
        .select('total_stars_earned')
        .eq('author_id', authorId)
        .maybeSingle();

      const newAuthorEarnings = (authorProfile?.total_stars_earned || 0) + authorShareStars;

      await supabase.from('author_earnings').upsert({
        author_id: authorId,
        total_stars_earned: newAuthorEarnings,
        updated_at: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true, creditedStars: starsToCredit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
