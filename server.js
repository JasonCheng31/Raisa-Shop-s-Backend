require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/create-checkout-session", async (req, res) => {
  const { cart } = req.body;
  res.send("Route works");
  const line_items = cart.map(item => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.title,
      },
      unit_amount: item.price * 100, // convert to cents
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: "http://localhost:5173/#/success",
    cancel_url: "http://localhost:5173/#/Cart",
  });

  res.json({ url: session.url });
});
app.get("/test-stripe", async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.json(balance);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});
app.listen(5000, () => console.log("Server running on port 5000"));