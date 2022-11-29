/**
 * Returns blob of the url
 * @param {String} url
 * @returns {Blob}
 */
async function urlToBlob(url) {
  const data = await fetch(url);
  const blob = await data.blob();
  return blob;
}

export default urlToBlob;
