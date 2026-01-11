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
 * Populate popup approval dengan data penerimaan
 * 
 * @param {object} data - Data penerimaan dari API
 */
function populateApprovalPopup(data) {
    console.log('Populating approval popup:', data);

    // Info penerimaan
    $('#approval_partner_name').text(data.partner_name || '-');
    $('#approval_spk').text(data.spk_number || '-');
    $('#approval_item').text(data.item || '-');
    $('#approval_jumlah').text((data.jumlah_diterima || 0) + ' unit');

    // Format tanggal
    if (data.tanggal_diterima) {
        const date = new Date(data.tanggal_diterima);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        $('#approval_tanggal').text(date.toLocaleDateString('id-ID', options));
    } else {
        $('#approval_tanggal').text('-');
    }

    // Handle foto bukti penerimaan
    if (data.bukti_penerimaan_url) {
        $('#approval_foto_img').attr('src', data.bukti_penerimaan_url);
        $('#approval_foto_area').show();
        $('#approval_foto_empty').hide();
    } else {
        $('#approval_foto_area').hide();
        $('#approval_foto_empty').show();
    }

    // Handle bukti dokumen
    if (data.bukti_dokumen_penerimaan_url) {
        const filename = data.bukti_dokumen_penerimaan_url.split('/').pop();
        const ext = filename.split('.').pop().toLowerCase();

        $('#approval_dokumen_name').text(filename);

        // Show preview untuk image, icon untuk PDF
        if (['jpg', 'jpeg', 'png'].includes(ext)) {
            $('#approval_dokumen_img').attr('src', data.bukti_dokumen_penerimaan_url).show();
            $('#approval_dokumen_icon').hide();
        } else {
            $('#approval_dokumen_img').hide();
            $('#approval_dokumen_icon').show();
        }

        $('#approval_dokumen_area').show();
        $('#approval_dokumen_empty').hide();
    } else {
        $('#approval_dokumen_area').hide();
        $('#approval_dokumen_empty').show();
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
        url: BASE_API + '/delivery/approve',
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
            $('#btn_approve_penerimaan').prop('disabled', false).html('<i class="f7-icons">checkmark_circle_fill</i> Approve Penerimaan');

            // Hide loading
            if (typeof app !== 'undefined' && app.preloader) {
                app.preloader.hide();
            }
        }
    });
}