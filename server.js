require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Stripe with secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST route for creating checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart } = req.body;

    // Map cart items to Stripe line items
    const line_items = cart.map(item => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.title },
        unit_amount: item.price * 100, // convert dollars to cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "https://YOUR_FRONTEND_URL/#/success", // Replace with your deployed frontend URL
      cancel_url: "https://YOUR_FRONTEND_URL/#/Cart",
    });

    // Send session URL to frontend
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Optional GET route to test Stripe connection
app.get("/test-stripe", async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.json(balance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Use Render’s assigned port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));