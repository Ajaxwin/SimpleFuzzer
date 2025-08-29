const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();
const PORT = process.env.PORT || 80;
const app = express();
app.use(express.json());
const client = new OpenAI();        // automatically reads the openai key from .env file

app.get('/', (req, res) => {
    res.status(200).send('Fuzzer Endpoint');
});


app.get('/chat', async (req, res) => {
    const response = await client.responses.create({
        model: "gpt-5",
        reasoning: { effort: "low" },
        instructions: "Talk like a tutor",
        input: "How to calculate sum of number from 1 to n in constant time?",
    });
    res.status(200).send(response.output_text);
});

app.listen(PORT, () => {
    console.log(`Fuzzer is running`);
});