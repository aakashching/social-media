const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://mini-social-media.up.railway.app";
module.exports = baseUrl;
