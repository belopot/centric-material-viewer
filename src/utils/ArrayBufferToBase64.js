const arraybufferToBase64 = arrayBuffer => {
  const b64encoded = btoa(
    [].reduce.call(
      new Uint8Array(arrayBuffer),
      function (p, c) {
        return p + String.fromCharCode(c);
      },
      '',
    ),
  );
  const mimetype = 'image/jpeg';
  return 'data:' + mimetype + ';base64,' + b64encoded;
};

export default arraybufferToBase64;
