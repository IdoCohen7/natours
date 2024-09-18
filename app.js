const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
app.use(express.json());

/*
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from server!', app: 'Natours' });
});

app.post('/', (req, res) => {
  res.send('You can post to this URL');
});
*/

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// Get route
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

// POST route
app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        // 201 = CREATED
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
});

// start server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
