import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET, 
});

async function uploadToCloudinary(req){

    let imageIfo = await cloudinary.uploader.upload(req.file.path);
    
    return imageIfo;
        
}

export {uploadToCloudinary};

export {cloudinary};