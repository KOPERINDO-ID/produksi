
var delayTimer;
function doSearchProduksiBodyType(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataProduksiBody();
	}, 1000);
}


var delayTimerBody;
function doSearchProduksiSelesaiBodyByPerusahaan(text) {
	clearTimeout(delayTimerBody);
	delayTimerBody = setTimeout(function () {
		getDataProduksiBody();
	}, 1000);
}

function keteranganCustomBody(penjualan_detail_performa_id) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-detail-penjualan-id",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			penjualan_detail_performa_id: penjualan_detail_performa_id,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			console.log(data.data[0].produk_keterangan_kustom);
			app.dialog.close();
			jQuery('#detail_custom_keterangan_body').html('-' + data.data[0].produk_keterangan_kustom.replace(/\r\n|\r|\n/g, "<br />-"));
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function detailPenjualanProduksiBody(penjualan_id) {
	detail_sales_data = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-penjualan-detail-performa",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			penjualan_id: penjualan_id
		},
		beforeSend: function () {
			$$('#detail_sales_data_proses').html('');
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			console.log(data.data.length);
			if (data.data.length != 0) {
				jQuery.each(data.data, function (i, val) {
					var no = i + 1;
					detail_sales_data += '<table  width="100%" style="border-collapse: collapse; border:1px solid gray;" border="1">';
					detail_sales_data += '<tbody>';
					detail_sales_data += ' <tr class="bg-dark-gray-medium">';
					detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
					detail_sales_data += '   Produk #' + no + '';
					detail_sales_data += ' </td>';
					detail_sales_data += '</tr>';
					detail_sales_data += ' <tr>';
					detail_sales_data += '   <td colspan="1" class="label-cell text-align-center" width="40%">' + val.penjualan_jenis + '<br><img data-image-src-proses="' + BASE_PATH_IMAGE_PERFORMA + '/' + val.gambar + '" class="pb-popup-dark-body" src="' + BASE_PATH_IMAGE_PERFORMA + '/' + val.gambar + '" width="100%"></td>';
					if (val.keterangan != null) {
						var keterangan_fix = val.keterangan;
					} else {
						var keterangan_fix = '';
					}
					detail_sales_data += '   <td colspan="2" class="label-cell text-align-center" width="60%" style="white-space: pre;">' + val.produk_keterangan_kustom + '<br><font color="red">' + keterangan_fix + '</font></td>';
					detail_sales_data += '</tr>';
					detail_sales_data += ' <tr class="">';
					detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">Qty : ' + val.penjualan_qty + '</td>';
					detail_sales_data += ' </tr>';
					detail_sales_data += '</tbody>';
					detail_sales_data += '</table><br>';
				});

				detail_sales_data += '<table  width="100%" style="border-collapse: collapse; border:1px solid gray;" border="1">';
				detail_sales_data += '<tbody>';
				detail_sales_data += ' <tr class="bg-dark-gray-medium">';
				detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
				detail_sales_data += '   Customer Logo';
				detail_sales_data += ' </td>';
				detail_sales_data += '</tr>';
				detail_sales_data += ' <tr >';
				detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
				detail_sales_data += '  <img onclick="zoom_view(this.src);" width="70%" src="' + BASE_PATH_IMAGE_CUSTOMER + '/' + data.data[0].customer_logo + '" />';
				detail_sales_data += ' </td>';
				detail_sales_data += '</tr>';
				detail_sales_data += ' <tr class="bg-dark-gray-medium">';
				detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
				detail_sales_data += '   Logo Bordir';
				detail_sales_data += ' </td>';
				detail_sales_data += '</tr>';
				detail_sales_data += ' <tr >';
				detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
				detail_sales_data += '  <img onclick="zoom_view(this.src);" width="70%" src="' + BASE_PATH_IMAGE_CUSTOMER + '/' + data.data[0].customer_logo_bordir + '" />';
				detail_sales_data += ' </td>';
				detail_sales_data += '</tr>';

				if (data.data[0].customer_logo_tambahan != "") {
					detail_sales_data += ' <tr class="bg-dark-gray-medium">';
					detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
					detail_sales_data += '   Logo Tambahan';
					detail_sales_data += ' </td>';
					detail_sales_data += '</tr>';
					detail_sales_data += ' <tr >';
					detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
					detail_sales_data += '  <img onclick="zoom_view(this.src);" width="70%" src="' + BASE_PATH_IMAGE_CUSTOMER + '/' + data.data[0].customer_logo_tambahan + '" />';
					detail_sales_data += ' </td>';
					detail_sales_data += '</tr>';
				}
				detail_sales_data += '</table>';


				$$('#detail_sales_data_produksi_body').html(detail_sales_data);
			} else {
				$$('#detail_sales_data_produksi_body').html('<center><h3>Tidak Ada Data</h3></center>');
			}

			$$('.pb-popup-dark-body').on('click', function () {
				console.log($$(this).attr("data-image-src-proses"));
				var gambar_zoom = $$(this).attr("data-image-src-proses");
				var myPhotoBrowserPopupDark = app.photoBrowser.create({
					photos: [
						'' + gambar_zoom + ''
					],
					theme: 'dark',
					type: 'popup'
				});
				myPhotoBrowserPopupDark.open();
			});
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function dateRangeDeclarationProduksiBody() {
	calendarRangeProduksiBody = app.calendar.create({
		inputEl: '#range-produksi-body',
		rangePicker: true,
		dateFormat: 'dd-mm-yyyy',
		closeOnSelect: true,
		rangePickerMinDays: 7,
		on: {
			close: function () {
				getDataProduksiBody();
			}
		}
	});
}

function getDataProduksiBody() {
	if (jQuery('#perusahaan_produksi_body_filter').val() == '' || jQuery('#perusahaan_produksi_body_filter').val() == null) {
		perusahaan_produksi_value = "empty";
	} else {
		perusahaan_produksi_value = jQuery('#perusahaan_produksi_body_filter').val();
	}
	if (jQuery('#type_produksi_body_filter').val() == '' || jQuery('#type_produksi_body_filter').val() == null) {
		type_produksi_filter = "empty";
	} else {
		type_produksi_filter = jQuery('#type_produksi_body_filter').val();
	}
	if (jQuery('#warna_produksi_filter_body').val() == '' || jQuery('#warna_produksi_filter_body').val() == null) {
		warna_produksi_filter = "empty";
	} else {
		warna_produksi_filter = jQuery('#warna_produksi_filter_body').val();
	}


	var data_produksi1 = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-produksi-body",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			perusahaan_produksi_value: perusahaan_produksi_value,
			type_produksi_filter: type_produksi_filter,
			warna_produksi_filter:warna_produksi_filter,
			akses: 'tabel'
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Body Produksi, Harap Tunggu');
			jQuery('#produk_data_proses').html('');
		},
		success: function (data) {
			app.dialog.close();

			if (data.data.length != 0) {
				var nota = '';
				var warna_telat = '';
				var nomor = 1;
				var now = moment();
				jQuery.each(data.data, function (i, val) {
					warna_telat = "";
					if (nota != val.penjualan_id) {
						if (now >= moment(val.penjualan_tanggal_kirim).subtract(5, 'days')) {
							data_produksi1 += ' <tr>';
							warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
						} else {
							data_produksi1 += ' <tr >';
						}
						nota = val.penjualan_id;
						data_produksi1 += '  <td style="padding:4px !important; border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell" ><center>' + (nomor++) + '</center></td>';
						data_produksi1 += '  <td style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  ><center>' + moment(val.penjualan_tanggal_kirim).subtract(5, 'days').format('DD-MMM') + '</center></td>';
						data_produksi1 += '  <td style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  ><center><font style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-sales-produksi-body" onclick="detailPenjualanProduksiBody(\'' + val.penjualan_id + '\')">' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</font></center></td>';
						data_produksi1 += '  <td style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  align="left">' + val.client_nama + '</td>';
					} else {
						data_produksi1 += ' <tr>';
						data_produksi1 += '  <td style=" ' + warna_telat + ' border-color:gray;" class="label-cell"  colspan="4"></td>';
					}


					if (now >= moment(val.penjualan_tanggal_kirim).subtract(5, 'days')) {
						var warna_telat2 = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
					} else {
						var warna_telat2 = '';

					}
					data_produksi1 += '  <td  style="' + warna_telat2 + 'border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; ' + warna_telat2 + ' border-color:gray;" class="label-cell"   align="left">' + val.penjualan_jenis + '';


					data_produksi1 += '</td>';
					data_produksi1 += '  <td class="label-cell" style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" align="right">' + val.penjualan_qty + '</td>';
					data_produksi1 += '  <td style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell"  align="left" ><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan-body" onclick="keteranganCustomBody(\'' + val.penjualan_detail_performa_id + '\')" >' + val.produk_keterangan_kustom.split('\n')[0] + '</font></td>';
					if (val.keterangan == null || val.keterangan == "") {
						data_produksi1 += '  <td style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell"  align="center" >-</td>';

					} else {
						data_produksi1 += '  <td style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell"  align="left" ><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan2" onclick="keterangan2(\'' + val.penjualan_detail_performa_id + '\')" >' + val.keterangan.split('\n')[0] + '</font></td>';

					}

					data_produksi1 += ' </tr>';
				});
			} else {

				data_produksi1 += ' <tr>';
				data_produksi1 += ' <td colspan="8">';
				data_produksi1 += ' <center> Data Kosong </center>';
				data_produksi1 += ' </td>';
				data_produksi1 += ' </tr>';
			}

			jQuery('#produk_data_body').html(data_produksi1);
			jQuery('#total_data_produk_body').html(data.data.length);

			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function resetStatusProduksi(penjualan_detail_performa_id) {
	app.dialog.create({
		title: 'Reset Status Produksi',
		text: 'Yakin Ingin Reset Status Produksi Ini ? ',
		cssClass: 'custom-dialog',
		closeByBackdropClick: 'true',
		buttons: [
			{
				text: 'Ya',
				onClick: function () {
					jQuery.ajax({
						type: 'POST',
						url: "" + BASE_API + "/reset-status-produksi",
						dataType: 'JSON',
						data: {
							penjualan_detail_performa_id: penjualan_detail_performa_id,
							status_produksi: 'body'
						},
						beforeSend: function () {
							app.dialog.preloader('Harap Tunggu');
						},
						success: function (data) {
							app.dialog.close();
							if (data.status == 'done') {
								app.dialog.alert('Berhasil Reset Status Produksi');
								getDataProduksi();
							} else {
								app.dialog.alert('Gagal Reset Status Produksi');
								getDataProduksi();
							}
						},
						error: function (xmlhttprequest, textstatus, message) {
						}
					});
				},
			},
			{
				text: 'Tidak',
				onClick: function () {

				},
			},
		],
	}).open();
}

function updateStatusBody(penjualan_detail_performa_id) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/update-body-status",
		dataType: 'JSON',
		data: {
			penjualan_detail_performa_id: penjualan_detail_performa_id,
			status_produksi: 'body'
		},
		beforeSend: function () {
			$$('#detail_sales_data').html('');
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			if (data.status == 'done') {
				app.dialog.alert('Berhasil Update Status Body');
				getDataProduksi();
			} else {
				app.dialog.alert('Gagal Update Status Body');
				getDataProduksi();
			}
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}



