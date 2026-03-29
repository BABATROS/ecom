import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save } from 'lucide-react';
import { handleUpload } from '../utils/uploadHandler';

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || 'User');
  const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || '');
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);

  useEffect(() => {
    if (profileImage) {
      setPreview(profileImage.startsWith('http') ? profileImage : `https://ecom-ghqt.onrender.com/${profileImage}`);
    } else {
      setPreview('');
    }
  }, [profileImage]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const path = await handleUpload(file);
    if (path) {
      setProfileImage(path);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert('ไม่พบข้อมูลผู้ใช้งาน กรุณาล็อกอินใหม่');
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put(`https://ecom-ghqt.onrender.com/api/auth/update-profile/${userId}`, {
        username: username.trim(),
        email: email.trim(),
        profileImage
      });

      const updatedUser = res.data.user;
      localStorage.setItem('username', updatedUser.username);
      localStorage.setItem('email', updatedUser.email);
      localStorage.setItem('profileImage', updatedUser.profileImage || '');
      alert('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
    } catch (err) {
      console.error('Profile update error:', err.response?.data || err);
      alert(err.response?.data?.msg || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-slate-100 text-slate-900">
      <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 bg-white p-10 shadow-lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black">Edit Profile</h1>
            <p className="text-zinc-500">ปรับแต่งรูปโปรไฟล์และข้อมูลบัญชีของคุณ</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-500 transition disabled:opacity-50"
          >
            <Save size={18} /> {saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-[220px_1fr] items-start">
            <div className="space-y-4">
              <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 bg-slate-50">
                {preview ? (
                  <img src={preview} alt="Profile" className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-slate-100 text-slate-500">
                    <User size={64} />
                  </div>
                )}
              </div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-600 hover:border-red-500 hover:text-slate-900 transition">
                <Camera size={18} /> เปลี่ยนรูปโปรไฟล์
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-3 w-full bg-white p-4 rounded-2xl border border-slate-200 text-slate-900 outline-none focus:border-red-500"
                />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-3 w-full bg-white p-4 rounded-2xl border border-slate-200 text-slate-900 outline-none focus:border-red-500"
                />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{role}</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
