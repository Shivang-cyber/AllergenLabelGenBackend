const SendErrorDev = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const message = err.message;
  const stack = err.stack;
  res.status(statusCode).json({
    status,
    message,
    stack,
  });
};

const SendErrorProd = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const message = err.message;

  if (err.isOperational) {
    res.status(statusCode).json({
      status,
      message,
    });
  }

  return res.status(statusCode).json({
    status: "error",
    message: "Something went wrong",
  });
};

const globalErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    SendErrorDev(err, res);
  }
  SendErrorProd(err, res);
};

module.exports = globalErrorHandler;