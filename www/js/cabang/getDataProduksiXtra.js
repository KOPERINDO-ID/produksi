/**
 * Fungsi utama untuk mengambil data extra produksi cabang
 * Menampilkan data produksi extra dalam bentuk tabel dengan filter
 * Berbeda dengan getDataProduksiCabang, fungsi ini menampilkan kolom wilayah
 */
function getDataExtraCabang() {
    // Tampilkan kolom wilayah (berbeda dengan getDataProduksiCabang)
    jQuery(".wilayah-column").show();

    // Ambil nilai filter dari form
    const filters = getExtraFilterValues();

    // Kirim request AJAX untuk mengambil data extra
    fetchExtraProduksiData(filters);

    toggleInvoiceColumn();
}

/**
 * Mengambil nilai-nilai filter dari form untuk data extra
 * @returns {Object} Object berisi nilai filter
 */
function getExtraFilterValues() {
    const perusahaanFilter = jQuery('#perusahaan_produksi_filter_cabang').val();
    const typeFilter = jQuery('#type_produksi_filter_cabang').val();
    const dateRange = jQuery('#range-produksi-cabang').val();

    return {
        perusahaan_produksi_value: perusahaanFilter || 'empty',
        type_produksi_filter: typeFilter || 'empty',
        startdate: getExtraStartDate(dateRange),
        enddate: getExtraEndDate(dateRange)
    };
}

/**
 * Mengambil tanggal mulai dari range picker untuk data extra
 * @param {string} dateRange - Nilai dari date range picker
 * @returns {string} Tanggal mulai dalam format YYYY-MM-DD atau 'empty'
 */
function getExtraStartDate(dateRange) {
    if (!dateRange) return 'empty';

    const startDateNew = new Date(calendarRangeProduksiSelesai.value[0]);
    return moment(startDateNew).add(5, 'days').format('YYYY-MM-DD');
}

/**
 * Mengambil tanggal akhir dari range picker untuk data extra
 * @param {string} dateRange - Nilai dari date range picker
 * @returns {string} Tanggal akhir dalam format YYYY-MM-DD atau 'empty'
 */
function getExtraEndDate(dateRange) {
    if (!dateRange) return 'empty';

    const endDateNew = new Date(calendarRangeProduksiSelesai.value[1]);
    return moment(endDateNew).add(5, 'days').format('YYYY-MM-DD');
}

/**
 * Mengirim request AJAX untuk mengambil data extra produksi
 * @param {Object} filters - Object berisi filter yang akan dikirim
 */
function fetchExtraProduksiData(filters) {
    jQuery.ajax({
        type: 'POST',
        url: BASE_API + "/get-data-extra-produksi-" + localStorage.getItem("lower_api_pabrik"),
        dataType: 'JSON',
        data: {
            karyawan_id: localStorage.getItem("user_id"),
            status: 'new_app',
            ...filters
        },
        beforeSend: function () {
            app.dialog.preloader('Mengambil Data Produksi, Harap Tunggu');
            jQuery('#produk_data').html('');
        },
        success: function (data) {
            app.dialog.close();
            console.log(data.data);

            const htmlContent = generateExtraProduksiHTML(data);
            jQuery('#produk_data_cabang').html(htmlContent);

            // Toggle invoice column setelah data di-render
            if (typeof toggleInvoiceColumn === 'function') {
                toggleInvoiceColumn();
            }
        },
        error: function (xmlhttprequest, textstatus, message) {
            app.dialog.close();
            console.error('Error fetching extra data:', message);
        }
    });
}

/**
 * Generate HTML untuk tabel extra produksi
 * @param {Object} data - Data dari server
 * @returns {string} HTML string untuk tabel
 */
function generateExtraProduksiHTML(data) {
    if (!data.data || data.data.length === 0) {
        return generateExtraEmptyTableHTML();
    }

    let htmlRows = '';
    let nomor = 1;
    let nota = '';
    let totalQtyProduksi = 0;
    const now = moment();
    const arsipValue = localStorage.getItem('arsip') || 'empty';

    jQuery.each(data.data, function (i, val) {
        const sisaKirimSJ = parseFloat(val.penjualan_qty) - parseFloat(data.surat_jalan_count[val.penjualan_detail_performa_id]);

        // Cek kondisi untuk menampilkan data extra
        if (shouldDisplayExtraData(val, arsipValue, sisaKirimSJ)) {
            htmlRows += generateExtraRowHTML(val, i, nomor, nota, sisaKirimSJ, data, now);

            // Update nilai untuk baris berikutnya
            if (nota !== val.penjualan_id) {
                nomor++;
            }
            nota = val.penjualan_id;
            totalQtyProduksi += (parseInt(val.penjualan_qty) - parseInt(val.stok));
        }
    });

    // Tambahkan footer dengan total
    htmlRows += generateExtraFooterHTML(totalQtyProduksi);

    return htmlRows;
}

/**
 * Cek apakah data extra harus ditampilkan berdasarkan kondisi
 * @param {Object} val - Data item
 * @param {string} arsipValue - Nilai arsip
 * @param {number} sisaKirimSJ - Sisa kirim surat jalan
 * @returns {boolean}
 */
function shouldDisplayExtraData(val, arsipValue, sisaKirimSJ) {
    if (arsipValue === 'empty') {
        // Kondisi untuk data extra non-arsip
        if (val.total_terima_pabrik < (val.penjualan_qty - val.stok)) {
            if (val.foto_produksi_selesai === null || sisaKirimSJ > 0 || val.penjualan_total_kirim === null) {
                return val.foto_produksi_selesai === null || val.foto_produksi_sjc === null;
            }
        }
    } else {
        // Kondisi untuk data extra arsip
        if (val.total_terima_pabrik >= val.penjualan_qty) {
            if (val.foto_produksi_selesai === null || sisaKirimSJ > 0 || val.penjualan_total_kirim === null) {
                return val.foto_produksi_selesai === null || val.foto_produksi_sjc === null;
            }
        }
    }
    return false;
}

/**
 * Generate HTML untuk satu baris data extra produksi
 * @param {Object} val - Data item
 * @param {number} index - Index item
 * @param {number} nomor - Nomor urut
 * @param {string} nota - ID nota sebelumnya
 * @param {number} sisaKirimSJ - Sisa kirim surat jalan
 * @param {Object} allData - Semua data dari server
 * @param {Object} now - Moment object untuk waktu sekarang
 * @returns {string} HTML string untuk row
 */
function generateExtraRowHTML(val, index, nomor, nota, sisaKirimSJ, allData, now) {
    let html = '';

    // Tentukan warna background berdasarkan status
    const backgroundColor = getExtraStatusBackgroundColor(val.status_produksi);
    const warnaTelatInfo = getExtraWarnaTelatInfo(val.penjualan_tanggal_kirim);

    // Jika ini adalah nota baru, buat header row
    if (nota !== val.penjualan_id) {
        html += generateExtraHeaderRow(val, nomor, warnaTelatInfo);
    } else {
        html += generateExtraContinuationRow(val, nomor, warnaTelatInfo);
    }

    // Tambahkan kolom-kolom data
    html += generateExtraDataColumns(val, index, backgroundColor, warnaTelatInfo, sisaKirimSJ, allData, now);
    html += '</tr>';

    return html;
}

/**
 * Mendapatkan warna background berdasarkan status produksi extra
 * @param {string} status - Status produksi
 * @returns {string} CSS gradient string
 */
function getExtraStatusBackgroundColor(status) {
    const colors = {
        'proses': 'linear-gradient(#4a8a4a , forestgreen); background: -webkit-linear-gradient(#4a8a4a , forestgreen); background: -o-linear-gradient(#4a8a4a , forestgreen); background: -moz-linear-gradient(#4a8a4a , forestgreen); color:white;',
        'selesai': 'linear-gradient(#067afb , #002b46); background: -webkit-linear-gradient(#067afb , #002b46); background: -o-linear-gradient(#067afb , #002b46); background: -moz-linear-gradient(#067afb , #002b46); color:white;',
        'body': 'linear-gradient(#c5a535  , #cf8600); background: -webkit-linear-gradient(#c5a535 , #cf8600); background: -o-linear-gradient(#c5a535 , #cf8600); background: -moz-linear-gradient(#c5a535 , #cf8600); color:white;',
        'noted': 'linear-gradient(#918f8a  , #b3afaa); background: -webkit-linear-gradient(#918f8a  , #b3afaa); background: -o-linear-gradient(#918f8a  , #b3afaa); background: -moz-linear-gradient(#918f8a  , #b3afaa); color:white;'
    };

    return colors[status] || '';
}

/**
 * Mendapatkan informasi warna untuk indikator keterlambatan extra
 * @param {string} tanggalKirim - Tanggal kirim penjualan
 * @returns {Object} Object berisi warna untuk berbagai kondisi
 */
function getExtraWarnaTelatInfo(tanggalKirim) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(moment().format('YYYY, MM, DD'));
    const secondDate = new Date(moment(tanggalKirim).subtract(8, 'days').format('YYYY-MM-DD'));
    const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));

    const redGradient = 'background: linear-gradient(#b53737 , #b20000); background: -webkit-linear-gradient(#b53737 , #b20000); background: -o-linear-gradient(#b53737 , #b20000); background: -moz-linear-gradient(#b53737 , #b20000); background-color:#b20000; color:white;';
    const orangeGradient = 'background: linear-gradient(#FF5733 , #FF5733); background: -webkit-linear-gradient(#FF5733 , #FF5733); background: -o-linear-gradient(#FF5733 , #FF5733); background: -moz-linear-gradient(#FF5733 , #FF5733); background-color:#FF5733; color:white;';

    if (firstDate >= secondDate) {
        return { warna_telat: redGradient, warna_telat2: redGradient };
    } else if (diffDays > 0 && diffDays < 3) {
        return { warna_telat: orangeGradient, warna_telat2: orangeGradient };
    } else if (diffDays === 0) {
        return { warna_telat: redGradient, warna_telat2: redGradient };
    }

    return { warna_telat: '', warna_telat2: '' };
}

/**
 * Generate HTML untuk header row extra (nota baru)
 * @param {Object} val - Data item
 * @param {number} nomor - Nomor urut
 * @param {Object} warnaTelatInfo - Informasi warna keterlambatan
 * @returns {string} HTML string
 */
function generateExtraHeaderRow(val, nomor, warnaTelatInfo) {
    let html = '';

    // Tentukan apakah row bisa di-highlight (untuk Jakarta)
    const rowHighlight = getExtraRowHighlight(val);
    html += `<tr ${rowHighlight}>`;

    // Kolom packing button
    html += generateExtraPackingButton(val);

    // Kolom nomor urut
    html += `<td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray; ${warnaTelatInfo.warna_telat}" class="label-cell">${nomor}</td>`;

    // Kolom tanggal kirim
    html += `<td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray; ${warnaTelatInfo.warna_telat}" class="label-cell">${moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM')}</td>`;

    // Kolom nomor penjualan (dengan link ke detail)
    const nomorPenjualan = moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');
    html += `<td align="left" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray; ${warnaTelatInfo.warna_telat}" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang">`;
    html += `<font style="color:white;" onclick="detailPenjualanProduksiCabang('${val.penjualan_id}','${val.penjualan_detail_performa_id}')"><b>${nomorPenjualan}</b></font></td>`;

    // Kolom nama client
    html += `<td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray; ${warnaTelatInfo.warna_telat}" class="label-cell" align="left">${val.client_nama}</td>`;

    return html;
}

/**
 * Generate HTML untuk continuation row extra (item lanjutan dari nota yang sama)
 * @param {Object} val - Data item
 * @param {number} nomor - Nomor urut
 * @param {Object} warnaTelatInfo - Informasi warna keterlambatan
 * @returns {string} HTML string
 */
function generateExtraContinuationRow(val, nomor, warnaTelatInfo) {
    let html = '<tr>';

    // Kolom kosong untuk packing
    html += `<td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-right: solid 1px; border-color:gray; padding:3px;" class="label-cell"></td>`;

    // Kolom nomor urut
    html += `<td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-color:gray; ${warnaTelatInfo.warna_telat}" class="label-cell">${nomor}</td>`;

    // Kolom tanggal kirim
    html += `<td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray; ${warnaTelatInfo.warna_telat}" class="label-cell">${moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM')}</td>`;

    // Kolom nomor penjualan
    const nomorPenjualan = moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');
    html += `<td align="left" style="border-bottom: solid 1px; border-right: solid 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray; ${warnaTelatInfo.warna_telat}" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang">`;
    html += `<font style="color:white;" onclick="detailPenjualanProduksiCabang('${val.penjualan_id}','${val.penjualan_detail_performa_id}')" class="text-add-colour-black-soft"><b>${nomorPenjualan}</b></font></td>`;

    // Kolom kosong untuk nama client
    html += `<td style="border-color:gray;" class="label-cell" colspan="1"></td>`;

    return html;
}

/**
 * Mendapatkan atribut highlight untuk row extra (khusus Jakarta)
 * @param {Object} val - Data item
 * @returns {string} HTML attribute string
 */
function getExtraRowHighlight(val) {
    if (localStorage.getItem("lokasi_pabrik") === 'Jakarta' && val.hide_produksi === 0) {
        return `class="bg-color-yellow" onclick="changeStatusHideProduksi(${val.penjualan_detail_performa_id});"`;
    }
    return '';
}

/**
 * Generate button packing extra dengan warna sesuai kondisi
 * @param {Object} val - Data item
 * @returns {string} HTML string untuk button packing
 */
function generateExtraPackingButton(val) {
    let buttonHTML = '';

    if (val.packing === 'polos') {
        if (val.alamat_kirim_penjualan !== null) {
            buttonHTML = `<button class="announcement btn-color-greenWhite text-add-colour-black-soft button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif('${val.penjualan_id}')"></button>`;
        } else {
            buttonHTML = `<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold"></button>`;
        }
    } else if (val.packing === 'plastik') {
        if (val.alamat_kirim_penjualan !== null) {
            buttonHTML = `<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif('${val.penjualan_id}')">Plastik</button>`;
        } else {
            buttonHTML = `<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold">Plastik</button>`;
        }
    } else if (val.packing === 'kardus') {
        if (val.alamat_kirim_penjualan !== null) {
            buttonHTML = `<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif('${val.penjualan_id}')">Kardus</button>`;
        } else {
            buttonHTML = `<button class="card-color-brown button-small col button text-bold">Kardus</button>`;
        }
    }

    return `<td style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px; border-color:gray; padding:3px;" class="label-cell" align="left">${buttonHTML}</td>`;
}

/**
 * Generate kolom-kolom data untuk row extra
 * @param {Object} val - Data item
 * @param {number} index - Index item
 * @param {string} backgroundColor - Warna background
 * @param {Object} warnaTelatInfo - Informasi warna keterlambatan
 * @param {number} sisaKirimSJ - Sisa kirim surat jalan
 * @param {Object} allData - Semua data dari server
 * @param {Object} now - Moment object
 * @returns {string} HTML string
 */
function generateExtraDataColumns(val, index, backgroundColor, warnaTelatInfo, sisaKirimSJ, allData, now) {
    let html = '';

    // Kolom jenis penjualan dengan tombol status
    html += generateExtraJenisColumn(val, index, warnaTelatInfo);

    // Kolom spesifikasi
    html += generateExtraSpesifikasiColumn(val, backgroundColor);

    // Kolom keterangan
    html += generateExtraKeteranganColumn(val, backgroundColor);

    // Kolom qty produksi
    const isMandiriOwner = val.is_mandiri_owner == 1;
    const jumlahBg = isMandiriOwner ? 'white' : backgroundColor;
    const jumlahColor = isMandiriOwner ? 'color:#1d1d1c;' : '';
    html += `<td style="background:${jumlahBg}; ${jumlahColor}border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="right">${parseInt(val.penjualan_qty) - parseInt(val.stok)}</td>`;

    // Kolom sisa
    html += generateExtraSisaColumn(val, backgroundColor, sisaKirimSJ);

    // Kolom foto, SJC, dan tujuan kirim (hanya jika status selesai)
    if (val.status_produksi === 'selesai') {
        html += generateExtraFotoButtons(val);
        html += generateExtraSJCButton(val);
        html += generateExtraTujuanKirimButton(val, sisaKirimSJ, allData);
    } else {
        html += '<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
        html += '<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
        html += '<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
    }

    // Kolom Invoice (BARU)
    html += generateExtraInvoiceButton(val);

    return html;
}

/**
 * Generate kolom jenis penjualan extra dengan tombol-tombol status
 * @param {Object} val - Data item
 * @param {number} index - Index item
 * @param {Object} warnaTelatInfo - Informasi warna keterlambatan
 * @returns {string} HTML string
 */
function generateExtraJenisColumn(val, index, warnaTelatInfo) {
    let html = `<td style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; ${warnaTelatInfo.warna_telat2} border-color:gray;" class="label-cell" align="left">`;
    html += `<font onclick="detail_button_cabang('${index}','produksi');">${val.penjualan_jenis}</font>`;

    // Tombol Noted
    html += `<a id="button_noted_cabang_${index}" onclick="rubahStatusProduksi('${val.penjualan_detail_performa_id}','${val.penjualan_id}','noted')" class="button-small col button" style="margin-top:15px; display:none; width:100%; border-radius: 10px; background-color: lightgrey; color:black;">`;
    html += '<center>Noted</center></a>';

    // Tombol Body
    html += `<a id="button_body_cabang_${index}" onclick="getDataFotoProduksiSelesaiCabang('${val.penjualan_detail_performa_id}','${val.penjualan_id}','${val.foto_produksi_body}','body')" data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:15px; display:none; width:100%; border-radius: 10px; background-color: orange; color:white;">`;
    html += '<center>Body</center></a>';

    // Tombol Proses
    html += `<a id="button_proses_cabang_${index}" onclick="getDataFotoProduksiSelesaiCabang('${val.penjualan_detail_performa_id}','${val.penjualan_id}','${val.foto_produksi_proses}','proses')" data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:7px; display:none; width:100%; border-radius: 10px; background-color: green; color:white;">`;
    html += '<center>Proses</center></a>';

    // Tombol Selesai
    html += '<br>';
    html += `<a id="button_selesai_cabang_${index}" onclick="getDataFotoProduksiSelesaiCabang('${val.penjualan_detail_performa_id}','${val.penjualan_id}','${val.foto_produksi_selesai}','selesai')" data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:-16px; display:none; width:100%; background-color: blue; border-radius: 10px; color:white;">`;
    html += '<center>Selesai</center></a>';

    html += '</td>';
    return html;
}

/**
 * Generate kolom spesifikasi produk extra
 * @param {Object} val - Data item
 * @param {string} backgroundColor - Warna background
 * @returns {string} HTML string
 */
function generateExtraSpesifikasiColumn(val, backgroundColor) {
    let spesifikasi = '';

    if (val.style !== null && val.style !== 'none') {
        spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
    } else {
        spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
    }

    // Jika rekening Mandiri Owner: background putih, teks #1d1d1c
    const isMandiriOwner = val.is_mandiri_owner == 1;
    const cellBg = isMandiriOwner ? 'white' : backgroundColor;
    const fontColor = isMandiriOwner ? '#1d1d1c' : 'white';

    return `<td style="border-bottom: solid 1px; border-left: solid 1px; border-color:gray; background:${cellBg};" class="label-cell" align="left">
		<font style="color:${fontColor};" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan-cabang" onclick="keteranganCustomCabang('${val.penjualan_detail_performa_id}')">${spesifikasi}</font>
	</td>`;
}

/**
 * Generate kolom keterangan extra
 * @param {Object} val - Data item
 * @param {string} backgroundColor - Warna background
 * @returns {string} HTML string
 */
function generateExtraKeteranganColumn(val, backgroundColor) {
    // Jika rekening Mandiri Owner: background putih, teks #1d1d1c
    const isMandiriOwner = val.is_mandiri_owner == 1;
    const cellBg = isMandiriOwner ? 'white' : backgroundColor;
    const fontColor = isMandiriOwner ? '#1d1d1c' : 'white';

    if (val.keterangan === null || val.keterangan === "") {
        return `<td style="background:${cellBg}; border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="center">-</td>`;
    }

    const keterangan = val.keterangan;
    const truncated = keterangan.length > 15 ? keterangan.substring(0, 15) + '<span style="font-size:25px;"> .....</span>' : keterangan;

    return `<td style="background:${cellBg}; border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="left">
		<p style="color:${fontColor}; margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang('${val.penjualan_detail_performa_id}')">${truncated}</p>
	</td>`;
}

/**
 * Generate kolom sisa extra
 * @param {Object} val - Data item
 * @param {string} backgroundColor - Warna background
 * @param {number} sisaKirimSJ - Sisa kirim surat jalan
 * @returns {string} HTML string
 */
function generateExtraSisaColumn(val, backgroundColor, sisaKirimSJ) {
    let sisaValue = '';

    if (val.tujuan_kirim !== null && val.tujuan_kirim === "customer") {
        sisaValue = sisaKirimSJ;
    } else {
        sisaValue = (parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik);
    }

    // Jika rekening Mandiri Owner: background putih, teks #1d1d1c
    const isMandiriOwner = val.is_mandiri_owner == 1;
    const cellBg = isMandiriOwner ? 'white' : backgroundColor;
    const fontColor = isMandiriOwner ? 'color:#1d1d1c;' : '';

    return `<td style="background:${cellBg}; ${fontColor}border-left: solid gray 1px; border-bottom: solid gray 1px;" class="label-cell" align="right">${sisaValue}</td>`;
}

/**
 * Generate tombol foto produksi extra
 * @param {Object} val - Data item
 * @returns {string} HTML string
 */
function generateExtraFotoButtons(val) {
    const buttonClass = val.foto_produksi_selesai !== null ? 'card-color-blue' : 'bg-dark-gray-young text-add-colour-black-soft';
    const buttonStyle = val.foto_produksi_selesai !== null ? 'color:white; width: 85px;' : 'width: 85px;';

    return `<td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang('${val.produksi_tanggal_body}','${val.produksi_tanggal_proses}','${val.produksi_tanggal_selesai}','${val.foto_produksi_body}','${val.foto_produksi_proses}','${val.foto_produksi_selesai}')">
		<button style="${buttonStyle}" class="${buttonClass} button-small col button text-bold">Foto</button>
	</td>`;
}

/**
 * Generate tombol SJC extra
 * @param {Object} val - Data item
 * @returns {string} HTML string
 */
function generateExtraSJCButton(val) {
    const buttonClass = val.foto_produksi_sjc !== null ? 'card-color-blue' : 'bg-dark-gray-young text-add-colour-black-soft';
    const buttonStyle = val.foto_produksi_sjc !== null ? 'color:white; width: 85px;' : 'width: 85px;';

    return `<td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang('${val.penjualan_detail_performa_id}','${val.foto_produksi_sjc}')">
		<button style="${buttonStyle}" class="${buttonClass} button-small col button text-bold">SJC</button>
	</td>`;
}

/**
 * Generate tombol tujuan kirim extra (Customer/Pusat)
 * @param {Object} val - Data item
 * @param {number} sisaKirimSJ - Sisa kirim surat jalan
 * @param {Object} allData - Semua data dari server
 * @returns {string} HTML string
 */
function generateExtraTujuanKirimButton(val, sisaKirimSJ, allData) {
    // Tentukan warna button berdasarkan kondisi
    const colorBtnSJ = getExtraColorButtonSJ(sisaKirimSJ, val.penjualan_total_kirim);
    const colorBtnTerima = getExtraColorButtonTerima(val.total_terima_pabrik);

    const nomorPenjualan = moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

    let html = '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

    if (val.tujuan_kirim !== null && val.tujuan_kirim === "customer") {
        // Button Customer
        html += `<button class="${colorBtnSJ} button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang('${val.penjualan_detail_performa_id}','${val.penjualan_id}','${val.penjualan_total_qty}','${val.client_nama}','${nomorPenjualan}');">Customer</button>`;
    } else {
        // Button Pusat
        const jenisEscaped = val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '');
        html += `<button class="${colorBtnTerima} button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik('${val.penjualan_detail_performa_id}','${val.penjualan_qty}','${val.stok}','${val.client_nama}','${val.penjualan_id}','${jenisEscaped}','${val.penjualan_tanggal}');">Pusat</button>`;
    }

    html += '</td>';
    return html;
}

/**
 * Mendapatkan warna button surat jalan extra
 * @param {number} sisaKirimSJ - Sisa kirim surat jalan
 * @param {*} penjualanTotalKirim - Total kirim penjualan
 * @returns {string} CSS class untuk button
 */
function getExtraColorButtonSJ(sisaKirimSJ, penjualanTotalKirim) {
    if (sisaKirimSJ <= 0) {
        return "btn-color-blueWhite";
    } else if (penjualanTotalKirim === null) {
        return "bg-dark-gray-young text-add-colour-black-soft";
    } else if (sisaKirimSJ > 0) {
        return "btn-color-greenWhite";
    }
    return "bg-dark-gray-young text-add-colour-black-soft";
}

/**
 * Mendapatkan warna button terima pabrik extra
 * @param {*} totalTerimaPabrik - Total terima pabrik
 * @returns {string} CSS class untuk button
 */
function getExtraColorButtonTerima(totalTerimaPabrik) {
    if (totalTerimaPabrik === null || totalTerimaPabrik === 0) {
        return "bg-dark-gray-young text-add-colour-black-soft";
    } else if (totalTerimaPabrik > 0) {
        return "btn-color-greenWhite";
    }
    return "bg-dark-gray-young text-add-colour-black-soft";
}

/**
 * Generate tombol Invoice extra
 * Hanya ditampilkan jika lokasi_pabrik = 'Jakarta' DAN is_mandiri_owner = 1
 * Jika is_mandiri_owner != 1, kolom menampilkan "-"
 * @param {Object} val - Data item
 * @returns {string} HTML string
 */
function generateExtraInvoiceButton(val) {
    const lokasiPabrik = localStorage.getItem('lokasi_pabrik');
    const isJakarta = lokasiPabrik === 'Jakarta';
    const isMandiriOwner = val.is_mandiri_owner == 1;

    // Style dasar td
    let tdStyle = 'border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray;';

    // Hide jika bukan Jakarta
    if (!isJakarta) {
        tdStyle += ' display:none;';
    }

    // Jika bukan Mandiri Owner, tampilkan "-" saja tanpa tombol
    if (!isMandiriOwner) {
        return `<td class="label-cell invoice-cell" style="${tdStyle}" align="center">-</td>`;
    }

    // Mandiri Owner: tampilkan tombol invoice sesuai status
    let html = `<td class="label-cell invoice-cell popup-open" style="${tdStyle}"`;

    // Cek status invoice (0/false/null = belum ada, selain itu = sudah ada)
    if (val.status_invoice == 0 || val.status_invoice == false || val.status_invoice == null) {
        // Belum ada invoice - button abu-abu untuk input
        html += ' data-popup=".popup-detail-invoice">';
        html += `<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold" style="width: 85px;" onclick="openInvoicePopup('${val.penjualan_id}','${val.penjualan_detail_performa_id}','${val.client_nama}')">Invoice</button>`;
    } else {
        // Sudah ada invoice - button biru untuk lihat detail
        html += ' data-popup=".popup-detail-invoice">';
        html += `<button class="btn-color-greenWhite button-small col button text-bold" style="width: 85px;" onclick="viewInvoiceDetail('${val.penjualan_id}','${val.penjualan_detail_performa_id}')">Invoice</button>`;
    }

    html += '</td>';
    return html;
}

/**
 * Generate HTML untuk tabel kosong extra
 * @returns {string} HTML string
 */
function generateExtraEmptyTableHTML() {
    return `
		<tr>
			<td colspan="8">
				<center>Data Kosong</center>
			</td>
		</tr>
	`;
}

/**
 * Generate HTML untuk footer tabel extra dengan total
 * @param {number} totalQty - Total quantity produksi
 * @returns {string} HTML string
 */
function generateExtraFooterHTML(totalQty) {
    return `
		<tr>
			<td colspan="8" style="border-top: 1px solid gray;"></td>
			<td align="right" style="border-right: solid gray 1px; border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="center" width="11,3%">
				<font>${totalQty}</font>
			</td>
			<td colspan="4" style="border-top: 1px solid gray;"></td>
		</tr>
	`;
}