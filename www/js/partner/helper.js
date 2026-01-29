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
 * Format angka untuk display dengan separator ribuan (1.234.567)
 * @param {number|string} num - Angka yang akan diformat
 * @returns {string} - Angka terformat dengan separator titik
 */
function formatNumberToDisplay(num) {
    if (!num && num !== 0) return '';
    // Hapus semua karakter non-digit
    let cleanNum = num.toString().replace(/\D/g, '');
    // Format dengan separator titik
    return cleanNum.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parse angka dari format display (1.234.567) ke angka biasa
 * @param {string} displayNum - Angka dalam format display dengan separator titik
 * @returns {number} - Angka tanpa separator
 */
function parseNumberFromDisplay(displayNum) {
    if (!displayNum) return 0;
    // Hapus semua titik separator
    let cleanNum = displayNum.toString().replace(/\./g, '');
    return parseInt(cleanNum, 10) || 0;
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
 * Format tanggal ke format display DD-MMM-YY (24-Des-25)
 * @param {string|Date} dateString - Tanggal yang akan diformat (format: YYYY-MM-DD)
 * @returns {string} - Tanggal dalam format "DD-MMM-YY"
 */
function formatDateToDisplay(dateString) {
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
 * Parse tanggal dari format display DD-MMM-YY ke YYYY-MM-DD
 * @param {string} displayDate - Tanggal dalam format "DD-MMM-YY" (24-Des-25)
 * @returns {string} - Tanggal dalam format "YYYY-MM-DD"
 */
function parseDateFromDisplay(displayDate) {
    if (!displayDate) return '';

    const monthNames = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
        'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
    };

    try {
        const parts = displayDate.split('-');
        if (parts.length !== 3) return '';

        const day = parseInt(parts[0], 10);
        const monthIndex = monthNames[parts[1]];
        const year = parseInt('20' + parts[2], 10); // Tambahkan '20' di depan tahun

        if (monthIndex === undefined) return '';

        const date = new Date(year, monthIndex, day);

        // Format ke YYYY-MM-DD
        const yyyy = date.getFullYear();
        const mm = ('0' + (date.getMonth() + 1)).slice(-2);
        const dd = ('0' + date.getDate()).slice(-2);

        return `${yyyy}-${mm}-${dd}`;
    } catch (error) {
        console.error('Error parsing date:', error);
        return '';
    }
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

/**
 * =========================================
 * PURCHASE FORMAT HANDLERS
 * =========================================
 * File ini berisi event listeners untuk auto-format
 * angka dan tanggal pada form purchase
 * 
 * CARA PENGGUNAAN:
 * Include file ini setelah helper.js dan index.js
 * File ini akan otomatis menginisialisasi event listeners
 */

$(document).ready(function () {
    console.log('Initializing purchase format handlers...');

    // =========================================
    // AUTO FORMAT UNTUK QTY PURCHASE DISPLAY
    // =========================================
    $(document).on('input', '#qty_purchase_display', function () {
        let val = $(this).val();

        // Hapus semua karakter non-digit
        val = val.replace(/\D/g, '');

        // Format dengan separator titik
        let formatted = formatNumberToDisplay(val);

        // Set value display
        $(this).val(formatted);

        // Set value asli (tanpa format) ke hidden input
        $('#qty_purchase').val(val);

        // Validasi max quantity
        let numVal = parseInt(val) || 0;
        let max = parseInt($('#qty_total_input').val()) || 0;

        if (numVal < 0) {
            $(this).val('0');
            $('#qty_purchase').val('0');
        }

        if (numVal > max) {
            let maxFormatted = formatNumberToDisplay(max);
            $(this).val(maxFormatted);
            $('#qty_purchase').val(max);
            if (typeof showNotification !== 'undefined') {
                showNotification(`Jumlah maksimal ${maxFormatted} pcs`, 'error');
            }
        }
    });

    // =========================================
    // AUTO FORMAT UNTUK PRODUCTION FEE DISPLAY
    // =========================================
    $(document).on('input', '#production_fee_display', function () {
        let val = $(this).val();

        // Hapus semua karakter non-digit
        val = val.replace(/\D/g, '');

        // Format dengan separator titik
        let formatted = formatNumberToDisplay(val);

        // Set value display
        $(this).val(formatted);

        // Set value asli (tanpa format) ke hidden input
        $('#production_fee').val(val);

        // Validasi min 0
        let numVal = parseInt(val) || 0;
        if (numVal < 0) {
            $(this).val('0');
            $('#production_fee').val('0');
        }
    });

    // =========================================
    // AUTO FORMAT UNTUK TANGGAL KIRIM
    // =========================================
    $(document).on('click', '#tgl_kirim_purchase_display', function () {
        // Buat calendar picker
        if (typeof app !== 'undefined' && app.calendar) {
            const calendarKirim = app.calendar.create({
                inputEl: '#tgl_kirim_purchase_display',
                dateFormat: 'dd-M-yy',
                openIn: 'customModal',
                header: true,
                footer: true,
                closeOnSelect: true,
                on: {
                    change: function (calendar, value) {
                        if (value && value.length > 0) {
                            const date = value[0];

                            // Format untuk display (24-Des-25)
                            const displayDate = formatDateToDisplay(date);
                            $('#tgl_kirim_purchase_display').val(displayDate);

                            // Format untuk hidden input (YYYY-MM-DD)
                            const hiddenDate = formatDate(date);
                            $('#tgl_kirim_purchase').val(hiddenDate);

                            console.log('Tanggal Kirim - Display:', displayDate, 'Hidden:', hiddenDate);
                        }
                    }
                }
            });
            calendarKirim.open();
        }
    });

    // =========================================
    // AUTO FORMAT UNTUK TANGGAL DEADLINE
    // =========================================
    $(document).on('click', '#tgl_deadline_purchase_display', function () {
        // Buat calendar picker
        if (typeof app !== 'undefined' && app.calendar) {
            const calendarDeadline = app.calendar.create({
                inputEl: '#tgl_deadline_purchase_display',
                dateFormat: 'dd-M-yy',
                openIn: 'customModal',
                header: true,
                footer: true,
                closeOnSelect: true,
                on: {
                    change: function (calendar, value) {
                        if (value && value.length > 0) {
                            const date = value[0];

                            // Format untuk display (24-Des-25)
                            const displayDate = formatDateToDisplay(date);
                            $('#tgl_deadline_purchase_display').val(displayDate);

                            // Format untuk hidden input (YYYY-MM-DD)
                            const hiddenDate = formatDate(date);
                            $('#tgl_deadline_purchase').val(hiddenDate);

                            console.log('Tanggal Deadline - Display:', displayDate, 'Hidden:', hiddenDate);
                        }
                    }
                }
            });
            calendarDeadline.open();
        }
    });

    // =========================================
    // UPDATE COPY KIRIM TO DEADLINE FUNCTION
    // =========================================
    // Override fungsi copyKirimToDeadline untuk menggunakan display value
    if (typeof window.copyKirimToDeadline === 'function') {
        const originalCopyFunction = window.copyKirimToDeadline;

        window.copyKirimToDeadline = function () {
            console.log('copyKirimToDeadline() called (with format support)');

            // Ambil nilai dari hidden input tanggal kirim
            const tglKirimHidden = $('#tgl_kirim_purchase').val();
            const tglKirimDisplay = $('#tgl_kirim_purchase_display').val();

            console.log('Tanggal Kirim Hidden:', tglKirimHidden);
            console.log('Tanggal Kirim Display:', tglKirimDisplay);

            // Cek apakah tanggal kirim ada
            if (tglKirimHidden && tglKirimHidden.trim() !== '') {
                // Set value ke input tanggal deadline (hidden)
                $('#tgl_deadline_purchase').val(tglKirimHidden);

                // Set value ke input tanggal deadline (display)
                if (tglKirimDisplay && tglKirimDisplay.trim() !== '') {
                    $('#tgl_deadline_purchase_display').val(tglKirimDisplay);
                } else {
                    // Jika display kosong, format dari hidden
                    const displayDate = formatDateToDisplay(tglKirimHidden);
                    $('#tgl_deadline_purchase_display').val(displayDate);
                }

                // Trigger change event agar form tahu ada perubahan
                $('#tgl_deadline_purchase').trigger('change');
                $('#tgl_deadline_purchase_display').trigger('change');

                console.log('Tanggal berhasil disalin');

                // Show success notification
                if (typeof showNotification !== 'undefined') {
                    showNotification('Tanggal berhasil disalin', 'success');
                }
            } else {
                console.log('Tanggal kirim kosong');

                // Show error notification
                if (typeof showNotification !== 'undefined') {
                    showNotification('Tanggal kirim belum diisi', 'error');
                }
            }

            return false; // Prevent any default behavior
        };
    }

    console.log('Purchase format handlers initialized successfully');
});