const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let status = err.status || err.statusCode || 500;
  let message = err.message || "Server Error";

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(", ");
  } else if (err.code === 11000) {
    status = 400;
    message = "Duplicate field value";
  } else if (err.code === "23505") {
    status = 400;
    message = "Resource already exists";
  }

  res.status(status).json({ message });
};

module.exports = errorHandler;
