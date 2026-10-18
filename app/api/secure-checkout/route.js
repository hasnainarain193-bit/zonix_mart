import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { amount, customerEmail, orderTracker, items } = await request.json();

    // Line items structure formation for Stripe Checkout session page conversion
    const transformedItems = items.map(item => ({
      price_data: {
        currency: 'omr',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 1000), // Convert OMR to Baizas securely
      },
      quantity: item.quantity,
    }));

    // Generate encrypted off-site transactional bridge session link parameters
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: transformedItems,
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/cart?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/cart?payment_status=cancelled`,
      customer_email: customerEmail,
      metadata: { orderId: orderTracker },
    });

    return NextResponse.json({ secureUrl: session.url }, { status: 200 });
  } catch (error) {
    console.error('Fatal Secure Transaction Core System Fault:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
