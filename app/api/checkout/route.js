import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { customer, orderItems, totalAmount } = await request.json();

    // Create secure SMTP stream engine connection via server configurations
    const transportEngine = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Compile dynamic rich HTML layout body template
    const itemsRowsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${item.name}</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty} units</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${(parseFloat(item.price_omr) * item.qty).toFixed(3)} OMR</td>
      </tr>
    `).join('');

    const salesEmailTemplate = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #4f46e5; text-transform: uppercase; tracking: tight;">Zonix Mart — New Premium Order Alert Node</h2>
        <p>An enterprise volumetric checkout execution request has just crossed the Omani storefront payment nodes.</p>
        
        <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 15px 0;" />
        <h3>Client Billing Directory:</h3>
        <p><strong>Name:</strong> ${customer.name}<br/><strong>Phone:</strong> ${customer.phone}<br/><strong>Email:</strong> ${customer.email}<br/><strong>Address:</strong> ${customer.address}</p>
        
        <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 15px 0;" />
        <h3>Order Items Specification Matrix:</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f7fafc; color: #718096; text-transform: uppercase;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsRowsHtml}</tbody>
        </table>
        
        <h3 style="text-align: right; margin-top: 20px; color: #0f172a;">Total Net Settlement Amount: <span style="font-family: monospace; color: #ff4d00;">${parseFloat(totalAmount).toFixed(3)} OMR</span></h3>
      </div>
    `;

    await transportEngine.sendMail({
      from: process.env.EMAIL_SERVER_USER,
      to: 'hasnainarain193@gmail.com', // Your target master email registry destination
      subject: `🚨 [Zonix Order Alert] — ${customer.name} just placed an order!`,
      html: salesEmailTemplate,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
