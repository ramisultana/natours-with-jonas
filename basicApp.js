const fs = require('fs');
const express = require('express');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  console.log('middleware text');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
// console.log(tours);
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};
const getTour = (req, res) => {
  // console.log(req.params);
  const id = req.params.id * 1; //TODO:how to read params from url 127.0.0.1:3000/api/v1/tours/6(the result be like  1,or 2 or 3 ...) and convert it to number by *1
  // if (id > tours.length) {
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'invalid id',
  //   });
  // }
  const tour = tours.find((el) => el.id === id);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }
  res.status(200).json({
    status: 'success',

    data: {
      tour,
    },
  });
};
const creatTour = (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',

        data: {
          tours: newTour,
        },
      });
    }
  );
};
const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<updated tour here...>',
    },
  });
};
const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: fail,
      message: 'invalid ID',
    });
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
// app.get('/api/v1/tours', getAllTours);

// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', creatTour);

// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// const port = 3000;
// app.listen(port, () => {
//   console.log(`app running on port ${port}`);
// });

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', creatTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//TODO: 3- ROUT
// version(1)
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', creatTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// version (2) app.route('/api/v1/tours').get(getAllTours).post(creatTour)
// app
//   .route('/api/v1/users/:id')
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);
//   VERSION (3) router system
const tourRouter = express.Router(); // parent rout
const userRouter = express.Router(); // parent rout

app.use('/api/v1/tours', tourRouter); // middleware function ( mounting router)
app.use('/api/v1/users', userRouter); // middleware function ( mounting router)

tourRouter.route('/').get(getAllTours).post(creatTour);

tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllUsers).post(creatUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

//TODO: 4- start server
const port = 3000;
app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
