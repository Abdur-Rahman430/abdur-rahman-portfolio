/**
 * Lightweight in-memory rate limiter for public abuse prevention.
 * Zero external dependencies.
 */

export function createRateLimiter({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 5, // max requests per window per IP
  message = 'Too many requests from this IP. Please try again later.',
} = {}) {
  const hits = new Map();

  // Periodic cleanup of stale records every 10 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(ip);
      }
    }
  }, 10 * 60 * 1000).unref();

  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown-ip';
    const now = Date.now();

    let record = hits.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      hits.set(ip, record);
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
}

export const messageRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many contact messages submitted from this IP. Please try again in 15 minutes.',
});
