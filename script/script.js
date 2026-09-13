// 1. MENGAMBIL ELEMENT DARI HTML

const formPesanan = document.getElementById("formPesanan");
const hasilTransaksi = document.getElementById("hasilTransaksi");
const tabelRiwayat = document.getElementById("tabelRiwayat");
const waktuSekarang = document.getElementById("waktuSekarang");
const kategoriPelanggan = document.getElementById("kategoriPelanggan");
const metodePesanan = document.getElementById("metode");

// 2. VARIABLE DAN ARRAY

let riwayatPesanan =
    JSON.parse(localStorage.getItem("riwayatPesanan")) || [];

const diskonMember = 0.05;

const pajak = 0.11;

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

// 6. FUNCTION MEMBUAT ID TRANSAKSI

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
            <strong>Pesanan belum dapat dikirim.</strong>
            <span>${pesan}</span>
        </div>
    `;

    hasilTransaksi.style.display = "block";
    hasilTransaksi.style.marginTop = "20px";
    hasilTransaksi.style.padding = "16px 18px";
    hasilTransaksi.style.border = "1px solid rgba(180, 50, 40, .35)";
    hasilTransaksi.style.borderRadius = "12px";
    hasilTransaksi.style.background = "#fff4f2";
    hasilTransaksi.style.color = "#8f2d24";
    hasilTransaksi.style.fontSize = "0.88rem";
    hasilTransaksi.style.lineHeight = "1.6";

    const errorBox = hasilTransaksi.querySelector(
        ".transaction-error"
    );

    if (errorBox) {
        errorBox.style.display = "flex";
        errorBox.style.flexDirection = "column";
        errorBox.style.gap = "4px";
    }

    hasilTransaksi.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// 10. FUNCTION VALIDASI NOMOR TELEPON

function validasiNomorTelepon(nomor) {
    const polaAngka = /^[0-9]+$/;

    if (!polaAngka.test(nomor)) {
        return "Nomor telepon hanya boleh berisi angka.";
    }

    if (!nomor.startsWith("08")) {
        return "Nomor telepon harus diawali dengan 08.";
    }

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
        if (!checkbox.checked) {
            return;
        }

        const baris = checkbox.closest("tr");

        if (!baris) {
            return;
        }

        const namaElement = baris.querySelector(
            ".order-item-name span"
        );

        const hargaElement = baris.querySelector(".price");

        const jumlahElement = baris.querySelector(".qty-input");

        if (!namaElement || !hargaElement || !jumlahElement) {
            return;
        }

        const nama = namaElement.textContent.trim();

        const harga = Number(
            hargaElement.textContent.replace(/[^0-9]/g, "")
        );

        const jumlah = Number(jumlahElement.value);

        if (isNaN(harga) || harga <= 0) {
            return;
        }

        if (!Number.isInteger(jumlah) || jumlah < 1) {
            return;
        }

        const subtotal = hitungSubtotal(harga, jumlah);

        const menu = {
            nama: nama,
            harga: harga,
            jumlah: jumlah,
            subtotal: subtotal
        };

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
    if (nama.trim() === "") {
        return "Nama pelanggan wajib diisi.";
    }

    if (nama.trim().length < 2) {
        return "Nama pelanggan minimal 2 karakter.";
    }

    if (/^[0-9]+$/.test(nama.trim())) {
        return "Nama pelanggan harus berupa nama, bukan angka.";
    }

    if (telepon.trim() === "") {
        return "Nomor telepon wajib diisi.";
    }

    const errorTelepon = validasiNomorTelepon(
        telepon.trim()
    );

    if (errorTelepon !== "") {
        return errorTelepon;
    }

    if (metode === "") {
        return "Silakan pilih metode pesanan.";
    }

    if (metode === "dine-in") {
        if (meja.trim() === "") {
            return "Nomor meja wajib diisi untuk makan di tempat.";
        }
    }

    if (menuDipilih.length === 0) {
        return "Silakan pilih minimal satu menu.";
    }

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
    const baris = document.createElement("tr");

    const kolomId = document.createElement("td");
    kolomId.textContent = data.id;

    const kolomWaktu = document.createElement("td");
    kolomWaktu.textContent = formatWaktu(data.waktu);

    const kolomPelanggan = document.createElement("td");
    kolomPelanggan.textContent = data.nama;

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

    const kolomJumlah = document.createElement("td");
    let totalJumlahItem = 0;

    data.menu.forEach(function (menu) {
        totalJumlahItem += menu.jumlah;
    });

    kolomJumlah.textContent = totalJumlahItem;

    const kolomSubtotal = document.createElement("td");
    kolomSubtotal.textContent = formatRupiah(data.subtotal);

    const kolomDiskon = document.createElement("td");
    kolomDiskon.textContent = formatRupiah(data.diskon);

    const kolomPajak = document.createElement("td");
    kolomPajak.textContent = formatRupiah(data.nilaiPajak);

    const kolomTotal = document.createElement("td");
    kolomTotal.textContent = formatRupiah(data.total);

    const kolomMetode = document.createElement("td");
    kolomMetode.textContent = namaMetode(data.metode);

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

    tabelRiwayat.appendChild(baris);
}

// 15. FUNCTION MEMUAT RIWAYAT SAAT REFRESH

function muatRiwayat() {
    riwayatPesanan.forEach(function (transaksi) {
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

perbaruiJam();

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

            if (input.value === "") {
                return;
            }

            if (isNaN(jumlah)) {
                input.value = 1;
                return;
            }

            if (!Number.isInteger(jumlah)) {
                input.value = Math.floor(jumlah);
            }

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
            event.preventDefault();

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

            const menuDipilih = ambilMenuDipilih();

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

            if (hasilTransaksi) {
                hasilTransaksi.innerHTML = "";
            }

            let subtotal = 0;

            menuDipilih.forEach(function (menu) {
                subtotal += menu.subtotal;
            });

            let diskon = 0;

            if (kategori === "member") {
                diskon = subtotal * diskonMember;
            } else if (subtotal >= 100000) {
                diskon = subtotal * diskonMember;
            }

            const setelahDiskon = subtotal - diskon;

            const nilaiPajak = setelahDiskon * pajak;

            const total = setelahDiskon + nilaiPajak;

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

            riwayatPesanan.push(transaksi);

            tambahKeTabel(transaksi);

            nomorTransaksi++;

            simpanRiwayat();

            formPesanan.reset();

            semuaInputJumlah.forEach(function (input) {
                input.value = 1;
            });

            aturNomorMeja();

            if (tabelRiwayat) {
                tabelRiwayat.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        }
    );
}

muatRiwayat();