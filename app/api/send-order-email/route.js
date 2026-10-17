import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Backend secure SMTP matrix setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function POST(request) {
  try {
    const { orderId, customerName, customerEmail, items, finalAmount, deliveryAddress, contactNumber } = await request.json();

    // Items map for clear structured matrix presentation
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 14px;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; font-weight: bold;">${(item.price * item.quantity).toFixed(3)} OMR</td>
      </tr>
    `).join('');

    // --- 🚨 GATEWAY 1: ADMIN EMAIL ALERT (Aap Ke Liye) ---
    const adminMailOptions = {
      from: '"Zonix Mart Engine" <no-reply@zonixmart.com>',
      to: 'hasnainarain193@gmail.com', // Admin gate trigger address
      subject: `🚨 NEW ORDER INSTANCE: #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
          <h2 style="color: #e67e22; border-bottom: 2px solid #e67e22; padding-bottom: 10px;">New Incoming Order Alert!</h2>
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
          <p><strong>GSM Phone:</strong> ${contactNumber}</p>
          <p><strong>Dropoff Node Location:</strong> ${deliveryAddress}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Product</th>
                <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
                <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <h3 style="text-align: right; color: #2c3e50; margin-top: 20px; font-size: 18px;">Gross Terminal Revenue: ${finalAmount.toFixed(3)} OMR</h3>
        </div>
      `,
    };

    // --- 🎉 GATEWAY 2: CUSTOMER SUCCESS INVOICE (Customer Ke Liye) ---
    const customerMailOptions = {
      from: '"Zonix Mart" <no-reply@zonixmart.com>',
      to: customerEmail,
      subject: `🎉 Order Dispatched Successfully! - ID: #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1a1a1a; padding: 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px; letter-spacing: 2px;">ZONIX MART</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #cccccc;">SECURE GATEWAY TRANSACTION SUCCESSFUL</p>
          </div>
          <div style="padding: 25px; color: #333333;">
            <h2 style="color: #27ae60; margin-top: 0;">Thank you for your order, ${customerName}!</h2>
            <p>Your transaction has been securely processed. We are packing your products for delivery across Oman.</p>
            <p><strong>Your Order Tracking Code:</strong> #${orderId}</p>
            
            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-top: 25px;">Receipt Breakdown</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>${itemsHtml}</tbody>
            </table>
            
            <h3 style="text-align: right; color: #1a1a1a; margin-top: 20px;">Total Charges Settled: ${finalAmount.toFixed(3)} OMR</h3>
            
            <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;">
            <p style="font-size: 12px; color: #777777; text-align: center; line-height: 1.5;">
              If you require real-time tracking updates or package modification, click the dedicated WhatsApp button on our footer dashboard to contact live grid operators.
            </p>
          </div>
        </div>
      `,
    };

    // Send both secure streams synchronously
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions)
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('SMTP Mail Transmission Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
