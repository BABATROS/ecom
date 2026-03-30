import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, Mail, Shield, ChevronLeft, Loader2 } from 'lucide-react';
import { handleUpload } from '../utils/uploadHandler';

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || 'Member');
  const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || '');
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const BACKEND_URL = 'https://ecom-ghqt.onrender.com';

  useEffect(() => {
    if (!token) navigate('/login');
  }, [navigate, token]);

  useEffect(() => {
    if (profileImage) {
      setPreview(profileImage.startsWith('http') ? profileImage : `${BACKEND_URL}/${profileImage}`);
    } else {
      setPreview('');
    }
  }, [profileImage]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // แสดง loading หลอกๆ หรือจัดการ UI ระหว่างอัปโหลดได้ที่นี่
    const path = await handleUpload(file);
    if (path) {
      setProfileImage(path);
      alert('Media uploaded to server!');
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!userId) {
      alert('Session Expired. Please login again.');
      navigate('/login');
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put(`${BACKEND_URL}/api/auth/update-profile/${userId}`, {
        username: username.trim(),
        email: email.trim(),
        profileImage
      });

      const updatedUser = res.data.user;
      localStorage.setItem('username', updatedUser.username);
      localStorage.setItem('email', updatedUser.email);
      localStorage.setItem('profileImage', updatedUser.profileImage || '');
      
      alert('PROFILE UPDATED SUCCESSFULLY');
    } catch (err) {
      console.error('Update error:', err);
      alert(err.response?.data?.msg || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-red-600">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-white mb-10 transition-all font-black uppercase tracking-widest text-[10px]"
        >
          <ChevronLeft size={16} /> Back to Street
        </button>

        <div className="bg-zinc-900/40 backdrop-blur-3xl rounded-[3rem] border border-zinc-800/50 overflow-hidden shadow-2xl">
          
          {/* Header Section */}
          <div className="p-8 md:p-12 border-b border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Account Setup</h1>
              <p className="text-zinc-500 text-[10px] tracking-[0.3em] font-black uppercase mt-2 italic">Update your identity in the system</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 bg-red-600 px-8 py-4 rounded-2xl font-black italic uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-start">
              
              {/* Profile Image Column */}
              <div className="flex flex-col items-center space-y-6">
                <div className="relative group">
                  <div className="w-56 h-56 rounded-[3rem] overflow-hidden border-4 border-zinc-800 transition-all duration-500 group-hover:border-red-600 shadow-2xl">
                    {preview ? (
                      <img src={preview} alt="Profile" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-600">
                        <User size={80} />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-4 right-4 bg-red-600 p-4 rounded-2xl cursor-pointer hover:bg-white hover:text-black transition-all shadow-xl group-hover:rotate-12">
                    <Camera size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest italic">Member Identity</p>
                  <p className="text-sm font-bold mt-1 text-zinc-400">{username || 'Anonymous User'}</p>
                </div>
              </div>

              {/* Information Form */}
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Username Input */}
                <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800 group focus-within:border-red-600 transition-all">
                  <label className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic mb-4">
                    <User size={14} className="text-red-600" /> Display Name
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-transparent text-xl font-black italic uppercase text-white outline-none placeholder:text-zinc-800"
                  />
                </div>

                {/* Email Input */}
                <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800 group focus-within:border-red-600 transition-all">
                  <label className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic mb-4">
                    <Mail size={14} className="text-red-600" /> Connection Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-transparent text-xl font-black italic text-white outline-none placeholder:text-zinc-800"
                  />
                </div>

                {/* Role Badge (Read Only) */}
                <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800 flex justify-between items-center">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest italic mb-1">
                      <Shield size={14} className="text-red-600" /> Access Level
                    </label>
                    <p className="text-2xl font-black italic uppercase tracking-tighter text-white">{role}</p>
                  </div>
                  <div className="px-4 py-2 bg-red-600/10 border border-red-600/20 rounded-xl">
                    <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Verified Account</p>
                  </div>
                </div>

              </form>
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="bg-zinc-950/50 p-8 text-center border-t border-zinc-800/50">
             <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] italic">
               Encryption Active // All data stored in SNKR HUB Secure Vault
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;