import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, Trash2, Package, Upload, Edit3 } from 'lucide-react';

const API_URL = 'https://ecom-ghqt.onrender.com/api/products';
const IMAGE_BASE_URL = 'https://ecom-ghqt.onrender.com/uploads/';

const AdminProductManager = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [newProduct, setNewProduct] = useState({ 
        name: '', 
        price: '', 
        description: '', 
        stock: '1', 
        brand: '' 
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            alert("กรุณาเข้าสู่ระบบ");
            navigate('/login');
            return;
        }
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/my-products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(res.data);
        } catch (err) {
            console.error("Fetch error:", err);
            if(err.response?.status === 401) alert("เซสชั่นหมดอายุ กรุณา Login ใหม่");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        Object.keys(newProduct).forEach(key => data.append(key, newProduct[key]));
        if (selectedImage) data.append('images', selectedImage);

        try {
            await axios.post(API_URL, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' 
                }
            });
            alert("✅ เพิ่มสินค้าเรียบร้อย!");
            setNewProduct({ name: '', price: '', description: '', stock: '1', brand: '' });
            setPreview(null);
            setSelectedImage(null);
            fetchProducts(); 
        } catch (err) {
            alert("❌ เพิ่มไม่สำเร็จ: " + (err.response?.data?.error || "เกิดข้อผิดพลาด"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("ยืนยันการลบสินค้าชิ้นนี้?")) {
            try {
                await axios.delete(`${API_URL}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProducts(products.filter(p => p._id !== id));
                alert("🗑️ ลบสินค้าเรียบร้อย");
            } catch (err) {
                alert("ลบไม่สำเร็จ: " + (err.response?.data?.msg || "ไม่มีสิทธิ์ลบ"));
            }
        }
    };

    if (loading) return (
        <div className="bg-black min-h-screen flex flex-col items-center justify-center text-red-600">
            <Loader2 className="animate-spin mb-4" size={48} />
            <span className="font-black italic uppercase text-2xl">Loading Your Inventory...</span>
        </div>
    );

    return (
        <div className="bg-black min-h-screen text-white pb-20">
            <main className="container mx-auto p-8 pt-32">
                <h1 className="text-6xl font-black italic uppercase mb-12">
                    MY <span className="text-red-600">INVENTORY</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* ฝั่งซ้าย: Form */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32 bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] backdrop-blur-xl">
                            <h2 className="text-xl font-black mb-6 uppercase italic tracking-tighter">Add New Drop</h2>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <input 
                                    className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-600 transition-all" 
                                    placeholder="Product Name" 
                                    value={newProduct.name} 
                                    onChange={(e)=>setNewProduct({...newProduct, name: e.target.value})} 
                                    required 
                                />
                                <input 
                                    className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-600 transition-all" 
                                    placeholder="Brand (e.g. Nike, Adidas)" 
                                    value={newProduct.brand} 
                                    onChange={(e)=>setNewProduct({...newProduct, brand: e.target.value})} 
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-600 transition-all" 
                                        placeholder="Price (฿)" type="number" 
                                        value={newProduct.price} 
                                        onChange={(e)=>setNewProduct({...newProduct, price: e.target.value})} 
                                        required 
                                    />
                                    <input 
                                        className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-600 transition-all" 
                                        placeholder="Stock" type="number" 
                                        value={newProduct.stock} 
                                        onChange={(e)=>setNewProduct({...newProduct, stock: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <textarea 
                                    className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-red-600 transition-all resize-none h-24" 
                                    placeholder="Product Description..." 
                                    value={newProduct.description} 
                                    onChange={(e)=>setNewProduct({...newProduct, description: e.target.value})} 
                                    required 
                                ></textarea>

                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl p-6 cursor-pointer hover:border-red-600 transition-all bg-black/50 group">
                                    {preview ? (
                                        <img src={preview} className="h-32 object-cover rounded-xl mb-2" alt="preview" />
                                    ) : (
                                        <Upload className="text-zinc-500 mb-2 group-hover:text-red-600" />
                                    )}
                                    <span className="text-[10px] font-black uppercase text-zinc-500">Upload Image</span>
                                    <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                                </label>

                                <button 
                                    disabled={isSubmitting}
                                    className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase italic hover:bg-white hover:text-black transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? "PUBLISHING..." : "PUBLISH NOW"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ฝั่งขวา: Product List */}
                    <div className="lg:col-span-8">
                        {products.length === 0 ? (
                            <div className="text-zinc-600 text-center py-20 border-2 border-dashed border-zinc-900 rounded-[3rem]">
                                <Package size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-black uppercase italic text-xl">No items yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {products.map((product) => (
                                    <div key={product._id} className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-5 group hover:border-zinc-700 transition-all flex flex-col">
                                        <div className="aspect-square rounded-2xl overflow-hidden bg-black mb-6 relative">
                                            <img 
                                                src={product.images?.[0]?.startsWith('http') ? product.images[0] : `${IMAGE_BASE_URL}${product.images?.[0]}`} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                                                alt={product.name}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400' }}
                                            />
                                            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                                <span className="text-[10px] font-black text-white uppercase">Stock: {product.stock}</span>
                                            </div>
                                            {product.brand && (
                                                <div className="absolute top-4 right-4 bg-red-600/80 px-3 py-1 rounded-full border border-red-500/50">
                                                    <span className="text-[10px] font-black text-white uppercase">{product.brand}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black uppercase italic truncate">{product.name}</h3>
                                            <p className="text-zinc-500 text-xs mt-1 mb-3 line-clamp-2">{product.description}</p>
                                            <p className="text-red-600 font-black text-xl mb-4">฿{Number(product.price).toLocaleString()}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => navigate(`/edit-product/${product._id}`)}
                                                className="flex-1 bg-white text-black py-3 rounded-xl font-black uppercase text-[10px] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                <Edit3 size={14} /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product._id)} 
                                                className="p-3 bg-zinc-800 text-zinc-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminProductManager;