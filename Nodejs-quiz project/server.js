const express = require('express');
const quiz = require('./quiz.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/quiz', (req, res) => {
    res.json(quiz);
});

app.post('/submit', (req, res) => {
    const answers = req.body.answers;
    let score = 0;
    const results = [];

    answers.forEach((userAnswer, index) => {
        if (userAnswer == quiz[index].correctAnswer) {
            score++;
            results.push({ question: quiz[index].question, result: 'correct' });
        } else {
            results.push({ question: quiz[index].question, result: 'incorrect', correctAnswer: quiz[index].options[quiz[index].correctAnswer] });
        }
    });

    res.json({ score, results });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
