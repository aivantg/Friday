import express from 'express';
import dotenv from 'dotenv-safe';
dotenv.config();

const app = express();

app.get('/', (req, res) => {
  res.send('hello world');
});

// Serve the files on port 3000.
const server = app.listen(3000, function () {
  console.log('Example app listening on port 3000!\n');
});
