import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLANS, getPlanPriceKopecks } from "@/lib/plans";

// YooKassa webhook handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // YooKassa sends payment.succeeded or payment.canceled events
    const event = body.event;
    const paymentData = body.object;

    if (!paymentData?.id) {
      return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { yookassaId: paymentData.id },
    });

    if (!payment) {
      console.log("Payment not found:", paymentData.id);
      return NextResponse.json({ ok: true });
    }

    if (event === "payment.succeeded") {
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "succeeded",
          paidAt: new Date(),
        },
      });

      // Apply the purchase
      if (payment.type === "subscription" && payment.planId) {
        // Update user's plan with new price locked in
        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            plan: payment.planId,
            planPrice: getPlanPriceKopecks(payment.planId),
            planStartedAt: new Date(),
          },
        });

        // Update all user's businesses with new SMS limits
        const plan = PLANS[payment.planId as keyof typeof PLANS];
        if (plan) {
          await prisma.business.updateMany({
            where: { userId: payment.userId },
            data: { smsLimit: plan.smsLimit },
          });
        }
      } else if (payment.type === "sms_pack" && payment.smsAmount) {
        // Add purchased SMS to all user's businesses (proportionally)
        // smsPurchased never expires (unlike smsLimit which resets monthly)
        const businesses = await prisma.business.findMany({
          where: { userId: payment.userId },
        });

        if (businesses.length > 0) {
          const smsPerBusiness = Math.floor(payment.smsAmount / businesses.length);
          await prisma.business.updateMany({
            where: { userId: payment.userId },
            data: { smsPurchased: { increment: smsPerBusiness } },
          });
        }
      }
    } else if (event === "payment.canceled") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "canceled" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
