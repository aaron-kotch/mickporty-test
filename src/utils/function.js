// import Resizer from 'react-image-file-resizer';
import { generateS3UploadLink } from '@API/api';
import moment from 'moment';

export const isFunction = value => value && (Object.prototype.toString.call(value) === "[object Function]" || "function" === typeof value || value instanceof Function);
// const addBackslash = (text) => {
//   return text.replaceAll('"', '\"')
// }
// const resizeFile = (file) =>
//   new Promise((resolve) => {
//     Resizer.imageFileResizer(
//       file,
//       500,
//       600,
//       'JPEG',
//       90,
//       0,
//       (uri) => {
//         resolve(uri)
//       },
//       'base64'
//     )
//   })

// const dataURIToBlob = (dataURI) => {
//   const splitDataURI = dataURI.split(',')
//   const byteString =
//     splitDataURI[0].indexOf('base64') >= 0
//       ? atob(splitDataURI[1])
//       : decodeURI(splitDataURI[1])
//   const mimeString = splitDataURI[0].split(':')[1].split(';')[0]
//   const ia = new Uint8Array(byteString.length)
//   for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)
//   return new Blob([ia], { type: mimeString })
// }

// export const uploadImgToS3 = (signedUrl, image) => {
//   let form = new FormData()
//   const newData = JSON.parse(signedUrl)
//   Object.keys(newData.fields).forEach((key) =>
//     form.append(key, newData.fields[key])
//   )
//   form.append('file', image)
//   return fetch(newData.url, { method: 'POST', body: form })
// }

export const uploadImgFromMPToS3 = (signedUrl, filePath, pushAlertPopUp) => {
  try {
    // eslint-disable-next-line no-undef
    my.postMessage({
      action: "uploadFile",
      body: { signedUrl, filePath },
    });
  } catch (err) {
    // 
  }
}

export async function getS3Link(count, path, images, token, pushAlertPopUp, fileName) {
  let params = {
    token: token,
    folderName: path,
    fileName: fileName
  }

  const response = await generateS3UploadLink(params);

  uploadImgFromMPToS3(response, images[count], pushAlertPopUp);
}

/**
* Determine the mobile operating system.
* This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
*
* @returns {String}
*/
export function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    // console.log('windows phone')
    return "Windows Phone";
  }

  if (/android/i.test(userAgent)) {
    // console.log('android phone')
    return "Android";
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    // console.log('ios phone')
    return "iOS";
  }

  return "unknown";
}

export const formatDateToLocalISO = (isoValue) => {
  let t = new Date(isoValue)
  let iso = t.toISOString()
  return iso;
}

export const isWithinLast7Days = (compareDate) => {
  // console.log('compareDate',compareDate);
  // console.log('result', compareDate.isBetween(moment().subtract(7,'d'), moment().add(1, 'minutes')));
  return compareDate.isBetween(moment().subtract(7, 'd'), moment().add(1, 'minutes'));
}