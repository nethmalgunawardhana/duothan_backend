const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const uploadImage = async (file, fileName, folder = 'uploads') => {
  try {
    const result = await imagekit.upload({
      file: file, // base64 string or buffer
      fileName: fileName,
      folder: folder,
      tags: ['upload']
    });
    return result;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw error;
  }
};

const deleteImage = async (fileId) => {
  try {
    await imagekit.deleteFile(fileId);
    return true;
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw error;
  }
};

const testImageKitConnection = async () => {
  try {
    await imagekit.listFiles({
      limit: 1
    });
    console.log('✅ ImageKit connection successful');
    return true;
  } catch (error) {
    console.error('❌ ImageKit connection failed:', error.message);
    return false;
  }
};

module.exports = {
  imagekit,
  uploadImage,
  deleteImage,
  testImageKitConnection
};