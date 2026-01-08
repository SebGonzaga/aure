require('dotenv').config(); // Essential: Load your .env file first
const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Load the API Key from your .env file (DO NOT hardcode it here)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

app.post('/chat', async (req, res) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-5-mini", // Use the 2026 stable flagship mini model
            messages: [
                { 
                    role: "system", 
                    content: "You are the House of Auré Concierge, a luxury jewelry stylist. The collection includes: Obscura (bold/night), Velour (rich/grace), Sloven (balanced), and Énigma (mysterious). Answer with elegance, grace, and professional warmth." 
                },
                { 
                    role: "user", 
                    content: req.body.message 
                }
            ],
            temperature: 0.65, // Slightly lower for more consistent luxury tone
        });

        res.json({ reply: response.choices[0].message.content });

    } catch (error) {
        console.error("--- AURÉ BOUTIQUE API ERROR ---");
        console.error(error.message);

        // Check if the model name is the issue
        if (error.message.includes("model_not_found")) {
            res.status(404).json({ reply: "My catalog is being updated to the latest 2026 collection. Please try again in a moment." });
        } else {
            res.status(500).json({ reply: "The House of Auré is currently hosting a private viewing. Please try again shortly." });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Auré Boutique Server active on port ${PORT}`);
    console.log("Status: 2026 Stable (GPT-5 Mini Enabled)");
});