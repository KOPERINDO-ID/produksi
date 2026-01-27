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
 * Format number dengan pemisah titik
 * @param {number} num - Angka yang akan diformat
 * @returns {string} - Angka terformat
 */
function formatNumber(num) {
    if (!num) return '0';

    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Format rupiah
 * @param {number} num - Jumlah uang
 * @returns {string} - Format rupiah
 */
function formatRupiah(num) {
    if (!num && num !== 0) return 'Rp 0';

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
                    ` : `
                        <div style="width: 100%; height: 180px; border-radius: 0.5rem; border: 2px solid #CFECFE; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background: #f5f5f5; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer;" onclick="window.open('${fotoProdukSpk}', '_blank')">
                            <i class="f7-icons" style="font-size: 48px; color: #e53935;">doc_text_fill</i>
                            <p style="margin-top: 0.5rem; font-size: 0.75rem; color: #666; text-align: center; padding: 0 0.5rem;">${dokumenFilename}</p>
                        </div>
                    `}
                </div>

                <!-- Foto Bukti Penerimaan -->
                <div style="flex: 1; min-width: 180px; max-width: 250px;">
                    <div style="position: relative;">
                        <img 
                            src="${fotoPenerimaanUrl}" 
                            alt="Bukti Penerimaan" 
                            style="width: 100%; height: 180px; object-fit: cover; border-radius: 0.5rem; border: 2px solid #CFECFE; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); cursor: pointer;"
                            onerror="this.src='https://via.placeholder.com/250x180?text=Tidak+Ada+Foto'"
                            onclick="zoomImage('${fotoPenerimaanUrl}', 'Bukti Penerimaan')"
                        />
                        <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px;">
                            <i class="f7-icons" style="color: white; font-size: 16px;">zoom_in</i>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Build HTML untuk keterangan SPK
        const spkDescription = `
            <div style="display: flex; flex-direction: column; justify-content: gap: 0.75rem; space-between; align-items: start; padding: 14px; border-radius: 0.5rem; border: 2px solid #CFECFE;">
                <h3 style="font-size: 16px; font-weight: 600; color: #fff; margin-top: 4px; margin-bottom: 8px; text-align: left;">Keterangan</h3>
                <div style="max-height: 4.5em; overflow-y: auto; line-height: 1.5em; width: 100%;">
                    ${penjualanDetail.keterangan ?? '-'}
                </div>
            </div>
        `;

        // Build HTML untuk detail informasi
        const detailHTML = `
            <div>
                <div style="font-size: 16px; font-weight: 600; color: #1c1c1d; background: #CFECFE; padding: 8px 0; text-align: center; border-radius: 8px 8px 0 0;">Detail</div>
                <div style="display: flex; flex-direction: column; gap: 8px; background: #f9fafb; padding: 14px; border-radius: 0 0 8px 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Tipe</span>
                        <span style="font-weight: 600; color: #1f2937; font-size: 14px;">${partnerTransaksi.item || penjualanDetail.produk_keterangan_kustom || '-'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Harga Produk</span>
                        <span style="font-weight: 600; color: #1f2937; font-size: 14px;">${formatNumber(penjualanDetail.penjualan_harga) || 0}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Jumlah Diterima</span>
                        <span style="font-weight: 600; color: #056BBC; font-size: 14px;">${jumlahDiterima} pcs</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Biaya pengerjaan (Satuan)</span>
                        <span style="font-weight: 600; color: #1f2937; font-size: 14px;">${formatNumber(partnerTransaksi.harga_produksi) || 0}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="color: #6b7280; font-size: 14px;">Biaya pengerjaan</span>
                        <span style="font-weight: 600; color: #1f2937; font-size: 14px;">${formatNumber(partnerTransaksi.total_harga_produksi) || 0}</span>
                    </div>
                    ${partnerTransaksi.keterangan ? `
                    <div style="display: flex; flex-direction: column; padding: 6px 0;">
                        <span style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Catatan (tambahan)</span>
                        <span style="font-weight: 800; color: #1f2937; font-size: 13px;">"${partnerTransaksi.keterangan}"</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        // ========== BUILD HTML UNTUK LIST MATERIAL ==========
        let materialsTableHTML = '';
        let totalMaterials = summary.total_harga_material || 0;

        if (materials && materials.length > 0) {
            // Jika total dari summary adalah 0, hitung manual
            if (totalMaterials === 0) {
                totalMaterials = materials.reduce((acc, mat) => {
                    return acc + ((mat.jumlah || 0) * (mat.harga || 0));
                }, 0);
            }

            const materialsRows = materials.map((mat, index) => {
                // PERBAIKAN: Gunakan total_harga dari backend jika ada
                const materialTotal = mat.total_harga || ((mat.jumlah || 0) * (mat.harga || 0));

                return `
                    <tr style="border-bottom: 1px solid #d1d5db;">
                        <td style="padding: 8px 12px; text-align: left; font-size: 13px; border: 1px solid #d1d5db; color: #1f2937; white-space: nowrap;">${index + 1}</td>
                        <td style="padding: 8px 12px; text-align: left; font-size: 13px; border: 1px solid #d1d5db; color: #1f2937; white-space: nowrap;">${mat.nama || mat.material_info?.nama_material || '-'}</td>
                        <td style="padding: 8px 12px; text-align: right; font-size: 13px; border: 1px solid #d1d5db; color: #1f2937; white-space: nowrap;">${mat.jumlah || 0}</td>
                        <td style="padding: 8px 12px; text-align: right; font-size: 13px; border: 1px solid #d1d5db; color: #1f2937; white-space: nowrap;">${formatNumber(mat.harga || 0)}</td>
                        <td style="padding: 8px 12px; text-align: right; font-size: 13px; border: 1px solid #d1d5db; color: #1f2937; white-space: nowrap; font-weight: 600;">${formatNumber(materialTotal)}</td>
                    </tr>
                `;
            }).join('');

            materialsTableHTML = `
                <div>
                    <h3 style="font-size: 16px; text-align: center; font-weight: 600; margin: 8px 0px; color: #fff;">List Material</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; font-size: 13px; border: 1px solid #9ca3af; border-radius: 8px; overflow: hidden; border-collapse: collapse;">
                            <thead class="table-header-theme">
                                <tr>
                                    <th style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; white-space: nowrap;">No</th>
                                    <th style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; white-space: nowrap;">Material</th>
                                    <th style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; white-space: nowrap;">Jumlah</th>
                                    <th style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; white-space: nowrap;">Harga Satuan</th>
                                    <th style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: center; white-space: nowrap;">Total</th>
                                </tr>
                            </thead>
                            <tbody class="table-body-theme">
                                ${materialsRows}
                                <tr style="background: white; font-weight: 600; border: 2px solid #d1d5db;">
                                    <td colspan="4" style="padding: 8px 12px; text-align: right; color: #1f2937; border: 1px solid #d1d5db; white-space: nowrap;">Subtotal</td>
                                    <td style="padding: 8px 12px; color: #056BBC; text-align: right; white-space: nowrap; font-weight: 700;">${formatNumber(totalMaterials)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }

        // ========== BUILD HTML UNTUK TOTAL SUMMARY ==========
        let summaryHTML = '';
        const biayaPengerjaan = partnerTransaksi.total_harga_produksi || 0;

        if (biayaPengerjaan > 0 || totalMaterials > 0) {
            const totalBersih = biayaPengerjaan - totalMaterials;

            summaryHTML = `
                <div style="padding: 15px; background: #CFECFE; color: #1c1c1d; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: grid; grid-template-columns: 1fr auto 1fr; padding-bottom: 10px; gap: 10px;">
                        <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; gap: 4px;">
                            <span style="font-weight: 600; font-size: 13px; white-space: nowrap;">Biaya Pengerjaan</span>
                            <span style="font-weight: 700; font-size: 16px; white-space: nowrap;">${formatNumber(biayaPengerjaan)}</span>
                        </div>
                        <div style="display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px;">
                            <hr style="width: 24px; border: 2px solid #1c1c1d; border-radius: 2px;">
                        </div>
                        <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; gap: 4px;">
                            <span style="font-weight: 600; font-size: 13px; white-space: nowrap;">Harga Material</span>
                            <span style="font-weight: 700; font-size: 16px; white-space: nowrap;">${formatNumber(totalMaterials)}</span>
                        </div>
                    </div>
                    <div style="border-top: 1px solid rgba(47, 43, 43, 0.3); padding-top: 10px; margin-top: 10px;"></div>
                    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
                        <span style="font-weight: 700; font-size: 16px; white-space: nowrap;">Total</span>
                        <span style="font-weight: 700; font-size: 20px; white-space: nowrap; margin-top: 4px;">${formatNumber(totalBersih)}</span>
                    </div>
                </div>
            `;
        }

        // ========== BUILD HTML UNTUK RIWAYAT PENGIRIMAN ==========
        let pengirimanHistoryHTML = '';

        if (pengiriman && pengiriman.length > 0) {
            const pengirimanRows = pengiriman.map((item, index) => {
                return `
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <td style="padding: 8px; text-align: center; font-size: 12px; color: #1f2937;">${index + 1}</td>
                        <td style="padding: 8px; text-align: center; font-size: 12px; color: #1f2937;">${formatTanggalIndonesia(item.tanggal_kirim)}</td>
                        <td style="padding: 8px; text-align: center; font-size: 12px; color: #1f2937;">${item.jumlah_kirim || 0}</td>
                        <td style="padding: 8px; text-align: center; font-size: 12px; color: #CFECFE; font-weight: 600;">${item.jumlah_diterima || 0}</td>
                        <td style="padding: 8px; text-align: center; font-size: 12px; color: #ef4444;">${item.jumlah_rusak || 0}</td>
                    </tr>
                `;
            }).join('');

            pengirimanHistoryHTML = `
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 16px; text-align: center; font-weight: 600; margin-bottom: 12px; color: #CFECFE;">Riwayat Pengiriman</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; font-size: 12px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; border-collapse: collapse;">
                            <thead class="table-header-theme">
                                <tr>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">No</th>
                                    <th style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">Tgl Kirim</th>
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