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

// =========================================
// MATERIAL MODAL FUNCTIONS
// =========================================

/**
 * Open material modal
 */
function openMaterialModal(id_partner_transaksi, partner_name, penjualan_id, penjualan_tanggal, jumlah) {
    console.log('Opening material modal:', { id_partner_transaksi, partner_name, penjualan_id, penjualan_tanggal, jumlah });

    // Validasi
    if (!id_partner_transaksi) {
        showAlert('ID Partner Transaksi tidak valid', 'Error');
        return;
    }

    // Set state
    MATERIAL_STATE.currentPartnerTransaksiId = id_partner_transaksi;
    MATERIAL_STATE.currentPartnerName = partner_name;
    MATERIAL_STATE.currentJumlah = jumlah;

    // Update UI
    $('#material-spk-code').text(formatSPKCode(penjualan_id, penjualan_tanggal) || '-');
    $('#material-partner-name').text(partner_name || '-');
    $('#material-quantity').text((jumlah || 0) + ' pcs');

    // Load material data
    loadMaterialData(id_partner_transaksi);

    // Open popup
    if (typeof app !== 'undefined') {
        app.popup.open('.popup-material');
    }
}

/**
 * Load material data
 */
function loadMaterialData(id_partner_transaksi) {
    // Validasi parameter
    if (!id_partner_transaksi) {
        showAlert('ID Partner Transaksi tidak valid', 'Error');
        return;
    }

    jQuery.ajax({
        type: 'POST',
        url: BASE_API + '/material',
        data: JSON.stringify({
            id_partner_transaksi: id_partner_transaksi
        }),
        contentType: 'application/json',
        dataType: 'json',
        beforeSend: function () {
            showLoading(true);
        },
        success: function (response) {
            console.log('Material data loaded:', response);

            // Sesuaikan dengan response backend (success: true/false)
            if (response.success === true) {
                // Simpan data ke state
                MATERIAL_STATE.materialList = response.data || [];
                MATERIAL_STATE.partnerInfo = response.partner_info || null;
                MATERIAL_STATE.grandTotal = response.grand_total || 0;
                MATERIAL_STATE.totalItems = response.total_items || 0;

                // Render table
                renderMaterialTable(response.data);

                // Opsional: render info partner dan total
                if (response.partner_info) {
                    renderPartnerInfo(response.partner_info);
                }
                if (response.grand_total) {
                    renderGrandTotal(response.grand_total);
                }
            } else {
                // Handle error dari backend
                showAlert(response.message || 'Gagal memuat data material', 'Error');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading material data:', xhr);

            // Handle berbagai error response
            let errorMessage = 'Terjadi kesalahan saat memuat data';

            if (xhr.responseJSON) {
                // Error dari backend Laravel
                errorMessage = xhr.responseJSON.message || errorMessage;

                // Tampilkan detail error jika ada
                if (xhr.responseJSON.errors) {
                    console.error('Validation errors:', xhr.responseJSON.errors);
                    errorMessage += ': ' + Object.values(xhr.responseJSON.errors).flat().join(', ');
                }

                if (xhr.responseJSON.error) {
                    console.error('Backend error:', xhr.responseJSON.error);
                }
            } else if (xhr.status === 404) {
                errorMessage = 'Data tidak ditemukan';
            } else if (xhr.status === 422) {
                errorMessage = 'Data tidak valid';
            } else if (xhr.status === 500) {
                errorMessage = 'Terjadi kesalahan di server';
            } else if (xhr.status === 0) {
                errorMessage = 'Tidak dapat terhubung ke server';
            }

            showAlert(errorMessage, 'Error');
        },
        complete: function () {
            showLoading(false);
        }
    });
}

/**
 * Render material table
 */
function renderMaterialTable(materials) {
    let html = '';
    let totalHarga = 0;

    if (!materials || materials.length === 0) {
        html = `
            <tr>
                <td colspan="5" align="center" style="border-top: solid 1px; border-left: solid 1px; border-color:gray; padding: 20px;">
                    <i class="f7-icons" style="font-size: 40px; color: #999;">cube_box</i>
                    <p style="color: #999; margin-top: 10px;">Belum ada data material</p>
                </td>
            </tr>
        `;
    } else {
        materials.forEach(function (material, index) {
            const total = (parseInt(material.jumlah) || 0) * (parseInt(material.harga) || 0);
            totalHarga += total;

            html += `
                <tr>
                    <td align="center" style="border-top: solid 1px; border-left: solid 1px; border-color:gray; padding: 10px;">
                        ${index + 1}
                    </td>
                    <td align="left" style="border-top: solid 1px; border-left: solid 1px; border-color:gray; padding: 10px;">
                        ${material.nama || '-'}
                    </td>
                    <td align="center" style="border-top: solid 1px; border-left: solid 1px; border-color:gray; padding: 10px;">
                        ${material.jumlah || 0}
                    </td>
                    <td align="right" style="border-top: solid 1px; border-left: solid 1px; border-color:gray; padding: 10px;">
                        ${formatRupiah(material.harga)}
                    </td>
                    <td align="center" style="border-top: solid 1px; border-left: solid 1px; border-color:gray; padding: 10px;">
                        ${material.foto_bukti_material ? `
                            <button onclick="viewMaterialPhoto('${material.foto_bukti_material}');" 
                                    class="button button-small button-fill" 
                                    style="background: #34c759; margin-bottom: 5px;">
                                <i class="f7-icons" style="font-size: 14px;">photo</i> Lihat Foto
                            </button>
                        ` : ''}
                        <button onclick="deleteMaterial('${material.id_partner_transaksi_detail}');" 
                                class="button button-small button-fill" 
                                style="background: #ff3b30;">
                            <i class="f7-icons" style="font-size: 14px;">trash</i> Hapus
                        </button>
                    </td>
                </tr>
            `;
        });

        // Add total row
        html += `
            <tr style="font-weight: bold; background: #f8f8f8;">
                <td colspan="3" align="right" style="border-top: solid 1px; border-left: solid 1px; border-color:gray; padding: 10px;">
                    Total:
                </td>
                <td align="right" style="border-top: solid 1px; border-left: solid 1px; border-color:gray; padding: 10px;">
                    ${formatRupiah(totalHarga)}
                </td>
                <td style="border-top: solid 1px; border-left: solid 1px; border-color:gray;"></td>
            </tr>
        `;
    }

    $('#data_material').html(html);
}

/**
 * Add material row
 */
function addMaterialRow() {
    console.log('=== ADD MATERIAL ROW ===');

    // Check if there's already an editing row
    if ($('.editing-row').length > 0) {
        console.log('Already has editing row');
        showAlert('Selesaikan input material yang sedang diedit terlebih dahulu', 'Perhatian');
        return;
    }

    // Get current row count untuk numbering
    const currentRowCount = $('#material_table_body tr:not(.editing-row)').length;
    const emptyState = $('#material_table_body').find('td[colspan]').length > 0;
    const nextNumber = emptyState ? 1 : currentRowCount + 1;

    console.log('Current row count:', currentRowCount);
    console.log('Next number:', nextNumber);

    // Get today's date for display
    const today = new Date();
    const todayFormatted = formatDateShow(today);

    console.log('Today:', todayFormatted);

    // Create new editable row with Framework7 styling
    const rowHtml = `
        <tr class="editing-row" style="background-color: #fff3cd;">
            <td align="center" style="padding: 10px; border: 1px solid #1C1C1D;">
                <i class="f7-icons" style="font-size: 24px; color: #ffc107;">exclamationmark_triangle_fill</i>
            </td>
            <td align="center" style="padding: 10px; border: 1px solid #1C1C1D;">
                ${todayFormatted}
            </td>
            <td style="padding: 5px; border: 1px solid #1C1C1D; width: 120px;">
                <div class="list inline-labels no-hairlines no-hairlines-between margin-top-half margin-bottom-half">
                    <ul>
                        <li class="item-content item-input">
                            <div class="item-inner">
                                <div class="item-input-wrap">
                                    <input type="text" 
                                           id="new_material_nama" 
                                           placeholder="Nama Material" 
                                           class="input-with-value"
                                           style="color: #1C1C1D; padding: 8px; border: 1px solid #1C1C1D; border-radius: 4px; width: 100%;">
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </td>
            <td style="padding: 5px; border: 1px solid #1C1C1D;">
                <div class="list inline-labels no-hairlines no-hairlines-between margin-top-half margin-bottom-half">
                    <ul>
                        <li class="item-content item-input">
                            <div class="item-inner">
                                <div class="item-input-wrap">
                                    <input type="number" 
                                           id="new_material_jumlah" 
                                           placeholder="0" 
                                           min="0"
                                           step="1"
                                           class="input-with-value"
                                           style="color: #1C1C1D; padding: 8px; border: 1px solid #1C1C1D; border-radius: 4px; width: 100%; text-align: center;">
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </td>
            <td style="padding: 5px; border: 1px solid #1C1C1D;">
                <div class="list inline-labels no-hairlines no-hairlines-between margin-top-half margin-bottom-half">
                    <ul>
                        <li class="item-content item-input">
                            <div class="item-inner">
                                <div class="item-input-wrap">
                                    <input type="number" 
                                           id="new_material_harga" 
                                           placeholder="0" 
                                           min="0"
                                           step="1000"
                                           class="input-with-value"
                                           style="color: #1C1C1D; padding: 8px; border: 1px solid #1C1C1D; border-radius: 4px; width: 100%; text-align: right;">
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </td>
            <td align="center" style="padding: 10px; border: 1px solid #1C1C1D;">
                <button class="button button-small button-fill color-green" 
                        onclick="saveMaterialRow();" 
                        style="width: 80px;">
                    Simpan
                </button>
                <br>
                <button class="button button-small button-fill color-orange" 
                        onclick="cancelMaterialRow();"
                        style="width: 80px;">
                    Batal
                </button>
            </td>
        </tr>
    `;

    // Remove empty state if exists
    if (emptyState) {
        console.log('Removing empty state');
        $('#material_table_body').empty();
    }

    // Prepend new row (add at top)
    $('#material_table_body').prepend(rowHtml);
    console.log('✓ Row added to table');

    // Auto-calculate total when price or quantity changes
    $('#new_material_jumlah, #new_material_harga').on('input', function () {
        calculateMaterialTotal();
    });

    // Focus on material name input
    setTimeout(function () {
        $('#new_material_nama').focus();
        console.log('✓ Focus set to nama input');
    }, 100);

    console.log('=== ADD MATERIAL ROW COMPLETE ===');
}

/**
 * Calculate material total preview
 */
function calculateMaterialTotal() {
    const jumlah = parseInt($('#new_material_jumlah').val() || 0);
    const harga = parseInt($('#new_material_harga').val() || 0);
    const total = jumlah * harga;

    $('#new_material_total_preview').text('Total: ' + formatRupiah(total));

    console.log('Total calculated:', {
        jumlah: jumlah,
        harga: harga,
        total: total
    });
}

/**
 * Save material row
 * VERSI YANG SUDAH DIPERBAIKI
 */
function saveMaterialRow() {
    console.log('=== SAVE MATERIAL ROW ===');

    // Get input values
    const nama = $('#new_material_nama').val().trim();
    const jumlah = parseInt($('#new_material_jumlah').val() || 0);
    const harga = parseInt($('#new_material_harga').val() || 0);

    console.log('Input values:', { nama, jumlah, harga });

    // Validation
    if (!nama) {
        console.log('✗ Validation failed: nama kosong');
        showAlert('Nama material harus diisi', 'Validasi');
        $('#new_material_nama').focus();
        return;
    }

    if (jumlah <= 0) {
        console.log('✗ Validation failed: jumlah <= 0');
        showAlert('Jumlah harus lebih dari 0', 'Validasi');
        $('#new_material_jumlah').focus();
        return;
    }

    if (harga <= 0) {
        console.log('✗ Validation failed: harga <= 0');
        showAlert('Harga harus lebih dari 0', 'Validasi');
        $('#new_material_harga').focus();
        return;
    }

    // Calculate total
    const totalHarga = jumlah * harga;
    console.log('Total harga:', totalHarga);

    // Validate MATERIAL_STATE
    if (!MATERIAL_STATE.currentPartnerTransaksiId) {
        console.error('✗ No currentPartnerTransaksiId');
        showAlert('ID Partner Transaksi tidak tersedia', 'Error');
        return;
    }

    console.log('Partner Transaksi ID:', MATERIAL_STATE.currentPartnerTransaksiId);

    // Prepare data
    const materialData = {
        id_partner_transaksi: MATERIAL_STATE.currentPartnerTransaksiId,
        nama: nama,
        jumlah: jumlah,
        harga: harga,
        total_harga: totalHarga
    };

    console.log('Material data prepared:', materialData);

    // Store to temp state for photo upload
    MATERIAL_STATE.tempMaterialRow = materialData;

    console.log('✓ Data stored to temp state');
    console.log('Opening photo upload modal...');

    // Open photo upload modal
    openPhotoUploadModal(PURCHASE_STATE.currentSpkCode, MATERIAL_STATE.currentPartnerName);

    console.log('=== SAVE MATERIAL ROW COMPLETE ===');
}

/**
 * Cancel material row
 * VERSI YANG SUDAH DIPERBAIKI
 */
function cancelMaterialRow() {
    console.log('=== CANCEL MATERIAL ROW ===');

    // Remove editing row
    $('.editing-row').remove();
    console.log('✓ Editing row removed');

    // Check if table is empty
    const remainingRows = $('#material_table_body tr').length;
    console.log('Remaining rows:', remainingRows);

    if (remainingRows === 0) {
        console.log('No rows left, showing empty state');

        const emptyStateHtml = `
            <tr data-empty-state="true">
                <td colspan="6" align="center" style="padding: 20px; border: 1px solid #ddd;">
                    <i class="f7-icons" style="font-size: 40px; color: #999;">cube_box</i>
                    <p style="color: #999; margin-top: 10px;">Belum ada data material</p>
                </td>
            </tr>
        `;

        $('#material_table_body').html(emptyStateHtml);
        console.log('✓ Empty state rendered');
    }

    console.log('=== CANCEL MATERIAL ROW COMPLETE ===');
}

/**
 * Open photo upload modal
 * VERSI YANG SUDAH DIPERBAIKI UNTUK FRAMEWORK7
 */
function openPhotoUploadModal(spkCode, partnerName) {
    console.log('=== OPEN PHOTO UPLOAD MODAL ===');

    // Init Components
    $('#photo-spk-code').text(spkCode);
    $('#photo-partner-name').text(partnerName);
    $('#photo-purchase-qty').text(MATERIAL_STATE.currentJumlah);

    $('#photo_type_purchase_tbl').text(PURCHASE_STATE.currentItem);
    $('#photo_qty_purchase_tbl').text(PURCHASE_STATE.currentQuantity);
    $('#photo_selesai_purchase_tbl').text(MATERIAL_STATE.currentJumlah);
    $('#photo_sisa_purchase_tbl').text(PURCHASE_STATE.currentQuantity - MATERIAL_STATE.currentJumlah);

    // Validate temp data
    if (!MATERIAL_STATE.tempMaterialRow) {
        console.error('✗ No temp material data');
        showAlert('Data material tidak tersedia', 'Error');
        return;
    }

    console.log('Temp material data:', MATERIAL_STATE.tempMaterialRow);

    // Clear previous data
    $('#photo_empty_placeholder').show();
    $('#photo_upload_input').val('');
    $('#photo_preview_area').hide();
    $('#photo_preview').attr('src', '');
    $('#btn_upload_photo').hide();

    console.log('✓ Photo inputs cleared');

    // Open popup using Framework7
    if (typeof app !== 'undefined' && app.popup) {
        console.log('Opening popup with Framework7...');
        app.popup.open('.popup-photo-upload');
        console.log('✓ Popup opened');
    } else {
        console.error('✗ Framework7 app not available');
        showAlert('Framework7 belum siap', 'Error');
    }

    console.log('=== OPEN PHOTO UPLOAD MODAL COMPLETE ===');
}

/**
 * Handle photo selection
 * VERSI YANG SUDAH DIPERBAIKI
 */
$(document).on('change', '#photo_upload_input', function (e) {
    console.log('=== PHOTO SELECTED ===');

    const file = e.target.files[0];

    if (!file) {
        console.log('No file selected');
        return;
    }

    console.log('File info:', {
        name: file.name,
        type: file.type,
        size: file.size
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
        console.error('✗ Invalid file type');
        showAlert('File harus berupa gambar', 'Error');
        $(this).val('');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        console.error('✗ File too large');
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
 * Upload material photo
 * VERSI YANG SUDAH DIPERBAIKI
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
    formData.append('token', localStorage.getItem('token'));
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
        url: BASE_API + '/save-material',
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
 * VERSI YANG SUDAH DIPERBAIKI UNTUK FRAMEWORK7
 */
function viewMaterialPhoto(photoUrl) {
    console.log('=== VIEW MATERIAL PHOTO ===');
    console.log('Photo URL:', photoUrl);

    if (!photoUrl) {
        console.log('✗ No photo URL');
        showAlert('Foto tidak tersedia', 'Info');
        return;
    }

    // Set photo
    $('#photo_viewer_image').attr('src', photoUrl);
    console.log('✓ Photo URL set');

    // Open popup using Framework7
    if (typeof app !== 'undefined' && app.popup) {
        console.log('Opening photo viewer...');
        app.popup.open('.popup-photo-viewer');
        console.log('✓ Photo viewer opened');
    } else {
        console.error('✗ Framework7 app not available');
        // Fallback: open in new window
        window.open(photoUrl, '_blank');
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