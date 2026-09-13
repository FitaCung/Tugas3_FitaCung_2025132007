// 1. MENGAMBIL ELEMENT DARI HTML

const formPesanan = document.getElementById("formPesanan");
const hasilTransaksi = document.getElementById("hasilTransaksi");
const tabelRiwayat = document.getElementById("tabelRiwayat");
const waktuSekarang = document.getElementById("waktuSekarang");
const kategoriPelanggan = document.getElementById("kategoriPelanggan");
const metodePesanan = document.getElementById("metode");

// 2. VARIABLE DAN ARRAY

// Ambil riwayat dari localStorage.
// Jika belum ada data, gunakan array kosong.
let riwayatPesanan =
    JSON.parse(localStorage.getItem("riwayatPesanan")) || [];

// Diskon member 5%
const diskonMember = 0.05;

// Pajak 11%
const pajak = 0.11;

// Nomor transaksi dilanjutkan dari localStorage
let nomorTransaksi =
    Number(localStorage.getItem("nomorTransaksi")) || 1;

// 3. FUNCTION FORMAT RUPIAH

function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);
}

// 4. FUNCTION MENGHITUNG SUBTOTAL

function hitungSubtotal(harga, jumlah) {
    return harga * jumlah;
}

// 5. FUNCTION NAMA METODE PESANAN

function namaMetode(metode) {
    switch (metode) {
        case "dine-in":
            return "Makan di Tempat";

        case "takeaway":
            return "Dibungkus / Take Away";

        default:
            return metode;
    }
}

// 6. FUNCTION KATEGORI PELANGGAN

function namaKategori(kategori) {
    switch (kategori) {
        case "member":
            return "Member";

        case "umum":
            return "Umum";

        default:
            return kategori;
    }
}

// 7. FUNCTION MEMBUAT ID TRANSAKSI

function buatIdTransaksi() {
    const sekarang = new Date();

    const tahun = sekarang.getFullYear();

    const bulan = String(
        sekarang.getMonth() + 1
    ).padStart(2, "0");

    const tanggal = String(
        sekarang.getDate()
    ).padStart(2, "0");

    const nomor = String(nomorTransaksi).padStart(3, "0");

    return `WS-${tahun}${bulan}${tanggal}-${nomor}`;
}

// 8. FUNCTION FORMAT WAKTU

function formatWaktu(tanggal) {
    return new Date(tanggal).toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

// 9. FUNCTION MENAMPILKAN ERROR

function tampilkanError(pesan) {
    if (!hasilTransaksi) {
        alert(pesan);
        return;
    }

    hasilTransaksi.innerHTML = `
        <div class="transaction-error">
            ${pesan}
        </div>
    `;

    hasilTransaksi.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// 10. FUNCTION VALIDASI NOMOR TELEPON

function validasiNomorTelepon(nomor) {
    // Nomor hanya boleh berisi angka
    const polaAngka = /^[0-9]+$/;

    if (!polaAngka.test(nomor)) {
        return "Nomor telepon hanya boleh berisi angka.";
    }

    // Nomor Indonesia harus dimulai dengan 08
    if (!nomor.startsWith("08")) {
        return "Nomor telepon harus diawali dengan 08.";
    }

    // Panjang nomor
    if (nomor.length < 10 || nomor.length > 13) {
        return "Nomor telepon harus terdiri dari 10–13 digit.";
    }

    return "";
}

// 11. FUNCTION MENGAMBIL SEMUA MENU YANG DIPILIH

function ambilMenuDipilih() {
    const menuDipilih = [];

    const semuaCheckbox = document.querySelectorAll(
        '.order-table input[type="checkbox"]'
    );

    semuaCheckbox.forEach(function (checkbox) {
        // Hanya proses menu yang dicentang
        if (!checkbox.checked) {
            return;
        }

        // Checkbox berada di dalam <tr>
        const baris = checkbox.closest("tr");

        if (!baris) {
            return;
        }

        // Ambil nama menu
        const namaElement = baris.querySelector(
            ".order-item-name span"
        );

        // Ambil harga
        const hargaElement = baris.querySelector(".price");

        // Ambil jumlah
        const jumlahElement = baris.querySelector(".qty-input");

        // Jika struktur HTML tidak lengkap
        if (!namaElement || !hargaElement || !jumlahElement) {
            return;
        }

        const nama = namaElement.textContent.trim();

        // Ubah harga menjadi angka
        const harga = Number(
            hargaElement.textContent.replace(/[^0-9]/g, "")
        );

        const jumlah = Number(jumlahElement.value);

        // Validasi harga
        if (isNaN(harga) || harga <= 0) {
            return;
        }

        // Validasi jumlah
        if (!Number.isInteger(jumlah) || jumlah < 1) {
            return;
        }

        // Hitung subtotal
        const subtotal = hitungSubtotal(harga, jumlah);

        // Object menu
        const menu = {
            nama: nama,
            harga: harga,
            jumlah: jumlah,
            subtotal: subtotal
        };

        // Masukkan ke array
        menuDipilih.push(menu);
    });

    return menuDipilih;
}

// 12. VALIDASI SEMUA INPUT

function validasiForm(
    nama,
    telepon,
    metode,
    meja,
    menuDipilih
) {
    // Validasi nama
    if (nama.trim() === "") {
        return "Nama pelanggan wajib diisi.";
    }

    if (nama.trim().length < 2) {
        return "Nama pelanggan minimal 2 karakter.";
    }

    if (/^[0-9]+$/.test(nama.trim())) {
        return "Nama pelanggan harus berupa nama, bukan angka.";
    }

    // Validasi telepon
    if (telepon.trim() === "") {
        return "Nomor telepon wajib diisi.";
    }

    const errorTelepon = validasiNomorTelepon(
        telepon.trim()
    );

    if (errorTelepon !== "") {
        return errorTelepon;
    }

    // Validasi metode
    if (metode === "") {
        return "Silakan pilih metode pesanan.";
    }

    // Validasi nomor meja
    if (metode === "dine-in") {
        if (meja.trim() === "") {
            return "Nomor meja wajib diisi untuk makan di tempat.";
        }
    }

    // Validasi menu
    if (menuDipilih.length === 0) {
        return "Silakan pilih minimal satu menu.";
    }

    // Validasi setiap menu
    for (const menu of menuDipilih) {
        if (isNaN(menu.harga) || menu.harga <= 0) {
            return `Harga ${menu.nama} tidak valid.`;
        }

        if (!Number.isInteger(menu.jumlah)) {
            return `Jumlah ${menu.nama} harus berupa angka bulat.`;
        }

        if (menu.jumlah < 1) {
            return `Jumlah ${menu.nama} minimal 1.`;
        }
    }

    return "";
}

// 13. FUNCTION MENYIMPAN RIWAYAT

function simpanRiwayat() {
    localStorage.setItem(
        "riwayatPesanan",
        JSON.stringify(riwayatPesanan)
    );

    localStorage.setItem(
        "nomorTransaksi",
        nomorTransaksi
    );
}

// 14. FUNCTION MEMASUKKAN TRANSAKSI KE TABEL RIWAYAT

function tambahKeTabel(data) {
    // Satu transaksi = satu baris
    const baris = document.createElement("tr");

    // ID TRANSAKSI
    const kolomId = document.createElement("td");
    kolomId.textContent = data.id;

    // WAKTU
    const kolomWaktu = document.createElement("td");
    kolomWaktu.textContent = formatWaktu(data.waktu);

    // PELANGGAN
    const kolomPelanggan = document.createElement("td");
    kolomPelanggan.textContent = data.nama;

    // MENU
    const kolomMenu = document.createElement("td");
    let daftarMenu = "";

    data.menu.forEach(function (menu, index) {
        if (index > 0) {
            daftarMenu += "<br>";
        }

        daftarMenu +=
            `${menu.nama} (${menu.jumlah} × ${formatRupiah(menu.harga)})`;
    });

    kolomMenu.innerHTML = daftarMenu;

    // TOTAL JUMLAH ITEM
    const kolomJumlah = document.createElement("td");
    let totalJumlahItem = 0;

    data.menu.forEach(function (menu) {
        totalJumlahItem += menu.jumlah;
    });

    kolomJumlah.textContent = totalJumlahItem;

    // SUBTOTAL
    const kolomSubtotal = document.createElement("td");
    kolomSubtotal.textContent = formatRupiah(data.subtotal);

    // DISKON
    const kolomDiskon = document.createElement("td");
    kolomDiskon.textContent = formatRupiah(data.diskon);

    // PAJAK
    const kolomPajak = document.createElement("td");
    kolomPajak.textContent = formatRupiah(data.nilaiPajak);

    // TOTAL
    const kolomTotal = document.createElement("td");
    kolomTotal.textContent = formatRupiah(data.total);

    // METODE
    const kolomMetode = document.createElement("td");
    kolomMetode.textContent = namaMetode(data.metode);

    // MASUKKAN SEMUA KOLOM
    baris.appendChild(kolomId);
    baris.appendChild(kolomWaktu);
    baris.appendChild(kolomPelanggan);
    baris.appendChild(kolomMenu);
    baris.appendChild(kolomJumlah);
    baris.appendChild(kolomSubtotal);
    baris.appendChild(kolomDiskon);
    baris.appendChild(kolomPajak);
    baris.appendChild(kolomTotal);
    baris.appendChild(kolomMetode);

    // Masukkan transaksi ke tabel
    tabelRiwayat.appendChild(baris);
}

// 15. FUNCTION MEMUAT RIWAYAT SAAT REFRESH

function muatRiwayat() {
    riwayatPesanan.forEach(function (transaksi) {
        // JSON menyimpan Date sebagai teks
        transaksi.waktu = new Date(transaksi.waktu);

        tambahKeTabel(transaksi);
    });
}

// 16. MENGATUR NOMOR MEJA

function aturNomorMeja() {
    const inputMeja = document.getElementById("meja");

    if (!inputMeja) {
        return;
    }

    if (
        metodePesanan &&
        metodePesanan.value === "dine-in"
    ) {
        inputMeja.disabled = false;
        inputMeja.required = true;
    } else {
        inputMeja.disabled = true;
        inputMeja.required = false;
        inputMeja.value = "";
    }
}

// 17. JAM REAL-TIME

function perbaruiJam() {
    if (!waktuSekarang) {
        return;
    }

    const sekarang = new Date();

    waktuSekarang.textContent =
        sekarang.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
}

// Jalankan pertama kali
perbaruiJam();

// Update setiap satu detik
setInterval(perbaruiJam, 1000);

// 18. EVENT METODE PESANAN

if (metodePesanan) {
    metodePesanan.addEventListener(
        "change",
        aturNomorMeja
    );

    aturNomorMeja();
}

// 19. VALIDASI INPUT JUMLAH

const semuaInputJumlah = document.querySelectorAll(
    ".qty-input"
);

semuaInputJumlah.forEach(function (input) {
    input.addEventListener(
        "input",
        function () {
            let jumlah = Number(input.value);

            // Jika kosong
            if (input.value === "") {
                return;
            }

            // Jika bukan angka
            if (isNaN(jumlah)) {
                input.value = 1;
                return;
            }

            // Jika desimal
            if (!Number.isInteger(jumlah)) {
                input.value = Math.floor(jumlah);
            }

            // Jumlah minimal 1
            if (Number(input.value) < 1) {
                input.value = 1;
            }
        }
    );
});

// 20. EVENT CHECKBOX MENU

const semuaCheckboxMenu = document.querySelectorAll(
    '.order-table input[type="checkbox"]'
);

semuaCheckboxMenu.forEach(function (checkbox) {
    checkbox.addEventListener(
        "change",
        function () {
            if (!checkbox.checked) {
                return;
            }

            const baris = checkbox.closest("tr");

            if (!baris) {
                return;
            }

            const inputJumlah = baris.querySelector(
                ".qty-input"
            );

            if (!inputJumlah) {
                return;
            }

            // Saat menu dipilih, jumlah minimal menjadi 1
            if (
                inputJumlah.value === "" ||
                Number(inputJumlah.value) < 1
            ) {
                inputJumlah.value = 1;
            }
        }
    );
});

// 21. EVENT SUBMIT FORM

if (formPesanan) {
    formPesanan.addEventListener(
        "submit",
        function (event) {
            // Mencegah halaman refresh
            event.preventDefault();

            // Ambil data pelanggan
            const nama = document.getElementById(
                "nama"
            ).value.trim();

            const telepon = document.getElementById(
                "telepon"
            ).value.trim();

            const metode = document.getElementById(
                "metode"
            ).value;

            const inputMeja = document.getElementById(
                "meja"
            );

            const meja = inputMeja
                ? inputMeja.value.trim()
                : "";

            const inputCatatan = document.getElementById(
                "catatan"
            );

            const catatan = inputCatatan
                ? inputCatatan.value.trim()
                : "";

            const kategori = kategoriPelanggan
                ? kategoriPelanggan.value
                : "umum";

            // Ambil menu yang dipilih
            const menuDipilih = ambilMenuDipilih();

            // Validasi
            const pesanError = validasiForm(
                nama,
                telepon,
                metode,
                meja,
                menuDipilih
            );

            if (pesanError !== "") {
                tampilkanError(pesanError);
                return;
            }

            // Hapus pesan error sebelumnya
            if (hasilTransaksi) {
                hasilTransaksi.innerHTML = "";
            }

            // Hitung subtotal
            let subtotal = 0;

            menuDipilih.forEach(function (menu) {
                subtotal += menu.subtotal;
            });

            // Hitung diskon
            let diskon = 0;

            // Member mendapat diskon 5%
            if (kategori === "member") {
                diskon = subtotal * diskonMember;
            }

            // Umum mendapat diskon jika subtotal minimal Rp100.000
            else if (subtotal >= 100000) {
                diskon = subtotal * diskonMember;
            }

            // Hitung pajak
            const setelahDiskon = subtotal - diskon;

            const nilaiPajak = setelahDiskon * pajak;

            const total = setelahDiskon + nilaiPajak;

            // Buat object transaksi
            const sekarang = new Date();

            const transaksi = {
                id: buatIdTransaksi(),
                waktu: sekarang,
                nama: nama,
                telepon: telepon,
                metode: metode,
                meja: meja,
                kategori: kategori,
                catatan: catatan,
                menu: menuDipilih,
                subtotal: subtotal,
                diskon: diskon,
                nilaiPajak: nilaiPajak,
                total: total
            };

            // Simpan transaksi ke array
            riwayatPesanan.push(transaksi);

            // Simpan ke localStorage
            simpanRiwayat();

            // Masukkan langsung ke tabel
            tambahKeTabel(transaksi);

            // Nomor transaksi berikutnya
            nomorTransaksi++;

            simpanRiwayat();

            // Reset form
            formPesanan.reset();

            // Setelah reset, semua jumlah dikembalikan menjadi 1
            semuaInputJumlah.forEach(function (input) {
                input.value = 1;
            });

            // Atur kembali nomor meja
            aturNomorMeja();

            // Scroll langsung ke tabel riwayat
            if (tabelRiwayat) {
                tabelRiwayat.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        }
    );
}

// 22. MUAT RIWAYAT SAAT WEB DIBUKA / REFRESH

muatRiwayat();