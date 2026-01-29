/**
 * =========================================
 * PARTNER MANAGEMENT - PURCHASE SYSTEM
 * =========================================
 * Sistem untuk mengelola purchase/pembelian dari partner
 * 
 * Refactored version - menggunakan helper.js untuk fungsi-fungsi umum
 * Tech Stack: Cordova + Framework7 v7
 * =========================================
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
    materialList: [],
    tempMaterialRow: null
};

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
 * Load purchase data
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
                PURCHASE_STATE.partnerList = response.data.partner || [];
                PURCHASE_STATE.purchaseList = response.data.partner_transaksi || [];
                PURCHASE_STATE.purchaseDetailList = response.data.partner_transaksi_detail || [];

                // Set tanggal kirim dengan format display
                const tglKirim = formatDate(response.data.penjualan_header.penjualan_tanggal_kirim);
                $('#tgl_kirim_purchase').val(tglKirim);
                $('#tgl_kirim_purchase_display').val(formatDateShow(tglKirim));

                // Clear form inputs dan error styling
                clearPurchaseForm();

                populatePurchaseHeader(response.data, response.data.partner_transaksi);
                populatePartnerDropdown(response.data.partner);
                renderPurchasingTable(response.data.partner_transaksi, response.data);
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
    const partner = data.partner;

    if (penjualan_header && penjualan_detail) {
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

        if (transaksi_pembelian.length > 0) {
            let partnerInfo = partner.find(p => p.id_partner === transaksi_pembelian[0].id_partner);
            let partnerName = partnerInfo ? partnerInfo.nama_partner : '-';

            MATERIAL_STATE.currentPartnerName = partnerName ?? null;
        } else {
            MATERIAL_STATE.currentPartnerName = null;
        }

        // Update UI
        $('#spk_code').text(spkCode);
        $('#client_name').text(penjualan_header.client_nama || '-');
        $('#partner_name').text(MATERIAL_STATE.currentPartnerName || '-');
        $('#purchase_qty').text((penjualan_detail.penjualan_qty || 0) + ' pcs');

        // Update table summary
        $('#type_purchase_tbl').text(penjualan_detail.produk_keterangan_kustom || '-');
        $('#qty_purchase_tbl').text(penjualan_detail.penjualan_qty || 0);

        // Set hidden inputs
        $('#item_purchase').val(penjualan_detail.produk_keterangan_kustom || '');
        $('#penjualan_detail_performa_id_purchase').val(penjualan_detail.penjualan_detail_performa_id || '');
    } else {
        console.error('✗ Incomplete data to populate purchase header');
        app.dialog.alert('Data tidak tersedia', 'Error');
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
 */
function PurchaseProces() {
    console.log('Processing purchase...');

    // Clear all previous error styling
    clearInputError('qty_purchase_display');
    clearInputError('production_fee_display');
    clearInputError('tgl_deadline_purchase_display');

    // Get form values
    const partnerId = $('#nama_partner_purchase').val();
    const qty = parseInt($('#qty_purchase').val()) || 0;
    const productionFee = parseInt($('#production_fee').val()) || 0;
    const tglDeadline = $('#tgl_deadline_purchase').val();
    const keterangan = $('#keterangan_partner').val();
    const totalProductionFee = qty * productionFee;

    // ========== VALIDASI DENGAN FOKUS DAN BORDER MERAH ==========

    // Validasi Partner
    if (!partnerId) {
        showAlert('Pilih partner terlebih dahulu', 'Perhatian');
        return;
    }

    // Validasi Jumlah
    if (!qty || qty <= 0) {
        showAlert('Masukkan jumlah yang valid', 'Perhatian');
        setInputError('qty_purchase_display');
        $('#qty_purchase_display').focus();
        return;
    }

    // Validasi Harga
    if (!productionFee || productionFee <= 0) {
        showAlert('Masukkan harga yang valid', 'Perhatian');
        setInputError('production_fee_display');
        $('#production_fee_display').focus();
        return;
    }

    // Validasi Total
    if (!totalProductionFee || totalProductionFee <= 0) {
        showAlert('Total harga tidak valid', 'Perhatian');
        setInputError('production_fee_display');
        $('#production_fee_display').focus();
        return;
    }

    // Validasi Deadline
    if (!tglDeadline) {
        showAlert('Pilih tanggal deadline', 'Perhatian');
        setInputError('tgl_deadline_purchase_display');
        $('#tgl_deadline_purchase_display').focus();
        return;
    }

    // Prepare data
    const formData = {
        penjualan_detail_performa_id: PURCHASE_STATE.currentPerformaId,
        item: $('#item_purchase').val(),
        id_partner: partnerId,
        jumlah: qty,
        harga_produksi: productionFee,
        total_harga_produksi: totalProductionFee,
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
                clearPurchaseForm();

                // Reload purchase data
                loadPurchaseData(PURCHASE_STATE.currentPerformaId);

            } else {
                showAlert(response.message || 'Gagal menyimpan purchase', 'Error');
            }
        },
        error: function (xhr, status, error) {
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
 * Clear purchase form
 */
function clearPurchaseForm() {
    // Clear display inputs
    $('#qty_purchase_display').val('');
    $('#production_fee_display').val('');
    $('#tgl_deadline_purchase_display').val('');
    $('#keterangan_partner').val('');

    // Clear hidden inputs
    $('#qty_purchase').val('');
    $('#production_fee').val('');
    $('#tgl_deadline_purchase').val('');

    // Clear error styling
    clearInputError('qty_purchase_display');
    clearInputError('production_fee_display');
    clearInputError('tgl_deadline_purchase_display');

    // Reset partner selection
    $('#nama_partner_purchase').val('');

    console.log('Purchase form cleared');
}

// =========================================
// MATERIAL MANAGEMENT FUNCTIONS
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
        let partnerInfo = data.partner_info;
        const clientInfo = data.client_info;

        $('#material_partner_name').text(partnerInfo.nama_partner || '-');
        $('#material_client_name').text(clientInfo.client_nama || '-');

        // Set SPK code from penjualan_id
        if (partnerInfo.penjualan_id) {
            const spkCode = formatSPKCode(partnerInfo.penjualan_id, new Date());
            $('#material_spk_code').text(spkCode);
        }
    }

    // Set quantity badge
    const totalQty = data.partner_info.penjualan_qty;
    $('#material_purchase_qty').text(totalQty + ' pcs');
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
    const jumlah = formatNumberWithDots(item.jumlah || 0);
    const harga = formatNumberWithDots(item.harga || 0);
    const total = formatNumberWithDots(item.total_harga || 0);

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

    if (!MATERIAL_STATE.currentPartnerTransaksiId) {
        showAlert('ID Partner Transaksi tidak tersedia', 'Error');
        return;
    }

    if ($('.editing-row').length > 0) {
        showAlert('Selesaikan penambahan material yang sedang berlangsung', 'Perhatian');
        return;
    }

    $('#material_table_body tr').each(function () {
        if ($(this).find('td[colspan="6"]').length > 0) {
            $(this).remove();
        }
    });

    const newRow = createEditableMaterialRow();
    $('#material_table_body').prepend(newRow);
    $('#input_material_nama').focus();

    attachMaterialRowFormatting();

    console.log('Editable row added');
}

/**
 * Create editable material row for adding new material
 */
function createEditableMaterialRow(item = null) {
    const isEdit = item !== null;
    const rowId = isEdit ? item.id : 'new';

    const tanggalValue = isEdit ? formatDate(item.dt_created) : formatDate(new Date());
    const materialName = isEdit ? item.nama : '';
    const jumlahValue = isEdit ? item.jumlah : '';
    const hargaValue = isEdit ? item.harga : '';

    const tanggalDisplay = isEdit ? formatDateShow(item.dt_created) : formatDateShow(new Date());
    const jumlahDisplay = isEdit ? formatNumberWithDots(item.jumlah) : '';
    const hargaDisplay = isEdit ? formatNumberWithDots(item.harga) : '';

    const row = `
        <tr class="editing-row" data-id="${rowId}">
            <td style="padding: 8px; text-align: center; border: 1px solid #ddd; background-color: #E8F5E9;">
                <i class="f7-icons" style="color: #4CAF50; font-size: 24px;">plus_circle_fill</i>
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #E8F5E9;">
                <input type="hidden" id="input_material_tanggal" value="${tanggalValue}">
                <input type="text" 
                       class="form-control" 
                       id="input_material_tanggal_display" 
                       placeholder="DD-MMM-YY"
                       value="${tanggalDisplay}"
                       readonly
                       style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px; background-color: #f5f5f5;">
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #E8F5E9;">
                <input type="text" 
                       class="form-control" 
                       id="input_material_nama" 
                       placeholder="Nama Material"
                       value="${materialName}"
                       style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px;">
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #E8F5E9;">
                <input type="hidden" id="input_material_jumlah" value="${jumlahValue}">
                <input type="text" 
                       class="form-control" 
                       id="input_material_jumlah_display" 
                       placeholder="0"
                       value="${jumlahDisplay}"
                       style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px;">
            </td>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #E8F5E9;">
                <input type="hidden" id="input_material_harga" value="${hargaValue}">
                <input type="text" 
                       class="form-control" 
                       id="input_material_harga_display" 
                       placeholder="0"
                       value="${hargaDisplay}"
                       style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px;">
            </td>
            <td class="display-flex flex-direction-row justify-content-space-between align-items-center" style="padding: 8px; text-align: center; border: 1px solid #ddd; background-color: #E8F5E9;">
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

    const nama = $('#input_material_nama').val().trim();
    const jumlah = parseInt($('#input_material_jumlah').val()) || 0;
    const harga = parseInt($('#input_material_harga').val()) || 0;

    if (!nama) {
        showAlert('Nama material harus diisi', 'Perhatian');
        $('#input_material_nama').focus();
        return;
    }

    if (jumlah <= 0) {
        showAlert('Jumlah harus lebih dari 0', 'Perhatian');
        $('#input_material_jumlah_display').focus();
        return;
    }

    if (harga <= 0) {
        showAlert('Harga harus lebih dari 0', 'Perhatian');
        $('#input_material_harga_display').focus();
        return;
    }

    const total_harga = jumlah * harga;

    const materialData = {
        id_partner_transaksi: MATERIAL_STATE.currentPartnerTransaksiId,
        nama: nama,
        jumlah: jumlah,
        harga: harga,
        total_harga: total_harga
    };

    console.log('Material data to save:', materialData);

    const rowId = $('.editing-row').data('id');
    if (rowId && rowId !== 'new') {
        materialData.id = rowId;
        updateMaterialToServer(materialData);
    } else {
        openPhotoUploadPopup(materialData);
    }
}

/**
 * Cancel material row editing
 */
function cancelMaterialRow() {
    $('.editing-row').remove();

    // Check if table is empty after removal
    if ($('#material_table_body tr').length === 0) {
        renderEmptyMaterialTable();
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
    $('#photo_spk_code').text(PURCHASE_STATE.currentSpkCode);
    $('#photo_partner_name').text(MATERIAL_STATE.currentPartnerName);
    $('#photo_client_name').text(PURCHASE_STATE.currentClientName);
    $('#photo_purchase_qty').text(PURCHASE_STATE.currentQuantity);

    // Clear preview
    $('#photo_preview').html('');
    $('#photo_input').val('');

    // Open popup
    if (typeof app !== 'undefined') {
        app.popup.open('.popup-photo-upload');
    }
}

/**
 * Handle photo file selection
 */
function handlePhotoInput(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const preview = `
                <img src="${e.target.result}" 
                     style="max-width: 100%; max-height: 300px; border-radius: 8px;" 
                     alt="Preview">
            `;
            $('#photo_preview').html(preview);
        };

        reader.readAsDataURL(file);
    }
}

/**
 * Submit material with photo
 */
function submitMaterialWithPhoto() {
    console.log('Submitting material with photo');

    const photoInput = $('#photo_input')[0];

    if (!photoInput.files || !photoInput.files[0]) {
        showAlert('Pilih foto terlebih dahulu', 'Perhatian');
        return;
    }

    const materialData = MATERIAL_STATE.tempMaterialRow;
    if (!materialData) {
        showAlert('Data material tidak tersedia', 'Error');
        return;
    }

    const formData = new FormData();
    formData.append('id_partner_transaksi', materialData.id_partner_transaksi);
    formData.append('nama', materialData.nama);
    formData.append('jumlah', materialData.jumlah);
    formData.append('harga', materialData.harga);
    formData.append('total_harga', materialData.total_harga);
    formData.append('foto_bukti_material', photoInput.files[0]);

    $.ajax({
        type: 'POST',
        url: BASE_API + '/tambah-material',
        data: formData,
        processData: false,
        contentType: false,
        beforeSend: function () {
            showLoading(true);
            $('#btn_submit_photo').prop('disabled', true);
        },
        success: function (response) {
            console.log('Material save response:', response);

            if (response.success === true) {
                showNotification('Material berhasil ditambahkan', 'success');

                // Close photo popup
                if (typeof app !== 'undefined') {
                    app.popup.close('.popup-photo-upload');
                }

                // Reload material data
                loadMaterialData(MATERIAL_STATE.currentPartnerTransaksiId);

                // Clear temp data
                MATERIAL_STATE.tempMaterialRow = null;

            } else {
                showAlert(response.message || 'Gagal menyimpan material', 'Error');
            }
        },
        error: function (xhr, status, error) {
            console.error('Material save error:', error);
            showAlert('Terjadi kesalahan saat menyimpan', 'Error');
        },
        complete: function () {
            showLoading(false);
            $('#btn_submit_photo').prop('disabled', false);
        }
    });
}

/**
 * Update material to server (for edit)
 */
function updateMaterialToServer(materialData) {
    $.ajax({
        type: 'POST',
        url: BASE_API + '/update-material',
        data: materialData,
        dataType: 'json',
        beforeSend: function () {
            showLoading(true);
        },
        success: function (response) {
            if (response.success === true) {
                showNotification('Material berhasil diupdate', 'success');
                loadMaterialData(MATERIAL_STATE.currentPartnerTransaksiId);
            } else {
                showAlert(response.message || 'Gagal update material', 'Error');
            }
        },
        error: function (xhr, status, error) {
            console.error('Material update error:', error);
            showAlert('Terjadi kesalahan saat update', 'Error');
        },
        complete: function () {
            showLoading(false);
        }
    });
}

/**
 * View material photo
 */
function viewMaterialPhoto(url) {
    console.log('Viewing photo:', url);

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

/**
 * Attach formatting to material row inputs
 */
function attachMaterialRowFormatting() {
    // Format jumlah
    $(document).off('input', '#input_material_jumlah_display');
    $(document).on('input', '#input_material_jumlah_display', function () {
        let displayValue = $(this).val();
        let formatted = formatNumberWithDots(displayValue);
        $(this).val(formatted);

        let actualValue = parseNumberFromDisplay(formatted);
        $('#input_material_jumlah').val(actualValue);
    });

    // Format harga
    $(document).off('input', '#input_material_harga_display');
    $(document).on('input', '#input_material_harga_display', function () {
        let displayValue = $(this).val();
        let formatted = formatNumberWithDots(displayValue);
        $(this).val(formatted);

        let actualValue = parseNumberFromDisplay(formatted);
        $('#input_material_harga').val(actualValue);
    });
}

// =========================================
// EVENT LISTENERS
// =========================================

/**
 * Initialize event listeners untuk purchase
 */
function initPurchaseEventListeners() {
    console.log('Initializing event listeners...');

    // Remove existing listeners
    $(document).off('click', '#close_purchase_modal');
    $(document).off('click', '#close_material_modal');
    $(document).off('click', '#btn_copy_kirim_to_deadline');
    $(document).off('input', '#qty_purchase_display');
    $(document).off('input', '#production_fee_display');
    $(document).off('change', '#tgl_kirim_purchase');
    $(document).off('change', '#tgl_deadline_purchase');
    $(document).off('focus', '#qty_purchase_display, #production_fee_display, #tgl_deadline_purchase_display');

    // Copy button
    $(document).on('click', '#btn_copy_kirim_to_deadline', function (e) {
        e.preventDefault();
        e.stopPropagation();
        copyKirimToDeadline();
        return false;
    });

    // Clear error styling on focus
    $(document).on('focus', '#qty_purchase_display, #production_fee_display, #tgl_deadline_purchase_display', function () {
        clearInputError($(this).attr('id'));
    });

    // ========== EVENT UNTUK FORMATTING JUMLAH ==========
    $(document).on('input', '#qty_purchase_display', function () {
        let displayValue = $('#qty_purchase_display').val();

        // Clear error styling saat user mulai mengetik
        clearInputError('qty_purchase_display');

        // Format dengan titik
        let formatted = formatNumberWithDots(displayValue);
        $('#qty_purchase_display').val(formatted);

        // Update hidden input dengan nilai asli
        let actualValue = parseNumberFromDisplay(formatted);
        $('#qty_purchase').val(actualValue);

        // Validasi maksimal
        let max = parseInt($('#qty_total_input').val());
        if (actualValue > max) {
            $('#qty_purchase_display').val(formatNumberWithDots(max));
            $('#qty_purchase').val(max);
            showNotification(`Jumlah maksimal ${formatNumberWithDots(max)} pcs`, 'error');
        }

        if (actualValue < 0) {
            $('#qty_purchase_display').val('0');
            $('#qty_purchase').val(0);
        }
    });

    // ========== EVENT UNTUK FORMATTING HARGA ==========
    $(document).on('input', '#production_fee_display', function () {
        let displayValue = $('#production_fee_display').val();

        // Clear error styling saat user mulai mengetik
        clearInputError('production_fee_display');

        // Format dengan titik
        let formatted = formatNumberWithDots(displayValue);
        $('#production_fee_display').val(formatted);

        // Update hidden input dengan nilai asli
        let actualValue = parseNumberFromDisplay(formatted);
        $('#production_fee').val(actualValue);

        if (actualValue < 0) {
            $('#production_fee_display').val('0');
            $('#production_fee').val(0);
        }
    });

    // ========== EVENT UNTUK TANGGAL KIRIM ==========
    $(document).on('change', '#tgl_kirim_purchase', function () {
        let dateValue = $(this).val();
        if (dateValue) {
            $('#tgl_kirim_purchase_display').val(formatDateShow(dateValue));
        }
    });

    // ========== EVENT UNTUK TANGGAL DEADLINE ==========
    $(document).on('change', '#tgl_deadline_purchase', function () {
        let dateValue = $(this).val();
        if (dateValue) {
            $('#tgl_deadline_purchase_display').val(formatDateShow(dateValue));
            clearInputError('tgl_deadline_purchase_display');
        }
    });

    // Sinkronisasi dari display ke hidden
    $(document).on('blur', '#tgl_kirim_purchase_display', function () {
        let displayValue = $(this).val();
        if (displayValue) {
            let parsedDate = parseDateFromDisplay(displayValue);
            $('#tgl_kirim_purchase').val(parsedDate);
        }
    });

    $(document).on('blur', '#tgl_deadline_purchase_display', function () {
        let displayValue = $(this).val();
        if (displayValue) {
            let parsedDate = parseDateFromDisplay(displayValue);
            $('#tgl_deadline_purchase').val(parsedDate);
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
    console.log('Initializing purchase management...');
    initPurchaseEventListeners();
    console.log('Purchase management initialized');
}

// =========================================
// AUTO INITIALIZATION
// =========================================

$(document).ready(function () {
    console.log('Document ready - Initializing purchase management...');
    initPurchaseManagement();
    console.log('Initialization complete');
});