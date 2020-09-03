import CryptoJS from 'crypto-js';
  
const key = CryptoJS.enc.Utf8.parse("1234123412ABCDEF");  //十六位十六进制数作为密钥,key,iv使用同一个

//解密方法
export function Decrypt(word) {
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: key, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}

//加密方法
export function Encrypt(word) {
    let src = CryptoJS.enc.Utf8.parse(word)
    let encrypted = CryptoJS.AES.encrypt(src, key, { iv: key, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString();
}

