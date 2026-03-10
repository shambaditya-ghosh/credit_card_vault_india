/**
 * CardVault India — 404 Not Found Middleware
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code:    'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = { notFound };
