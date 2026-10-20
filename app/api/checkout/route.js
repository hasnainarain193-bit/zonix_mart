import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { amount, orderTracker, customerEmail, clientName, cartItems } = await request.json();

    // Thawani API expects amount in Baizas (1 OMR = 1000 Baizas)
    const amountInBaizas = Math.round(parseFloat(amount) * 1000);

    // Format products according to Thawani Schema
    const productsPayload = cartItems.map(item => ({
      name: item.name.substring(0, 40), // Safe string boundary limit
      unit_amount: Math.round(parseFloat(item.price_omr) * 1000),
      quantity: item.qty
    }));

    // Append delivery charges as a product item in Thawani invoice row
    productsPayload.push({
      name: "Delivery Surcharge Fee",
      unit_amount: 799, // 0.799 OMR fixed delivery charge in Baizas
      quantity: 1
    });

    // Thawani Checkout Session Endpoint (Test mode uses staging URL)
    const thawaniUrl = 'https://thawani.om';
    
    const response = await fetch(thawaniUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'thawani-api-key': process.env.THAWANI_SECRET_KEY
      },
      body: JSON.stringify({
        client_reference_id: orderTracker,
        products: productsPayload,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart?payment_status=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart?payment_status=cancel`,
        metadata: {
          customer_email: customerEmail,
          customer_name: clientName
        }
      })
    });

    const data = await response.json();

    if (data.success === true && data.data.session_id) {
      // Return Thawani Hosted Redirection URL to Frontend container
      const redirectUrl = `https://thawani.om{data.data.session_id}?key=${process.env.NEXT_PUBLIC_THAWANI_PUBLIC_KEY}`;
      return NextResponse.json({ success: true, url: redirectUrl }, { status: 200 });
    } else {
      throw new Error(data.description || "Thawani Session token generation failed.");
    }

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
