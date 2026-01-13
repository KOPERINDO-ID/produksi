// =========================================
// APPROVAL PENERIMAAN FUNCTIONS
// =========================================

// State untuk menyimpan data penerimaan yang sedang di-review
let APPROVAL_STATE = {
    currentPenerimaanId: null,
    currentPartnerTransaksiId: null,
    currentData: null
};

/**
 * Lihat detail penerimaan dan buka popup approval
 * 
 * @param {string} id_penerimaan - ID penerimaan (partner_detail_pengiriman.id)
 * @param {string} id_partner_transaksi - ID partner transaksi
 */
function lihatDetailPenerimaan(id_penerimaan, id_partner_transaksi) {
    console.log('Lihat detail penerimaan:', id_penerimaan, id_partner_transaksi);

    // Store IDs
    APPROVAL_STATE.currentPenerimaanId = id_penerimaan;
    APPROVAL_STATE.currentPartnerTransaksiId = id_partner_transaksi;

    console.log('currentPartnerTransaksiId set to:', APPROVAL_STATE.currentPartnerTransaksiId);

    // Show loading
    if (typeof app !== 'undefined' && app.preloader) {
        app.preloader.show();
    }

    // Fetch data penerimaan dari API
    $.ajax({
        type: 'POST',
        url: BASE_API + '/delivery',
        dataType: 'json',
        data: {
            id_partner_transaksi: id_partner_transaksi
        },
        success: function (response) {
            console.log('Detail penerimaan loaded:', response);

            if (response.success && response.data) {
                APPROVAL_STATE.currentData = response.data;

                if (response.data.deliveries == [] || APPROVAL_STATE.currentData.data[0].status_penerimaan === 'SUDAH_DITERIMA') {
                    $('#btn_approve_penerimaan').hide();
                } else {
                    $('#btn_approve_penerimaan').show();
                }

                // Populate popup dengan data
                populateApprovalPopup(response.data);

                // Buka popup
                if (typeof app !== 'undefined') {
                    app.popup.open('.popup-approval-penerimaan');
                }
            } else {
                alert(response.message || 'Gagal memuat data penerimaan');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading detail:', error);
            alert('Terjadi kesalahan saat memuat data');
        },
        complete: function () {
            if (typeof app !== 'undefined' && app.preloader) {
                app.preloader.hide();
            }
        }
    });
}

/**
 * Format tanggal ke format Indonesia
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
 * Format rupiah
 * @param {number} amount - Jumlah uang
 * @returns {string} - Format rupiah
 */
function formatRupiah(amount) {
    if (!amount && amount !== 0) return 'Rp 0';

    return 'Rp ' + parseInt(amount).toLocaleString('id-ID');
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
 * Populate popup approval dengan data penerimaan
 * 
 * @param {object} data - Data penerimaan dari API
 */
function populateApprovalPopup(data) {
    console.log('Populating approval popup:', data);

    // ========== VALIDASI DATA ==========
    if (!data || !data.data || data.data.length === 0) {
        console.error('Data tidak valid atau kosong');
        if (typeof app !== 'undefined' && app.toast) {
            app.toast.create({
                text: 'Data tidak ditemukan',
                position: 'center',
                closeTimeout: 2000,
                cssClass: 'bg-color-red'
            }).open();
        }
        return;
    }

    const headerInfo = data.data[0];
    const detailInfo = data.deliveries && data.deliveries.length > 0 ? data.deliveries[0] : null;

    // ========== POPULATE HEADER INFO ==========
    $('#approval_spk_code').text(headerInfo?.penjualan_id || '-');
    $('#approval_partner_name').text(headerInfo?.nama_partner || '-');

    // ========== HANDLE DETAIL INFO (dengan preventif null) ==========
    if (detailInfo) {
        // Jika ada detail info
        $('#approval_purchase_qty').text((detailInfo.jumlah_diterima || 0) + ' pcs');

        // URL gambar dengan fallback
        const fotoPenerimaanUrl = detailInfo.bukti_penerimaan_url || 'https://via.placeholder.com/250x180?text=Tidak+Ada+Foto';
        const fotoDokumenUrl = detailInfo.bukti_dokumen_penerimaan_url || 'https://via.placeholder.com/250x180?text=Tidak+Ada+Dokumen';

        // Cek tipe file dokumen
        const dokumenFilename = detailInfo.bukti_dokumen_penerimaan_url ? detailInfo.bukti_dokumen_penerimaan_url.split('/').pop() : 'Tidak ada dokumen';
        const dokumenExt = dokumenFilename.split('.').pop().toLowerCase();
        const isImageDokumen = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(dokumenExt);

        // Build HTML untuk 2 gambar berjajar dengan zoom
        const imagesHTML = `
            <div style="display: flex; justify-content: center; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                <!-- Foto Bukti Penerimaan -->
                <div style="flex: 1; min-width: 180px; max-width: 250px;">
                    <div style="position: relative;">
                        <img 
                            src="${fotoPenerimaanUrl}" 
                            alt="Bukti Penerimaan" 
                            style="width: 100%; height: 180px; object-fit: cover; border-radius: 0.5rem; border: 2px solid #009100; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); cursor: pointer;"
                            onerror="this.src='https://via.placeholder.com/250x180?text=Tidak+Ada+Foto'"
                            onclick="zoomImage('${fotoPenerimaanUrl}', 'Bukti Penerimaan')"
                        />
                        <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px;">
                            <i class="f7-icons" style="color: white; font-size: 16px;">zoom_in</i>
                        </div>
                    </div>
                    <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280; font-weight: 500; text-align: center;">Bukti Penerimaan</p>
                </div>
                
                <!-- Foto Bukti Dokumen -->
                <div style="flex: 1; min-width: 180px; max-width: 250px;">
                    ${isImageDokumen ? `
                        <div style="position: relative;">
                            <img 
                                src="${fotoDokumenUrl}" 
                                alt="Bukti Dokumen" 
                                style="width: 100%; height: 180px; object-fit: cover; border-radius: 0.5rem; border: 2px solid #009100; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); cursor: pointer;"
                                onerror="this.src='https://via.placeholder.com/250x180?text=Tidak+Ada+Dokumen'"
                                onclick="zoomImage('${fotoDokumenUrl}', 'Bukti Dokumen')"
                            />
                            <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px;">
                                <i class="f7-icons" style="color: white; font-size: 16px;">zoom_in</i>
                            </div>
                        </div>
                    ` : `
                        <div style="width: 100%; height: 180px; border-radius: 0.5rem; border: 2px solid #009100; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background: #f5f5f5; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer;" onclick="window.open('${fotoDokumenUrl}', '_blank')">
                            <i class="f7-icons" style="font-size: 48px; color: #e53935;">doc_text_fill</i>
                            <p style="margin-top: 0.5rem; font-size: 0.75rem; color: #666; text-align: center; padding: 0 0.5rem;">${dokumenFilename}</p>
                        </div>
                    `}
                    <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280; font-weight: 500; text-align: center;">Bukti Dokumen</p>
                </div>
            </div>
        `;

        // Build HTML untuk detail informasi
        const detailHTML = `
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="font-size: 16px; font-weight: 600; color: #009100; margin-bottom: 12px; text-align: center;">Detail Penerimaan</h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Nama Item</span>
                        <span style="font-weight: 600; color: #1f2937; font-size: 14px;">${headerInfo?.nama_item || '-'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Customer</span>
                        <span style="font-weight: 600; color: #1f2937; font-size: 14px;">${headerInfo?.nama_customer || '-'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Jumlah Diterima</span>
                        <span style="font-weight: 600; color: #009100; font-size: 14px;">${detailInfo.jumlah_diterima || 0} pcs</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Tanggal Diterima</span>
                        <span style="font-weight: 600; color: #1f2937; font-size: 14px;">${formatTanggalIndonesia(detailInfo.tanggal_diterima)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Deadline</span>
                        <span style="font-weight: 600; color: #1f2937; font-size: 14px;">${formatTanggalIndonesia(headerInfo?.tanggal_deadline)}</span>
                    </div>
                    ${detailInfo.catatan ? `
                    <div style="display: flex; flex-direction: column; padding: 6px 0;">
                        <span style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Catatan</span>
                        <span style="font-weight: 500; color: #1f2937; font-size: 13px; font-style: italic;">"${detailInfo.catatan}"</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        // ========== BUILD HTML UNTUK LIST MATERIAL ==========
        let materialsTableHTML = '';
        let totalMaterials = 0;

        if (headerInfo?.materials && headerInfo.materials.length > 0) {
            const materialsRows = headerInfo.materials.map((mat, index) => {
                const materialTotal = (mat.qty || 0) * (mat.harga || 0);
                totalMaterials += materialTotal;

                return `
                    <tr style="border-bottom: 1px solid #d1d5db;">
                        <td style="padding: 8px 12px; text-align: left; font-size: 13px; border: 1px solid #d1d5db; color: #1f2937;">${index + 1}</td>
                        <td style="padding: 8px 12px; text-align: left; font-size: 13px; border: 1px solid #d1d5db; color: #1f2937;">${mat.nama || '-'}</td>
                        <td style="padding: 8px 12px; text-align: right; font-size: 13px; border: 1px solid #d1d5db; color: #1f2937;">${mat.qty || 0}</td>
                        <td style="padding: 8px 12px; text-align: right; font-size: 13px; border: 1px solid #d1d5db; color: #1f2937;">${formatRupiah(mat.harga || 0)}</td>
                        <td style="padding: 8px 12px; text-align: right; font-size: 13px; border: 1px solid #d1d5db; color: #1f2937; font-weight: 600;">${formatRupiah(materialTotal)}</td>
                    </tr>
                `;
            }).join('');

            materialsTableHTML = `
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 16px; text-align: center; font-weight: 600; margin-bottom: 12px; color: #009100;">List Material</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; font-size: 13px; border: 1px solid #9ca3af; border-radius: 8px; overflow: hidden; border-collapse: collapse;">
                            <thead style="background: linear-gradient(to bottom, #009100, #007a00); color: white;">
                                <tr>
                                    <th style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; white-space: nowrap;">No</th>
                                    <th style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; white-space: nowrap;">Material</th>
                                    <th style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; white-space: nowrap;">Jumlah</th>
                                    <th style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; white-space: nowrap;">Harga Satuan</th>
                                    <th style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; white-space: nowrap;">Total</th>
                                </tr>
                            </thead>
                            <tbody style="background: white;">
                                ${materialsRows}
                                <tr style="background: white; font-weight: 600; border: 2px solid #d1d5db;">
                                    <td colspan="4" style="padding: 8px 12px; text-align: right; color: #1f2937; border: 1px solid #d1d5db; white-space: nowrap;">Subtotal</td>
                                    <td style="padding: 8px 12px; color: #009100; text-align: right; white-space: nowrap; font-weight: 700;">${formatRupiah(totalMaterials)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // ========== BUILD HTML UNTUK TOTAL SUMMARY ==========
        let summaryHTML = '';
        const biayaPengerjaan = headerInfo?.biaya_pengerjaan || 0;

        if (biayaPengerjaan > 0 || totalMaterials > 0) {
            const totalBersih = biayaPengerjaan - totalMaterials;

            summaryHTML = `
                <div style="padding: 15px; background: linear-gradient(to right, #009100, #007a00); border-radius: 8px; margin-bottom: 20px;">
                    <div style="margin-bottom: 15px;">
                        <div style="display: grid; grid-template-columns: 1fr auto 1fr; padding-bottom: 10px; gap: 10px;">
                            <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; gap: 4px; color: white;">
                                <span style="font-weight: 600; font-size: 13px; white-space: nowrap;">Biaya Pengerjaan</span>
                                <span style="font-weight: 700; font-size: 16px; white-space: nowrap;">${formatRupiah(biayaPengerjaan)}</span>
                            </div>
                            <div style="display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; color: white;">
                                <hr style="width: 24px; border: 2px solid white; border-radius: 2px;">
                            </div>
                            <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; gap: 4px; color: white;">
                                <span style="font-weight: 600; font-size: 13px; white-space: nowrap;">Harga Material</span>
                                <span style="font-weight: 700; font-size: 16px; white-space: nowrap;">${formatRupiah(totalMaterials)}</span>
                            </div>
                        </div>
                        <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px; margin-top: 10px;"></div>
                        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; color: white;">
                            <span style="font-weight: 700; font-size: 16px; white-space: nowrap;">Total</span>
                            <span style="font-weight: 700; font-size: 20px; white-space: nowrap; margin-top: 4px;">${formatRupiah(totalBersih)}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Update area gambar, detail, material, dan summary
        $('#approval_images_area').html(imagesHTML);
        $('#approval_detail_info').html(detailHTML);
        $('#approval_materials_section').html(materialsTableHTML);
        $('#approval_summary_section').html(summaryHTML);

        $('#approval_images_area').show();
        $('#approval_detail_info').show();

        // Show material dan summary hanya jika ada data
        if (materialsTableHTML) {
            $('#approval_materials_section').show();
        } else {
            $('#approval_materials_section').hide();
        }

        if (summaryHTML) {
            $('#approval_summary_section').show();
        } else {
            $('#approval_summary_section').hide();
        }

        $('#approval_empty_state').hide();

    } else {
        // ========== JIKA DETAIL INFO NULL - TAMPILKAN EMPTY STATE ==========
        console.warn('Detail info tidak tersedia (null/kosong)');

        // Set default values
        $('#approval_purchase_qty').text('0 pcs');

        // Show empty state
        $('#approval_images_area').hide();
        $('#approval_detail_info').hide();
        $('#approval_materials_section').hide();
        $('#approval_summary_section').hide();
        $('#approval_empty_state').show();

        // Optional: Show warning message
        if (typeof app !== 'undefined' && app.toast) {
            app.toast.create({
                text: 'Data pengiriman belum tersedia',
                position: 'center',
                closeTimeout: 2000,
                cssClass: 'bg-color-orange'
            }).open();
        }
    }
}

/**
 * Approve penerimaan
 */
function approvePenerimaan() {
    console.log('Approve penerimaan:', APPROVAL_STATE.currentPenerimaanId);

    if (!APPROVAL_STATE.currentPenerimaanId) {
        alert('ID penerimaan tidak ditemukan');
        return;
    }

    // Konfirmasi
    if (typeof app !== 'undefined' && app.dialog) {
        app.dialog.confirm(
            'Approve penerimaan barang ini?',
            'Konfirmasi Approval',
            function () {
                executeApproval();
            }
        );
    } else {
        if (confirm('Approve penerimaan barang ini?')) {
            executeApproval();
        }
    }
}

/**
 * Close approval popup dan reset state
 */
function closeApprovalPopup() {
    console.log('Closing approval popup...');

    // Close popup
    if (typeof app !== 'undefined') {
        app.popup.close('.popup-approval-penerimaan');
    }

    // Reset state
    APPROVAL_STATE.currentPenerimaanId = null;
    APPROVAL_STATE.currentPartnerTransaksiId = null;
    APPROVAL_STATE.currentData = null;

    console.log('Approval popup closed and state reset');
}

/**
 * Execute approval ke backend
 */
function executeApproval() {
    console.log('Executing approval...');

    // Disable button
    $('#btn_approve_penerimaan').prop('disabled', true).text('Processing...');

    // Show loading
    if (typeof app !== 'undefined' && app.preloader) {
        app.preloader.show();
    }

    $.ajax({
        type: 'POST',
        url: BASE_API + '/partner/approve',
        data: {
            id: APPROVAL_STATE.currentPenerimaanId,
            id_partner_transaksi: APPROVAL_STATE.currentPartnerTransaksiId
        },
        dataType: 'json',
        success: function (response) {
            console.log('Approval response:', response);

            if (response.success) {
                // Success notification
                if (typeof app !== 'undefined' && app.toast) {
                    app.toast.create({
                        text: 'Penerimaan berhasil di-approve',
                        position: 'center',
                        closeTimeout: 2000,
                        cssClass: 'bg-color-green'
                    }).open();
                } else {
                    alert('Penerimaan berhasil di-approve');
                }

                // Close popup
                if (typeof app !== 'undefined') {
                    app.popup.close('.popup-approval-penerimaan');
                }

                // Refresh data laporan
                if (typeof refreshDataLaporan === 'function') {
                    setTimeout(function () {
                        refreshDataLaporan();
                    }, 500);
                }

                // Reset state
                APPROVAL_STATE.currentPenerimaanId = null;
                APPROVAL_STATE.currentPartnerTransaksiId = null;
                APPROVAL_STATE.currentData = null;

            } else {
                alert(response.message || 'Gagal approve penerimaan');
            }
        },
        error: function (xhr, status, error) {
            console.error('Approval error:', error);

            let errorMessage = 'Terjadi kesalahan saat approve';
            try {
                const errorResponse = JSON.parse(xhr.responseText);
                if (errorResponse.message) {
                    errorMessage = errorResponse.message;
                }
            } catch (e) {
                console.error('Error parsing response');
            }

            alert(errorMessage);
        },
        complete: function () {
            // Re-enable button
            $('#btn_approve_penerimaan').prop('disabled', false).html('<i class="f7-icons" style="margin-right: 8px;">checkmark_circle_fill</i> ACC');

            // Hide loading
            if (typeof app !== 'undefined' && app.preloader) {
                app.preloader.hide();
            }
        }
    });
}