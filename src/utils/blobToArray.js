/**
 * Returns arraybuffer of blob
 * @param {Blob} blob
 * @returns {ArrayBuffer}
 */
async function blobToArray(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(blob);
  });
}

export default blobToArray;
