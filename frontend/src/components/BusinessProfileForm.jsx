import React, { useState } from 'react';

const BusinessProfileForm = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    business_name: initialData?.business_name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    phone: initialData?.phone || '',
    location: initialData?.location || '',
  });
  const [profileImage, setProfileImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (profileImage) {
      data.append('profile_image', profileImage);
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold">Business Name</label>
        <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block font-semibold">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block font-semibold">Category</label>
        <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block font-semibold">Phone</label>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block font-semibold">Location</label>
        <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border p-2 rounded" />
      </div>
      <div>
        <label className="block font-semibold">Profile Image</label>
        <input type="file" onChange={handleImageChange} className="w-full" />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Profile</button>
    </form>
  );
};

export default BusinessProfileForm;
