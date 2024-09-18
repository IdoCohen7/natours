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

// GET route
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

// GetTour route
app.get('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1; // Multiply numeric string to turn it into a number
  const tour = tours.find((el) => el.id === id);
  console.log(tour);

  // No tour found
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }

  // tour found
  res.status(200).json({
    status: 'success',
    data: {
      tour,
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

app.patch('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1; // Multiply numeric string to turn it into a number
  const tour = tours.find((el) => el.id === id);
  console.log(tour);

  // No tour found
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }

  // tour found, PATCH logic not implemented
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Tour is updated!',
    },
  });
});

app.delete('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1; // Multiply numeric string to turn it into a number
  const tour = tours.find((el) => el.id === id);

  // No tour found
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }

  // tour found, PATCH logic not implemented, 204 == no content
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// start server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
