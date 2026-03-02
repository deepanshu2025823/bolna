// app/api/user/payment/create/route.ts
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("CRITICAL: Razorpay keys are missing in environment variables!");
      return NextResponse.json({ success: false, message: "Server configuration error: Keys missing" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const body = await request.json(); 
    
    const amount = Number(body.amount);
    
    if (!amount || isNaN(amount)) {
      return NextResponse.json({ success: false, message: "Invalid amount provided." }, { status: 400 });
    }

    const amountInINR = Math.round(amount * 83); 
    const amountInPaise = amountInINR * 100;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ success: true, order });
    
  } catch (error: any) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
  }
}