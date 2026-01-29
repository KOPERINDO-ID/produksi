// =========================================
// APPROVAL PENERIMAAN FUNCTIONS
// =========================================
// Refactored version - menggunakan helper.js untuk fungsi-fungsi umum
// Tech Stack: Cordova + Framework7 v7
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
 * @param {string} id_partner_transaksi - ID partner transaksi
 */
function lihatDetailPenerimaan(id_partner_transaksi) {
    console.log('Lihat detail penerimaan untuk partner transaksi:', id_partner_transaksi);

    // Store ID
    APPROVAL_STATE.currentPartnerTransaksiId = id_partner_transaksi;

    console.log('currentPartnerTransaksiId set to:', APPROVAL_STATE.currentPartnerTransaksiId);

    // Show loading
    if (typeof app !== 'undefined' && app.preloader) {
        app.preloader.show();
    }

    // Fetch data penerimaan dari API
    $.ajax({
        type: 'GET',
        url: BASE_API + '/partner/get-partner-summary',
        dataType: 'json',
        success: function (response) {
            console.log('Partner summary loaded:', response);

            if (response.success && response.data) {

                const partnerData = response.data.find(item =>
                    item.partner_transaksi.id_partner_transaksi == id_partner_transaksi
                );

                console.log("Partner data: ", partnerData);

                if (partnerData) {
                    APPROVAL_STATE.currentData = partnerData;

                    if (!partnerData.pengiriman || partnerData.pengiriman.length === 0) {
                        if (typeof app !== 'undefined' && app.dialog) {
                            app.dialog.alert('Data pengiriman belum ada!', 'Informasi');
                        } else {
                            alert('Data pengiriman belum ada!');
                        }
                        return;
                    }

                    // Cek apakah sudah diterima
                    if (partnerData.partner_transaksi.status_approval === 'ACC' || partnerData.partner_transaksi.status_penerimaan == null) {
                        $('#btn_approve_penerimaan').hide();
                        $('#btn_cancel_approval').hide();
                    } else {
                        $('#btn_approve_penerimaan').show();
                        $('#btn_cancel_approval').show();
                    }

                    // Populate popup dengan data
                    populateApprovalPopup(partnerData);

                    // Buka popup
                    if (typeof app !== 'undefined') {
                        app.popup.open('.popup-approval-penerimaan');
                    }
                } else {
                    alert('Data partner transaksi tidak ditemukan');
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
 * SYNC dengan struktur backend getPartnerSummary()
 * 
 * @param {object} data - Data penerimaan dari API
 */
function populateApprovalPopup(data) {
    console.log('Populating approval popup:', data);

    // ========== VALIDASI DATA ==========
    if (!data) {
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

    // ========== EXTRACT DATA SESUAI STRUKTUR BACKEND ==========
    const partnerTransaksi = data.partner_transaksi || {};
    const partner = data.partner || {};
    const penjualanHeader = data.penjualan_header || {};
    const penjualanDetail = data.penjualan_detail || {};
    const client = data.client || {};
    const materials = data.materials || [];
    const summary = data.summary || {};

    // PERBAIKAN: pengiriman ada di level root, bukan di dalam materials
    const pengiriman = data.pengiriman || [];

    console.log("Materials: ", materials);
    console.log("Pengiriman: ", pengiriman);
    console.log("Summary: ", summary);

    // ========== POPULATE HEADER INFO ==========
    $('#approval_spk_code').text(formatSPKCode(penjualanHeader.penjualan_id, penjualanHeader.penjualan_tanggal) || '-');
    $('#approval_client_name').text(client.client_nama || '-');
    $('#approval_partner_name').text(partner.nama_partner || '-');

    // ========== HANDLE DATA PENGIRIMAN ==========
    // PERBAIKAN: Ambil pengiriman terbaru dari array pengiriman di level root
    let latestDelivery = null;

    if (pengiriman && pengiriman.length > 0) {
        // Ambil pengiriman terbaru (yang terakhir berdasarkan index atau tanggal)
        // Sort by tanggal_diterima atau dt_record descending untuk mendapatkan yang terbaru
        const sortedPengiriman = [...pengiriman].sort((a, b) => {
            const dateA = new Date(a.tanggal_diterima || a.dt_record || 0);
            const dateB = new Date(b.tanggal_diterima || b.dt_record || 0);
            return dateB - dateA;
        });
        latestDelivery = sortedPengiriman[0];
        console.log("Latest delivery:", latestDelivery);
    }

    // ========== HANDLE DETAIL INFO ==========
    if (latestDelivery || partnerTransaksi.id_partner_transaksi) {
        // Jika ada detail info dari pengiriman atau minimal dari partner transaksi

        // PERBAIKAN: Gunakan summary.total_diterima atau latestDelivery.jumlah_diterima
        const jumlahDiterima = summary.total_diterima || latestDelivery?.jumlah_diterima || partnerTransaksi.jumlah_diterima || 0;
        $('#approval_purchase_qty').text(jumlahDiterima + ' pcs');

        // URL gambar dengan fallback
        const fotoPenerimaanUrl = latestDelivery?.bukti_penerimaan
            ? BASE_API.replace(/.{3}$/, '') + latestDelivery.bukti_penerimaan
            : 'https://via.placeholder.com/250x180?text=Tidak+Ada+Foto';

        const fotoProdukSpk = penjualanDetail?.gambar
            ? BASE_API.replace(/.{3}$/, 'performa_image/') + penjualanDetail?.gambar
            : 'https://via.placeholder.com/250x180?text=Tidak+Ada+Dokumen';

        // Cek tipe file dokumen
        const dokumenFilename = penjualanDetail?.gambar || 'Gambar tidak tersedia';
        const dokumenExt = dokumenFilename.split('.').pop().toLowerCase();
        const isImageDokumen = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(dokumenExt);

        // Build HTML untuk 2 gambar berjajar dengan zoom
        const imagesHTML = `
            <div style="display: flex; justify-content: center; align-items: flex-start; gap: 0.75rem; flex-wrap: wrap;">
                <!-- Foto SPK -->
                <div style="flex: 1; min-width: 180px; max-width: 250px;">
                    ${isImageDokumen ? `
                        <div style="position: relative;">
                            <img 
                                src="${fotoProdukSpk}" 
                                alt="SPK" 
                                style="width: 100%; height: 180px; object-fit: cover; border-radius: 0.5rem; border: 2px solid #CFECFE; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); cursor: pointer;"
                                onerror="this.src='https://via.placeholder.com/250x180?text=Tidak+Ada+Dokumen'"
                                onclick="zoomImage('${fotoProdukSpk}', 'Foto SPK')"
                            />
                            <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px;">
                                <i class="f7-icons" style="color: white; font-size: 16px;">zoom_in</i>
                            </div>
                        </div>
                        <div class="text-align-center" style="margin-top: 0.5rem; font-size: 13px; color: #666;">
                            <i class="f7-icons" style="font-size: 14px;">doc_text_fill</i> Foto SPK
                        </div>
                    ` : `
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 180px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 0.5rem; border: 2px solid #CFECFE; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <i class="f7-icons" style="font-size: 48px; color: white; margin-bottom: 8px;">doc_text_fill</i>
                            <span style="color: white; font-size: 12px; text-align: center; padding: 0 12px;">${dokumenExt.toUpperCase()}</span>
                        </div>
                        <div class="text-align-center" style="margin-top: 0.5rem; font-size: 13px; color: #666;">
                            <i class="f7-icons" style="font-size: 14px;">doc_text_fill</i> Dokumen SPK
                        </div>
                        <div class="text-align-center" style="margin-top: 0.25rem;">
                            <a href="${fotoProdukSpk}" target="_blank" class="button button-small button-outline" style="font-size: 11px; padding: 4px 12px;">
                                <i class="f7-icons" style="font-size: 12px; margin-right: 4px;">arrow_down_circle</i>
                                Download
                            </a>
                        </div>
                    `}
                </div>

                <!-- Foto Penerimaan -->
                <div style="flex: 1; min-width: 180px; max-width: 250px;">
                    <div style="position: relative;">
                        <img 
                            src="${fotoPenerimaanUrl}" 
                            alt="Penerimaan" 
                            style="width: 100%; height: 180px; object-fit: cover; border-radius: 0.5rem; border: 2px solid #CFECFE; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); cursor: pointer;"
                            onerror="this.src='https://via.placeholder.com/250x180?text=Tidak+Ada+Foto'"
                            onclick="zoomImage('${fotoPenerimaanUrl}', 'Foto Penerimaan')"
                        />
                        <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px;">
                            <i class="f7-icons" style="color: white; font-size: 16px;">zoom_in</i>
                        </div>
                    </div>
                    <div class="text-align-center" style="margin-top: 0.5rem; font-size: 13px; color: #666;">
                        <i class="f7-icons" style="font-size: 14px;">camera_fill</i> Foto Penerimaan
                    </div>
                </div>
            </div>
        `;

        // Build SPK Description
        const spkDescription = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; border-radius: 0.5rem; color: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600; font-size: 14px;">
                        <i class="f7-icons" style="font-size: 16px; margin-right: 4px;">cube_box_fill</i>
                        ${escapeHtml(penjualanDetail?.item || 'Tidak ada informasi item')}
                    </span>
                </div>
                <div style="font-size: 12px; opacity: 0.9; line-height: 1.5;">
                    ${escapeHtml(penjualanDetail?.keterangan || 'Tidak ada keterangan')}
                </div>
            </div>
        `;

        // Build Detail Info HTML
        const detailHTML = `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                <!-- Tanggal SPK -->
                <div style="background: #f9fafb; padding: 0.75rem; border-radius: 0.5rem; border-left: 3px solid #CFECFE;">
                    <div style="font-size: 11px; color: #6b7280; margin-bottom: 0.25rem;">Tanggal SPK</div>
                    <div style="font-weight: 600; font-size: 13px; color: #111827;">
                        ${formatTanggalIndonesia(penjualanHeader?.penjualan_tanggal) || '-'}
                    </div>
                </div>

                <!-- Tanggal Deadline -->
                <div style="background: #f9fafb; padding: 0.75rem; border-radius: 0.5rem; border-left: 3px solid #fbbf24;">
                    <div style="font-size: 11px; color: #6b7280; margin-bottom: 0.25rem;">Deadline</div>
                    <div style="font-weight: 600; font-size: 13px; color: #111827;">
                        ${formatTanggalIndonesia(partnerTransaksi?.tgl_deadline) || '-'}
                    </div>
                </div>

                <!-- Jumlah SPK -->
                <div style="background: #f9fafb; padding: 0.75rem; border-radius: 0.5rem; border-left: 3px solid #10b981;">
                    <div style="font-size: 11px; color: #6b7280; margin-bottom: 0.25rem;">Jumlah SPK</div>
                    <div style="font-weight: 600; font-size: 13px; color: #111827;">
                        ${formatNumber(partnerTransaksi?.jumlah || 0)} pcs
                    </div>
                </div>

                <!-- Harga Satuan -->
                <div style="background: #f9fafb; padding: 0.75rem; border-radius: 0.5rem; border-left: 3px solid #8b5cf6;">
                    <div style="font-size: 11px; color: #6b7280; margin-bottom: 0.25rem;">Harga Satuan</div>
                    <div style="font-weight: 600; font-size: 13px; color: #111827;">
                        ${formatRupiah(partnerTransaksi?.harga || 0)}
                    </div>
                </div>
            </div>
        `;

        // Build Materials Table HTML
        let materialsTableHTML = '';
        if (materials && materials.length > 0) {
            const materialRows = materials.map(material => `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">${escapeHtml(material.nama_material || '-')}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px;">${material.jumlah || 0}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 12px;">${formatRupiah(material.harga || 0)}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 12px; font-weight: 600;">${formatRupiah((material.jumlah || 0) * (material.harga || 0))}</td>
                </tr>
            `).join('');

            materialsTableHTML = `
                <div style="margin-top: 1rem;">
                    <div style="font-weight: 600; margin-bottom: 0.5rem; color: #111827; font-size: 14px;">
                        <i class="f7-icons" style="font-size: 16px; margin-right: 4px;">layers_fill</i>
                        Material
                    </div>
                    <div style="overflow-x: auto; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
                        <table style="width: 100%; border-collapse: collapse; background: white;">
                            <thead style="background: #f9fafb;">
                                <tr>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px;">Nama Material</th>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px;">Jumlah</th>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 12px;">Harga Satuan</th>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 12px;">Total</th>
                                </tr>
                            </thead>
                            <tbody class="table-body-theme">
                                ${materialRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // Build Pengiriman History HTML
        let pengirimanHistoryHTML = '';
        if (pengiriman && pengiriman.length > 0) {
            const pengirimanRows = pengiriman.map((p, idx) => `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px;">${idx + 1}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">${formatTanggalIndonesia(p.tanggal_diterima || p.dt_record) || '-'}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px;">${p.jumlah_kirim || 0}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #CFECFE;">${p.jumlah_diterima || 0}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #ef4444;">${p.jumlah_rusak || 0}</td>
                </tr>
            `).join('');

            pengirimanHistoryHTML = `
                <div style="margin-top: 1rem;">
                    <div style="font-weight: 600; margin-bottom: 0.5rem; color: #111827; font-size: 14px;">
                        <i class="f7-icons" style="font-size: 16px; margin-right: 4px;">cube_box</i>
                        Riwayat Pengiriman
                    </div>
                    <div style="overflow-x: auto; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
                        <table style="width: 100%; border-collapse: collapse; background: white;">
                            <thead style="background: #f9fafb;">
                                <tr>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px;">No</th>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 12px;">Tanggal</th>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px;">Kirim</th>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px;">Diterima</th>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 12px;">Rusak</th>
                                </tr>
                            </thead>
                            <tbody class="table-body-theme">
                                ${pengirimanRows}
                                <tr style="background: #f9fafb; font-weight: 600;">
                                    <td colspan="2" style="padding: 8px; text-align: right; font-size: 12px;">Total:</td>
                                    <td style="padding: 8px; text-align: center; font-size: 12px;">${summary.total_kirim || 0}</td>
                                    <td style="padding: 8px; text-align: center; font-size: 12px; color: #CFECFE;">${summary.total_diterima || 0}</td>
                                    <td style="padding: 8px; text-align: center; font-size: 12px; color: #ef4444;">${pengiriman.reduce((acc, p) => acc + (p.jumlah_rusak || 0), 0)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // Build Summary HTML
        let summaryHTML = '';
        if (summary && Object.keys(summary).length > 0) {
            summaryHTML = `
                <div style="margin-top: 1rem;">
                    <div style="font-weight: 600; margin-bottom: 0.5rem; color: #111827; font-size: 14px;">
                        <i class="f7-icons" style="font-size: 16px; margin-right: 4px;">chart_bar_fill</i>
                        Summary
                    </div>
                    <div style="overflow-x: auto; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
                        <table style="width: 100%; border-collapse: collapse; background: white;">
                            <thead style="background: #f9fafb;">
                                <tr>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">No</th>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left;">Keterangan</th>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">Kirim</th>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">Diterima</th>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">Rusak</th>
                                </tr>
                            </thead>
                            <tbody class="table-body-theme">
                                ${pengirimanRows}
                                <tr style="background: #f9fafb; font-weight: 600;">
                                    <td colspan="2" style="padding: 8px; text-align: right; font-size: 12px;">Total:</td>
                                    <td style="padding: 8px; text-align: center; font-size: 12px;">${summary.total_kirim || 0}</td>
                                    <td style="padding: 8px; text-align: center; font-size: 12px; color: #CFECFE;">${summary.total_diterima || 0}</td>
                                    <td style="padding: 8px; text-align: center; font-size: 12px; color: #ef4444;">${pengiriman.reduce((acc, p) => acc + (p.jumlah_rusak || 0), 0)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // Update area gambar, description, detail, material, pengiriman, dan summary
        $('#approval_images_area').html(imagesHTML);
        $('#approval_description_info').html(spkDescription);
        $('#approval_detail_info').html(detailHTML);
        $('#approval_materials_section').html(materialsTableHTML);
        $('#approval_pengiriman_section').html(pengirimanHistoryHTML);
        $('#approval_summary_section').html(summaryHTML);

        $('#approval_images_area').show();
        $('#approval_detail_info').show();
        $('#approval_description_info').show();

        // Show material hanya jika ada data
        if (materialsTableHTML) {
            $('#approval_materials_section').show();
        } else {
            $('#approval_materials_section').hide();
        }

        // Show pengiriman hanya jika ada data
        if (pengirimanHistoryHTML) {
            $('#approval_pengiriman_section').show();
        } else {
            $('#approval_pengiriman_section').hide();
        }

        // Show summary hanya jika ada data
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
        $('#approval_pengiriman_section').hide();
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
    console.log('Approve penerimaan untuk partner transaksi:', APPROVAL_STATE.currentPartnerTransaksiId);

    if (!APPROVAL_STATE.currentPartnerTransaksiId) {
        alert('ID partner transaksi tidak ditemukan');
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
                    }, 1000);
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