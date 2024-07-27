require("dotenv").config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const cors = require("cors");
app.use(express.json());
const PORT = process.env.instance_Port;
const Token = process.env.token;

const corsOptions = {
    origin: ['*', 'https://bistara.vercel.app', 'http://localhost:3000', 'https://bistaralinen.com.au'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
    console.log("Origin header:", req.headers.origin);
    next();
});

app.post('/create-draft-order', async (req, res) => {
    console.log('Incoming request body:', JSON.stringify(req.body, null, 2));

    // Extract the line_items and note from the request body
    const { draft_order } = req.body;
    const { line_items, note } = draft_order;

    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
        return res.status(400).json({ error: 'Invalid or missing line items' });
    }

    try {
        // Prepare the payload for the Shopify API request
        const payload = {
            draft_order: {
                line_items: line_items.map(item => ({
                    variant_id: parseInt(item.variant_id, 10),
                    quantity: item.quantity
                })),
                use_customer_default_address: draft_order.use_customer_default_address,
                tags: draft_order.tags,
                note: note
            }
        };

        console.log('Payload being sent:', JSON.stringify(payload, null, 2));

        // Make the API request to create the draft order
        const response = await fetch('https://bistaralinenco.myshopify.com/admin/api/2023-07/draft_orders.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': `${Token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error creating draft order:', errorText);
            return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error creating draft order:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
  console.log('Server is running on port' + PORT);
});
