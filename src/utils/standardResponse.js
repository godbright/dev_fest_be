export const getStandardResponse = (req, res, status, message, data = {}) => {
  let url = req.protocol + "://" + req.headers.host + req.originalUrl;

  const response = {
    status: status,
    message: message,
    data,
    links: {
      self: url,
    },
  };

  return res.status(status).send(response);
};
