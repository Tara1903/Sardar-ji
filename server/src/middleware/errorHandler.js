const errorHandler = (error, _req, res, _next) => {
  const status = error.status || 400;
  res.status(status).json({
    message: error.message || 'Something went wrong.',
  });
};

module.exports = {
  errorHandler,
};
