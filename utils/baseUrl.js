const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://social-media-7t1c.onrender.com";
module.exports = baseUrl;
