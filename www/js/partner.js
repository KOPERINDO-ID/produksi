/**
 * =========================================
 * PARTNER MANAGEMENT - PURCHASE SYSTEM
 * =========================================
 * Sistem untuk mengelola purchase/pembelian dari partner
 */

// =========================================
// GLOBAL VARIABLES & CONSTANTS
// =========================================

let PURCHASE_STATE = {
    currentPerformaId: null,
    currentPenjualanId: null,
    currentClientId: null,
    currentSpkCode: null,
    currentClientName: null,
    currentQuantity: 0,
    currentItem: null,
    currentTanggalKirim: null,
    partnerList: [],
    purchaseList: [],
    purchaseDetailList: []
};

let MATERIAL_STATE = {
    currentPartnerTransaksiId: null,
    currentPartnerName: null,
    currentItem: null,
    currentJumlah: 0,
    materialList: []
};

// =========================================
// HELPER FUNCTIONS
// =========================================

/**
 * Format angka dengan separator ribuan
 */
function formatNumber(num) {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Format mata uang Rupiah
 */
function formatRupiah(angka) {
    if (!angka) return 'Rp 0';
    return 'Rp ' + parseInt(angka).toLocaleString('id-ID');
}

/**
 * Format tanggal ke format dd/mm/yyyy
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
 * Format SPK Code dari penjualan_id dan tanggal
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
 * Menampilkan loading indicator
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
 * Copy tanggal kirim ke deadline
 * FUNGSI INI BISA DIPANGGIL LANGSUNG DARI ONCLICK ATAU EVENT LISTENER
 */
function copyKirimToDeadline() {
    console.log('copyKirimToDeadline() called');

    // Ambil nilai dari input tanggal kirim
    const tglKirim = $('#tgl_kirim_purchase').val();

    console.log('Tanggal Kirim:', tglKirim);

    // Cek apakah tanggal kirim ada
    if (tglKirim && tglKirim.trim() !== '') {
        // Set value ke input tanggal deadline
        $('#tgl_deadline_purchase').val(tglKirim);

        // Trigger change event agar form tahu ada perubahan
        $('#tgl_deadline_purchase').trigger('change');

        console.log('Tanggal berhasil disalin:', tglKirim);

        // Show success notification
        showNotification('Tanggal berhasil disalin', 'success');
    } else {
        console.log('Tanggal kirim kosong');

        // Show error notification
        showNotification('Tanggal kirim belum diisi', 'error');
    }

    return false; // Prevent any default behavior
}

// =========================================
// PURCHASE MODAL FUNCTIONS
// =========================================

/**
 * Membuka modal purchase dengan data dari API
 */
function openPurchaseModal(penjualan_detail_performa_id = PURCHASE_STATE.currentPerformaId) {
    console.log('Opening purchase modal for performa_id:', penjualan_detail_performa_id);

    // Validasi
    if (!penjualan_detail_performa_id) {
        showAlert('ID Performa tidak valid', 'Error');
        return;
    }

    // Simpan performa id ke state
    PURCHASE_STATE.currentPerformaId = penjualan_detail_performa_id;

    // Load all data from single API
    loadPurchaseData(penjualan_detail_performa_id);

    // Open modal
    if (typeof app !== 'undefined') {
        app.popup.open('.proses-purchase');
    }
}

/**
 * Load semua data purchase dari API
 */
function loadPurchaseData(penjualan_detail_performa_id) {
    $.ajax({
        type: "POST",
        url: BASE_API + "/get-popup-purchase",
        dataType: 'json',
        data: {
            penjualan_detail_performa_id: penjualan_detail_performa_id
        },
        beforeSend: function () {
            showLoading(true);
        },
        success: function (response) {
            console.log('Purchase data loaded:', response);

            if (response.status == 1 && response.data) {
                // Simpan data ke state
                PURCHASE_STATE.partnerList = response.data.partner || [];
                PURCHASE_STATE.purchaseList = response.data.partner_transaksi || [];
                PURCHASE_STATE.purchaseDetailList = response.data.partner_transaksi_detail || [];

                $('#tgl_kirim_purchase').val(formatDate(response.data.penjualan_header.penjualan_tanggal_kirim));

                // Populate header info
                populatePurchaseHeader(response.data, response.data.partner_transaksi);

                // Populate partner dropdown
                populatePartnerDropdown(response.data.partner);

                // Render purchase table
                renderPurchasingTable(response.data.partner_transaksi, response.data);

                // Calculate and update summary
                updatePurchaseSummary(response.data);

            } else {
                showAlert(response.message || 'Gagal memuat data purchase', 'Error');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading purchase data:', error);
            showAlert('Terjadi kesalahan saat memuat data', 'Error');
        },
        complete: function () {
            showLoading(false);
        }
    });
}

/**
 * Populate header information
 */
function populatePurchaseHeader(data, transaksi) {
    const penjualan_header = data.penjualan_header;
    const penjualan_detail = data.penjualan_detail;
    const transaksi_pembelian = transaksi;

    if (penjualan_header && penjualan_detail && transaksi_pembelian) {
        // Update state
        PURCHASE_STATE.currentPenjualanId = penjualan_header.penjualan_id;
        PURCHASE_STATE.currentClientId = penjualan_header.client_id;
        PURCHASE_STATE.currentClientName = penjualan_header.client_nama;
        PURCHASE_STATE.currentQuantity = penjualan_detail.penjualan_qty;
        PURCHASE_STATE.currentItem = penjualan_detail.produk_keterangan_kustom;
        PURCHASE_STATE.currentTanggalKirim = penjualan_header.penjualan_tanggal_kirim;

        // Format SPK code (penjualan_id dengan format)
        const spkCode = formatSPKCode(penjualan_header.penjualan_id, penjualan_header.penjualan_tanggal);

        PURCHASE_STATE.currentSpkCode = spkCode;

        // Update UI
        $('#spk-code').text(spkCode);
        $('#client-name').text(penjualan_header.client_nama || '-');
        $('#purchase-qty').text((penjualan_detail.penjualan_qty || 0) + ' pcs');

        // Update table summary
        $('#type_purchase_tbl').text(penjualan_detail.produk_keterangan_kustom || '-');
        $('#qty_purchase_tbl').text(penjualan_detail.penjualan_qty || 0);

        // Set hidden inputs
        $('#item_purchase').val(penjualan_detail.produk_keterangan_kustom || '');
        $('#penjualan_detail_performa_id_purchase').val(penjualan_detail.penjualan_detail_performa_id || '');
    }
}

/**
 * Populate partner dropdown
 */
function populatePartnerDropdown(partners) {
    let options = '<option value="">Pilih Partner</option>';

    if (partners && partners.length > 0) {
        partners.forEach(function (partner) {
            options += `<option value="${partner.id_partner}">${partner.nama_partner}</option>`;
        });
    }

    $('#nama_partner_purchase').html(options);

    // Reinit smart select
    if (typeof app !== 'undefined') {
        const smartSelect = app.smartSelect.get('.partner-smart-select');
        if (smartSelect) {
            smartSelect.destroy();
        }

        app.smartSelect.create({
            el: '.partner-smart-select',
            closeOnSelect: true,
            openIn: 'popup',
            searchbar: true,
            searchbarPlaceholder: 'Cari Partner'
        });
    }
}

/**
 * Update purchase summary table
 */
function updatePurchaseSummary(data) {
    const penjualan_detail = data.penjualan_detail;
    const partner_transaksi = data.partner_transaksi || [];

    if (penjualan_detail) {
        let totalQtyPurchase = 0;

        // Calculate total qty from partner_transaksi
        if (partner_transaksi.length > 0) {
            partner_transaksi.forEach(function (transaksi) {
                totalQtyPurchase += parseInt(transaksi.jumlah) || 0;
            });
        }

        const qty = parseInt(penjualan_detail.penjualan_qty) || 0;
        const sisa = qty - totalQtyPurchase;

        // Update UI
        $('#selesai_purchase_tbl').text(totalQtyPurchase);
        $('#sisa_purchase_tbl').text(sisa);

        // Update hidden input
        $('#qty_total_input').val(sisa);
    }
}

/**
 * Render purchasing table
 */
function renderPurchasingTable(purchases, data) {
    let html = '';

    if (!purchases || purchases.length === 0) {
        html = `
            <tr>
                <td colspan="4" align="center" style="border-top: solid 1px; border-left: solid 1px; border-color:gray; padding: 20px;">
                    <i class="f7-icons" style="font-size: 40px; color: #999;">cube_box</i>
                    <p style="color: #999; margin-top: 10px;">Belum ada data</p>
                </td>
            </tr>
        `;
    } else {
        purchases.forEach(function (purchase, index) {
            html += `
                <tr>
                    <td align="center" style="border-top: solid 1px; border-left: solid 1px; border-color:gray; padding: 10px;">
                        ${index + 1}
                    </td>
                    <td align="left" style="border-top: solid 1px; border-left: solid 1px; border-color:gray; padding: 10px;">
                        <div style="font-weight: bold;">${purchase.nama_partner || '-'}</div>
                    </td>
                    <td align="right" style="border-top: solid 1px; border-left: solid 1px; border-color:gray; padding: 10px;">
                        <div style="font-weight: bold;">${purchase.jumlah || 0}</div>
                    </td>
                    <td align="center" style="border-top: solid 1px; border-left: solid 1px; border-color:gray; padding: 10px;">
                        <button onclick="openMaterialModal('${purchase.id_partner_transaksi}', '${purchase.nama_partner}', '${data.penjualan_header.penjualan_id}', '${data.penjualan_header.penjualan_tanggal}', ${purchase.jumlah});" 
                                class="button button-small bg-dark-gray-young text-add-colour-black-soft" 
                                style="width: 85px;">
                                    Material
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    $('#data_partner_purchasing').html(html);
}

/**
 * Process purchase (Save)
 * //! NOTE
 */
function PurchaseProces() {
    console.log('Processing purchase...');

    // Get form values
    const partnerId = $('#nama_partner_purchase').val();
    const qty = $('#qty_purchase').val();
    const productionFee = $('#production_fee').val();
    const tglDeadline = $('#tgl_deadline_purchase').val();
    const keterangan = $('#keterangan_partner').val();

    // Validation
    if (!partnerId) {
        showAlert('Pilih partner terlebih dahulu', 'Perhatian');
        return;
    }

    if (!qty || qty <= 0) {
        showAlert('Masukkan jumlah yang valid', 'Perhatian');
        return;
    }

    if (!productionFee || productionFee <= 0) {
        showAlert('Masukkan harga yang valid', 'Perhatian');
        return;
    }

    if (!tglDeadline) {
        showAlert('Pilih tanggal deadline', 'Perhatian');
        return;
    }

    // Prepare data
    const formData = {
        penjualan_detail_performa_id: PURCHASE_STATE.currentPerformaId,
        item: $('#item_purchase').val(),
        id_partner: partnerId,
        jumlah_qty: qty,
        harga_produksi: productionFee,
        tgl_deadline: tglDeadline,
        keterangan: keterangan
    };

    console.log('Sending purchase data:', formData);

    // Send to API
    $.ajax({
        type: 'POST',
        url: BASE_API + '/tambah-purchase-proses',
        data: formData,
        dataType: 'json',
        beforeSend: function () {
            showLoading(true);
            $('#performa_button_save').prop('disabled', true);
        },
        success: function (response) {
            console.log('Purchase save response:', response);

            if (response.status === 'done') {
                showNotification('Purchase berhasil disimpan', 'success');

                // Clear form
                $('#purchase_form')[0].reset();
                $('#nama_partner_purchase').val('');

                // Reload purchase data
                loadPurchaseData(PURCHASE_STATE.currentPerformaId);

            } else {
                showAlert(response.message || 'Gagal menyimpan purchase', 'Error');
            }
        },
        error: function (xhr, status, error) {
            showLoading(false);
            console.error('Purchase save error:', error);
            showAlert('Terjadi kesalahan saat menyimpan', 'Error');
        },
        complete: function () {
            showLoading(false);
            $('#performa_button_save').prop('disabled', false);
        }
    });
}

/**
 * Delete purchase
 * //! NOTE
 */
function deletePurchase(id_partner_transaksi) {
    console.log('Deleting purchase:', id_partner_transaksi);

    showConfirm('Apakah Anda yakin ingin menghapus data ini?', 'Konfirmasi Hapus', function () {
        $.ajax({
            type: 'POST',
            url: BASE_API + '/delete-partner-transaksi',
            data: {
                token: localStorage.getItem('token'),
                id_partner_transaksi: id_partner_transaksi
            },
            dataType: 'json',
            beforeSend: function () {
                showLoading(true);
            },
            success: function (response) {
                console.log('Delete response:', response);

                if (response.status == 1) {
                    showNotification('Purchase berhasil dihapus', 'success');

                    // Reload data
                    loadPurchaseData(PURCHASE_STATE.currentPerformaId);

                } else {
                    showAlert(response.message || 'Gagal menghapus purchase', 'Error');
                }
            },
            error: function (xhr, status, error) {
                console.error('Delete error:', error);
                showAlert('Terjadi kesalahan saat menghapus', 'Error');
            },
            complete: function () {
                showLoading(false);
            }
        });
    });
}

/**
 * =========================================
 * MATERIAL MANAGEMENT FUNCTIONS
 * =========================================
 * Fungsi untuk mengelola material partner
 */

// =========================================
// MATERIAL TABLE FUNCTIONS
// =========================================

/**
 * Membuka modal material dengan data dari API
 */
function openMaterialModal(id_partner_transaksi, partner_name = '') {
    console.log('Opening material modal for partner transaksi:', id_partner_transaksi);

    // Validasi
    if (!id_partner_transaksi) {
        showAlert('ID Partner Transaksi tidak valid', 'Error');
        return;
    }

    // Simpan id ke state
    MATERIAL_STATE.currentPartnerTransaksiId = id_partner_transaksi;
    MATERIAL_STATE.currentPartnerName = partner_name;

    // Load material data from API
    loadMaterialData(id_partner_transaksi);

    // Open modal
    if (typeof app !== 'undefined') {
        app.popup.open('.popup-material');
    }
}

/**
 * Load data material dari API
 */
function loadMaterialData(id_partner_transaksi) {
    console.log('Loading material data for ID:', id_partner_transaksi);

    $.ajax({
        type: "POST",
        url: BASE_API + "/material",
        dataType: 'json',
        data: {
            id_partner_transaksi: id_partner_transaksi
        },
        beforeSend: function () {
            showLoading(true);
        },
        success: function (response) {
            console.log('Material data loaded:', response);

            if (response.success === true && response.data) {
                // Simpan data ke state
                MATERIAL_STATE.materialList = response.data.material || [];

                // Populate header info
                populateMaterialHeader(response.data);

                // Render material table
                renderMaterialTable(response.data.material);

                // Update material count
                updateMaterialCount(response.data.total_items || 0);

            } else {
                showAlert(response.message || 'Gagal memuat data material', 'Error');
                // Render empty table
                renderEmptyMaterialTable();
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading material data:', error);
            console.error('Response:', xhr.responseText);

            // Check if 404 (no data found)
            if (xhr.status === 404) {
                console.log('No material data found - rendering empty table');
                renderEmptyMaterialTable();
                updateMaterialCount(0);
            } else {
                showAlert('Terjadi kesalahan saat memuat data', 'Error');
            }
        },
        complete: function () {
            showLoading(false);
        }
    });
}

/**
 * Populate material header information
 */
function populateMaterialHeader(data) {
    console.log('Populating material header:', data);

    if (data.partner_info) {
        const partnerInfo = data.partner_info;

        // Set partner name
        $('#material-partner-name').text(partnerInfo.nama_partner || '-');

        // Set SPK code from penjualan_id
        if (partnerInfo.penjualan_id) {
            // Assuming you have the date from somewhere, otherwise use today's date
            const spkCode = formatSPKCode(partnerInfo.penjualan_id, new Date());
            $('#material-spk-code').text(spkCode);
        }
    }

    // Set quantity badge (could be sum of material quantities or from partner_info)
    // const totalQty = data.material ? data.material.reduce((sum, item) => sum + parseInt(item.jumlah || 0), 0) : 0;
    const totalQty = data.partner_info.penjualan_qty;
    $('#material-quantity').text(totalQty + ' pcs');
}

/**
 * Render material table
 */
function renderMaterialTable(materials) {
    console.log('Rendering material table:', materials);

    const tbody = $('#material_table_body');
    tbody.empty();

    if (!materials || materials.length === 0) {
        renderEmptyMaterialTable();
        return;
    }

    materials.forEach((item, index) => {
        const row = createMaterialRow(item, index + 1);
        tbody.append(row);
    });

    console.log('Material table rendered with', materials.length, 'rows');
}

/**
 * Render empty material table
 */
function renderEmptyMaterialTable() {
    const tbody = $('#material_table_body');
    tbody.empty();

    const emptyRow = `
        <tr>
            <td colspan="6" align="center" style="padding: 20px; border: 1px solid #ddd;">
                <i class="f7-icons" style="font-size: 40px; color: #999;">cube_box</i>
                <p style="color: #999; margin-top: 10px;">Belum ada data material</p>
            </td>
        </tr>
    `;

    tbody.append(emptyRow);
}

/**
 * Create material table row
 */
function createMaterialRow(item, rowNumber) {
    const tanggal = formatDateShow(item.dt_created);
    const materialName = item.nama || '-';
    const jumlah = formatNumber(item.jumlah || 0);
    const harga = formatRupiah(item.harga || 0);
    const total = formatRupiah(item.total_harga || 0);

    // ========== PHOTO BUTTON - SIMPLIFIED ==========
    let photoButton = '';
    if (item.foto_bukti_material) {
        const photoUrl = item.foto_bukti_material;

        photoButton = `
            <button class="button button-small button-fill color-blue text-bold" 
                    onclick="viewMaterialPhoto('${photoUrl}')" 
                    style="margin-right: 4px;">
                        DETAIL
            </button>
        `;
    }
    // ==============================================

    const row = `
        <tr data-id="${item.id}">
            <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${rowNumber}</td>
            <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${tanggal}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${materialName}</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${jumlah}</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${harga}</td>
            <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">
                ${photoButton}
            </td>
        </tr>
    `;

    return row;
}
/**
 * Update material count
 */
function updateMaterialCount(count) {
    $('#material_count').text(count + ' item');
}

/**
 * Add new material row (inline editing)
 */
function addMaterialRow() {
    console.log('Adding new material row');

    // Validasi
    if (!MATERIAL_STATE.currentPartnerTransaksiId) {
        showAlert('ID Partner Transaksi tidak tersedia', 'Error');
        return;
    }

    // Check if there's already an editing row
    if ($('.editing-row').length > 0) {
        showAlert('Selesaikan penambahan material yang sedang berlangsung', 'Perhatian');
        return;
    }

    // Remove empty placeholder if exists
    $('#material_table_body tr').each(function () {
        if ($(this).find('td[colspan="6"]').length > 0) {
            $(this).remove();
        }
    });

    // Create new editable row
    const newRow = createEditableMaterialRow();
    $('#material_table_body').prepend(newRow);

    // Focus on first input
    $('#input_material_nama').focus();

    console.log('Editable row added');
}

/**
 * Create editable material row for adding new material
 */
function createEditableMaterialRow(item = null) {
    const isEdit = item !== null;
    const rowId = isEdit ? item.id : 'new';

    const tanggal = isEdit ? formatDate(item.dt_created) : formatDate(new Date());
    const materialName = isEdit ? item.nama : '';
    const jumlah = isEdit ? item.jumlah : '';
    const harga = isEdit ? item.harga : '';

    const row = `
        <tr class="editing-row" data-id="${rowId}">
            <td style="padding: 8px; text-align: center; border: 1px solid #ddd; background-color: #FFF9E6;">
                <i class="f7-icons" style="color: #FFA500;">pencil_circle_fill</i>
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #FFF9E6;">
                <input type="date" 
                       class="form-control" 
                       id="input_material_tanggal" 
                       value="${tanggal}"
                       style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px;">
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #FFF9E6;">
                <input type="text" 
                       class="form-control" 
                       id="input_material_nama" 
                       placeholder="Nama Material"
                       value="${materialName}"
                       style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px;">
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #FFF9E6;">
                <input type="number" 
                       class="form-control" 
                       id="input_material_jumlah" 
                       placeholder="Jumlah"
                       value="${jumlah}"
                       min="0"
                       style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px;">
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #FFF9E6;">
                <input type="number" 
                       class="form-control" 
                       id="input_material_harga" 
                       placeholder="Harga"
                       value="${harga}"
                       min="0"
                       style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px;">
            </td>
            <td class="display-flex flex-direction-row justify-content-space-between align-items-center" style="padding: 8px; text-align: center; border: 1px solid #ddd; background-color: #FFF9E6;">
                <button class="button button-small button-fill color-green" style="margin-right: 4px;"
                        onclick="saveMaterialRow()">
                    <i class="f7-icons" style="font-size: 16px;">checkmark</i>
                </button>
                <button class="button button-small button-fill color-red" 
                        onclick="cancelMaterialRow()">
                    <i class="f7-icons" style="font-size: 16px;">xmark</i>
                </button>
            </td>
        </tr>
    `;

    return row;
}

/**
 * Save material row (add new or update existing)
 */
function saveMaterialRow() {
    console.log('Saving material row');

    // Get values
    const nama = $('#input_material_nama').val().trim();
    const jumlah = parseInt($('#input_material_jumlah').val()) || 0;
    const harga = parseInt($('#input_material_harga').val()) || 0;

    // Validation
    if (!nama) {
        showAlert('Nama material harus diisi', 'Perhatian');
        $('#input_material_nama').focus();
        return;
    }

    if (jumlah <= 0) {
        showAlert('Jumlah harus lebih dari 0', 'Perhatian');
        $('#input_material_jumlah').focus();
        return;
    }

    if (harga <= 0) {
        showAlert('Harga harus lebih dari 0', 'Perhatian');
        $('#input_material_harga').focus();
        return;
    }

    // Calculate total
    const total_harga = jumlah * harga;

    // Prepare data
    const materialData = {
        id_partner_transaksi: MATERIAL_STATE.currentPartnerTransaksiId,
        nama: nama,
        jumlah: jumlah,
        harga: harga,
        total_harga: total_harga
    };

    console.log('Material data to save:', materialData);

    // Check if editing existing row
    const rowId = $('.editing-row').data('id');
    if (rowId && rowId !== 'new') {
        materialData.id = rowId;
        updateMaterialToServer(materialData);
    } else {
        // Open photo upload popup
        openPhotoUploadPopup(materialData);
    }
}

/**
 * Open photo upload popup
 */
function openPhotoUploadPopup(materialData) {
    console.log('Opening photo upload popup');

    // Save temp data
    MATERIAL_STATE.tempMaterialRow = materialData;

    // Initialize Header Data
    $('#photo-spk-code').text(PURCHASE_STATE.currentSpkCode);
    $('#photo-partner-name').text(MATERIAL_STATE.currentPartnerName);
    $('#photo-purchase-qty').text(PURCHASE_STATE.currentQuantity);

    // Initialize Table Data
    $('#photo_type_purchase_tbl').text(PURCHASE_STATE.currentItem);
    $('#photo_qty_purchase_tbl').text(PURCHASE_STATE.currentQuantity);
    $('#photo_selesai_purchase_tbl').text(MATERIAL_STATE.currentJumlah);

    // Reset upload form
    $('#photo_upload_input').val('');
    $('#photo_preview').attr('src', '');
    $('#photo_empty_placeholder').show();
    $('#photo_preview_area').hide();
    $('#btn_upload_photo').hide();

    // Open popup
    if (typeof app !== 'undefined') {
        app.popup.open('.popup-photo-upload');
    }
}

/**
 * Cancel material row editing
 */
function cancelMaterialRow() {
    console.log('Canceling material row');

    showConfirm(
        'Batalkan penambahan material?',
        'Konfirmasi',
        function () {
            $('.editing-row').remove();

            // Check if table is empty
            if ($('#material_table_body tr').length === 0) {
                renderEmptyMaterialTable();
            }

            console.log('Material row cancelled');
        }
    );
}

/**
 * Edit material row
 */
function editMaterialRow(id) {
    console.log('Editing material row:', id);

    // Check if there's already an editing row
    if ($('.editing-row').length > 0) {
        showAlert('Selesaikan pengeditan yang sedang berlangsung', 'Perhatian');
        return;
    }

    // Find material in state
    const material = MATERIAL_STATE.materialList.find(item => item.id === id);

    if (!material) {
        showAlert('Data material tidak ditemukan', 'Error');
        return;
    }

    console.log('Material to edit:', material);

    // Find and replace the row
    const targetRow = $(`#material_table_body tr[data-id="${id}"]`);
    if (targetRow.length > 0) {
        const editableRow = createEditableMaterialRow(material);
        targetRow.replaceWith(editableRow);
        $('#input_material_nama').focus();
    }
}

/**
 * Update material to server
 */
function updateMaterialToServer(materialData) {
    console.log('Updating material to server:', materialData);

    $.ajax({
        type: 'POST',
        url: BASE_API + '/material/update-partner-material',
        data: materialData,
        dataType: 'json',
        beforeSend: function () {
            showLoading(true);
        },
        success: function (response) {
            console.log('Update response:', response);

            if (response.status == 1 || response.success === true) {
                showNotification('Material berhasil diupdate', 'success');

                // Remove editing row
                $('.editing-row').remove();

                // Refresh material data
                refreshMaterialData();
            } else {
                showAlert(response.message || 'Gagal mengupdate material', 'Error');
            }
        },
        error: function (xhr, status, error) {
            console.error('Update error:', error);
            showAlert('Terjadi kesalahan saat mengupdate material', 'Error');
        },
        complete: function () {
            showLoading(false);
        }
    });
}

/**
 * Delete material row
 */
function deleteMaterialRow(id) {
    console.log('Deleting material row:', id);

    showConfirm(
        'Hapus material ini?',
        'Konfirmasi Hapus',
        function () {
            $.ajax({
                type: 'POST',
                url: BASE_API + '/material/delete-partner-material',
                data: {
                    id: id
                },
                dataType: 'json',
                beforeSend: function () {
                    showLoading(true);
                },
                success: function (response) {
                    console.log('Delete response:', response);

                    if (response.status == 1 || response.success === true) {
                        showNotification('Material berhasil dihapus', 'success');

                        // Refresh material data
                        refreshMaterialData();
                    } else {
                        showAlert(response.message || 'Gagal menghapus material', 'Error');
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Delete error:', error);
                    showAlert('Terjadi kesalahan saat menghapus material', 'Error');
                },
                complete: function () {
                    showLoading(false);
                }
            });
        }
    );
}

/**
 * Refresh material data
 */
function refreshMaterialData() {
    console.log('=== REFRESH MATERIAL DATA ===');

    if (!MATERIAL_STATE.currentPartnerTransaksiId) {
        console.error('✗ No currentPartnerTransaksiId');
        showAlert('ID Partner Transaksi tidak tersedia', 'Error');
        return;
    }

    console.log('Refreshing for ID:', MATERIAL_STATE.currentPartnerTransaksiId);

    // Call loadMaterialData
    loadMaterialData(MATERIAL_STATE.currentPartnerTransaksiId);

    console.log('=== REFRESH MATERIAL DATA COMPLETE ===');
}

// =========================================
// PHOTO UPLOAD FUNCTIONS
// =========================================

/**
 * Handle photo selection
 */
$(document).on('change', '#photo_upload_input', function (e) {
    console.log('=== PHOTO SELECTED ===');

    const file = e.target.files[0];

    if (!file) {
        console.log('✗ No file selected');
        return;
    }

    console.log('File:', file.name, file.size, file.type);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        console.log('✗ Invalid file type:', file.type);
        showAlert('File harus berformat JPG, JPEG, atau PNG', 'Error');
        $(this).val('');
        return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        console.log('✗ File too large:', file.size);
        showAlert('Ukuran file maksimal 5MB', 'Error');
        $(this).val('');
        return;
    }

    console.log('✓ File validation passed');

    // Preview image
    const reader = new FileReader();

    reader.onload = function (e) {
        console.log('✓ File loaded for preview');
        $('#photo_preview').attr('src', e.target.result);
        $('#photo_empty_placeholder').hide();
        $('#photo_preview_area').show();
        $('#btn_upload_photo').show();
        console.log('✓ Preview displayed');
    };

    reader.onerror = function (e) {
        console.error('✗ Error reading file:', e);
        showAlert('Gagal membaca file', 'Error');
    };

    reader.readAsDataURL(file);
    console.log('Reading file...');
});

/**
 * Upload material with photo
 */
function uploadMaterialPhoto() {
    console.log('=== UPLOAD MATERIAL PHOTO ===');

    const fileInput = document.getElementById('photo_upload_input');
    const file = fileInput ? fileInput.files[0] : null;

    if (!file) {
        console.log('✗ No file selected');
        showAlert('Pilih foto terlebih dahulu', 'Perhatian');
        return;
    }

    if (!MATERIAL_STATE.tempMaterialRow) {
        console.error('✗ No temp material data');
        showAlert('Data material tidak tersedia', 'Error');
        return;
    }

    console.log('File:', file.name);
    console.log('Temp data:', MATERIAL_STATE.tempMaterialRow);

    // Prepare form data
    const formData = new FormData();
    formData.append('id_partner_transaksi', MATERIAL_STATE.tempMaterialRow.id_partner_transaksi);
    formData.append('nama', MATERIAL_STATE.tempMaterialRow.nama);
    formData.append('jumlah', MATERIAL_STATE.tempMaterialRow.jumlah);
    formData.append('harga', MATERIAL_STATE.tempMaterialRow.harga);
    formData.append('total_harga', MATERIAL_STATE.tempMaterialRow.total_harga);
    formData.append('foto_bukti_material', file);

    console.log('FormData prepared');

    // Upload
    $.ajax({
        type: 'POST',
        url: BASE_API + '/material/add-partner-material',
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json',
        beforeSend: function (xhr) {
            console.log('Sending upload request...');
            showLoading(true);
            $('#btn_upload_photo').prop('disabled', true).text('Uploading...');
        },
        success: function (response) {
            console.log('=== UPLOAD SUCCESS ===');
            console.log('Response:', response);

            if (response.status == 1 || response.success === true) {
                console.log('✓ Material saved successfully');
                showNotification('Material berhasil ditambahkan', 'success');

                // Close upload popup
                if (typeof app !== 'undefined' && app.popup) {
                    console.log('Closing upload popup...');
                    app.popup.close('.popup-photo-upload');
                }

                // Remove editing row
                $('.editing-row').remove();
                console.log('✓ Editing row removed');

                // Clear temp data
                MATERIAL_STATE.tempMaterialRow = null;
                console.log('✓ Temp data cleared');

                // Refresh material data
                console.log('Refreshing material data...');
                refreshMaterialData();

            } else {
                console.error('✗ Save failed:', response.message);
                showAlert(response.message || 'Gagal menambahkan material', 'Error');
            }
        },
        error: function (xhr, status, error) {
            console.error('=== UPLOAD ERROR ===');
            console.error('Status:', status);
            console.error('Error:', error);
            console.error('Response:', xhr.responseText);

            showAlert('Terjadi kesalahan saat upload', 'Error');
        },
        complete: function () {
            console.log('Upload request complete');
            showLoading(false);
            $('#btn_upload_photo').prop('disabled', false).text('Upload Foto');
        }
    });
}

/**
 * View material photo
 */
function viewMaterialPhoto(photoUrl) {
    console.log('=== VIEW MATERIAL PHOTO ===');
    console.log('Photo URL:', photoUrl);

    if (!photoUrl) {
        showAlert('Foto tidak tersedia', 'Info');
        return;
    }

    const url = BASE_API.slice(0, -3) + photoUrl;

    // ✅ URL sudah lengkap dari backend, tidak perlu concat lagi
    $('#photo_viewer_image').attr('src', url);

    // Set download link
    $('#photo_download_link').attr('href', url);

    // Open popup
    if (typeof app !== 'undefined' && app.popup) {
        app.popup.open('.popup-photo-viewer');
    } else {
        window.open(url, '_blank');
    }
}
/**
 * Refresh material data
 * VERSI YANG SUDAH DIPERBAIKI
 */
function refreshMaterialData() {
    console.log('=== REFRESH MATERIAL DATA ===');

    if (!MATERIAL_STATE.currentPartnerTransaksiId) {
        console.error('✗ No currentPartnerTransaksiId');
        showAlert('ID Partner Transaksi tidak tersedia', 'Error');
        return;
    }

    console.log('Refreshing for ID:', MATERIAL_STATE.currentPartnerTransaksiId);

    // Call loadMaterialData
    loadMaterialData(MATERIAL_STATE.currentPartnerTransaksiId);

    // Show notification
    showNotification('Data material diperbarui', 'success');

    console.log('=== REFRESH MATERIAL DATA COMPLETE ===');
}

// =========================================
// EVENT LISTENERS
// =========================================

/**
 * Initialize event listeners
 * MENGGUNAKAN DELEGATION PATTERN - EVENT LISTENER TERDAFTAR DI DOCUMENT
 * SEHINGGA BEKERJA BAHKAN UNTUK ELEMEN YANG DI-RENDER DINAMIS
 */
function initPurchaseEventListeners() {
    console.log('Initializing event listeners...');

    // Remove existing listeners to avoid duplicates
    $(document).off('click', '#close_purchase_modal');
    $(document).off('click', '#close_material_modal');
    $(document).off('click', '#btn_copy_kirim_to_deadline');

    // Copy button - Copy tanggal kirim ke deadline
    $(document).on('click', '#btn_copy_kirim_to_deadline', function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Copy button clicked via event delegation');
        copyKirimToDeadline();
        return false;
    });

    $(document).on('input', '#qty_purchase', function () {
        let val = parseInt($(this).val());
        let max = parseInt($('#qty_total_input').val());

        if (val < 0) {
            $(this).val(0);
        }

        if (val > max) {
            $(this).val(max);
            showNotification(`Jumlah maksimal ${max} pcs`, 'error');
        }
    });

    $(document).on('input', '#production_fee', function () {
        let val = parseInt($(this).val());

        if (val < 0) {
            $(this).val(0);
        }
    });

    console.log('Purchase event listeners initialized');
}

// =========================================
// INITIALIZATION
// =========================================

/**
 * Initialize purchase management
 */
function initPurchaseManagement() {
    console.log('Initializing Purchase Management...');

    // Reset state
    PURCHASE_STATE = {
        currentPerformaId: null,
        currentPenjualanId: null,
        currentClientId: null,
        currentClientName: null,
        currentQuantity: 0,
        currentItem: null,
        currentTanggalKirim: null,
        partnerList: [],
        purchaseList: [],
        purchaseDetailList: []
    };

    MATERIAL_STATE = {
        currentPartnerTransaksiId: null,
        currentPartnerName: null,
        currentItem: null,
        currentJumlah: 0,
        materialList: []
    };

    // Initialize event listeners
    initPurchaseEventListeners();

    console.log('Purchase Management initialized successfully');
}

// =========================================
// AUTO INITIALIZATION
// =========================================

$(document).ready(function () {
    console.log('Document ready - Initializing...');

    // Initialize purchase management
    initPurchaseManagement();

    console.log('Initialization complete');
});