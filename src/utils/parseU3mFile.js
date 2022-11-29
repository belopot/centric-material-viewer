import * as THREE from 'three';
import JSZip from 'jszip';
import {DEFAULT_MATERIAL_DATA} from 'dataset/materials';
import rgbToHex from './rgbToHex';
import arraybufferToBase64 from './arrayBufferToBase64';

/**
 * @param {ArrayBuffer} arrayBuffer
 * @returns
 */
export default function parseU3mFile(arrayBuffer) {
  const file = new Blob([arrayBuffer], {type: 'application/zip'});
  return new Promise((resolve, reject) => {
    new JSZip().loadAsync(file).then(zip => {
      const zipEntries = Object.keys(zip.files);
      const zipFiles = zipEntries.map(entry => zip.files[entry]);
      const zipData = zipFiles.map(file => file.async('arraybuffer'));
      Promise.all(zipData)
        .then(data => {
          //Default material data
          const materialData = Object.assign({}, DEFAULT_MATERIAL_DATA);

          //Parse u3m
          if (zipEntries.some(entry => entry.endsWith('.u3m'))) {
            materialData.type = 'u3m';

            const idx = zipEntries.findIndex(entry => entry.endsWith('.u3m'));
            const u3mJson = JSON.parse(new TextDecoder().decode(data[idx]));
            const front = u3mJson.material.front;
            if (front) {
              //Preview
              const setPreview = () => {
                const arraybuffer =
                  data[zipEntries.findIndex(entry => entry === 'preview.png')];
                const base64 = arraybufferToBase64(arraybuffer);
                materialData.preview = base64;
              };
              setPreview();

              //Color
              materialData.color = rgbToHex(front.basecolor.constant);

              //Map
              const setMap = () => {
                const path = front.basecolor.texture.image.path.replaceAll(
                  /\\/g,
                  '/',
                );
                const arraybuffer =
                  data[zipEntries.findIndex(entry => entry === path)];
                const base64 = arraybufferToBase64(arraybuffer);
                const image = new Image();
                image.src = base64;
                const texture = new THREE.Texture();
                texture.image = image;
                image.onload = () => {
                  texture.needsUpdate = true;
                };

                materialData.map = texture;
              };

              if (front.basecolor.texture) {
                setMap();
              }

              //Normal Map
              const setNormalMap = () => {
                const path = front.normal.texture.image.path.replaceAll(
                  /\\/g,
                  '/',
                );
                const arraybuffer =
                  data[zipEntries.findIndex(entry => entry === path)];
                const base64 = arraybufferToBase64(arraybuffer);
                const image = new Image();
                image.src = base64;
                const texture = new THREE.Texture();
                texture.image = image;
                image.onload = () => {
                  texture.needsUpdate = true;
                };

                materialData.normalMap = texture;
              };

              if (front.normal.texture) {
                setNormalMap();
              }

              //Displacement Map
              const setDisplacementMap = () => {
                const path = front.displacement.texture.image.path.replaceAll(
                  /\\/g,
                  '/',
                );
                const arraybuffer =
                  data[zipEntries.findIndex(entry => entry === path)];
                const base64 = arraybufferToBase64(arraybuffer);
                const image = new Image();
                image.src = base64;
                const texture = new THREE.Texture();
                texture.image = image;
                image.onload = () => {
                  texture.needsUpdate = true;
                };

                materialData.displacementMap = texture;
              };

              if (front.displacement.texture) {
                setDisplacementMap();
              }

              //Roughness Map
              const setRoughnessMap = () => {
                const path = front.roughness.texture.image.path.replaceAll(
                  /\\/g,
                  '/',
                );
                const arraybuffer =
                  data[zipEntries.findIndex(entry => entry === path)];
                const base64 = arraybufferToBase64(arraybuffer);
                const image = new Image();
                image.src = base64;
                const texture = new THREE.Texture();
                texture.image = image;
                image.onload = () => {
                  texture.needsUpdate = true;
                };

                materialData.roughnessMap = texture;
                materialData.roughness = front.roughness.constant;
              };

              if (front.roughness.texture) {
                setRoughnessMap();
              }

              //Metalness Map
              const setMetalnessMap = () => {
                const path = front.metalness.texture.image.path.replaceAll(
                  /\\/g,
                  '/',
                );
                const arraybuffer =
                  data[zipEntries.findIndex(entry => entry === path)];
                const base64 = arraybufferToBase64(arraybuffer);
                const image = new Image();
                image.src = base64;
                const texture = new THREE.Texture();
                texture.image = image;
                image.onload = () => {
                  texture.needsUpdate = true;
                };

                materialData.metalnessMap = texture;
                materialData.metalness = front.metalness.constant;
              };

              if (front.metalness.texture) {
                setMetalnessMap();
              }

              //Alpha Map
              const setAlphaMap = () => {
                const path = front.alpha.texture.image.path.replaceAll(
                  /\\/g,
                  '/',
                );
                const arraybuffer =
                  data[zipEntries.findIndex(entry => entry === path)];
                const base64 = arraybufferToBase64(arraybuffer);
                const image = new Image();
                image.src = base64;
                const texture = new THREE.Texture();
                texture.image = image;
                image.onload = () => {
                  texture.needsUpdate = true;
                };

                materialData.metalnessMap = texture;
              };

              if (front.alpha.texture) {
                setAlphaMap();
              }
            }
          }

          resolve(materialData);
        })
        .catch(error => {
          reject(error);
        });
    });
  });
}
