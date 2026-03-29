/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // สำคัญมาก: เพื่อให้ Tailwind หา class ในไฟล์ React เจอ
  ],
  theme: {
    extend: {
      colors: {
        'sneaker-black': '#121212',
        'sneaker-card': '#1f1f1f',
        'sneaker-accent': '#00FF41', // สีเขียวนีออนสำหรับปุ่มหรือราคา
      },
    },
  },
  plugins: [],
}