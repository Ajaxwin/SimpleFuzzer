const express = require('express');
const app = express();
const port = 80;

app.use(express.json());

// Database of users (in-memory for this example)
const users = [
    { id: 1, username: "admin", email: "admin@example.com" },
    { id: 2, username: "user", email: "user@example.com" }
];

app.get('/', (req, res) => {
    res.status(200).send("You are connected");
});

// Vulnerable search endpoint
app.get('/search', (req, res) => {
    const query = req.query.q;

    // Vulnerable: no input validation
    if (!query) {
        return res.status(400).json({ error: 'Search query required' });
    }

    try {
        // Vulnerable: using regex without validation could lead to ReDoS
        const regex = new RegExp(query);
        const results = users.filter(user =>
            regex.test(user.username) || regex.test(user.email)
        );

        return res.json(results);
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
});

// User creation endpoint
app.post('/users', (req, res) => {
    const { username, email } = req.body;

    // Vulnerable: insufficient validation
    if (!username || !email) {
        return res.status(400).json({ error: 'Username and email required' });
    }

    // Create new user
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = { id: newId, username, email };
    users.push(newUser);

    return res.status(201).json(newUser);
});

app.listen(port, () => {
    console.log(`API server running on port ${port}`);
});