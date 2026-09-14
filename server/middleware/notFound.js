export function notFound(_req, res, next) {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
}
