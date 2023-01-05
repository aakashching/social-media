const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://social-media-production-a1ca.up.railway.app";
module.exports = baseUrl;
