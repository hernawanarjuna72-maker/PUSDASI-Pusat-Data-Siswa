// --- DATABASE SIMULASI (LocalStorage) ---
let studentsData = JSON.parse(localStorage.getItem('pusdasi_students')) || [];
let currentUser = JSON.parse(localStorage.getItem('pusdasi_currentUser')) || null;
let currentOTP = "";
let otpTimerInterval;

// --- PENGECEKAN SESI SAAT HALAMAN DIMUAT (Auto-Login Bypass) ---
window.onload = () => {
    if (currentUser) {
        loadStudentHome(currentUser);
        showPage('student-home-container');
    } else {
        showPage('auth-container');
    }
};

// --- LOGIKA NAVIGASI HALAMAN (Efek Animasi Fade-In) ---
function showPage(pageId) {
    document.querySelectorAll('.page-view').forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        void targetPage.offsetWidth; // Memicu ulang reflow animasi CSS
        targetPage.classList.add('active');
    }
}

function switchAuth(type) {
    if (type === 'register') {
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('register-box').style.display = 'block';
    } else {
        document.getElementById('register-box').style.display = 'none';
        document.getElementById('login-box').style.display = 'block';
    }
}

// --- SHORTCUT MENU ADMIN (Ketuk logo PUSDASI 3 kali) ---
let logoClicks = 0;
document.getElementById('pusdasi-logo-container').addEventListener('click', () => {
    logoClicks++;
    if (logoClicks >= 3) {
        showPage('admin-login-container');
        logoClicks = 0; 
    }
});

// --- SISTEM SIMULASI KODE OTP (Refresh Otomatis 30 Detik) ---
function generateOTP(prefix) {
    clearInterval(otpTimerInterval);
    currentOTP = Math.floor(100000 + Math.random() * 900000).toString(); 
    
    document.getElementById(`simulated-otp-${prefix}`).innerText = `[Simulasi Email] Kode Anda: ${currentOTP}`;
    
    let timeLeft = 30;
    document.getElementById(`timer-${prefix}`).innerText = timeLeft;
    
    otpTimerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById(`timer-${prefix}`).innerText = timeLeft;
        if (timeLeft <= 0) {
            generateOTP(prefix); 
        }
    }, 1000);
}
document.getElementById('btn-req-otp-login').addEventListener('click', () => generateOTP('login'));
document.getElementById('btn-req-otp-reg').addEventListener('click', () => generateOTP('reg'));


// --- PROSES REGISTRASI SISWA BARU (Validasi Ganda & Langsung Ke Beranda) ---
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('reg-otp').value !== currentOTP) {
        alert("Kode OTP salah atau sudah kadaluarsa!");
        return;
    }

    const inputEmail = document.getElementById('reg-email').value;
    const inputNisn = document.getElementById('reg-nisn').value;

    // VALIDASI DATA UNIK (Hanya 1 data yang sama untuk Email & NISN)
    const isDuplicate = studentsData.find(s => s.email === inputEmail || s.nisn === inputNisn);
    if (isDuplicate) {
        if (isDuplicate.email === inputEmail) {
            alert("Registrasi Gagal: Email ini sudah terdaftar!");
        } else {
            alert("Registrasi Gagal: NISN ini sudah terdaftar milik siswa lain!");
        }
        return; 
    }

    const newStudent = {
        id: Date.now().toString(),
        name: document.getElementById('reg-name').value,
        email: inputEmail,
        nisn: inputNisn,
        dob: document.getElementById('reg-dob').value,
        notes: "Siswa baru terdaftar secara mandiri. Belum ada catatan dari Otoritas Akademik.",
        photo: null,
        photoPosition: "center"
    };

    studentsData.push(newStudent);
    localStorage.setItem('pusdasi_students', JSON.stringify(studentsData));
    
    // Set Sesi Login (Siswa Baru Langsung Masuk Beranda Tanpa Halaman Login)
    currentUser = newStudent;
    localStorage.setItem('pusdasi_currentUser', JSON.stringify(currentUser));
    
    clearInterval(otpTimerInterval);
    document.getElementById('register-form').reset();
    document.getElementById('simulated-otp-reg').innerText = "";
    
    loadStudentHome(currentUser);
    showPage('student-home-container');
});

// --- PROSES LOGIN SISWA ---
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('login-otp').value !== currentOTP) {
        alert("Kode OTP salah atau sudah kadaluarsa!");
        return;
    }

    const email = document.getElementById('login-email').value;
    const nisn = document.getElementById('login-nisn').value;
    const dob = document.getElementById('login-dob').value;
    
    const student = studentsData.find(s => s.email === email && s.nisn === nisn && s.dob === dob);

    if (student) {
        currentUser = student;
        localStorage.setItem('pusdasi_currentUser', JSON.stringify(currentUser));
        
        clearInterval(otpTimerInterval);
        document.getElementById('login-form').reset();
        document.getElementById('simulated-otp-login').innerText = "";
        
        loadStudentHome(currentUser);
        showPage('student-home-container');
    } else {
        alert("Data tidak ditemukan! Periksa kembali Email, NISN, dan Tanggal Lahir.");
    }
});

// --- MEMUAT DATA IDENTITAS KE BERANDA ---
function loadStudentHome(student) {
    document.getElementById('display-name').innerText = student.name;
    document.getElementById('display-nisn').innerText = student.nisn;
    document.getElementById('display-dob').innerText = new Date(student.dob).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
    document.getElementById('display-notes').innerText = student.notes;

    const imgElement = document.getElementById('display-photo');
    const placeholderText = document.getElementById('photo-text');
    
    if (student.photo) {
        imgElement.src = student.photo;
        imgElement.style.objectPosition = student.photoPosition || 'center';
        imgElement.style.display = 'block';
        placeholderText.style.display = 'none';
    } else {
        imgElement.style.display = 'none';
        placeholderText.style.display = 'block';
    }
}

// --- BURGER MENU ANIMATION & LOGOUT ---
const burgerMenu = document.getElementById('burger-menu');
const navLinks = document.getElementById('nav-links');
burgerMenu.addEventListener('click', () => { 
    burgerMenu.classList.toggle('active'); 
    navLinks.classList.toggle('active'); 
});

document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    currentUser = null; 
    localStorage.removeItem('pusdasi_currentUser');
    burgerMenu.classList.remove('active'); 
    navLinks.classList.remove('active');
    showPage('auth-container');
});


// --- OTORITAS HALAMAN PANEL ADMIN ---
document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if(document.getElementById('admin-username').value === 'admin' && 
       document.getElementById('admin-password').value === 'admin123') {
        loadAdminTable(); 
        showPage('admin-dashboard-container'); 
        document.getElementById('admin-login-form').reset();
    } else { 
        alert("Kredensial Admin Salah!"); 
    }
});

function loadAdminTable() {
    const tbody = document.getElementById('students-table-body');
    tbody.innerHTML = '';
    
    studentsData.forEach(student => {
        let photoHtml = student.photo 
            ? `<img src="${student.photo}" class="admin-table-photo" style="object-position: ${student.photoPosition || 'center'};">` 
            : `<div class="admin-table-photo" style="background:#eee; display:flex; align-items:center; justify-content:center; font-size:10px; color:#777;">No Pic</div>`;

        const row = `<tr>
            <td>${photoHtml}</td>
            <td><strong>${student.name}</strong></td>
            <td>${student.nisn}</td>
            <td>${student.email}</td>
            <td>${student.dob}</td>
            <td>${student.notes}</td>
            <td>
                <button class="btn-edit" onclick="openAdminModal('${student.id}')">Edit</button>
                <button class="btn-danger" onclick="adminDeleteStudent('${student.id}')">Hapus</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// --- LOGIKA POP-UP MODAL PANEL ADMIN (TAMBAH & EDIT DATA BERFOTO) ---
function openAdminModal(studentId = '') {
    const adminModal = document.getElementById('admin-modal');
    const form = document.getElementById('admin-modal-form');

    if (!adminModal || !form) return;
    form.reset(); 

    // Jika studentId berupa teks string valid, artinya masuk mode EDIT DATA
    if (studentId && typeof studentId === 'string') {
        document.getElementById('modal-title').innerText = "Edit Otoritas Data Siswa";
        const s = studentsData.find(x => x.id === studentId);
        if (s) {
            document.getElementById('modal-id').value = s.id;
            document.getElementById('modal-name').value = s.name;
            document.getElementById('modal-email').value = s.email;
            document.getElementById('modal-nisn').value = s.nisn;
            document.getElementById('modal-dob').value = s.dob;
            document.getElementById('modal-notes').value = s.notes;
            document.getElementById('modal-position').value = s.photoPosition || 'center';
        }
    } else {
        // Jika parameter kosong, artinya masuk mode TAMBAH DATA BARU
        document.getElementById('modal-title').innerText = "Tambah Siswa Baru Oleh Admin";
        document.getElementById('modal-id').value = "";
    }
    adminModal.classList.add('active');
}

function closeAdminModal() {
    const adminModal = document.getElementById('admin-modal');
    if (adminModal) adminModal.classList.remove('active');
}

// Proses submit data (Tambah / Edit) dari Pop-up Admin
document.getElementById('admin-modal-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('modal-id').value;
    const name = document.getElementById('modal-name').value;
    const email = document.getElementById('modal-email').value;
    const nisn = document.getElementById('modal-nisn').value;
    const dob = document.getElementById('modal-dob').value;
    const notes = document.getElementById('modal-notes').value;
    const position = document.getElementById('modal-position').value;
    const fileInput = document.getElementById('modal-photo');

    // Validasi pencegahan data kembar/duplikat
    const isDup = studentsData.find(s => (s.email === email || s.nisn === nisn) && s.id !== id);
    if (isDup) {
        alert(isDup.email === email ? "Gagal: Email sudah terdaftar!" : "Gagal: NISN sudah terdaftar!");
        return;
    }

    const saveAction = (photoBase64) => {
        try {
            if (id) {
                // Mode Update / Edit
                const index = studentsData.findIndex(s => s.id === id);
                studentsData[index].name = name;
                studentsData[index].email = email;
                studentsData[index].nisn = nisn;
                studentsData[index].dob = dob;
                studentsData[index].notes = notes;
                studentsData[index].photoPosition = position;
                if (photoBase64 !== null) studentsData[index].photo = photoBase64;
                
                if (currentUser && currentUser.id === id) {
                    currentUser = studentsData[index];
                    localStorage.setItem('pusdasi_currentUser', JSON.stringify(currentUser));
                }
            } else {
                // Mode Tambah Baru
                studentsData.push({
                    id: Date.now().toString(),
                    name, email, nisn, dob, notes,
                    photo: photoBase64,
                    photoPosition: position
                });
            }

            localStorage.setItem('pusdasi_students', JSON.stringify(studentsData));
            closeAdminModal();
            loadAdminTable();
            alert("Data Integrasi Siswa Berhasil Disimpan!");

        } catch (err) {
            alert("Memori Penuh! Ukuran file foto terlalu besar untuk simulasi browser. Harap gunakan foto dengan ukuran lebih kecil (di bawah 500 KB).");
        }
    };

    // Memproses konversi file gambar ke teks base64
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(ev) { saveAction(ev.target.result); };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveAction(null); 
    }
});

// Fitur Menghapus Data Siswa Secara Permanen
function adminDeleteStudent(id) {
    const s = studentsData.find(x => x.id === id);
    if (!s) return;

    if (confirm(`Apakah Anda yakin ingin menghapus seluruh data siswa dari "${s.name}" secara permanen?`)) {
        studentsData = studentsData.filter(x => x.id !== id);
        localStorage.setItem('pusdasi_students', JSON.stringify(studentsData));
        
        if (currentUser && currentUser.id === id) {
            currentUser = null; 
            localStorage.removeItem('pusdasi_currentUser');
        }
        loadAdminTable();
        alert("Data siswa berhasil dihapus.");
    }
}

function logoutAdmin() { showPage('auth-container'); }