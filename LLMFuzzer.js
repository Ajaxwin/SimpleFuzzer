const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');
const { exec } = require('child_process');

dotenv.config();
const PORT = process.env.PORT || 80;
const app = express();
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
	throw new Error("GEMINI_API_KEY environment variable not found.");
}

const ai = new GoogleGenAI({});
const BASE_URL = 'https://httpbin.org';
const REQUESTS = require('./Requests.json');

// @ Fuzzer 

// ! 1.Not very effective
// ! 2. Slow

// Fuzz Post Requests
app.get('/fuzzer/post', async (req, res) => {
	try {
		const requests = REQUESTS.HttpBin.POST;
		const contents = 'For each of the following HTTP POST requests, Change payloads of each requests with random values, like username, ip etc fill random value everywhere. Generate array of curl commands as show in example_usage of each request. Make sure not to respond anything other than this array. Return response in form of array string. Here are the requests:\n\n ' + JSON.stringify(requests) + '\n';
		const result = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents,
			config: {
				temperature: 2.0 				// measure of randomness
			}
		});

		const seeds = result.text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
		console.log(seeds);
		let failedCommands = [];


		const execCommands = (command) =>
			new Promise((resolve) => {
				exec(command, (error, stdout, stderr) => {
					if (error) {
						console.error(`Error executing command: ${command}\n`, error);
						failedCommands.push({ command, error: error.message });
					}
					else {
						console.log(stdout);
					}
					resolve();
				});
			});
		
		(async () => {
			await Promise.all(seeds.map((command) => execCommands(command)));
			console.log('Failed commands:', failedCommands);
		})();
		
		res.status(200).send({message: 'Fuzzing completed', failedCommands});
	} catch (error) {
		console.error('Error generating content:', error);
		res.status(500).send('An error occurred while processing your request.');
	}
});



// Chat Endpoint
app.get('/chat', async (req, res) => {
	try {
		const prompt = req.query.prompt;
		if (!prompt)
			throw error;

		const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
		console.log(typeof(result.text));
		res.status(200).send(result.text);

	} catch (error) {
		console.error('Error generating content:', error);
		res.status(500).send('An error occurred while processing your request.');
	}
});




// Common Stuff
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