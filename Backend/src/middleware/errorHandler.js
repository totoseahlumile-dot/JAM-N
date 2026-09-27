const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  const status = Number.isInteger(error.status) ? error.status : 500;
  const response = {
    error: {
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: status === 500 ? "An unexpected error occurred" : error.message
    }
  };

  if (error.details) response.error.details = error.details;

  if (process.env.NODE_ENV !== "test" && status === 500) {
    console.error(error);
  }

  return res.status(status).json(response);
};

export default errorHandler;
