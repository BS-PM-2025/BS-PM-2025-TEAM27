import React, { useEffect, useState } from 'react';
import api from '../api';
import BusinessProfileForm from '../components/BusinessProfileForm';

const BusinessProfile = () => {
  const [profile, setProfile] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [sales, setSales] = useState([]);
  const [newGalleryImage, setNewGalleryImage] = useState(null);
  const [newSale, setNewSale] = useState({ title: '', description: '', start_date: '', end_date: '', image: null });
  const [editSaleId, setEditSaleId] = useState(null);
  const [editSaleData, setEditSaleData] = useState({ title: '', description: '', start_date: '', end_date: '', image: null });
const [workTime, setWorkTime] = useState({
    sunThuStart: '',
    sunThuEnd: '',
    friStart: '',
    friEnd: '',
    satStart: '',
    satEnd: ''
  });

 useEffect(() => {
  api.get('profile/business/')
    .then((res) => {
      const data = res.data[0];
      setProfile(data);
      setGalleryImages(data.gallery_images || []);
      setSales(data.sales || []);

      setWorkTime({
        sunThuStart: data.work_time_sun_thu?.split(' - ')[0] || '',
        sunThuEnd: data.work_time_sun_thu?.split(' - ')[1] || '',
        friStart: data.work_time_fri?.split(' - ')[0] || '',
        friEnd: data.work_time_fri?.split(' - ')[1] || '',
        satStart: data.work_time_sat?.split(' - ')[0] || '',
        satEnd: data.work_time_sat?.split(' - ')[1] || ''
      });
    })
    .catch(err => console.error('Error fetching profile:', err));
}, []);


  const handleProfileUpdate = (data) => {
    api.put(`profile/business/${profile.id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => {
        setProfile(res.data);
        alert('Profile updated successfully!');
      })
      .catch(err => console.error('Error updating profile:', err));
  };

  const handleWorkTimeUpdate = () => {
    const payload = {
  work_time_sun_thu: workTime.sunThuStart && workTime.sunThuEnd
    ? `${workTime.sunThuStart} - ${workTime.sunThuEnd}`
    : "Closed",
  work_time_fri: workTime.friStart && workTime.friEnd
    ? `${workTime.friStart} - ${workTime.friEnd}`
    : "Closed",
  work_time_sat: workTime.satStart && workTime.satEnd
    ? `${workTime.satStart} - ${workTime.satEnd}`
    : "Closed"
};
    api.patch(`profile/business/${profile.id}/`, payload)
      .then((res) => {
        setProfile(res.data);
        alert('Work time updated successfully!');
      })
      .catch(err => console.error('Error updating work time:', err));
  };

  const handleGalleryImageUpload = () => {
    const formData = new FormData();
    formData.append('image', newGalleryImage);
    api.post('gallery-images/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => {
        setGalleryImages([...galleryImages, res.data]);
        setNewGalleryImage(null);
      })
      .catch(err => console.error('Error uploading gallery image:', err));
  };

  const handleGalleryImageDelete = (id) => {
    api.delete(`gallery-images/${id}/`).then(() => {
      setGalleryImages(galleryImages.filter(img => img.id !== id));
    }).catch(err => console.error('Error deleting gallery image:', err));
  };

  const handleNewSaleChange = (e) => {
    const { name, value, files } = e.target;
    const val = name === 'image' ? files[0] : value;
    setNewSale({ ...newSale, [name]: val });
  };

  const handleEditSaleChange = (e) => {
    const { name, value, files } = e.target;
    const val = name === 'image' ? files[0] : value;
    setEditSaleData({ ...editSaleData, [name]: val });
  };

  const handleNewSaleSubmit = () => {
    const formData = new FormData();
    Object.entries(newSale).forEach(([key, val]) => { if (val) formData.append(key, val); });
    api.post('sales/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => {
        setSales([...sales, res.data]);
        setNewSale({ title: '', description: '', start_date: '', end_date: '', image: null });
      })
      .catch(err => console.error('Error adding new sale:', err));
  };

  const handleSaleDelete = (id) => {
    api.delete(`sales/${id}/`).then(() => {
      setSales(sales.filter(sale => sale.id !== id));
    }).catch(err => console.error('Error deleting sale:', err));
  };

  const handleSaleEdit = (sale) => {
    setEditSaleId(sale.id);
    setEditSaleData(sale);
  };

  const handleEditSaleSubmit = () => {
    const formData = new FormData();
    Object.entries(editSaleData).forEach(([key, val]) => { if (val) formData.append(key, val); });
    api.put(`sales/${editSaleId}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => {
        setSales(sales.map(s => s.id === editSaleId ? res.data : s));
        setEditSaleId(null);
        setEditSaleData({ title: '', description: '', start_date: '', end_date: '', image: null });
      })
      .catch(err => console.error('Error editing sale:', err));
  };

  if (!profile) return <div className="text-center mt-10 text-lg">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-xl space-y-10">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-3 text-gray-800">Business Profile</h2>
        {profile.profile_image && (
          <img src={profile.profile_image} alt="Profile" className="mx-auto w-32 h-32 rounded-full border-4 border-gray-300 shadow-md" />
        )}
      </div>

      <BusinessProfileForm initialData={profile} onSubmit={handleProfileUpdate} />

      <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-xl space-y-10">
      <div>
        <h3 className="text-2xl font-semibold mb-4">Business Work Time</h3>

        <div className="mb-3">
          <label className="block font-medium text-gray-700">Sunday–Thursday</label>
          <div className="flex gap-2">
            <input type="time" value={workTime.sunThuStart} onChange={(e) => setWorkTime({ ...workTime, sunThuStart: e.target.value })} className="p-2 border rounded" />
            <input type="time" value={workTime.sunThuEnd} onChange={(e) => setWorkTime({ ...workTime, sunThuEnd: e.target.value })} className="p-2 border rounded" />
          </div>
        </div>

        <div className="mb-3">
          <label className="block font-medium text-gray-700">Friday</label>
          <div className="flex gap-2">
            <input type="time" value={workTime.friStart} onChange={(e) => setWorkTime({ ...workTime, friStart: e.target.value })} className="p-2 border rounded" />
            <input type="time" value={workTime.friEnd} onChange={(e) => setWorkTime({ ...workTime, friEnd: e.target.value })} className="p-2 border rounded" />
          </div>
        </div>

        <div className="mb-3">
          <label className="block font-medium text-gray-700">Saturday</label>
          <div className="flex gap-2">
            <input type="time" value={workTime.satStart} onChange={(e) => setWorkTime({ ...workTime, satStart: e.target.value })} className="p-2 border rounded" />
            <input type="time" value={workTime.satEnd} onChange={(e) => setWorkTime({ ...workTime, satEnd: e.target.value })} className="p-2 border rounded" />
          </div>
        </div>

        <button onClick={handleWorkTimeUpdate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Save Work Time</button>
      </div>
    </div>

      <div>
        <h3 className="text-2xl font-semibold mb-4">Gallery</h3>
        <div className="flex gap-2 mb-4">
          <input type="file" onChange={(e) => setNewGalleryImage(e.target.files[0])} />
          <button onClick={handleGalleryImageUpload} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Upload</button>
        </div>
        <div className="flex flex-wrap gap-3">
          {galleryImages.map((img) => (
            <div key={img.id} className="relative group">
              <img src={img.image} alt="Gallery" className="w-32 h-32 object-cover rounded-lg border shadow" />
              <button onClick={() => handleGalleryImageDelete(img.id)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white text-sm px-2 rounded-full opacity-0 group-hover:opacity-100 transition">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-semibold mb-4">Add New Sale</h3>
        <div className="grid grid-cols-1 gap-3">
          <input type="text" name="title" placeholder="Title" value={newSale.title} onChange={handleNewSaleChange} className="border p-2 rounded" />
          <textarea name="description" placeholder="Description" value={newSale.description} onChange={handleNewSaleChange} className="border p-2 rounded" />
          <input type="date" name="start_date" value={newSale.start_date} onChange={handleNewSaleChange} className="border p-2 rounded" />
          <input type="date" name="end_date" value={newSale.end_date} onChange={handleNewSaleChange} className="border p-2 rounded" />
          <input type="file" name="image" onChange={handleNewSaleChange} className="border p-2 rounded" />
          <button onClick={handleNewSaleSubmit} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Add Sale</button>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-semibold mb-4">Current Sales</h3>
        <div className="space-y-4">
          {sales.map((sale) => (
            <div key={sale.id} className="bg-gray-50 border rounded-lg p-4 shadow relative">
              {editSaleId === sale.id ? (
                <div className="space-y-2">
                  <input type="text" name="title" value={editSaleData.title} onChange={handleEditSaleChange} className="w-full border p-2 rounded" />
                  <textarea name="description" value={editSaleData.description} onChange={handleEditSaleChange} className="w-full border p-2 rounded" />
                  <input type="date" name="start_date" value={editSaleData.start_date} onChange={handleEditSaleChange} className="w-full border p-2 rounded" />
                  <input type="date" name="end_date" value={editSaleData.end_date} onChange={handleEditSaleChange} className="w-full border p-2 rounded" />
                  <input type="file" name="image" onChange={handleEditSaleChange} className="w-full border rounded" />
                  
                  <div className="flex gap-2">
                    <button onClick={handleEditSaleSubmit} className="bg-blue-600 text-white px-4 py-1 rounded">Save</button>
                    <button onClick={() => setEditSaleId(null)} className="bg-gray-400 text-white px-4 py-1 rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="font-bold text-lg">{sale.title}</h4>
                  <p className="text-sm text-gray-700">{sale.description}</p>
                  <p className="text-sm text-gray-500">{sale.start_date} to {sale.end_date}</p>

<p className="text-sm text-blue-700">
  💾 Saved by {sale.favorites_count} visitor{sale.favorites_count === 1 ? '' : 's'}
</p>
<p className="text-sm text-green-700">
  💾 All time Saved by {sale.total_favorites ?? 0} visitor{(sale.total_favorites ?? 0) === 1 ? '' : 's'}
</p>

<<<<<<< HEAD

=======
>>>>>>> 0c8c190afb5c3d1a2f7e2bf1a1e50f901986222b
{sale.image && <img src={sale.image} alt="Sale" className="w-32 h-32 mt-2 rounded shadow-md object-cover" />}

                  <div className="absolute top-2 right-2 flex gap-1">
                    <button onClick={() => handleSaleEdit(sale)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">Edit</button>
                    <button onClick={() => handleSaleDelete(sale.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;