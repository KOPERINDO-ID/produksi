/**
 * =========================================
 * LAPORAN PARTNER PAGE MANAGEMENT
 * =========================================
*/

// =========================================
// VARIABLES & CONSTANTS
// =========================================
const LAPORAN_CONFIG = {
	apiEndpoint: '/get-data-partner-laporan',
	apiImageEndpoint: '/get-item-detail-gambar',
	imagePath: {
		koper: 'https://tasindo-sale-webservice.digiseminar.id/product_image_new',
		performa: 'https://tasindo-sale-webservice.digiseminar.id/performa_image'
	},
	searchDelay: 1000,
	dateFormat: {
		display: 'DD-MM-YYYY',
		internal: 'YYYY/MM/DD',
		short: 'DDMMYY'
	},
	itemsPerPage: 20  // Sama dengan partner.js
};

let LAPORAN_STATE = {
	laporanData: [],
	isLoading: false,
	searchTimer: null,
	currentFilters: {
		partner: '',
		customer: ''
	},
	currentPage: 1,
	totalData: 0
};

// =========================================
// HELPER FUNCTIONS
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

/**
 * Format nomor invoice dengan menghilangkan prefix dan leading zeros
 * @param {string} invoiceId - ID invoice
 * @returns {string} Invoice ID yang sudah diformat
 */
function formatInvoiceId(invoiceId) {
	if (!invoiceId) return '-';
	return invoiceId.replace(/INV_/g, '').replace(/^0+/, '');
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
 * Menentukan background color berdasarkan status dan deadline
 * @param {object} item - Data item laporan
 * @returns {string} CSS background style
 */
function getRowBackgroundColor(item) {
	// Jika sudah selesai, tidak perlu pewarnaan
	if (item.tgl_selesai !== null) {
		return '';
	}

	const currentDate = moment().format(LAPORAN_CONFIG.dateFormat.internal);
	const deadlineDate = moment(item.tgl_deadline, LAPORAN_CONFIG.dateFormat.internal);

	// Melewati deadline (merah)
	if (deadlineDate.isBefore(currentDate)) {
		return 'background: linear-gradient(#b53737, #b20000);';
	}

	// Belum ada status (hijau - dalam proses)
	if (!item.status || item.status === null) {
		return 'background: linear-gradient(#4a8a4a, forestgreen);';
	}

	// Status tidak lambat (biru)
	if (item.status === 'tidak_lambat') {
		return 'background: linear-gradient(#067afb, #002b46);';
	}

	// Default jika ada status lain (merah)
	return 'background: linear-gradient(#b53737, #b20000);';
}

/**
 * Mendapatkan path gambar berdasarkan nama file
 * @param {string} filename - Nama file gambar
 * @returns {string} Full path ke gambar
 */
function getImagePath(filename) {
	if (!filename) return '';

	const isKoperImage = filename.substring(0, 5) === 'koper';
	const basePath = isKoperImage
		? LAPORAN_CONFIG.imagePath.koper
		: LAPORAN_CONFIG.imagePath.performa;

	return `${basePath}/${filename}`;
}

/**
 * Format tanggal untuk display
 * @param {string|Date} date - Tanggal yang akan diformat
 * @param {string} format - Format output (default: DD-MM-YYYY)
 * @returns {string} Tanggal yang sudah diformat
 */
function formatLaporanDate(date, format = LAPORAN_CONFIG.dateFormat.display) {
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
// PAGINATION FUNCTIONS
// =========================================

/**
 * Membuat HTML untuk tombol paginasi sederhana
 * Sama seperti partner.js - hanya Previous, Info, dan Next
 */
function createPaginationButtons(currentPage, totalPages) {
	if (totalPages <= 1) return '';

	let html = '<div class="segmented segmented-raised" style="margin: 10px 0; width: 100%; display: flex; justify-content: space-between;">';

	// Tombol Previous
	if (currentPage > 1) {
		html += `<button class="button button-outline text-add-colour-white" style="display: flex; align-items: center; border-color: #686665 !important; flex: 1;" onclick="goToPage(${currentPage - 1})">
			<i class="f7-icons">chevron_left</i> Previous
		</button>`;
	} else {
		html += `<button class="button button-outline text-add-colour-white disabled" style="opacity: 0.3; display: flex; align-items: center; border-color: #686665 !important; flex: 1;">
			<i class="f7-icons">chevron_left</i> Previous
		</button>`;
	}

	// Info halaman
	html += `<button class="button text-add-colour-white" style="background-color: #686665; flex: 1;">${currentPage} / ${totalPages}</button>`;

	// Tombol Next
	if (currentPage < totalPages) {
		html += `<button class="button button-outline text-add-colour-white" style="display: flex; align-items: center; border-color: #686665 !important; flex: 1;" onclick="goToPage(${currentPage + 1})">
			Next <i class="f7-icons">chevron_right</i>
		</button>`;
	} else {
		html += `<button class="button button-outline text-add-colour-white disabled" style="opacity: 0.3; display: flex; align-items: center; border-color: #686665 !important; flex: 1;">
			Next <i class="f7-icons">chevron_right</i>
		</button>`;
	}

	html += '</div>';
	return html;
}

/**
 * Pindah ke halaman tertentu
 */
function goToPage(page) {
	LAPORAN_STATE.currentPage = page;
	renderLaporanData();

	// Scroll ke atas tabel
	const tableElement = document.getElementById('tabel_laporan_partner');
	if (tableElement) {
		tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
}

/**
 * Membuat HTML untuk baris tabel laporan
 * @param {object} item - Data item laporan
 * @param {number} index - Index/nomor urut
 * @returns {string} HTML string untuk table row
 */
function createLaporanTableRow(item, index) {
	console.log('Creating table row for item:', item);
	const bgColor = getRowBackgroundColor(item);
	const invoiceNumber = formatInvoiceId(item.penjualan_id);
	const invoiceDate = formatLaporanDate(item.penjualan_tanggal, LAPORAN_CONFIG.dateFormat.short);
	const spkNumber = `${invoiceDate}-${invoiceNumber}`;

	return `
        <tr style="${bgColor}">
            <td style="border:1px solid gray !important;" class="label-cell text-align-center">
                ${index}
            </td>
            <td style="border:1px solid gray !important; min-width: 100px !important;" class="label-cell text-align-left">
                ${escapeHtml(spkNumber)}
            </td>
            <td style="border:1px solid gray !important; min-width: 100px !important;" class="label-cell text-align-left">
                ${escapeHtml(item.nama_partner || '-')}
            </td>
            <td style="border:1px solid gray !important; min-width: 150px !important;" class="label-cell text-align-left">
                ${escapeHtml(item.client_nama || '-')}
            </td>
            <td onclick="lihatDetailGambar('${item.penjualan_detail_performa_id}');" 
                style="border:1px solid gray !important; cursor: pointer; min-width: 150px !important;" 
                class="label-cell text-align-left popup-open" 
                data-popup=".item-detail-gambar">
                ${escapeHtml(item.item || '-')}
            </td>
            <td style="border:1px solid gray !important;" class="label-cell text-align-center">
                ${escapeHtml(item.jumlah || '0')}
            </td>
            <td style="border:1px solid gray !important; min-width: 100px !important;" class="label-cell text-align-center">
                ${formatDateIndonesia(item.tgl_input)}
            </td>
            <td style="border:1px solid gray !important; min-width: 100px !important;" class="label-cell text-align-center">
                ${formatDateIndonesia(item.tgl_deadline)}
            </td>
            <td style="border:1px solid gray !important; min-width: 100px !important;" class="label-cell text-align-center">
                ${formatDateIndonesia(item.tgl_selesai)}
            </td>
            <td style="border:1px solid gray !important;" class="label-cell text-align-center">
                <button class="button button-small button-fill ${item.status_penerimaan == null ? 'bg-dark-gray-young text-add-colour-black-soft' : 'bg-blue text-add-colour-white'}" style="width: 116px;"
					onclick="lihatDetailPenerimaan('${item.penjualan_detail_performa_id}', '${item.id_partner_transaksi}');">
					Detail
				</button>
            </td>
        </tr>
    `;
}

/**
 * Menampilkan loading indicator
 * @param {boolean} show - True untuk menampilkan, false untuk menyembunyikan
 */
function showLaporanLoading(show = true) {
	LAPORAN_STATE.isLoading = show;
	if (typeof app !== 'undefined' && app.dialog) {
		if (show) {
			app.dialog.preloader('Mengambil Data, Harap Tunggu');
		} else {
			app.dialog.close();
		}
	}
}

/**
 * Menampilkan notifikasi
 * @param {string} message - Pesan yang akan ditampilkan
 * @param {string} type - Tipe notifikasi (success/error)
 */
function showLaporanNotification(message, type = 'success') {
	if (typeof app !== 'undefined' && app.toast) {
		const color = type === 'success' ? 'green' : 'red';
		app.toast.create({
			text: message,
			position: 'center',
			closeTimeout: type === 'error' ? 4000 : 2000,
			cssClass: `bg-color-${color}`
		}).open();
	} else {
		console.log(`[${type.toUpperCase()}] ${message}`);
	}
}

// =========================================
// DATA MANAGEMENT FUNCTIONS
// =========================================

/**
 * Mengambil data laporan partner dari server
 */
function fetchDataLaporanPartner() {
	// Ambil nilai filter
	const partnerFilter = sanitizeLaporanString(
		jQuery('#partner_laporan_filter_search').val()
	) || 'empty';

	const customerFilter = sanitizeLaporanString(
		jQuery('#partner_customer_filter_search').val()
	) || 'empty';

	// Update state
	LAPORAN_STATE.currentFilters = {
		partner: partnerFilter,
		customer: customerFilter
	};

	// Reset ke halaman pertama saat filter berubah
	LAPORAN_STATE.currentPage = 1;

	// Validasi user ID
	const userId = localStorage.getItem('user_id');
	if (!userId) {
		showLaporanNotification('User ID tidak ditemukan', 'error');
		return;
	}

	showLaporanLoading(true);

	jQuery.ajax({
		type: 'POST',
		url: BASE_API + LAPORAN_CONFIG.apiEndpoint,
		dataType: 'JSON',
		data: {
			karyawan_id: userId,
			partner_laporan_filter_search: partnerFilter,
			partner_customer_filter_search: customerFilter
		},
		success: function (response) {
			console.log('Laporan data received:', response);

			if (response && response.data) {
				LAPORAN_STATE.laporanData = response.data;
				renderLaporanData();
				showLaporanNotification('Data berhasil dimuat', 'success');
			} else {
				LAPORAN_STATE.laporanData = [];
				renderLaporanData();
				showLaporanNotification('Tidak ada data ditemukan', 'error');
			}
		},
		error: function (xhr, status, error) {
			console.error('Error fetching laporan data:', {
				status: status,
				error: error,
				response: xhr.responseText
			});

			LAPORAN_STATE.laporanData = [];
			renderLaporanData();

			let errorMessage = 'Gagal memuat data laporan';
			try {
				const response = JSON.parse(xhr.responseText);
				if (response.message) {
					errorMessage = response.message;
				}
			} catch (e) {
				console.error('Error parsing response:', e);
			}

			showLaporanNotification(errorMessage, 'error');
		},
		complete: function () {
			showLaporanLoading(false);
		}
	});
}

/**
 * Render data laporan ke tabel
 */
function renderLaporanData() {
	const tableBody = jQuery('#data_laporan_partner');

	// Clear table
	tableBody.html('');

	// Filter hanya data yang belum selesai
	const activeData = LAPORAN_STATE.laporanData.filter(item =>
		item.tgl_selesai === null || item.tgl_selesai === ''
	);

	// Update jumlah data
	LAPORAN_STATE.totalData = activeData.length;
	jQuery('#jumlah_data_laporan').text(activeData.length);

	if (activeData.length === 0) {
		tableBody.html(`
            <tr>
                <td colspan="10" style="padding: 20px; text-align: center; color: #999;">
                    Tidak ada data laporan yang ditampilkan
                </td>
            </tr>
        `);
		// Sembunyikan pagination jika tidak ada data
		jQuery('#tombol_paginasi').html('');
		return;
	}

	// Hitung pagination
	const totalPages = Math.ceil(activeData.length / LAPORAN_CONFIG.itemsPerPage);

	// Pastikan currentPage valid
	if (LAPORAN_STATE.currentPage > totalPages) {
		LAPORAN_STATE.currentPage = totalPages;
	}
	if (LAPORAN_STATE.currentPage < 1) {
		LAPORAN_STATE.currentPage = 1;
	}

	// Ambil data untuk halaman saat ini
	const startIndex = (LAPORAN_STATE.currentPage - 1) * LAPORAN_CONFIG.itemsPerPage;
	const endIndex = startIndex + LAPORAN_CONFIG.itemsPerPage;
	const pageData = activeData.slice(startIndex, endIndex);

	// Build table rows dengan nomor yang benar (berdasarkan posisi global)
	let html = '';
	const startNumber = startIndex + 1;

	pageData.forEach((item, index) => {
		html += createLaporanTableRow(item, startNumber + index);
	});

	tableBody.html(html);

	// Render pagination buttons (style sederhana seperti partner.js)
	const paginationHtml = createPaginationButtons(LAPORAN_STATE.currentPage, totalPages);
	jQuery('#tombol_paginasi').html(paginationHtml);

	console.log(`Rendered page ${LAPORAN_STATE.currentPage} with ${pageData.length} items (Total: ${activeData.length} items, ${totalPages} pages)`);
}

/**
 * Melihat detail gambar item
 * @param {string} performaId - ID performa detail
 */
function lihatDetailGambar(performaId) {
	if (!performaId) {
		showLaporanNotification('ID performa tidak valid', 'error');
		return;
	}

	const userId = localStorage.getItem('user_id');
	if (!userId) {
		showLaporanNotification('User ID tidak ditemukan', 'error');
		return;
	}

	showLaporanLoading(true);

	jQuery.ajax({
		type: 'POST',
		url: BASE_API + LAPORAN_CONFIG.apiImageEndpoint,
		dataType: 'JSON',
		data: {
			karyawan_id: userId,
			penjualan_detail_performa_id: performaId
		},
		success: function (response) {
			console.log('Image data received:', response);

			if (response && response.data && response.data.gambar) {
				const imagePath = getImagePath(response.data.gambar);
				displayImageInPopup(imagePath);
			} else {
				showLaporanNotification('Gambar tidak ditemukan', 'error');
			}
		},
		error: function (xhr, status, error) {
			console.error('Error fetching image:', {
				status: status,
				error: error,
				response: xhr.responseText
			});

			let errorMessage = 'Gagal memuat gambar';
			try {
				const response = JSON.parse(xhr.responseText);
				if (response.message) {
					errorMessage = response.message;
				}
			} catch (e) {
				console.error('Error parsing response:', e);
			}

			showLaporanNotification(errorMessage, 'error');
		},
		complete: function () {
			showLaporanLoading(false);
		}
	});
}

/**
 * Menampilkan gambar dalam popup
 * @param {string} imagePath - Path lengkap ke gambar
 */
function displayImageInPopup(imagePath) {
	if (!imagePath) return;

	const imageHtml = `
        <img data-image-src="${imagePath}" 
             class="pb-popup-dark-laporan" 
             src="${imagePath}" 
             width="100%"
             alt="Detail Item Image" />
    `;

	jQuery('#item_detail_gambar').html(imageHtml);

	// Setup photo browser untuk zoom
	setupPhotoBrowser(imagePath);
}

/**
 * Setup photo browser untuk zoom gambar
 * @param {string} imagePath - Path gambar
 */
function setupPhotoBrowser(imagePath) {
	// Remove previous event listener
	$$('.pb-popup-dark-laporan').off('click');

	// Add new event listener
	$$('.pb-popup-dark-laporan').on('click', function () {
		const imageUrl = $$(this).attr('data-image-src');

		if (typeof app !== 'undefined' && app.photoBrowser) {
			const photoBrowser = app.photoBrowser.create({
				photos: [imageUrl],
				theme: 'dark',
				type: 'popup'
			});
			photoBrowser.open();
		} else {
			console.warn('Photo Browser not available');
		}
	});
}

// =========================================
// SEARCH & FILTER FUNCTIONS
// =========================================

/**
 * Search dengan debouncing untuk partner
 */
function doSearchPartnerLaporan() {
	clearTimeout(LAPORAN_STATE.searchTimer);

	LAPORAN_STATE.searchTimer = setTimeout(function () {
		console.log('Searching partner...');
		fetchDataLaporanPartner();
	}, LAPORAN_CONFIG.searchDelay);
}

/**
 * Search dengan debouncing untuk customer
 */
function doSearchCustomerLaporan() {
	clearTimeout(LAPORAN_STATE.searchTimer);

	LAPORAN_STATE.searchTimer = setTimeout(function () {
		console.log('Searching customer...');
		fetchDataLaporanPartner();
	}, LAPORAN_CONFIG.searchDelay);
}

/**
 * Reset semua filter pencarian
 */
function resetLaporanFilters() {
	jQuery('#partner_laporan_filter_search').val('');
	jQuery('#partner_customer_filter_search').val('');

	LAPORAN_STATE.currentFilters = {
		partner: '',
		customer: ''
	};

	fetchDataLaporanPartner();
}

/**
 * Refresh data laporan
 */
function refreshLaporanData() {
	console.log('Refreshing laporan data...');
	fetchDataLaporanPartner();
}

// =========================================
// INITIALIZATION & CLEANUP
// =========================================

/**
 * Inisialisasi halaman laporan partner
 */
function initLaporanPartnerPage() {
	console.log('Initializing Laporan Partner Page...');

	// Reset state
	LAPORAN_STATE = {
		laporanData: [],
		isLoading: false,
		searchTimer: null,
		currentFilters: {
			partner: '',
			customer: ''
		},
		currentPage: 1,
		totalData: 0
	};

	// Setup event listeners
	const partnerSearchInput = jQuery('#partner_laporan_filter_search');
	const customerSearchInput = jQuery('#partner_customer_filter_search');

	if (partnerSearchInput.length > 0) {
		partnerSearchInput.off('keyup').on('keyup', doSearchPartnerLaporan);
	}

	if (customerSearchInput.length > 0) {
		customerSearchInput.off('keyup').on('keyup', doSearchCustomerLaporan);
	}

	// Fetch initial data
	fetchDataLaporanPartner();

	console.log('Laporan Partner Page initialized successfully');
}

/**
 * Cleanup saat halaman di-destroy
 */
function destroyLaporanPartnerPage() {
	console.log('Destroying Laporan Partner Page...');

	// Clear timer
	if (LAPORAN_STATE.searchTimer) {
		clearTimeout(LAPORAN_STATE.searchTimer);
		LAPORAN_STATE.searchTimer = null;
	}

	// Remove event listeners
	jQuery('#partner_laporan_filter_search').off('keyup');
	jQuery('#partner_customer_filter_search').off('keyup');
	$$('.pb-popup-dark-laporan').off('click');

	// Reset state
	LAPORAN_STATE = {
		laporanData: [],
		isLoading: false,
		searchTimer: null,
		currentFilters: {
			partner: '',
			customer: ''
		},
		currentPage: 1,
		totalData: 0
	};

	console.log('Laporan Partner Page destroyed');
}

// =========================================
// BACKWARD COMPATIBILITY
// =========================================
// Fungsi-fungsi ini untuk backward compatibility dengan code lama

/**
 * @deprecated Use lihatDetailGambar() instead
 */
function itemDetailGambar(performaId) {
	console.warn('itemDetailGambar() is deprecated. Use lihatDetailGambar() instead');
	lihatDetailGambar(performaId);
}

/**
 * @deprecated Use fetchDataLaporanPartner() instead
 */
function getDataPartnerLaporan() {
	console.warn('getDataPartnerLaporan() is deprecated. Use fetchDataLaporanPartner() instead');
	fetchDataLaporanPartner();
}



// =========================================
// AUTO INITIALIZATION
// =========================================

// Auto initialize jika DOM sudah ready dan halaman laporan aktif
jQuery(document).ready(function () {
	// Cek apakah halaman laporan partner aktif
	if (jQuery('[data-name="laporan-partner-page"]').length > 0) {
		initLaporanPartnerPage();
	}
});

// Export untuk module pattern (optional)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		init: initLaporanPartnerPage,
		destroy: destroyLaporanPartnerPage,
		refresh: refreshLaporanData,
		resetFilters: resetLaporanFilters,
		searchPartner: doSearchPartnerLaporan,
		searchCustomer: doSearchCustomerLaporan
	};
}