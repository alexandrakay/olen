import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function findUserByCustomerId(db: FirebaseFirestore.Firestore, customerId: string): Promise<string | null> {
  const snap = await db.collection("users").where("stripeCustomerId", "==", customerId).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].id;
}

export const stripeWebhook = onRequest(
  { secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] },
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch {
      res.status(400).send("Webhook signature verification failed");
      return;
    }

    const db = getFirestore();

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.uid;
        if (!uid) { res.status(400).send("Missing uid in metadata"); return; }
        await db.doc(`users/${uid}`).update({
          subscriptionStatus: "active",
          stripeCustomerId: session.customer as string,
        });
      }

      if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object as Stripe.Subscription;
        const uid = await findUserByCustomerId(db, sub.customer as string);
        if (uid) await db.doc(`users/${uid}`).update({ subscriptionStatus: "cancelled" });
      }

      if (event.type === "customer.subscription.updated") {
        const sub = event.data.object as Stripe.Subscription;
        const uid = await findUserByCustomerId(db, sub.customer as string);
        if (uid) {
          const status = sub.status === "active" ? "active"
            : sub.status === "past_due" ? "past_due"
            : sub.status === "canceled" ? "cancelled"
            : null;
          if (status) await db.doc(`users/${uid}`).update({ subscriptionStatus: status });
        }
      }

      if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as Stripe.Invoice;
        const uid = await findUserByCustomerId(db, invoice.customer as string);
        if (uid) await db.doc(`users/${uid}`).update({ subscriptionStatus: "past_due" });
      }

      res.status(200).send("ok");
    } catch {
      res.status(500).send("Internal error");
    }
  }
);
