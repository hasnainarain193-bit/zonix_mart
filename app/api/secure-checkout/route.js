import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { amount, orderTracker } = await request.json();

    // Stripe code completely removed. 
    // This is a temporary clean bypass route until local Omani Gateway (Thawani) is integrated.
    console.log(`Processing local pipeline for order tracking reference ID: #${orderTracker}`);

    return NextResponse.json({ success: true, message: "Local order matrix initialized." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
