/**
 * =========================================
 * PARTNER HELPER FUNCTIONS
 * =========================================
 * File ini berisi fungsi-fungsi helper yang digunakan
 * di berbagai halaman partner (approval, detail, index)
 * 
 * Tech Stack: Cordova + Framework7 v7
 * =========================================
 */

// =========================================
// FORMAT HELPER FUNCTIONS
// =========================================

/**
 * Format angka dengan separator ribuan (titik)
 * @param {number|string} num - Angka yang akan diformat
 * @returns {string} Angka terformat dengan titik sebagai separator ribuan
 * @example formatNumber(1000) => "1.000"
 */
function formatNumber(num) {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Format angka dengan titik ribuan untuk display (sama dengan formatNumber)
 * @param {number|string} num - Angka yang akan diformat
 * @returns {string} Angka terformat dengan titik sebagai separator ribuan
 * @example formatNumberWithDots(1000) => "1.000"
 */
function formatNumberWithDots(num) {
    if (!num && num !== 0) return '';
    // Hapus semua karakter non-digit
    let cleanNum = num.toString().replace(/\D/g, '');
    // Format dengan titik sebagai separator ribuan
    return cleanNum.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse angka dari format display (dengan titik) ke angka biasa
 * @param {string} displayNum - String angka dengan format display (menggunakan titik)
 * @returns {number} Angka integer tanpa format
 * @example parseNumberFromDisplay("1.000") => 1000
 */
function parseNumberFromDisplay(displayNum) {
    if (!displayNum) return 0;
    // Hapus semua titik
    return parseInt(displayNum.toString().replace(/\./g, '')) || 0;
}

/**
 * Format mata uang Rupiah
 * @param {number|string} angka - Jumlah uang yang akan diformat
 * @returns {string} Format rupiah dengan prefix "Rp"
 * @example formatRupiah(10000) => "Rp 10.000"
 */
function formatRupiah(angka) {
    if (!angka && angka !== 0) return 'Rp 0';
    return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
}

// =========================================
// DATE HELPER FUNCTIONS
// =========================================

/**
 * Format tanggal ke format YYYY-MM-DD
 * @param {string|Date} dateString - String atau object tanggal
 * @returns {string} Tanggal dalam format YYYY-MM-DD
 * @example formatDate("2025-01-29") => "2025-01-29"
 */
function formatDate(dateString) {
    if (!dateString) return '-';

    let date = new Date(dateString);
    let day = ('0' + date.getDate()).slice(-2);
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();

    return `${year}-${month}-${day}`;
}

/**
 * Format tanggal untuk ditampilkan (format: "24-Des-25")
 * @param {string|Date} dateString - String atau object tanggal
 * @returns {string} Tanggal dalam format DD-MMM-YY
 * @example formatDateShow("2025-01-29") => "29-Jan-25"
 */
function formatDateShow(dateString) {
    if (!dateString) return '';

    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    let date = new Date(dateString);
    let day = ('0' + date.getDate()).slice(-2);
    let month = monthNames[date.getMonth()];
    let year = date.getFullYear().toString().slice(-2);

    return `${day}-${month}-${year}`;
}

/**
 * Parse tanggal dari format display (24-Des-25) ke format YYYY-MM-DD
 * @param {string} displayDate - Tanggal dalam format display (DD-MMM-YY)
 * @returns {string} Tanggal dalam format YYYY-MM-DD
 * @example parseDateFromDisplay("29-Jan-25") => "2025-01-29"
 */
function parseDateFromDisplay(displayDate) {
    if (!displayDate) return '';

    const monthNames = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'Mei': '05', 'Jun': '06', 'Jul': '07', 'Agu': '08',
        'Sep': '09', 'Okt': '10', 'Nov': '11', 'Des': '12'
    };

    // Format: 24-Des-25
    const parts = displayDate.split('-');
    if (parts.length !== 3) return '';

    const day = parts[0];
    const month = monthNames[parts[1]];
    const year = '20' + parts[2]; // Tambahkan 20 di depan tahun

    return `${year}-${month}-${day}`;
}

/**
 * Format tanggal ke format Indonesia: "29 Jan 2025"
 * @param {string|Date} date - Tanggal yang akan diformat
 * @returns {string} Tanggal dalam format "DD MMM YYYY"
 * @example formatDateIndonesia("2025-01-29") => "29 Jan 2025"
 */
function formatDateIndonesia(date) {
    if (!date) return '-';

    // Array nama bulan dalam bahasa Indonesia (singkat)
    const bulanIndonesia = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    try {
        // Parse tanggal menggunakan moment.js jika tersedia
        if (typeof moment !== 'undefined') {
            const m = moment(date);
            if (!m.isValid()) return '-';

            const tanggal = m.date();
            const bulan = bulanIndonesia[m.month()];
            const tahun = m.year();

            return `${tanggal} ${bulan} ${tahun}`;
        }

        // Fallback jika moment.js tidak tersedia
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';

        const tanggal = d.getDate();
        const bulan = bulanIndonesia[d.getMonth()];
        const tahun = d.getFullYear();

        return `${tanggal} ${bulan} ${tahun}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
}

/**
 * Format tanggal Indonesia (alias untuk formatDateIndonesia)
 * @param {string|Date} dateString - String atau object tanggal
 * @returns {string} Tanggal terformat
 */
function formatTanggalIndonesia(dateString) {
    return formatDateIndonesia(dateString);
}

/**
 * Format tanggal untuk laporan dengan format custom
 * @param {string|Date} date - Tanggal yang akan diformat
 * @param {string} format - Format output (default: DD-MM-YYYY)
 * @returns {string} Tanggal yang sudah diformat
 */
function formatLaporanDate(date, format = 'DD-MM-YYYY') {
    if (!date) return '-';

    try {
        if (typeof moment !== 'undefined') {
            const m = moment(date);
            return m.isValid() ? m.format(format) : '-';
        }
        return date;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
}

// =========================================
// SPK & INVOICE HELPER FUNCTIONS
// =========================================

/**
 * Format SPK Code dari penjualan_id dan tanggal
 * @param {string|number} penjualan_id - ID penjualan
 * @param {string|Date} tanggal - Tanggal penjualan
 * @returns {string} SPK code dalam format DDMMYY-ID
 * @example formatSPKCode("INV_001", "2025-01-29") => "290125-1"
 */
function formatSPKCode(penjualan_id, tanggal) {
    if (!penjualan_id || !tanggal) return '-';

    // Convert penjualan_id to string dan remove prefix "INV_" jika ada
    let id = String(penjualan_id).replace(/^INV_/i, '');

    // Remove leading zeros
    id = parseInt(id, 10).toString();

    // Format tanggal: DDMMYY
    const date = new Date(tanggal);
    const dd = ('0' + date.getDate()).slice(-2);
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const yy = date.getFullYear().toString().slice(-2);

    return `${dd}${mm}${yy}-${id}`;
}

/**
 * Format nomor invoice dengan menghilangkan prefix dan leading zeros
 * @param {string} invoiceId - ID invoice
 * @returns {string} Invoice ID yang sudah diformat
 * @example formatInvoiceId("INV_00123") => "123"
 */
function formatInvoiceId(invoiceId) {
    if (!invoiceId) return '-';
    return invoiceId.replace(/INV_/g, '').replace(/^0+/, '');
}

// =========================================
// STRING & SANITIZATION HELPER FUNCTIONS
// =========================================

/**
 * Sanitize string untuk pencarian
 * @param {string} str - String yang akan dibersihkan
 * @returns {string} String yang sudah dibersihkan
 */
function sanitizeLaporanString(str) {
    if (!str) return '';
    return str.toString().trim();
}

/**
 * Escape HTML untuk mencegah XSS
 * @param {string} text - Text yang akan di-escape
 * @returns {string} Text yang sudah aman dari XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// =========================================
// UI HELPER FUNCTIONS
// =========================================

/**
 * Menampilkan loading indicator
 * @param {boolean} show - True untuk menampilkan, false untuk menyembunyikan
 */
function showLoading(show = true) {
    if (typeof app !== 'undefined' && app.preloader) {
        if (show) {
            app.preloader.show();
        } else {
            app.preloader.hide();
        }
    }
}

/**
 * Menampilkan notifikasi toast
 * @param {string} message - Pesan yang akan ditampilkan
 * @param {string} type - Tipe notifikasi: 'success', 'error', 'warning'
 */
function showNotification(message, type = 'success') {
    if (typeof app !== 'undefined' && app.toast) {
        let cssClass = 'bg-color-green';

        if (type === 'error') {
            cssClass = 'bg-color-red';
        } else if (type === 'warning') {
            cssClass = 'bg-color-orange';
        }

        app.toast.create({
            text: message,
            position: 'center',
            closeTimeout: 2000,
            cssClass: cssClass
        }).open();
    } else {
        // Fallback jika Framework7 belum ready
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
    }
}

/**
 * Alias untuk showNotification (untuk backward compatibility)
 */
function showLaporanNotification(message, type = 'success') {
    showNotification(message, type);
}

/**
 * Alias untuk showLoading (untuk backward compatibility)
 */
function showLaporanLoading(show = true) {
    showLoading(show);
}

/**
 * Menampilkan alert dialog
 * @param {string} message - Pesan alert
 * @param {string} title - Judul alert (default: 'Perhatian')
 */
function showAlert(message, title = 'Perhatian') {
    if (typeof app !== 'undefined' && app.dialog) {
        app.dialog.alert(message, title);
    } else {
        alert(message);
    }
}

/**
 * Menampilkan confirm dialog
 * @param {string} message - Pesan konfirmasi
 * @param {string} title - Judul dialog (default: 'Konfirmasi')
 * @param {Function} callback - Callback function jika user menekan OK
 */
function showConfirm(message, title = 'Konfirmasi', callback) {
    if (typeof app !== 'undefined' && app.dialog) {
        app.dialog.confirm(message, title, callback);
    } else {
        if (confirm(message)) {
            callback();
        }
    }
}

// =========================================
// INPUT VALIDATION HELPER FUNCTIONS
// =========================================

/**
 * Clear error styling from input
 * @param {string} inputId - ID dari input element
 */
function clearInputError(inputId) {
    $(`#${inputId}`).css('border-color', '');
}

/**
 * Set error styling to input
 * @param {string} inputId - ID dari input element
 */
function setInputError(inputId) {
    $(`#${inputId}`).css({
        'border': '2px solid #ff3b30',
        'border-radius': '4px'
    });
}

// =========================================
// IMAGE HELPER FUNCTIONS
// =========================================

/**
 * Zoom image in popup
 * @param {string} imageUrl - URL gambar yang akan di-zoom
 * @param {string} title - Judul gambar
 */
function zoomImage(imageUrl, title) {
    const popupHTML = `
        <div class="popup popup-zoom-image" data-swipe-to-close="to-bottom">
            <div class="view">
                <div class="page">
                    <div class="navbar">
                        <div class="navbar-bg bg-color-black"></div>
                        <div class="navbar-inner">
                            <div class="title text-color-white">${title}</div>
                            <div class="right">
                                <a class="link popup-close text-color-white" data-popup=".popup-zoom-image">
                                    <i class="f7-icons">xmark_circle_fill</i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="page-content" style="background: #000;">
                        <div style="display: flex; justify-content: center; align-items: center; min-height: 100%; padding: 20px;">
                            <img 
                                src="${imageUrl}" 
                                style="max-width: 100%; max-height: 90vh; object-fit: contain; border-radius: 8px;"
                                onerror="this.src='https://via.placeholder.com/800x600?text=Image+Not+Found'"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing zoom popup if any
    $('.popup-zoom-image').remove();

    // Add popup to body
    $('body').append(popupHTML);

    // Open popup
    if (typeof app !== 'undefined') {
        app.popup.open('.popup-zoom-image');
    }
}

/**
 * Mendapatkan path gambar berdasarkan nama file
 * @param {string} filename - Nama file gambar
 * @returns {string} Full path ke gambar
 */
function getImagePath(filename) {
    if (!filename) return '';

    const imagePath = {
        koper: 'https://tasindo-sale-webservice.digiseminar.id/product_image_new',
        performa: 'https://tasindo-sale-webservice.digiseminar.id/performa_image'
    };

    const isKoperImage = filename.substring(0, 5) === 'koper';
    const basePath = isKoperImage ? imagePath.koper : imagePath.performa;

    return `${basePath}/${filename}`;
}

// =========================================
// UTILITY FUNCTIONS
// =========================================

/**
 * Copy tanggal kirim ke deadline
 * Fungsi ini akan menyalin nilai dari input tanggal kirim ke tanggal deadline
 */
function copyKirimToDeadline() {
    console.log('copyKirimToDeadline() called');

    const tglKirimDisplay = $('#tgl_kirim_purchase_display').val();
    const tglKirimHidden = $('#tgl_kirim_purchase').val();

    if (tglKirimDisplay && tglKirimDisplay.trim() !== '') {
        $('#tgl_deadline_purchase_display').val(tglKirimDisplay);

        if (tglKirimHidden) {
            $('#tgl_deadline_purchase').val(tglKirimHidden);
        }

        $('#tgl_deadline_purchase_display').trigger('change');
        showNotification('Tanggal berhasil disalin', 'success');
    } else {
        showNotification('Tanggal kirim belum diisi', 'error');
    }

    return false;
}

/**
 * Menentukan background color berdasarkan status dan deadline
 * @param {object} item - Data item laporan
 * @returns {string} CSS style untuk background color
 */
function getRowBackgroundColor(item) {
    const currentDate = moment().startOf('day');
    const deadlineDate = moment(item.tgl_deadline, 'YYYY/MM/DD').startOf('day');

    // KONDISI 1: Jika tgl_selesai masih null DAN hari ini >= tgl_deadline -> MERAH
    if (item.tgl_selesai === null && currentDate.isSameOrAfter(deadlineDate)) {
        return 'background: linear-gradient(#b53737, #b20000);';
    }

    // KONDISI 2: Jika tgl_selesai terisi DAN melebihi tgl_deadline -> MERAH
    if (item.tgl_selesai !== null) {
        const selesaiDate = moment(item.tgl_selesai, 'YYYY/MM/DD').startOf('day');
        if (selesaiDate.isAfter(deadlineDate)) {
            return 'background: linear-gradient(#b53737, #b20000);';
        }
    }

    // KONDISI 3: Default - tidak ada warna khusus
    return '';
}

// =========================================
// EXPORT FUNCTIONS (untuk module pattern)
// =========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Format helpers
        formatNumber,
        formatNumberWithDots,
        parseNumberFromDisplay,
        formatRupiah,

        // Date helpers
        formatDate,
        formatDateShow,
        parseDateFromDisplay,
        formatDateIndonesia,
        formatTanggalIndonesia,
        formatLaporanDate,

        // SPK & Invoice helpers
        formatSPKCode,
        formatInvoiceId,

        // String helpers
        sanitizeLaporanString,
        escapeHtml,

        // UI helpers
        showLoading,
        showNotification,
        showLaporanNotification,
        showLaporanLoading,
        showAlert,
        showConfirm,

        // Input validation helpers
        clearInputError,
        setInputError,

        // Image helpers
        zoomImage,
        getImagePath,

        // Utility functions
        copyKirimToDeadline,
        getRowBackgroundColor
    };
}