/**
 * ========================================
 * INVOICE HELPER FUNCTIONS
 * ========================================
 * File ini berisi fungsi-fungsi helper untuk menangani Invoice
 * Digunakan oleh getDataProduksiCabang dan getDataExtraCabang
 */

/**
 * Membuka popup invoice untuk input data baru
 * @param {string} penjualanId - ID penjualan
 * @param {string} perfomaId - ID performa detail
 * @param {string} clientNama - Nama client
 */
function openInvoicePopup(penjualanId, perfomaId, clientNama) {
    // Reset form
    resetInvoiceForm();

    // Simpan data untuk proses simpan nanti
    localStorage.setItem('current_penjualan_id', penjualanId);
    localStorage.setItem('current_performa_id', perfomaId);

    // Load detail items
    loadInvoiceItems(penjualanId);

    // Set mode input (bukan view)
    localStorage.setItem('invoice_mode', 'input');

    // Enable semua input field
    enableInvoiceInputs();
}

/**
 * Melihat detail invoice yang sudah ada
 * @param {string} penjualanId - ID penjualan
 * @param {string} perfomaId - ID performa detail
 */
function viewInvoiceDetail(penjualanId, perfomaId) {
    // Set mode view
    localStorage.setItem('invoice_mode', 'view');

    // Load data invoice dari server
    loadExistingInvoiceData(penjualanId, perfomaId);
}

/**
 * Reset form invoice ke kondisi awal
 */
function resetInvoiceForm() {
    // Reset preview foto
    jQuery('#foto_preview').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/foto_invoice/no_image_invoice.png');
    jQuery('#foto_preview_container').show();
    jQuery('#foto_placeholder').hide();

    // Reset input fields
    jQuery('#detail_no_invoice').val('');
    jQuery('#detail_no_sj').val('');
    jQuery('#detail_nominal_bayar_invoice').val('');
    jQuery('#detail_keterangan_invoice').val('');

    // Hide error messages
    jQuery('#error_foto').hide();
    jQuery('#error_no_invoice').hide();
    jQuery('#error_sj').hide();
    jQuery('#error_nominal').hide();

    // Reset file input
    jQuery('#file_bukti_pembayaran').val('');

    // Clear localStorage untuk foto dan data terkait
    localStorage.removeItem('uploaded_invoice_photo');
    localStorage.removeItem('foto_lama_invoice');
}

/**
 * Load items detail untuk ditampilkan di popup
 * @param {string} penjualanId - ID penjualan
 */
function loadInvoiceItems(penjualanId) {
    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-detail-spk",
        dataType: 'JSON',
        data: {
            penjualan_id: penjualanId
        },
        beforeSend: function () {
            jQuery('#popup_detail_items').html('<tr><td colspan="3" align="center">Loading...</td></tr>');
        },
        success: function (data) {
            // Set header info jika ada
            if (data.data.header) {
                jQuery('#popup_spk_no').text(data.data.header.spk_no || '-');
                jQuery('#popup_client').text(data.data.header.client_nama || '-');
            }

            // Process details array
            if (data.data.details && Array.isArray(data.data.details) && data.data.details.length > 0) {
                let itemsHtml = '';

                jQuery.each(data.data.details, function (index, item) {
                    var path_image = item.gambar.substring(0, 5) == "koper"
                        ? 'https://tasindo-sale-webservice.digiseminar.id/product_image_new'
                        : 'https://tasindo-sale-webservice.digiseminar.id/performa_image';
                    var image = path_image + '/' + item.gambar;

                    itemsHtml += '<tr>';

                    // Nomor urut - gunakan item.no atau index + 1
                    const no = item.no || (index + 1);
                    itemsHtml += `<td style="border-right: 1px solid #ddd; border-bottom: 1px solid #ddd; text-align: center; padding: 8px;">${no}</td>`;

                    // Produk - gunakan product_kode
                    const produkNama = item.product_kode || '-';
                    itemsHtml += `<td style="border-right: 1px solid #ddd; border-bottom: 1px solid #ddd; text-align: left; padding: 8px;">${produkNama}<br><img src="${image}" width="150px" onclick="zoom_view(this.src);"></td>`;

                    // Qty - gunakan qty atau qty_raw
                    const qty = item.qty || item.qty_raw || 0;
                    itemsHtml += `<td style="border-right: 1px solid #ddd; border-bottom: 1px solid #ddd; text-align: center; padding: 8px;">${qty}</td>`;

                    itemsHtml += '</tr>';
                });

                jQuery('#popup_detail_items').html(itemsHtml);
            } else {
                jQuery('#popup_detail_items').html('<tr><td colspan="3" align="center" style="padding: 8px 0;">Tidak ada data</td></tr>');
            }
        },
        error: function () {
            jQuery('#popup_detail_items').html('<tr><td colspan="3" align="center">Error loading data</td></tr>');
        }
    });
}

/**
 * Load data invoice yang sudah tersimpan
 * @param {string} penjualanId - ID penjualan
 * @param {string} perfomaId - ID performa detail
 */
function loadExistingInvoiceData(penjualanId, perfomaId) {
    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-invoice-detail",
        dataType: 'JSON',
        data: {
            penjualan_id: penjualanId,
            performa_id: perfomaId
        },
        beforeSend: function () {
            app.dialog.preloader('Loading data invoice...');
        },
        success: function (data) {
            app.dialog.close();

            // Backend response: status: 1 untuk success
            if ((data.status === 1 || data.success === true) && data.data) {
                const invoice = data.data;

                // Set foto - sesuaikan dengan field dari backend
                if (invoice.foto_bukti) {
                    const fotoUrl = BASE_API.slice(0, -3) + 'foto_invoice/' + invoice.foto_bukti;
                    jQuery('#foto_preview').attr('src', fotoUrl);

                    // Simpan nama foto lama untuk keperluan update
                    localStorage.setItem('foto_lama_invoice', invoice.foto_bukti);
                }

                // Set input values
                jQuery('#detail_no_invoice').val(invoice.no_invoice || '');
                jQuery('#detail_no_sj').val(invoice.no_sj || '');

                // Format nominal ke format rupiah
                if (invoice.nominal_invoice) {
                    jQuery('#detail_nominal_bayar_invoice').val(formatRupiah(invoice.nominal_invoice));
                }

                jQuery('#detail_keterangan_invoice').val(invoice.keterangan || '');

                // Load items dan set header dari get-detail-spk
                loadInvoiceItems(penjualanId);

                // Simpan data untuk keperluan update
                localStorage.setItem('current_penjualan_id', penjualanId);
                localStorage.setItem('current_performa_id', perfomaId);

                // Disable inputs karena mode view
                disableInvoiceInputs();
            } else {
                app.dialog.alert(data.message || 'Data invoice tidak ditemukan');
            }
        },
        error: function (xhr) {
            app.dialog.close();

            let errorMessage = 'Gagal memuat data invoice';

            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }

            app.dialog.alert(errorMessage);
        }
    });
}

/**
 * Enable semua input field untuk mode input
 */
function enableInvoiceInputs() {
    jQuery('#detail_no_invoice').prop('disabled', false);
    jQuery('#detail_no_sj').prop('disabled', false);
    jQuery('#detail_nominal_bayar_invoice').prop('disabled', false);
    jQuery('#detail_keterangan_invoice').prop('disabled', false);
    jQuery('#file_bukti_pembayaran').prop('disabled', false);

    // Show upload buttons
    jQuery('.btn-function').show();
}

/**
 * Disable semua input field untuk mode view
 */
function disableInvoiceInputs() {
    jQuery('#detail_no_invoice').prop('disabled', true);
    jQuery('#detail_no_sj').prop('disabled', true);
    jQuery('#detail_nominal_bayar_invoice').prop('disabled', true);
    jQuery('#detail_keterangan_invoice').prop('disabled', true);
    jQuery('#file_bukti_pembayaran').prop('disabled', true);

    // Hide upload buttons and save button
    jQuery('.btn-function').hide();
}

/**
 * Membuka kamera untuk mengambil foto invoice
 */
function openCameraForInvoice() {
    jQuery('#file_bukti_pembayaran').attr('capture', 'camera');
    jQuery('#file_bukti_pembayaran').click();
}

/**
 * Membuka galeri untuk memilih foto invoice
 */
function openGalleryForInvoice() {
    jQuery('#file_bukti_pembayaran').removeAttr('capture');
    jQuery('#file_bukti_pembayaran').click();
}

/**
 * Preview foto bukti pembayaran yang dipilih
 * @param {Event} event - Event dari input file
 */
function previewFotoBukti(event) {
    const file = event.target.files[0];

    if (file) {
        // Validasi ukuran file (max 5MB)
        if (file.size > 10 * 1024 * 1024) {
            app.dialog.alert('Ukuran file terlalu besar! Maksimal 10MB');
            return;
        }

        // Validasi tipe file
        if (!file.type.match('image.*')) {
            app.dialog.alert('File harus berupa gambar!');
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            // Set preview
            jQuery('#foto_preview').attr('src', e.target.result);
            jQuery('#foto_preview_container').show();
            jQuery('#foto_placeholder').hide();

            // Simpan ke localStorage untuk proses upload
            localStorage.setItem('uploaded_invoice_photo', e.target.result);

            // Hide error jika ada
            jQuery('#error_foto').hide();
        };

        reader.readAsDataURL(file);
    }
}

/**
 * View full image invoice
 */
function viewFullInvoiceImage() {
    const imgSrc = jQuery('#foto_preview').attr('src');
    if (imgSrc && imgSrc !== 'https://tasindo-sale-webservice.digiseminar.id/foto_invoice/no_image_invoice.png') {
        zoom_view(imgSrc);
    }
}

/**
 * Handler untuk perubahan nominal
 * Format input menjadi format rupiah
 */
function onNominalChange() {
    let value = jQuery('#detail_nominal_bayar_invoice').val();

    // Hapus semua karakter non-digit
    value = value.replace(/\D/g, '');

    // Format ke rupiah
    if (value) {
        const formatted = formatRupiah(value);
        jQuery('#detail_nominal_bayar_invoice').val(formatted);
    }

    // Hide error jika ada
    if (value) {
        jQuery('#error_nominal').hide();
    }
}

/**
 * Format angka ke format rupiah
 * @param {string|number} angka - Angka yang akan diformat
 * @returns {string} Format rupiah
 */
function formatRupiah(angka) {
    let number_string = angka.toString().replace(/[^,\d]/g, '');
    let split = number_string.split(',');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        let separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
}

/**
 * Simpan data pembayaran invoice
 */
function simpanPembayaran() {
    // Validasi
    let isValid = true;

    // Cek foto
    const fotoSrc = jQuery('#foto_preview').attr('src');
    const fotoBase64 = localStorage.getItem('uploaded_invoice_photo');
    const isNewInvoice = localStorage.getItem('invoice_mode') === 'input';

    // Foto wajib untuk invoice baru
    if (isNewInvoice && (!fotoBase64 || fotoSrc === 'https://tasindo-sale-webservice.digiseminar.id/foto_invoice/no_image_invoice.png')) {
        jQuery('#error_foto').show();
        isValid = false;
    } else {
        jQuery('#error_foto').hide();
    }

    // Cek no invoice
    const noInvoice = jQuery('#detail_no_invoice').val().trim();
    if (!noInvoice) {
        jQuery('#error_no_invoice').show();
        isValid = false;
    } else {
        jQuery('#error_no_invoice').hide();
    }

    // Cek no SJ
    const noSJ = jQuery('#detail_no_sj').val().trim();
    if (!noSJ) {
        jQuery('#error_sj').show();
        isValid = false;
    } else {
        jQuery('#error_sj').hide();
    }

    // Cek nominal
    const nominal = jQuery('#detail_nominal_bayar_invoice').val().trim();
    if (!nominal || nominal === '0') {
        jQuery('#error_nominal').show();
        isValid = false;
    } else {
        jQuery('#error_nominal').hide();
    }

    if (!isValid) {
        app.dialog.alert('Mohon lengkapi semua field yang wajib diisi!');
        return;
    }

    // Ambil data
    const penjualanId = localStorage.getItem('current_penjualan_id');
    const perfomaId = localStorage.getItem('current_performa_id');
    const keterangan = jQuery('#detail_keterangan_invoice').val().trim();
    const fotoLama = localStorage.getItem('foto_lama_invoice'); // untuk update

    // Data untuk dikirim ke backend
    const postData = {
        penjualan_id: penjualanId,
        nominal_invoice: nominal, // kirim format dengan separator (backend yang normalisasi)
        tanggal_invoice: moment().format('YYYY-MM-DD'), // tanggal hari ini
        no_invoice: noInvoice,
        no_sj: noSJ,
        keterangan: keterangan || null,
        foto_bukti_base64: fotoBase64 || null,
        foto_filename: 'invoice.jpg', // default filename
        foto_lama: fotoLama || null,
        user_id: localStorage.getItem("user_id"),
        lokasi_pabrik: localStorage.getItem("lokasi_pabrik")
    };

    // Konfirmasi
    app.dialog.confirm('Apakah Anda yakin ingin menyimpan data invoice ini?', function () {
        // Kirim ke server
        jQuery.ajax({
            type: 'POST',
            url: BASE_API + "/save-invoice",
            dataType: 'JSON',
            data: postData,
            beforeSend: function () {
                app.dialog.preloader('Menyimpan data...');
            },
            success: function (response) {
                app.dialog.close();

                // Backend mengembalikan status: 1 untuk success
                if (response.status === 1 || response.success === true) {
                    app.dialog.alert('Data invoice berhasil disimpan!', function () {
                        // Close popup
                        app.popup.close('.popup-detail-invoice');

                        // Refresh data
                        if (typeof getDataProduksiCabang === 'function') {
                            getDataProduksiCabang();
                        }
                        if (typeof getDataExtraCabang === 'function') {
                            getDataExtraCabang();
                        }

                        // Clear localStorage
                        localStorage.removeItem('current_penjualan_id');
                        localStorage.removeItem('current_performa_id');
                        localStorage.removeItem('uploaded_invoice_photo');
                        localStorage.removeItem('invoice_mode');
                        localStorage.removeItem('foto_lama_invoice');
                    });
                } else {
                    app.dialog.alert(response.message || 'Gagal menyimpan data invoice');
                }
            },
            error: function (xhr) {
                app.dialog.close();

                let errorMessage = 'Terjadi kesalahan saat menyimpan data';

                // Parse error dari backend
                if (xhr.responseJSON) {
                    if (xhr.responseJSON.message) {
                        errorMessage = xhr.responseJSON.message;
                    }

                    // Tampilkan validation errors jika ada
                    if (xhr.responseJSON.errors) {
                        const errors = xhr.responseJSON.errors;
                        const errorList = Object.values(errors).flat().join('<br>');
                        errorMessage += '<br><br>' + errorList;
                    }
                }

                app.dialog.alert(errorMessage);
            }
        });
    });
}

function toggleInvoiceColumn() {
    const lokasiPabrik = localStorage.getItem('lokasi_pabrik');
    const isJakarta = lokasiPabrik === 'Jakarta';

    // Toggle header kolom Invoice
    const invoiceHeaders = document.querySelectorAll('.invoice-column');
    invoiceHeaders.forEach(header => {
        header.style.display = isJakarta ? '' : 'none';
    });

    // Toggle body cells Invoice (jika sudah ada data)
    const invoiceCells = document.querySelectorAll('#produk_data_cabang .invoice-cell');
    invoiceCells.forEach(cell => {
        cell.style.display = isJakarta ? '' : 'none';
    });

    console.log('Toggle Invoice Column:', isJakarta ? 'SHOW' : 'HIDE', '(Lokasi:', lokasiPabrik + ')');
}