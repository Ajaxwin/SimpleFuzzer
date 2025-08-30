const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();
const PORT = process.env.PORT || 80;
const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
	throw new Error("GEMINI_API_KEY environment variable not found.");
}

const genAI = new GoogleGenerativeAI(apiKey);

app.get('/chat', async (req, res) => {
	try {
		const result = await genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
			.generateContent("How to calculate sum of number from 1 to n in constant time?");
		res.status(200).send(result.response.text());

	} catch (error) {
		console.error('Error generating content:', error);
		res.status(500).send('An error occurred while processing your request.');
	}
});

app.get('/', (req, res) => {
	res.status(200).send('Fuzzer Endpoint');
});

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
}).on('error', (error) => {
	console.error('Server error:', error);
});

// Shutdown server gracefully on SIGINT
process.on('SIGINT', () => {
	console.log('Shutting down server...');
	server.close(() => {
		console.log('Server closed');
		process.exit(0);
	});
});

process.on('SIGTERM', () => {
	console.log('SIGTERM received. Shutting down gracefully...');
	server.close(() => {
		console.log('Server closed. Exiting process.');
		process.exit(0);
	});
});