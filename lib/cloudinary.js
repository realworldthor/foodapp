export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'foodapp_uploads');
  formData.append('cloud_name', 'dpuynsgic');

  const res = await fetch(
    'https://api.cloudinary.com/v1_1/dpuynsgic/image/upload',
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await res.json();
  console.log('Cloudinary response:', data);

  if (data.secure_url) {
    return data.secure_url;
  } else {
    throw new Error(data.error?.message || 'Upload failed');
  }
}