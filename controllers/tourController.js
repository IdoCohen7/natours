const fs = require('fs');

const tours = JSON.parse(fs.readFileSync(`./dev-data/data/tours-simple.json`));

function checkID(req, res, next, val) {
  const id = req.params.id * 1; // Multiply numeric string to turn it into a number
  const tour = tours.find((el) => el.id === id);
  // No tour found
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid ID',
    });
  }
  next();
}

function checkBody(req, res, next) {
  if (!req.body.name || !req.body.price) {
    // CHECKS IF PRICE OR NAME PROPERTIES ARE NULL
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
}

function getAllTours(req, res) {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
}

function getTour(req, res) {
  const id = req.params.id * 1; // Multiply numeric string to turn it into a number
  const tour = tours.find((el) => el.id === id);
  // tour found
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
}

function postTour(req, res) {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  console.log(newTour);

  fs.writeFile(
    `./dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        // 201 = CREATED
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    },
  );
}

function patchTour(req, res) {
  const id = req.params.id * 1; // Multiply numeric string to turn it into a number
  const tour = tours.find((el) => el.id === id);
  // tour found, PATCH logic not implemented
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Tour is updated!',
    },
  });
}

function deleteTour(req, res) {
  const id = req.params.id * 1; // Multiply numeric string to turn it into a number
  const tour = tours.find((el) => el.id === id);
  // tour found, PATCH logic not implemented, 204 == no content
  res.status(204).json({
    status: 'success',
    data: null,
  });
}

module.exports = {
  getAllTours,
  getTour,
  postTour,
  patchTour,
  deleteTour,
  checkID,
  checkBody,
};
