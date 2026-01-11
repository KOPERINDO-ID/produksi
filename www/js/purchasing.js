/**
 * =========================================
 * PURCHASING (PARTNER DATA) PAGE MANAGEMENT
 * =========================================
 */

// =========================================
// GLOBAL VARIABLES & CONSTANTS
// =========================================
const PURCHASING_CONFIG = {
	itemsPerPage: 20,
	apiEndpoint: '/get-data-partner',
	apiAddEndpoint: '/partner/tambah-partner-proses',
	apiDeleteEndpoint: '/partner/hapus-partner'
};

let PURCHASING_STATE = {
	currentPage: 1,
	totalData: 0,
	partnerData: [],
	filteredData: [],
	isLoading: false,
	searchTimer: null
};

// =========================================
// HELPER FUNCTIONS
// =========================================

/**
 * Membersihkan string untuk pencarian
 */
function sanitizeString(str) {
	if (!str) return '';
	return str.toString().toLowerCase().trim();
}

/**
 * Escape HTML untuk mencegah XSS
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
 * Membuat HTML untuk baris tabel partner
 */
function createPartnerTableRow(partner, index) {
	return `
        <tr>
            <td style="border:1px solid gray !important;" class="label-cell text-align-center">
                ${index}
            </td>
            <td style="border:1px solid gray !important;" class="label-cell text-align-left">
                ${escapeHtml(partner.nama_partner || '-')}
            </td>
            <td style="border:1px solid gray !important;" class="label-cell text-align-center">
                ${escapeHtml(partner.no_hp || '-')}
            </td>
            <td style="border:1px solid gray !important;" class="label-cell text-align-left">
                ${escapeHtml(partner.pic || '-')}
            </td>
            <td style="border:1px solid gray !important;" class="label-cell text-align-left">
                ${escapeHtml(partner.kota || '-')}
            </td>
            <td style="border:1px solid gray !important;" class="label-cell text-align-left">
                ${escapeHtml(partner.alamat || '-')}
            </td>
            <td style="border:1px solid gray !important;" class="label-cell text-align-center">
                <button class="button button-small button-fill color-red" 
                    onclick="deletePartner('${partner.id_partner}', '${escapeHtml(partner.nama)}')">
                    Hapus
                </button>
            </td>
        </tr>
    `;
}

/**
 * Membuat HTML untuk tombol paginasi sederhana
 * Style sama dengan partner.js
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
 * Menampilkan loading indicator
 */
function showPurchasingLoading(show = true) {
	PURCHASING_STATE.isLoading = show;
	if (typeof app !== 'undefined' && app.dialog) {
		if (show) {
			app.dialog.preloader('Memuat Data...');
		} else {
			app.dialog.close();
		}
	}
}

/**
 * Menampilkan notifikasi
 */
function showPurchasingNotification(message, type = 'success') {
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
 * Mengambil data partner dari server
 */
function fetchPartnerData() {
	showPurchasingLoading(true);

	jQuery.ajax({
		type: 'POST',
		url: BASE_API + PURCHASING_CONFIG.apiEndpoint,
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem('user_id'),
		},
		success: function (response) {
			console.log('Partner data received:', response);

			if (response && response.data) {
				PURCHASING_STATE.partnerData = response.data;
				PURCHASING_STATE.filteredData = [...PURCHASING_STATE.partnerData];
				PURCHASING_STATE.totalData = PURCHASING_STATE.partnerData.length;

				renderPartnerData();
				showPurchasingNotification('Data berhasil dimuat', 'success');
			} else {
				PURCHASING_STATE.partnerData = [];
				PURCHASING_STATE.filteredData = [];
				PURCHASING_STATE.totalData = 0;

				renderPartnerData();
				showPurchasingNotification('Tidak ada data ditemukan', 'error');
			}
		},
		error: function (xhr, status, error) {
			console.error('Error fetching partner data:', {
				status: status,
				error: error,
				response: xhr.responseText
			});

			PURCHASING_STATE.partnerData = [];
			PURCHASING_STATE.filteredData = [];
			PURCHASING_STATE.totalData = 0;

			renderPartnerData();

			let errorMessage = 'Gagal memuat data partner';
			try {
				const response = JSON.parse(xhr.responseText);
				if (response.message) {
					errorMessage = response.message;
				}
			} catch (e) {
				console.error('Error parsing response:', e);
			}

			showPurchasingNotification(errorMessage, 'error');
		},
		complete: function () {
			showPurchasingLoading(false);
		}
	});
}

/**
 * Render data partner ke tabel dengan pagination
 */
function renderPartnerData() {
	const tableBody = jQuery('#partner_data');


	// Clear table
	tableBody.html('');

	const activeData = PURCHASING_STATE.filteredData;

	if (activeData.length === 0) {
		tableBody.html(`
            <tr>
			<td colspan="7" style="padding: 20px; text-align: center; color: #999; border: 1px solid gray;">
			<i class="f7-icons" style="font-size: 48px;">person_crop_circle_badge_xmark</i>
			<p style="margin-top: 10px;">Tidak ada data partner</p>
			</td>
            </tr>
			`);
		// Sembunyikan pagination jika tidak ada data
		jQuery('#pagination_button').html('');
		return;
	}

	// Update jumlah data
	jQuery('#jumlah_data_partner').text(activeData.length);

	// Hitung pagination
	const totalPages = Math.ceil(activeData.length / PURCHASING_CONFIG.itemsPerPage);

	// Pastikan currentPage valid
	if (PURCHASING_STATE.currentPage > totalPages) {
		PURCHASING_STATE.currentPage = totalPages;
	}
	if (PURCHASING_STATE.currentPage < 1) {
		PURCHASING_STATE.currentPage = 1;
	}

	// Ambil data untuk halaman saat ini
	const startIndex = (PURCHASING_STATE.currentPage - 1) * PURCHASING_CONFIG.itemsPerPage;
	const endIndex = startIndex + PURCHASING_CONFIG.itemsPerPage;
	const pageData = activeData.slice(startIndex, endIndex);

	// Build table rows dengan nomor yang benar
	let html = '';
	const startNumber = startIndex + 1;

	pageData.forEach((partner, index) => {
		html += createPartnerTableRow(partner, startNumber + index);
	});

	tableBody.html(html);

	// Render pagination buttons
	const paginationHtml = createPaginationButtons(PURCHASING_STATE.currentPage, totalPages);
	jQuery('#pagination_button').html(paginationHtml);

	console.log(`Rendered page ${PURCHASING_STATE.currentPage} with ${pageData.length} items (Total: ${activeData.length} items, ${totalPages} pages)`);
}

/**
 * Pindah ke halaman tertentu
 */
function goToPage(page) {
	PURCHASING_STATE.currentPage = page;
	renderPartnerData();

	// Scroll ke atas tabel
	const tableElement = document.getElementById('partner_data');
	if (tableElement) {
		tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
}

// =========================================
// SEARCH & FILTER FUNCTIONS
// =========================================

/**
 * Search partner dengan debouncing
 */
function doSearchPartner() {
	clearTimeout(PURCHASING_STATE.searchTimer);

	PURCHASING_STATE.searchTimer = setTimeout(function () {
		const searchValue = sanitizeString(jQuery('#partner_filter_search').val());

		console.log('Searching partner:', searchValue);

		if (!searchValue) {
			// Jika search kosong, tampilkan semua data
			PURCHASING_STATE.filteredData = [...PURCHASING_STATE.partnerData];
		} else {
			// Filter data berdasarkan search
			PURCHASING_STATE.filteredData = PURCHASING_STATE.partnerData.filter(partner => {
				const nama = sanitizeString(partner.nama);
				const pic = sanitizeString(partner.pic);
				const kota = sanitizeString(partner.kota);
				const noHp = sanitizeString(partner.no_hp);

				return nama.includes(searchValue) ||
					pic.includes(searchValue) ||
					kota.includes(searchValue) ||
					noHp.includes(searchValue);
			});
		}

		// Reset ke halaman pertama saat search
		PURCHASING_STATE.currentPage = 1;

		renderPartnerData();
	}, 500); // Debounce 500ms
}

// =========================================
// CRUD OPERATIONS
// =========================================

/**
 * Tambah partner baru
 */
function tambahPartnerProses() {
	console.log('Adding new partner...');

	// Get form values
	const namaPartner = jQuery('#nama_partner').val();
	const pic = jQuery('#pic').val();
	const noHp = jQuery('#no_hp').val();
	const kota = jQuery('#kota').val();
	const alamat = jQuery('#alamat').val();

	// Validation
	if (!namaPartner || !pic || !noHp || !kota || !alamat) {
		showPurchasingNotification('Mohon lengkapi semua field', 'error');
		return;
	}

	showPurchasingLoading(true);

	// Prepare data
	const postData = {
		nama: namaPartner,
		pic: pic,
		no_hp: noHp,
		kota: kota,
		alamat: alamat
	};

	jQuery.ajax({
		type: 'POST',
		url: BASE_API + PURCHASING_CONFIG.apiAddEndpoint,
		dataType: 'JSON',
		contentType: 'application/json',
		data: JSON.stringify(postData),
		success: function (response) {
			console.log('Partner added:', response);

			if (response.success) {
				showPurchasingNotification('Partner berhasil ditambahkan', 'success');

				// Reset form
				jQuery('#tambah_partner_form')[0].reset();

				// Close popup
				if (typeof app !== 'undefined') {
					app.popup.close('.tambah-partner');
				}

				// Refresh data
				fetchPartnerData();
			} else {
				showPurchasingNotification(response.message || 'Gagal menambahkan partner', 'error');
			}
		},
		error: function (xhr, status, error) {
			console.error('Error adding partner:', {
				status: status,
				error: error,
				response: xhr.responseText
			});

			let errorMessage = 'Gagal menambahkan partner';
			try {
				const response = JSON.parse(xhr.responseText);
				if (response.message) {
					errorMessage = response.message;
				}
			} catch (e) {
				console.error('Error parsing response:', e);
			}

			showPurchasingNotification(errorMessage, 'error');
		},
		complete: function () {
			showPurchasingLoading(false);
		}
	});
}

/**
 * Delete partner
 */
function deletePartner(partnerId, partnerName) {
	console.log('Delete partner:', partnerId, partnerName);

	if (typeof app !== 'undefined') {
		app.dialog.confirm(
			`Hapus partner "${partnerName}"?<br>Data yang sudah dihapus tidak dapat dikembalikan.`,
			'Konfirmasi Hapus',
			function () {
				executeDeletePartner(partnerId);
			}
		);
	} else {
		if (confirm(`Hapus partner "${partnerName}"?`)) {
			executeDeletePartner(partnerId);
		}
	}
}

/**
 * Eksekusi delete partner
 */
function executeDeletePartner(partnerId) {
	showPurchasingLoading(true);

	jQuery.ajax({
		type: 'DELETE',
		url: BASE_API + PURCHASING_CONFIG.apiDeleteEndpoint + '/' + partnerId,
		dataType: 'JSON',
		success: function (response) {
			console.log('Partner deleted:', response);

			if (response.success) {
				showPurchasingNotification('Partner berhasil dihapus', 'success');

				// Refresh data
				fetchPartnerData();
			} else {
				showPurchasingNotification(response.message || 'Gagal menghapus partner', 'error');
			}
		},
		error: function (xhr, status, error) {
			console.error('Error deleting partner:', {
				status: status,
				error: error,
				response: xhr.responseText
			});

			let errorMessage = 'Gagal menghapus partner';
			try {
				const response = JSON.parse(xhr.responseText);
				if (response.message) {
					errorMessage = response.message;
				}
			} catch (e) {
				console.error('Error parsing response:', e);
			}

			showPurchasingNotification(errorMessage, 'error');
		},
		complete: function () {
			showPurchasingLoading(false);
		}
	});
}

// =========================================
// INITIALIZATION
// =========================================

/**
 * Inisialisasi halaman purchasing
 */
function initPurchasingPage() {
	console.log('Initializing Purchasing Page...');

	// Reset state
	PURCHASING_STATE = {
		currentPage: 1,
		totalData: 0,
		partnerData: [],
		filteredData: [],
		isLoading: false,
		searchTimer: null
	};

	// Setup event listeners
	const searchInput = jQuery('#partner_filter_search');
	if (searchInput.length > 0) {
		searchInput.off('keyup').on('keyup', doSearchPartner);
	}

	// Fetch initial data
	fetchPartnerData();

	console.log('Purchasing Page initialized successfully');
}

/**
 * Cleanup saat halaman di-destroy
 */
function destroyPurchasingPage() {
	console.log('Destroying Purchasing Page...');

	// Clear timer
	if (PURCHASING_STATE.searchTimer) {
		clearTimeout(PURCHASING_STATE.searchTimer);
		PURCHASING_STATE.searchTimer = null;
	}

	// Remove event listeners
	jQuery('#partner_filter_search').off('keyup');

	// Reset state
	PURCHASING_STATE = {
		currentPage: 1,
		totalData: 0,
		partnerData: [],
		filteredData: [],
		isLoading: false,
		searchTimer: null
	};

	console.log('Purchasing Page destroyed');
}

// =========================================
// AUTO INITIALIZATION
// =========================================

// Auto initialize jika DOM sudah ready dan halaman purchasing aktif
jQuery(document).ready(function () {
	if (jQuery('[data-name="purchasing"]').length > 0) {
		initPurchasingPage();
	}
});

// Export untuk module pattern (optional)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		init: initPurchasingPage,
		destroy: destroyPurchasingPage,
		refresh: fetchPartnerData,
		search: doSearchPartner
	};
}