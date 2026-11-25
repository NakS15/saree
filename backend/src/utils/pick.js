// Copies only the listed keys, so clients can't set fields like status, role or rating.
module.exports = (source, allowed) =>
  Object.fromEntries(Object.entries(source || {}).filter(([key]) => allowed.includes(key)));
