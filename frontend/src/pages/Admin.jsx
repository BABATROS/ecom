import { handleUpload } from '../utils/uploadHandler'; // Import มาใช้

const AdminPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const onSaveProduct = async () => {
    // 1. อัปโหลดไฟล์ก่อน เพื่อเอา Path มา
    const filePath = await handleUpload(selectedFile);
    
    if (filePath) {
      // 2. ส่งข้อมูลสินค้า + Path รูป/วิดีโอ ไปบันทึกลง MongoDB
      const productData = {
        name: "Nike Air Max",
        price: 5900,
        mediaUrl: filePath // Path ที่ได้จากขั้นตอนแรก
      };
      await axios.post('/api/products', productData);
      alert("บันทึกสินค้าเรียบร้อย!");
    }
  };

  return (
    <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
  );
};