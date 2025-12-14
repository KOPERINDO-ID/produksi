var delayTimer;
function doSearchPartnerLaporan(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataPartnerLaporan();
	}, 1000);
}

var delayTimer;
function doSearchCustomerLaporan(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataPartnerLaporan();
	}, 1000);
}


function itemDetailGambar(penjualan_detail_performa_id) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-item-detail-gambar",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			penjualan_detail_performa_id: penjualan_detail_performa_id
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Gambar, Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			if (data.data.gambar.substring(0, 5) == "koper") {
				var path_image = 'https://tasindo-sale-webservice.digiseminar.id/product_image_new';
			} else {
				var path_image = 'https://tasindo-sale-webservice.digiseminar.id/performa_image';
			}
			jQuery('#item_detail_gambar').html('<img data-image-src="' + path_image + '/' + data.data.gambar + '" class="pb-popup-dark-laporan" src="' + path_image + '/' + data.data.gambar + '" width="100%"></img>');

			$$('.pb-popup-dark-laporan').on('click', function () {
				console.log($$(this).attr("data-image-src"));
				var gambar_zoom = $$(this).attr("data-image-src");
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


function getDataPartnerLaporan() {
	if (jQuery('#partner_laporan_filter_search').val() == '' || jQuery('#partner_laporan_filter_search').val() == null) {
		partner_laporan_filter_search = "empty";
	} else {
		partner_laporan_filter_search = jQuery('#partner_laporan_filter_search').val();
	}
	if (jQuery('#partner_customer_filter_search').val() == '' || jQuery('#partner_customer_filter_search').val() == null) {
		partner_customer_filter_search = "empty";
	} else {
		partner_customer_filter_search = jQuery('#partner_customer_filter_search').val();
	}

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-partner-laporan",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			partner_laporan_filter_search: partner_laporan_filter_search,
			partner_customer_filter_search: partner_customer_filter_search
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data partner, Harap Tunggu');
			jQuery('#produk_data').html('');
		},
		success: function (data) {
			app.dialog.close();
			var nomor = 1;
			var data_partner_purchasing = '';
			console.log(moment());
			jQuery.each(data.data, function (i, val) {
				if (val.tgl_selesai == null) {
					var warna_bg = '';


					if (moment(val.tgl_deadline, "YYYY/MM/DD").isBefore(moment().format('YYYY/MM/DD')) == true) {
						warna_bg = 'background: linear-gradient(#b53737 , #b20000);';
					} else {
						if (val.status == null) {
							warna_bg = 'background:linear-gradient(#4a8a4a , forestgreen); ';
						} else {
							if (val.status == 'tidak_lambat') {
								warna_bg = 'background: linear-gradient(#067afb , #002b46); ';
							} else {
								warna_bg = 'background: linear-gradient(#b53737 , #b20000);';

							}
						}
					}


					data_partner_purchasing += '<tr style="' + warna_bg + '">';
					data_partner_purchasing += '   <td  style=" border:1px solid gray !important;" class="label-cell text-align-center">' + nomor++ + '</td>';
					data_partner_purchasing += '   <td   style=" border:1px solid gray !important;" class="label-cell text-align-left">' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
					data_partner_purchasing += '   <td  style=" border:1px solid gray !important;"  class="label-cell text-align-left">' + val.nama_partner + '</td>';
					data_partner_purchasing += '   <td  style=" border:1px solid gray !important;"  class="label-cell text-align-left">' + val.client_nama + '</td>';
					data_partner_purchasing += '   <td   onclick="itemDetailGambar(' + val.penjualan_detail_performa_id + ');" style=" border:1px solid gray !important;" class="label-cell text-align-left popup-open" data-popup=".item-detail-gambar">' + val.item + '</td>';
					data_partner_purchasing += '   <td  style=" border:1px solid gray !important;"  class="label-cell text-align-center">' + val.jumlah + '</td>';
					data_partner_purchasing += '   <td  style=" border:1px solid gray !important;"  class="label-cell text-align-center">' + moment(val.tgl_input).format('DD-MM-YYYY') + '</td>';
					data_partner_purchasing += '   <td  style=" border:1px solid gray !important;"  class="label-cell text-align-center">' + moment(val.tgl_deadline).format('DD-MM-YYYY') + '</td>';
					if (val.tgl_selesai != null) {
						data_partner_purchasing += '   <td  style=" border:1px solid gray !important;"  class="label-cell text-align-center">' + moment(val.tgl_selesai).format('DD-MM-YYYY') + '</td>';
					} else {
						data_partner_purchasing += '   <td  style=" border:1px solid gray !important;"  class="label-cell text-align-center">-</td>';
					}
					data_partner_purchasing += '</tr>';
				}
			});

			jQuery('#partner_data_laporan').html(data_partner_purchasing);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}