# Expense Apps – Backend (Express.js)

Aplikasi ini merupakan backend dari **Expense Apps**, yaitu aplikasi sederhana untuk mencatat pemasukan dan pengeluaran.
Backend dibangun menggunakan **Node.js + Express.js**, dan frontend menggunakan **HTML, JavaScript Vanilla, serta TailwindCSS**.

---

## Fitur Utama

* Register & Login (User Authentication)
* CRUD Transaksi (Tambah, Edit, Hapus, Tampilkan)
* JWT Authentication
* Validasi input
* Struktur API sederhana & mudah digunakan

---

## Teknologi yang Digunakan

* **Node.js**
* **Express.js**
* **MySQL** (default)
* **JWT** (JSON Web Token)
* **bcryptjs**
* **dotenv**

---

##  Struktur Folder

```
expense-apps/
├── controllers/
├── middleware/
├── routes/
├── models/
├── public/            # berisi login.html, dashboard, script JS, CSS, dll
├── node_modules/
├── .env
├── .gitignore
├── package.json
└── app.js
```

---

##  Cara Instalasi

### 1 Clone repository

```bash
git clone https://github.com/opan27/expense-apps.git
cd expense-apps
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Buat file `.env` di root project

Isi file `.env` dengan konfigurasi berikut:

```
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=nama_database
```

> Pastikan database dengan nama yang kamu isi telah dibuat di MySQL.

---

## Menjalankan Aplikasi

Jalankan backend dengan:

```bash
node app.js
```

Jika berhasil, server berjalan di:

```
http://localhost:3000
```

Untuk membuka halaman login frontend (HTML):

```
http://localhost:3000/login.html
```

---

##  Contoh Endpoint API

### Auth

| Method | Endpoint       | Deskripsi                      |
| ------ | -------------- | ------------------------------ |
| POST   | /auth/register | Register user baru             |
| POST   | /auth/login    | Login user dan mendapatkan JWT |

### expense

| Method | Endpoint          | Deskripsi             |
| ------ | ----------------- | --------------------- |
| GET    | /expense          | Ambil semua expense   |
| POST   | /expense          | Tambah expense        |
| PUT    | /expense/:id      | Update transaksi      |
| DELETE | /eexpense/:id     | Hapus transaksi       |
### income

| Method | Endpoint          | Deskripsi             |
| ------ | ----------------- | --------------------- |
| GET    | /income           | Ambil semua income    |
| POST   | /income           | Tambah income         |
| PUT    | /income/:id       | Update income         |
| DELETE | /income/:id       | Hapus  income         |

Gunakan header berikut untuk endpoint yang butuh login:

```
Authorization: Bearer <token>
```

---

##  Lisensi

Aplikasi ini dibuat untuk keperluan **Tugas Besar Pemrograman Fullstack**.
Bebas digunakan dan dimodifikasi untuk kebutuhan pembelajaran.

---


