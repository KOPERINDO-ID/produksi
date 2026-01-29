/**
 * =========================================
 * PARTNER HELPER FUNCTIONS
 * =========================================
 * File ini berisi fungsi-fungsi helper yang digunakan
 * di seluruh sistem partner management
 */

// =========================================
// FORMAT FUNCTIONS
// =========================================

/**
 * Format angka dengan separator ribuan (titik)
 * @param {number|string} num - Angka yang akan diformat
 * @returns {string} - Angka terformat dengan separator titik
 */
function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Format mata uang Rupiah
 * @param {number|string} angka - Jumlah uang yang akan diformat
 * @returns {string} - Format rupiah (Rp X.XXX.XXX)
 */
function formatRupiah(angka) {
    if (!angka && angka !== 0) return 'Rp 0';
    return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
}

/**
 * Format tanggal ke format yyyy-mm-dd
 * @param {string|Date} dateString - Tanggal yang akan diformat
 * @returns {string} - Tanggal dalam format yyyy-mm-dd
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
 * Format tanggal untuk ditampilkan (format: "10 Des 25")
 * @param {string|Date} dateString - Tanggal yang akan diformat
 * @returns {string} - Tanggal dalam format "DD MMM YY"
 */
function formatDateShow(dateString) {
    if (!dateString) return '-';

    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    let date = new Date(dateString);
    let day = date.getDate();
    let month = monthNames[date.getMonth()];
    let year = date.getFullYear().toString().slice(-2);

    return `${day} ${month} ${year}`;
}

/**
 * Format tanggal ke format Indonesia: "10 Des 2024"
 * @param {string|Date} date - Tanggal yang akan diformat (format: YYYY-MM-DD atau Date object)
 * @returns {string} Tanggal dalam format "10 Des 2024"
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
 * Format tanggal ke format Indonesia (untuk approval)
 * @param {string} dateString - String tanggal
 * @returns {string} - Tanggal terformat
 */
function formatTanggalIndonesia(dateString) {
    if (!dateString) return '-';

    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

/**
 * Format SPK Code dari penjualan_id dan tanggal
 * @param {string|number} penjualan_id - ID penjualan
 * @param {string|Date} tanggal - Tanggal penjualan
 * @returns {string} - SPK Code dalam format DDMMYY-ID
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
 */
function formatInvoiceId(invoiceId) {
    if (!invoiceId) return '-';
    return invoiceId.replace(/INV_/g, '').replace(/^0+/, '');
}

// =========================================
// STRING & SECURITY FUNCTIONS
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
 * @param {string} type - Tipe notifikasi ('success' atau 'error')
 */
function showNotification(message, type = 'success') {
    if (typeof app !== 'undefined' && app.toast) {
        const cssClass = type === 'success' ? 'bg-color-green' : 'bg-color-red';
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
 * Menampilkan alert dialog
 * @param {string} message - Pesan alert
 * @param {string} title - Judul alert
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
 * @param {string} title - Judul konfirmasi
 * @param {function} callback - Fungsi yang dipanggil jika user mengkonfirmasi
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

/**
 * Zoom image in popup
 * @param {string} imageUrl - URL gambar
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