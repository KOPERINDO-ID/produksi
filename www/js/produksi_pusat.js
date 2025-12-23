var calendarRangePenjualan;



function choosePabrikSby(pabrik) {
	if (pabrik == 'Sby') {
		$(".dataFilterCabangBtn").addClass("bg-dark-gray-medium");
		$(".sbyFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$("#spk_data").show();
		$("#pusat_data").hide();
		getDataProduksi();
	} else if (pabrik == 'Pusat') {
		localStorage.setItem('server_pilihan_pabrik', pabrik);
		$(".dataFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".sbyFilterCabangBtn").addClass("bg-dark-gray-medium");
		$("#pusat_data").show();
		$("#spk_data").hide();
		getDataProduksiCabangPusatSpk();
	}

}

function donwloadProduksiSelesaiPopup() {
	if (jQuery('#bulan_popup_produksi_selesai').val() == "") {
		var bulan_popup_produksi_selesai = moment().format('M');
		jQuery('#bulan_popup_produksi_selesai').val(moment().format('M'));
	} else {
		var bulan_popup_produksi_selesai = jQuery('#bulan_popup_produksi_selesai').val();
	}

	if (jQuery('#perusahaan_popup_produksi_filter').val() == '' || jQuery('#perusahaan_popup_produksi_filter').val() == null) {
		perusahaan_popup_produksi_filter = "empty";
	} else {
		perusahaan_popup_produksi_filter = jQuery('#perusahaan_popup_produksi_filter').val();
	}

	var data_produksi = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-produksi-selesai-popup-surabaya",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			bulan_popup_produksi_selesai: bulan_popup_produksi_selesai,
			perusahaan_popup_produksi_filter: perusahaan_popup_produksi_filter,
			year: jQuery('#year_popup_produksi_selesai_pusat').val()
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi Selesai, Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			data_produksi += '	<table   cellspacing="1" cellpadding="1"  width="100%">';
			data_produksi += '	<thead class="text-align-center">';
			data_produksi += '		<tr>';
			data_produksi += '			<th colspan="6" style="border-right: solid 1px; border-top: solid 1px; border-left: solid 1px;  " class="label-cell" ><font style="float:left; font-weight:bold; font-size:16px; padding:3px;"> Produksi Selesai : Surabaya</font> <font style="float:right; font-weight:bold; font-size:16px; padding:3px;"> ' + moment(bulan_popup_produksi_selesai).format('MMMM') + '</font></th>';
			data_produksi += '		</tr>';
			data_produksi += '		<tr>';
			data_produksi += '			<th style=" border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  " class="label-cell" align="center" width="3%">No</th>';
			data_produksi += '			<th style=" border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  " class="label-cell" width="5%">Tgl Selesai</th>';
			data_produksi += '			<th style=" border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  " class="label-cell" width="10%">SPK</th>';
			data_produksi += '			<th style=" border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  " class="label-cell" width="10%">Nama</th>';
			data_produksi += '			<th style=" border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  " class="label-cell" width="10%">Type</th>';
			data_produksi += '			<th style=" border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; " class="label-cell" width="3%">Jumlah</th>';
			data_produksi += '		</tr>';
			data_produksi += '	</thead>';
			data_produksi += '	<tbody class="text-align-center">';
			if (data.data.length != 0) {


				var nota = '';
				var nomor = 1;
				var jumlah_qty_produksi = 0;
				var now = moment();



				jQuery.each(data.data, function (i, val) {
					var sisa_terima_pabrik = parseFloat(val.penjualan_qty) - parseFloat(val.total_terima_pabrik);


					jumlah_qty_produksi += val.penjualan_qty;

					if (nota != val.penjualan_id) {
						if (now >= moment(val.penjualan_tanggal_kirim).subtract(5, 'days')) {
							data_produksi += ' <tr>';
						} else {
							data_produksi += ' <tr ">';
						}

						nota = val.penjualan_id;
						data_produksi += '  <td style="border-top: solid gray 1px; border-bottom: solid gray 1px; border-left: solid gray 1px; " class="label-cell" width="5.4%" ><center>' + (nomor++) + '</center></td>';
						data_produksi += '  <td style="border-top: solid gray 1px; border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  width="7.9%"><center>' + moment(val.produksi_tanggal_selesai).format('DD-MMM') + '</center></td>';
						data_produksi += '  <td style="border-top: solid gray 1px; border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  width="9.9%"><center><font  class="text-add-colour-black-soft popup-open" data-popup=".detail-sales-produksi" onclick="detailPenjualanProduksi(\'' + val.penjualan_id + '\')"><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></center></td>';
						data_produksi += '  <td style="border-top: solid gray 1px; border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  align="center" width="18.8%">' + val.client_nama + ' | ' + val.client_kota + '</td>';
					} else {
						data_produksi += ' <tr>';
						data_produksi += '  <td style="  border-color:white;" class="label-cell"  colspan="4"></td>';
					}



					data_produksi += '  <td  style="border-bottom: solid gray 1px;  border-left: solid gray 1px;" class="label-cell"   align="center" width="11,3%"><font>' + val.penjualan_jenis + '</font>';



					data_produksi += '</td>';


					data_produksi += '  <td  style="border-bottom: solid gray 1px; border-left: solid gray 1px; border-right: solid gray 1px;" class="label-cell" align="right" width="7%">' + val.penjualan_qty + '</td>';

					data_produksi += ' </tr>';



				});
				data_produksi += ' <tr>';
				data_produksi += ' <td colspan="5" style="" class="label-cell">';
				data_produksi += ' </td>';
				data_produksi += ' <td  align="right" style="border-bottom: solid gray 1px; border-left: solid gray 1px;  border-right: solid gray 1px;" class="label-cell">';
				data_produksi += ' ' + number_format(jumlah_qty_produksi) + '';
				data_produksi += ' </td>';
				data_produksi += ' </tr>';



			} else {
				data_produksi += ' <tr>';
				data_produksi += ' <td colspan="5">';
				data_produksi += ' <center> Data Kosong </center>';
				data_produksi += ' </td>';
				data_produksi += ' </tr>';

			}


			data_produksi += '	</tbody>';
			data_produksi += '</table>';
			console.log(data_produksi);
			let options = {
				documentSize: 'A4',
				type: 'share',
				fileName: 'produksi_selesai_surabaya_' + moment().format('M') + '.pdf'
			}

			pdf.fromData(data_produksi, options)
				.then((stats) => console.log('status', stats))
				.catch((err) => console.err(err))


		},
		error: function (xmlhttprequest, textstatus, message) {


		}
	});
}

function produksiSelesaiPopup() {

	if (jQuery('#bulan_popup_produksi_selesai').val() == "") {
		var bulan_popup_produksi_selesai = moment().format('M');
		jQuery('#bulan_popup_produksi_selesai').val(moment().format('M'));
	} else {
		var bulan_popup_produksi_selesai = jQuery('#bulan_popup_produksi_selesai').val();
	}

	if (jQuery('#perusahaan_popup_produksi_filter').val() == '' || jQuery('#perusahaan_popup_produksi_filter').val() == null) {
		perusahaan_popup_produksi_filter = "empty";
	} else {
		perusahaan_popup_produksi_filter = jQuery('#perusahaan_popup_produksi_filter').val();
	}


	var data_produksi = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-produksi-selesai-popup-surabaya",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			bulan_popup_produksi_selesai: bulan_popup_produksi_selesai,
			perusahaan_popup_produksi_filter: perusahaan_popup_produksi_filter,
			year: jQuery('#year_popup_produksi_selesai_pusat').val()
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi Selesai, Harap Tunggu');
			jQuery('#produksi_selesai_popup_data').html('');
		},
		success: function (data) {
			app.dialog.close();
			console.log(data.data);
			if (data.data.length != 0) {
				var nota = '';
				var nomor = 1;
				var jumlah_qty_produksi = 0;
				var now = moment();
				jQuery.each(data.data, function (i, val) {
					var sisa_terima_pabrik = parseFloat(val.penjualan_qty) - parseFloat(val.total_terima_pabrik);


					jumlah_qty_produksi += val.penjualan_qty;

					if (nota != val.penjualan_id) {
						if (now >= moment(val.penjualan_tanggal_kirim).subtract(5, 'days')) {
							data_produksi += ' <tr>';
						} else {
							data_produksi += ' <tr ">';
						}

						nota = val.penjualan_id;
						data_produksi += '  <td style="border-top: solid gray 1px; border-bottom: solid gray 1px; border-left: solid gray 1px; " class="label-cell" width="5.4%" ><center>' + (nomor++) + '</center></td>';
						data_produksi += '  <td style="border-top: solid gray 1px; border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  width="7.9%"><center>' + moment(val.produksi_tanggal_selesai).format('DD-MMM') + '</center></td>';
						data_produksi += '  <td style="border-top: solid gray 1px; border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  width="9.9%"><center><font  style="color:white;" class="text-add-colour-black-soft" ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></center></td>';
						data_produksi += '  <td style="border-top: solid gray 1px; border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  align="left" width="18.8%">' + val.client_nama + ' | ' + val.client_kota + '</td>';
					} else {
						data_produksi += ' <tr>';
						data_produksi += '  <td style="border-color:white; " class="label-cell"  colspan="4"></td>';
					}



					data_produksi += '  <td  style="border-bottom: solid gray 1px;  border-left: solid gray 1px;" class="label-cell"   align="center" width="11,3%"><font>' + val.penjualan_jenis + '</font>';



					data_produksi += '</td>';


					data_produksi += '  <td  style="border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell" align="right" width="7%">' + val.penjualan_qty + '</td>';

					data_produksi += ' </tr>';



				});
				data_produksi += ' <tr>';
				data_produksi += ' <td colspan="5" style="" class="label-cell">';
				data_produksi += ' </td>';
				data_produksi += ' <td  align="right" style="border-bottom: solid gray 1px; border-left: solid gray 1px; " class="label-cell">';
				data_produksi += ' ' + number_format(jumlah_qty_produksi) + '';
				data_produksi += ' </td>';
				data_produksi += ' </tr>';
			} else {
				data_produksi += ' <tr>';
				data_produksi += ' <td colspan="5">';
				data_produksi += ' <center> Data Kosong </center>';
				data_produksi += ' </td>';
				data_produksi += ' </tr>';

			}

			jQuery('#produksi_selesai_popup_data').html(data_produksi);



			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {


		}
	});
}

function hapusTransaksiPartner(id_partner_transaksi) {
	app.dialog.create({
		title: 'Hapus Item',
		text: 'Apakah anda yakin menghapus item ini ? ',
		cssClass: 'custom-dialog',
		closeByBackdropClick: 'true',
		buttons: [
			{
				text: 'Ya',
				onClick: function () {
					jQuery.ajax({
						type: 'POST',
						url: "" + BASE_API + "/hapus-transaksi-partner",
						dataType: 'JSON',
						data: {
							id_partner_transaksi: id_partner_transaksi
						},
						beforeSend: function () {
							app.dialog.preloader('Harap Tunggu');
						},
						success: function (data) {
							app.dialog.close();
							getPopUpPurchase();
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

function getLogoPurchase(penjualan_detail_performa_id, foto_resin_selesai) {
	console.log(foto_resin_selesai);
	jQuery('#penjualan_detail_performa_id_foto_purchasing_logo').val(penjualan_detail_performa_id);
	localStorage.removeItem('file_foto_purchase');
	$('#file_foto_purchase_view').attr('src', '');
	$('#file_foto_purchase_view_now').attr('src', '');
	$$(".custom-file-upload-purchase-selesai").show();
	if (foto_resin_selesai != 'null') {
		jQuery('#file_foto_purchase_view_now').attr('src', BASE_PATH_IMAGE_BUKTI_PURCHASE_RISEN + '/' + foto_resin_selesai);
	} else {
		jQuery('#file_foto_purchase_view_now').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
	}
}


function selesaiPartner(id_partner_transaksi, tgl_deadline, penjualan_detail_performa_id) {

	if (moment(tgl_deadline, "YYYY/MM/DD").isBefore(moment().format('YYYY/MM/DD')) == true) {
		var status = "terlambat";
	} else {
		var status = "tidak_lambat";
	}

	console.log(status);
	app.dialog.create({
		title: 'Item Selesai',
		text: 'Apakah anda yakin item ini sudah selesai ? ',
		cssClass: 'custom-dialog',
		closeByBackdropClick: 'true',
		buttons: [
			{
				text: 'Ya',
				onClick: function () {
					jQuery.ajax({
						type: 'POST',
						url: "" + BASE_API + "/purchase-selesai",
						dataType: 'JSON',
						data: {
							status: status,
							id_partner_transaksi: id_partner_transaksi,
							penjualan_detail_performa_id: penjualan_detail_performa_id,
							qty_total_detail_performa: $('#qty_total_input').val()
						},
						beforeSend: function () {
							app.dialog.preloader('Harap Tunggu');
						},
						success: function (data) {
							app.dialog.close();
							$('#tgl_deadline_purchase').val("");

							$('#qty_purchase').val("");
							getPopUpPurchase();
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

function PurchaseProces() {
	if (!$$('#purchase_form')[0].checkValidity()) {
		app.dialog.alert('Cek Isian Form Anda');
	} else {
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/tambah-purchase-proses",
			dataType: 'JSON',
			data: {
				id_partner: $('#nama_partner_purchase').val(),
				item: $('#item_purchase').val(),
				jumlah: $('#qty_purchase').val(),
				tgl_deadline: $('#tgl_deadline_purchase').val(),
				harga_produksi: $('#production_fee').val(),
				penjualan_detail_performa_id: $('#penjualan_detail_performa_id_purchase').val()
			},
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();
				$('#qty_purchase').val("");
				$('#production_fee').val("")
				$('#tgl_deadline_purchase').val("");
				getPopUpPurchase();
			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}
}

function setPurchaseDetailPerformaId(penjualan_detail_performa_id, penjualan_id, penjualan_jenis, penjualan_tanggal, penjualan_qty) {
	localStorage.setItem('purchase_detail_performa_id', penjualan_detail_performa_id);
	$('#invoice_purchase_tbl').html(moment(penjualan_tanggal).format('DDMMYY') + '-' + penjualan_id.replace(/\INV_/g, '').replace(/^0+/, ''));
	$('#type_purchase_tbl').html(penjualan_jenis);
	$('#qty_purchase_tbl').html(penjualan_qty);
	$('#tgl_deadline_purchase').val("");
	$('#production_fee').val("");
	$('#item_purchase').val("");
	$('#item_purchase').val(penjualan_jenis);
	$('#qty_purchase').val("");
	$('#penjualan_detail_performa_id_purchase').val(penjualan_detail_performa_id);

	$('#qty_total_input').val(penjualan_qty);
	getPopUpPurchase();
}

function getPopUpPurchase() {
	var smartSelectPartner = app.smartSelect.get('.partner-smart-select');
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-popup-purchase",
		dataType: 'JSON',
		data: {
			penjualan_detail_performa_id: localStorage.getItem('purchase_detail_performa_id')
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$('#point_popup').html("");
		},
		success: function (data) {
			app.dialog.close();
			var data_partner = '';

			var select_box_partner;
			select_box_partner += '<option value="" selected></option>';
			$.each(data.partner, function (i, item) {
				select_box_partner += '<option value="' + item.id_partner + '">' + item.nama_partner + '</option>';
			});
			$$('#nama_partner_purchase').html(select_box_partner);

			smartSelectPartner.setValue([])

			var data_partner_purchasing = "";
			var no = 1;
			var qty_selesai = 0;
			var qty_sisa = 0;

			$.each(data.data, function (i, val) {

				if (val.tgl_selesai != null) {
					qty_selesai += val.jumlah;
				}

				var warna_bg = '';
				if (val.status == null) {
					warna_bg = 'background:linear-gradient(#4a8a4a , forestgreen); border-color:white;';
				} else {
					if (val.status == 'tidak_lambat') {
						warna_bg = 'background: linear-gradient(#067afb , #002b46); border-color:white;';
					} else {
						warna_bg = 'background: linear-gradient(#b53737 , #b20000); border-color:white;';

					}
				}

				data_partner_purchasing += '<tr style="' + warna_bg + '">';
				data_partner_purchasing += '   <td  class="label-cell text-align-center">' + no++ + '</td>';
				data_partner_purchasing += '   <td  class="label-cell text-align-left">' + val.nama_partner + '</td>';
				data_partner_purchasing += '   <td  class="label-cell text-align-left">' + val.item + '</td>';
				data_partner_purchasing += '   <td  class="label-cell text-align-center">' + val.jumlah + '</td>';
				data_partner_purchasing += '   <td  class="label-cell text-align-center">' + (val.harga_produksi * val.jumlah) + '</td>';
				data_partner_purchasing += '   <td  class="label-cell text-align-center">' + moment(val.tgl_input).format('DD-MM-YYYY') + '</td>';
				data_partner_purchasing += '   <td  class="label-cell text-align-center">' + moment(val.tgl_deadline).format('DD-MM-YYYY') + '</td>';
				if (val.tgl_selesai != null) {
					data_partner_purchasing += '   <td  class="label-cell text-align-center">' + moment(val.tgl_selesai).format('DD-MM-YYYY') + '</td>';
				} else {
					data_partner_purchasing += '   <td  class="label-cell text-align-center">-</td>';
				}
				// if (val.tgl_selesai == null) {
				// 	data_partner_purchasing += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="15%">';
				// 	data_partner_purchasing += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold"   onclick="selesaiPartner(\'' + val.id_partner_transaksi + '\',\'' + val.tgl_deadline + '\',\'' + val.penjualan_detail_performa_id + '\');">Selesai</button>';
				// 	data_partner_purchasing += '</td>';
				// } else {
				// 	data_partner_purchasing += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="15%">';
				// 	data_partner_purchasing += ' ';
				// 	data_partner_purchasing += '</td>';
				// }
				data_partner_purchasing += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="15%">';
				data_partner_purchasing += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold"   onclick="hapusTransaksiPartner(\'' + val.id_partner_transaksi + '\');">Hapus</button>';
				data_partner_purchasing += '</td>';
				data_partner_purchasing += '</tr>';

			});
			$('#selesai_purchase_tbl').html(qty_selesai);
			$('#data_partner_purchasing').html(data_partner_purchasing);

			qty_sisa = parseInt($('#qty_purchase_tbl').text()) - parseInt($('#selesai_purchase_tbl').text());


			$('#sisa_purchase_tbl').html(qty_sisa);

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

var delayTimer;
function doSearchPopupProduksiByPerusahaan(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		produksiSelesaiPopup();
	}, 1000);
}

var delayTimer;
function doSearchPopupBulanProduksiSelesai(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		produksiSelesaiPopup();
	}, 100);
}

var delayTimer;
function doSearchPopupYearProduksiSelesai(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		produksiSelesaiPopup();
	}, 100);
}

var delayTimer;
function tambahStokProduksi(penjualan_detail_performa_id) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		if (jQuery('#qty_stok_' + penjualan_detail_performa_id + '').val() != '') {
			jQuery.ajax({
				type: 'POST',
				url: "" + BASE_API + "/tambah-stok-produksi",
				dataType: 'JSON',
				data: {
					karyawan_id: localStorage.getItem("user_id"),
					penjualan_detail_performa_id: penjualan_detail_performa_id,
					stok: jQuery('#qty_stok_' + penjualan_detail_performa_id + '').val()
				},
				beforeSend: function () {
					app.dialog.preloader('Harap Tunggu');
				},
				success: function (data) {
					app.dialog.close();
					getDataProduksi();
				},
				error: function (xmlhttprequest, textstatus, message) {
				}
			});
		} else {
			app.dialog.alert('Stok Tidak Boleh Kosong', function () {

			});
		}

	}, 1000);
}

function qtyStokFill(penjualan_detail_performa_id) {
	if (jQuery('#qty_stok_' + penjualan_detail_performa_id + '').val() == 0) {
		jQuery('#qty_stok_' + penjualan_detail_performa_id + '').val("")
	}
}

var delayTimer;
function doSearchProduksiWarna(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataProduksi();
	}, 1000);
}

var delayTimer;
function doSearchProduksiProsesWarna(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataProduksiProses();
	}, 1000);
}

var delayTimer;
function doSearchProduksiSelesaiWarna(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataProduksiSelesai();
	}, 1000);
}

var delayTimer;
function doSearchProduksiBodyWarna(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataProduksiBody();
	}, 1000);
}

var delayTimer;
function doSearchProduksiType(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataProduksi();
	}, 1000);
}

var delayTimer;
function doSearchProduksiProsesType(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataProduksiProses();
	}, 1000);
}

var delayTimer;
function doSearchProduksiSelesaiType(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataProduksiSelesai();
	}, 1000);
}

function detailPenjualanPointProduksi(penjualan_id) {
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
			$$('#detail_sales_data').html('');
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
					if (val.style != null && val.style != 'none') {
						var style = val.style.replace(',', '<br>');
					} else {
						var style = '';
					}

					if (val.keterangan != null) {
						var keterangan_fix = val.keterangan;
					} else {
						var keterangan_fix = '';
					}

					if (val.gambar.substring(0, 5) == "koper") {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/product_image_new';
					} else {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/performa_image';
					}
					detail_sales_data += ' <tr>';
					detail_sales_data += '   <td colspan="1" class="label-cell text-align-center" width="40%">' + val.penjualan_jenis + '<br><img data-image-src="' + path_image + '/' + val.gambar + '" class="pb-popup-dark" src="' + path_image + '/' + val.gambar + '" width="100%"></td>';
					detail_sales_data += '   <td colspan="2" class="label-cell text-align-center" width="60%" style="white-space: pre;">' + val.produk_keterangan_kustom + '<br>' + style + '<br><font color="red">' + keterangan_fix + '</font></td>';
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




				$$('#detail_sales_data_owner').html(detail_sales_data);
			} else {
				$$('#detail_sales_data_owner').html('<center><h3>Tidak Ada Data</h3></center>');
			}

			$$('.pb-popup-dark').on('click', function () {
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

function downloadPointProduksiPdf() {

	if (jQuery('#point_bulan').val() == "") {
		var point_bulan = moment().format('M');
		jQuery('#point_bulan').val(moment().format('M'));
	} else {
		var point_bulan = jQuery('#point_bulan').val();
	}

	var years = jQuery('#point_year_produksi').val();

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/download-point-produksi",
		dataType: 'JSON',
		data: {
			month: point_bulan,
			year: years
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			var point_popup_pdf = '';
			point_popup_pdf += '<table width="100%" border="0">';
			point_popup_pdf += '<tr>';
			point_popup_pdf += '<td colspan="8" style="font-weight:bold;" align="center">RINCIAN TRANSAKSI <br> </td>';
			point_popup_pdf += '</tr>';
			point_popup_pdf += '<tr>';
			point_popup_pdf += '<td colspan="8"  align="center"><b>KOPERINDO</b><br>Industri Tas & Koper</td>';
			point_popup_pdf += '</tr>';
			point_popup_pdf += '<tr>';
			point_popup_pdf += '<td colspan="8" align="center">www.koperindo.id';
			point_popup_pdf += '<hr>';
			point_popup_pdf += '</td>';
			point_popup_pdf += '</tr>';
			point_popup_pdf += '<tr>';
			point_popup_pdf += '<td colspan="8"  align="center"><b>Point Produksi | Bulan ' + moment().format('MMMM') + '</b></td>';
			point_popup_pdf += '</tr>';
			point_popup_pdf += '<tr>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" width="13%">Tgl</th>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;" width="21%">SPK</th>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;" width="22%">Perusahaan</th>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;" width="21%">Jenis</th>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;" width="10%">Cabang</th>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;" width="7%">Point</th>';

			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;" width="9%">Qty</th>';
			point_popup_pdf += '<th class="label-cell" style="border-top:1px solid gray; border-right:1px solid gray; border-bottom:1px solid gray;" width="13%">Total</th>';

			point_popup_pdf += '</tr>';
			point_popup_pdf += '</thead>';
			point_popup_pdf += '<tbody>';

			var jumlah_point_produksi = 0;
			$.each(data.data, function (i, item) {


				if (item.status_produksi == 'selesai') {
					if (item.status_pengirman == 'selesai') {
						if (item.bantuan_cabang == 'Jakarta') {
							if (item.penjualan_jenis.indexOf("HC") != -1) {
								var point = 100;
							} else {
								var point = 100;
							}
						} else {
							if (item.penjualan_jenis.indexOf("HC") != -1) {
								var point = 200;
							} else {
								var point = 100;
							}
						}

						if (item.bantuan_cabang != null) {
							var cabang = item.bantuan_cabang;
						} else {
							var cabang = '-';
						}


						jumlah_point_produksi += parseFloat(item.penjualan_qty) * point;
						point_popup_pdf += '<tr>';
						point_popup_pdf += '<td align="left" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.tgl_surat_jalan_selesai).format('DD-MMM') + '</td>';
						point_popup_pdf += '<td align="left"  style="border-bottom:1px solid gray; "  ><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></td>';
						point_popup_pdf += '<td align="left"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; " >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';
						point_popup_pdf += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_jenis + '</td>';
						point_popup_pdf += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + cabang + '</td>';
						point_popup_pdf += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + point + '</td>';

						point_popup_pdf += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_qty + '</td>';
						point_popup_pdf += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(parseFloat(item.penjualan_qty) * point) + '</td>';

						point_popup_pdf += '</tr>';
					}
				}
			});

			point_popup_pdf += '<tr>';
			point_popup_pdf += '<td colspan="6"  align="center"><b></b></td>';
			point_popup_pdf += '<td align="center"><b>Total</b></td>';
			point_popup_pdf += '<td   align="right"><b>' + number_format(jumlah_point_produksi) + '</b></td>';
			point_popup_pdf += '</tr>';

			point_popup_pdf += '</tbody>';



			point_popup_pdf += '</table>';


			console.log(point_popup_pdf);
			let options = {
				documentSize: 'A4',
				type: 'share',
				fileName: 'report_point_' + moment().format('M') + '.pdf'
			}

			pdf.fromData(point_popup_pdf, options)
				.then((stats) => console.log('status', stats))
				.catch((err) => console.err(err))
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	})
}

function getYearPointProduksi() {
	let startYear = 2010;
	let endYear = new Date().getFullYear();
	for (i = endYear; i > startYear; i--) {
		if (i == endYear) {
			$('.point_years_produksi').append($('<option selected />').val(i).html(i));
		} else {
			$('.point_years_produksi').append($('<option />').val(i).html(i));
		}
	}
}

function pointProduksi() {

	if (jQuery('#point_bulan').val() == "") {
		var point_bulan = moment().format('M');
		jQuery('#point_bulan').val(moment().format('M'));
	} else {
		var point_bulan = jQuery('#point_bulan').val();
	}
	var years = jQuery('#point_year_produksi').val();
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/download-point-produksi",
		dataType: 'JSON',
		data: {
			month: point_bulan,
			year: years
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$('#point_popup').html("");
		},
		success: function (data) {
			app.dialog.close();
			var point_popup = '';
			var jumlah_point_produksi = 0;
			$.each(data.data, function (i, item) {


				if (item.bantuan_cabang == 'Jakarta') {
					if (item.penjualan_jenis.indexOf("HC") != -1) {
						var point = 100;
					} else {
						var point = 100;
					}
				} else {
					if (item.penjualan_jenis.indexOf("HC") != -1) {
						var point = 200;
					} else {
						var point = 100;
					}
				}

				if (item.bantuan_cabang != null) {
					var cabang = item.bantuan_cabang;
				} else {
					var cabang = '-';
				}



				if (item.status_produksi == 'selesai') {
					if (item.status_pengirman == 'selesai') {
						jumlah_point_produksi += parseFloat(item.penjualan_qty) * point;
						point_popup += '<tr>';
						point_popup += '<td align="left" style=" border-right:1px solid gray; padding:5px; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + moment(item.tgl_surat_jalan_selesai).format('DD-MMM') + '</td>';
						point_popup += '<td align="left" class="popup-open" data-popup=".detail-penjualan-point-produksi" onclick="detailPenjualanPointProduksi(\'' + item.penjualan_id + '\')" style="border-bottom:1px solid gray; "  ><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></td>';
						point_popup += '<td align="left"  style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray; " >' + item.client_nama + '<br><div class="detail_sales_data_tooltip_' + item.penjualan_id + '"></div>';
						point_popup += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_jenis + '</td>';
						point_popup += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + cabang + '</td>';

						point_popup += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + point + '</td>';
						point_popup += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + item.penjualan_qty + '</td>';
						point_popup += '<td align="right" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">' + number_format(parseFloat(item.penjualan_qty) * point) + '</td>';

						point_popup += '</tr>';
					}
				}
			});

			point_popup += '<tr>';
			point_popup += '<td colspan="6"  align="center"><b></b></td>';
			point_popup += '<td align="center"><b>Total</b></td>';
			point_popup += '<td   align="right"><b>' + number_format(jumlah_point_produksi) + '</b></td>';
			point_popup += '</tr>';




			$('#point_popup').html(point_popup);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function deleteMaterial(material_id) {

	app.dialog.create({
		title: 'Hapus Material',
		text: 'Apakah Anda Yakin Menghapus Material ini ? ',
		cssClass: 'custom-dialog',
		closeByBackdropClick: 'true',
		buttons: [
			{
				text: 'Ya',
				onClick: function () {
					jQuery.ajax({
						type: "POST",
						url: "" + BASE_API + "/delete-material",
						dataType: 'JSON',
						data: { material_id: material_id },
						beforeSend: function () {
							app.dialog.progress();
						},
						success: function (data) {
							app.dialog.close();
							if (data.status == 1) {
								app.dialog.alert('Berhasil Menghapus Material', function () {
									getDataMaterial(localStorage.getItem('penjualan_id_material_storage'), localStorage.getItem('penjualan_tanggal_material_storage'));
								});
							} else {
								app.dialog.alert('Gagal Menghapus Material', function () {
									getDataMaterial(localStorage.getItem('penjualan_id_material_storage'), localStorage.getItem('penjualan_tanggal_material_storage'));
								});
							}
						},
						error: function (xmlhttprequest, textstatus, message) {
							app.dialog.close();
							app.dialog.alert('Internet Tidak Stabil / Gangguan Server', function () {
								app.views.main.router.navigate(app.views.main.router.currentRoute.url, {
									ignoreCache: true,
									reloadCurrent: true
								});
							});
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

function materialProcess() {
	if (!$$('#material_form')[0].checkValidity()) {
		app.dialog.alert('Cek Isian Material Anda');
	} else {
		var formData = new FormData(jQuery("#material_form")[0]);
		jQuery.ajax({
			type: "POST",
			url: "" + BASE_API + "/input-material-proses",
			dataType: "JSON",
			data: formData,
			contentType: false,
			processData: false,
			beforeSend: function () {
				app.dialog.preloader('Proses');
			},
			success: function (data) {
				app.dialog.close();
				if (data.status == 'done') {
					app.dialog.alert('Berhasil Input Material');
					getDataMaterial(localStorage.getItem('penjualan_id_material_storage'), localStorage.getItem('penjualan_tanggal_material_storage'));
				} else {
					app.dialog.alert('Gagal Input Material');
					getDataMaterial(localStorage.getItem('penjualan_id_material_storage'), localStorage.getItem('penjualan_tanggal_material_storage'));
				}

			}
		});
	}
}

function getDataMaterial(penjualan_id, penjualan_tanggal) {
	var text_invoice_material_popup = moment(penjualan_tanggal).format('DDMMYY') + '-' + penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');
	$$('#invoice_material_popup').html(text_invoice_material_popup);

	$$('#penjualan_id_material').val("");
	$$('#warna_material').val("");
	$$('#qty_material').val("");
	$$('#keterangan_material').val("");
	$$('#nama_material').val("");
	app.dialog.close();
	$$('#penjualan_id_material').val(penjualan_id);
	localStorage.setItem('penjualan_id_material_storage', penjualan_id);
	localStorage.setItem('penjualan_tanggal_material_storage', penjualan_tanggal);
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-material",
		dataType: 'JSON',
		data: {
			penjualan_id: localStorage.getItem('penjualan_id_material_storage')
		},
		beforeSend: function () {
			$$('#data_material').html('');
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			if (data.data.length == 0) {
				$$('#data_material').html("<tr><td align='center' colspan='5'><b>Tidak Ada Material</b><br></td></tr>");

			} else {
				var material_data = '';
				jQuery.each(data.data, function (i, val) {
					var no = i + 1;
					material_data += ' <tr>';
					material_data += '   <td  class="label-cell text-align-center">' + no + '</td>';
					material_data += '   <td  class="label-cell text-align-left">' + val.nama + '</td>';
					material_data += '   <td  class="label-cell text-align-center">' + val.qty + '</td>';
					material_data += '   <td  class="label-cell text-align-left">' + val.warna + '</td>';
					material_data += '   <td  class="label-cell text-align-left">' + val.keterangan + '</td>';
					material_data += '   <td  class="label-cell text-align-center"><i  onclick="deleteMaterial(\'' + val.material_id + '\')" class="f7-icons">trash</i></td>';
					material_data += '</tr>';
				});
				$$('#data_material').html(material_data);

			}

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function rubahCabangBantuan(penjualan_detail_performa_id, penjualan_id) {
	console.log(jQuery('#bantuan_cabang_' + penjualan_id + '').val());
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/rubah-cabang-bantuan",
		dataType: 'JSON',
		data: {
			penjualan_detail_performa_id: penjualan_detail_performa_id,
			bantuan_cabang: jQuery('#bantuan_cabang_' + penjualan_detail_performa_id + '').val()
		},
		beforeSend: function () {
			$$('#detail_sales_data').html('');
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			if (data.status == 'done') {
				app.dialog.alert('Berhasil Update Cabang Bantuan');
				getDataProduksi();
			} else {
				app.dialog.alert('Gagal Update Cabang Bantuan');
				getDataProduksi();
			}
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function detailPenjualanProduksi(penjualan_id) {
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
			$$('#detail_sales_data').html('');
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
					if (val.style != null && val.style != 'none') {
						var style = val.style.replace(',', '<br>');
					} else {
						var style = '';
					}

					if (val.keterangan != null) {
						var keterangan_fix = val.keterangan;
					} else {
						var keterangan_fix = '';
					}
					if (val.gambar.substring(0, 5) == "koper") {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/product_image_new';
					} else {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/performa_image';
					}
					if (val.kode_warna != null) {
						var kode_warna = val.kode_warna;
					} else {
						var kode_warna = '-';
					}
					detail_sales_data += ' <tr>';
					detail_sales_data += '   <td colspan="1" class="label-cell text-align-center" width="40%">' + val.penjualan_jenis + '<br><img data-image-src="' + path_image + '/' + val.gambar + '" class="pb-popup-dark" src="' + path_image + '/' + val.gambar + '" width="100%"></td>';
					detail_sales_data += '   <td colspan="2" class="label-cell text-align-center" width="60%" style="white-space: pre;">' + val.produk_keterangan_kustom + '<br>' + style + '<br>' + kode_warna + '<br><font color="red">' + keterangan_fix + '</font></td>';
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




				$$('#detail_sales_data_produksi').html(detail_sales_data);
			} else {
				$$('#detail_sales_data_produksi').html('<center><h3>Tidak Ada Data</h3></center>');
			}

			$$('.pb-popup-dark').on('click', function () {
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

function detailPenjualanProduksiProses(penjualan_id) {
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

					if (val.gambar.substring(0, 5) == "koper") {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/product_image_new';
					} else {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/performa_image';
					}
					detail_sales_data += '   <td colspan="1" class="label-cell text-align-center" width="40%">' + val.penjualan_jenis + '<br><img data-image-src-proses="' + path_image + '/' + val.gambar + '" class="pb-popup-dark-proses" src="' + path_image + '/' + val.gambar + '" width="100%"></td>';
					if (val.style != null && val.style != 'none') {
						var style = val.style.replace(',', '<br>');
					} else {
						var style = '';
					}

					if (val.keterangan != null) {
						var keterangan_fix = val.keterangan;
					} else {
						var keterangan_fix = '';
					}
					detail_sales_data += '   <td colspan="2" class="label-cell text-align-center" width="60%" style="white-space: pre;">' + val.produk_keterangan_kustom + '<br>' + style + '<br><font color="red">' + keterangan_fix + '</font></td>';
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


				$$('#detail_sales_data_produksi_proses').html(detail_sales_data);
			} else {
				$$('#detail_sales_data_produksi_proses').html('<center><h3>Tidak Ada Data</h3></center>');
			}

			$$('.pb-popup-dark-proses').on('click', function () {
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

function detailPenjualanProduksiSelesai(penjualan_id) {
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
			$$('#detail_sales_data_selesai').html('');
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
					if (val.style != null && val.style != 'none') {
						var style = val.style.replace(',', '<br>');
					} else {
						var style = '';
					}

					if (val.keterangan != null) {
						var keterangan_fix = val.keterangan;
					} else {
						var keterangan_fix = '';
					}

					if (val.gambar.substring(0, 5) == "koper") {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/product_image_new';
					} else {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/performa_image';
					}
					detail_sales_data += ' <tr>';
					detail_sales_data += '   <td colspan="1" class="label-cell text-align-center" width="40%">' + val.penjualan_jenis + '<br><img data-image-src-selesai="' + path_image + '/' + val.gambar + '" class="pb-popup-dark-selesai" src="' + path_image + '/' + val.gambar + '" width="100%"></td>';
					detail_sales_data += '   <td colspan="2" class="label-cell text-align-center" width="60%" style="white-space: pre;">' + val.produk_keterangan_kustom + '<br>' + style + '<br><font color="red">' + keterangan_fix + '</font></td>';
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

				$$('#detail_sales_data_produksi_selesai').html(detail_sales_data);
			} else {
				$$('#detail_sales_data_produksi_selesai').html('<center><h3>Tidak Ada Data</h3></center>');
			}

			$$('.pb-popup-dark-selesai').on('click', function () {
				console.log($$(this).attr("data-image-src-selesai"));
				var gambar_zoom = $$(this).attr("data-image-src-selesai");
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

function detailPenjualanProduksiHarian(penjualan_id) {
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
			$$('#detail_sales_data_harian').html('');
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
					if (val.style != null && val.style != 'none') {
						var style = val.style.replace(',', '<br>');
					} else {
						var style = '';
					}
					if (val.keterangan != null) {
						var keterangan_fix = val.keterangan;
					} else {
						var keterangan_fix = '';
					}

					if (val.gambar.substring(0, 5) == "koper") {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/product_image_new';
					} else {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/performa_image';
					}
					detail_sales_data += ' <tr>';
					detail_sales_data += '   <td colspan="1" class="label-cell text-align-center" width="40%">' + val.penjualan_jenis + '<br><img data-image-src-harian="' + path_image + '/' + val.gambar + '" class="pb-popup-dark-harian" src="' + path_image + '/' + val.gambar + '" width="100%"></td>';
					detail_sales_data += '   <td colspan="2" class="label-cell text-align-center" width="60%" style="white-space: pre;">' + val.produk_keterangan_kustom + '<br>' + style + '<br><font color="red">' + keterangan_fix + '</font></td>';
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
				$$('#detail_sales_data_produksi_harian').html(detail_sales_data);
			} else {
				$$('#detail_sales_data_produksi_harian').html('<center><h3>Tidak Ada Data</h3></center>');
			}

			$$('.pb-popup-dark-harian').on('click', function () {
				console.log($$(this).attr("data-image-src-harian"));
				var gambar_zoom = $$(this).attr("data-image-src-harian");
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

function detail_button(id, produksi) {
	if (jQuery('#button_proses_' + id + '').is(":visible")) {
		jQuery('#button_selesai_' + id + '').hide();
		jQuery('#button_proses_' + id + '').hide();
		jQuery('#button_body_' + id + '').hide();

	} else {
		jQuery('#button_selesai_' + id + '').show();
		jQuery('#button_proses_' + id + '').show();
		jQuery('#button_body_' + id + '').show();
	}
}

function detail_button2(id, produksi) {
	if (jQuery('#button_selesai2_' + id + '').is(":visible")) {
		jQuery('#button_selesai2_' + id + '').hide();
		jQuery('#button_proses2_' + id + '').hide();
	} else {
		jQuery('#button_selesai2_' + id + '').show();
		jQuery('#button_proses2_' + id + '').hide();
	}

}

function keteranganCustom(penjualan_detail_performa_id) {
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
			if (data.data[0].style != null && data.data[0].style != 'none') {
				var spesifikasi = '- ' + data.data[0].produk_keterangan_kustom.replace(/\r\n|\r|\n/g, "<br />- ") + '<br>- ' + data.data[0].style.replace(',', '<br>- ');
			} else {
				var spesifikasi = '- ' + data.data[0].produk_keterangan_kustom.replace(/\r\n|\r|\n/g, "<br />- ");
			}
			jQuery('#detail_custom_keterangan').html(spesifikasi);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function keteranganCustom2(penjualan_detail_performa_id) {
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
			jQuery('#detail_custom_keterangan2').html('-' + data.data[0].produk_keterangan_kustom.replace(/\r\n|\r|\n/g, "<br />-"));
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function keteranganCustom3(penjualan_detail_performa_id) {
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
			jQuery('#detail_custom_keterangan3').html('-' + data.data[0].produk_keterangan_kustom.replace(/\r\n|\r|\n/g, "<br />-"));
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function keterangan3(penjualan_detail_performa_id) {
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
			jQuery('#detail_keterangan3').html(style + '-' + data.data[0].keterangan.replace(/\r\n|\r|\n/g, "<br />-"));
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function keterangan2(penjualan_detail_performa_id) {
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
			jQuery('#detail_keterangan2').html(style + '-' + data.data[0].keterangan.replace(/\r\n|\r|\n/g, "<br />-"));
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function keterangan(penjualan_detail_performa_id) {
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
			jQuery('#detail_keterangan').html('-' + data.data[0].keterangan.replace(/\r\n|\r|\n/g, "<br />-"));
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function emptyValue(id) {
	jQuery('#' + id + '').val('');
}

function piValue() {
	jQuery('#performa').val('PI_');
}

var delayTimer;
function doSearchProduksiByPerusahaan(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataProduksi();
	}, 1000);
}

function doSearchProduksiProsesByPerusahaan(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataProduksiProses();
	}, 1000);
}

function doSearchProduksiSelesaiByPerusahaan(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataProduksiSelesai();
	}, 1000);
}

function doSearchProduksiSelesaiHarianByPerusahaan(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataProduksiHarian();
	}, 100);
}

function dateRangeDeclarationProduksi() {
	calendarRangeProduksi = app.calendar.create({
		inputEl: '#range-produksi',
		rangePicker: true,
		dateFormat: 'dd-mm-yyyy',
		closeOnSelect: true,
		rangePickerMinDays: 7,
		on: {
			close: function () {
				getDataProduksi();
			}
		}
	});
}

function dateRangeDeclarationProduksiProses() {
	calendarRangeProduksiProses = app.calendar.create({
		inputEl: '#range-produksi-proses',
		rangePicker: true,
		dateFormat: 'dd-mm-yyyy',
		closeOnSelect: true,
		rangePickerMinDays: 7,
		on: {
			close: function () {
				getDataProduksiProses();
			}
		}
	});
}

function dateRangeDeclarationProduksiHarian() {
	calendarRangeProduksiSelesai = app.calendar.create({
		inputEl: '#range-produksi-selesai-harian',
		rangePicker: true,
		dateFormat: 'dd-mm-yyyy',
		closeOnSelect: true,
		rangePickerMinDays: 7,
		on: {
			close: function () {
				getDataProduksiHarian();
			}
		}
	});
}

function dateRangeDeclarationProduksiSelesai() {
	calendarRangeProduksiSelesai = app.calendar.create({
		inputEl: '#range-produksi-selesai',
		rangePicker: true,
		dateFormat: 'dd-mm-yyyy',
		closeOnSelect: true,
		rangePickerMinDays: 7,
		on: {
			close: function () {
				getDataProduksiSelesai();
			}
		}
	});
}

function prosesProduksi(id) {
	jQuery('.tooltiptext').attr("visibility", "visible");

}

function updateStatusProduksi(id, status, jenis = 0) {
	if (status == 1) {
		status = 'selesai';

		app.dialog.create({
			title: 'Status Produksi ',
			text: 'Ubah Status Produksi Menjadi (Selesai) ? ',
			cssClass: 'custom-dialog',
			closeByBackdropClick: 'true',
			buttons: [
				{
					text: 'Ya',
					onClick: function () {
						jQuery.ajax({
							type: 'POST',
							url: "" + BASE_API + "/update-produksi-status",
							dataType: 'JSON',
							data: {
								karyawan_id: localStorage.getItem("user_id"),
								id: id,
								status_produksi: status
							},
							beforeSend: function () {
								app.dialog.preloader('Harap Tunggu');
							},
							success: function (data) {
								app.popover.close();
								app.dialog.close();
								app.popup.close();
								getDataProduksi();
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
	} else if (status == 0) {
		status = 'proses';
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/update-produksi-status",
			dataType: 'JSON',
			data: {
				karyawan_id: localStorage.getItem("user_id"),
				id: id,
				status_produksi: status
			},
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.popover.close();
				app.dialog.close();
				app.popup.close();
				getDataProduksi();
			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}


}

function getDataProduksi() {
	if (jQuery('#perusahaan_produksi_filter').val() == '' || jQuery('#perusahaan_produksi_filter').val() == null) {
		perusahaan_produksi_value = "empty";
	} else {
		perusahaan_produksi_value = jQuery('#perusahaan_produksi_filter').val();
	}

	if (jQuery('#type_produksi_filter').val() == '' || jQuery('#type_produksi_filter').val() == null) {
		type_produksi_filter = "empty";
	} else {
		type_produksi_filter = jQuery('#type_produksi_filter').val();
	}

	if (jQuery('#warna_produksi_filter').val() == '' || jQuery('#warna_produksi_filter').val() == null) {
		warna_produksi_filter = "empty";
	} else {
		warna_produksi_filter = jQuery('#warna_produksi_filter').val();
	}

	var data_produksi = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-produksi-surabaya-new",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			perusahaan_produksi_value: perusahaan_produksi_value,
			type_produksi_filter: type_produksi_filter,
			warna_produksi_filter: warna_produksi_filter
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi, Harap Tunggu');
			jQuery('#produk_data').html('');
		},
		success: function (data) {
			app.dialog.close();
			console.log(data.data);
			if (data.data.length != 0) {
				var nota = '';
				var nomor = 1;
				var warna = '';
				var warna_telat = '';
				var warna_button_packing = '';
				var now = moment();
				jQuery.each(data.data, function (i, val) {
					var sisa_terima_pabrik = parseFloat(val.penjualan_qty) - parseFloat(val.total_terima_pabrik);

					var color_urgent_blink = '';
					var date_urgent = '';
					if (val.tgl_cs_deadline != null) {
						color_urgent_blink = 'card-color-red announcement';
						date_urgent = moment(val.penjualan_tanggal_kirim).subtract(5, 'days').format('DD-MMM');
					} else {
						color_urgent_blink = '';
						date_urgent = moment(val.penjualan_tanggal_kirim).subtract(5, 'days').format('DD-MMM');
					}

					if (sisa_terima_pabrik > 0) {
						if (val.stock == 0) {
							warna = "";
							warna_telat = "";
							if (val.status_produksi == 'proses') {
								warna = "linear-gradient(#4a8a4a , forestgreen); /* Standard syntax */ background: -webkit-linear-gradient(#4a8a4a , forestgreen); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#4a8a4a , forestgreen); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#4a8a4a , forestgreen); /* For Firefox 3.6 to 15 */ color:white;";
							} else if (val.status_produksi == 'selesai') {
								warna = "linear-gradient(#067afb , #002b46); /* Standard syntax */ background: -webkit-linear-gradient(#067afb , #002b46); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#067afb , #002b46); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#067afb , #002b46); /* For Firefox 3.6 to 15 */ color:white;";
							} else if (val.status_produksi == 'body') {
								warna = "linear-gradient(#c5a535  , #cf8600); /* Standard syntax */ background: -webkit-linear-gradient(#c5a535 , #cf8600); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#c5a535 , #cf8600); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#c5a535 , #cf8600); /* For Firefox 3.6 to 15 */ color:white;";
							}

							if (nota != val.penjualan_id) {

								const oneDay_2 = 24 * 60 * 60 * 1000;
								const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
								const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(5, 'days').format('YYYY-MM-DD'));


								const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
								if (val.tgl_cs_deadline != null) {
									var warna_telat = '';
								} else {
									if (firstDate_2 >= secondDate_2) {
										var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
									} else {
										if (diffDays_2 > 0 && diffDays_2 < 3) {
											var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

										} else if (diffDays_2 == 0) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										}
									}
								}


								data_produksi += ' <tr>';
								nota = val.penjualan_id;
								var color_shipment_blink = '';
								if (val.packing == 'polos') {
									if (val.alamat_kirim_penjualan != null) {
										color_shipment_blink = 'announcement btn-color-greenWhite';
										warna_button_packing = '<button class="announcement btn-color-greenWhite text-add-colour-black-soft button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-pusat" onclick="shipmentNotifPusat(\'' + val.penjualan_id + '\')"></button>';
									} else {
										color_shipment_blink = '';
										warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold"></button>';
									}
								} else if (val.packing == 'plastik') {
									if (val.alamat_kirim_penjualan != null) {
										color_shipment_blink = 'announcement btn-color-greenWhite';
										warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-pusat" onclick="shipmentNotifPusat(\'' + val.penjualan_id + '\')">Plastik</button>';
									} else {
										color_shipment_blink = '';
										warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold">Plastik</button>';
									}
								} else if (val.packing == 'kardus') {
									if (val.alamat_kirim_penjualan != null) {
										color_shipment_blink = 'announcement btn-color-greenWhite';
										warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-pusat" onclick="shipmentNotifPusat(\'' + val.penjualan_id + '\')">Kardus</button>';
									} else {
										color_shipment_blink = '';
										warna_button_packing = '<button class="card-color-brown button-small col button text-bold">Kardus</button>';
									}
								} else {
									color_shipment_blink = '';
									warna_button_packing = '';
								}

								data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;" class="label-cell"  align="left" >';
								data_produksi += '    ' + warna_button_packing + '  ';
								data_produksi += '  </td>';

								data_produksi += '  <td style="padding:4px !important; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell" ><center>' + (nomor++) + '</center></td>';
								data_produksi += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell ' + color_urgent_blink + '"  ><center>' + date_urgent + '</center></td>';
								data_produksi += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell" ><center><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-sales-produksi" onclick="detailPenjualanProduksi(\'' + val.penjualan_id + '\')"><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></center></td>';
								data_produksi += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  align="left" >' + val.client_nama + ' | ' + val.client_kota + '</td>';
							} else {
								data_produksi += ' <tr>';
								data_produksi += '  <td style="  border-color:gray;" class="label-cell"  colspan="5"></td>';
							}



							const oneDay = 24 * 60 * 60 * 1000;
							const firstDate = new Date(moment().format('YYYY, MM, DD'));
							const secondDate = new Date(moment(val.penjualan_tanggal_kirim).subtract(5, 'days').format('YYYY-MM-DD'));


							const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
							if (firstDate >= secondDate) {
								var warna_telat2 = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
							} else {
								if (diffDays > 0 && diffDays < 3) {
									var warna_telat2 = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

								} else if (diffDays == 0) {
									var warna_telat2 = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
								}
							}


							data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; ' + warna_telat2 + ' border-color:gray;" class="label-cell"   align="center"><font onclick="detail_button(\'' + i + '\',\'produksi\');">' + val.penjualan_jenis + '</font>';

							if (val.penjualan_jenis.indexOf("HC") != -1) {
								data_produksi += '<a id="button_body_' + i + '" onclick="getDataFotoProduksiSelesaiPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_body + '\',\'body\')"  data-popup=".produksi-selesai-foto-pusat" class="button-small col button popup-open" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: orange; color:white;';
								data_produksi += '"> <center>Body</center> </a>';
								data_produksi += '<a id="button_proses_' + i + '" onclick="getDataFotoProduksiSelesaiPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_proses + '\',\'proses\')"  data-popup=".produksi-selesai-foto-pusat" class="button-small col button popup-open" style="margin-top:7px; display:none;width:100%; border-radius: 10px;background-color: green; color:white;';
								data_produksi += '"> <center>Proses</center> </a>';
								data_produksi += '<br><a id="button_selesai_' + i + '" onclick="getDataFotoProduksiSelesaiPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_selesai + '\',\'selesai\')"  data-popup=".produksi-selesai-foto-pusat" class="button-small col button popup-open" style="margin-top:-16px; display:none;width:100%; background-color: blue; border-radius: 10px; color:white;"> <center>Selesai</center> </a> ';
							} else {
								data_produksi += '<a id="button_proses_' + i + '" onclick="setPurchaseDetailPerformaId(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis + '\',\'' + val.penjualan_tanggal + '\',\'' + val.penjualan_qty + '\' )" data-popup=".proses-purchase" class="button-small col button popup-open" style="margin-top:7px; display:none;width:100%; border-radius: 10px;background-color: green; color:white;';
								data_produksi += '"> <center>Proses</center> </a>';
								data_produksi += '<br><a id="button_selesai_' + i + '" onclick="getDataFotoProduksiSelesaiPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_selesai + '\',\'selesai\')"  data-popup=".produksi-selesai-foto-pusat" class="button-small col button popup-open" style="margin-top:-16px; display:none;width:100%; background-color: blue; border-radius: 10px; color:white;"> <center>Selesai</center> </a> ';
							}


							data_produksi += '</td>';


							data_produksi += '  <td  style="border-bottom: solid 1px; border-left: solid 1px; border-color:gray; background:' + warna + ';" class="label-cell" align="right" >' + val.penjualan_qty + '</td>';
							if (val.stok != 0) {
								data_produksi += '  <td class="label-cell" style="linear-gradient(#4a8a4a , forestgreen); /* Standard syntax */ background: -webkit-linear-gradient(#4a8a4a , forestgreen); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#4a8a4a , forestgreen); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#4a8a4a , forestgreen); /* For Firefox 3.6 to 15 */ color:white; border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" align="right"><input onclick="qtyStokFill(\'' + val.penjualan_detail_performa_id + '\')" onkeyup="tambahStokProduksi(\'' + val.penjualan_detail_performa_id + '\')" type="number" value="' + val.stok + '" name="qty_stok_' + val.penjualan_detail_performa_id + '" id="qty_stok_' + val.penjualan_detail_performa_id + '" style=" text-align: right;  width:100%; border-radius:2px; linear-gradient(#4a8a4a , forestgreen); /* Standard syntax */ background: -webkit-linear-gradient(#4a8a4a , forestgreen); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#4a8a4a , forestgreen); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#4a8a4a , forestgreen); /* For Firefox 3.6 to 15 */ color:white;"/></td>';
							} else {
								data_produksi += '  <td  class="label-cell" style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" align="right"><input onclick="qtyStokFill(\'' + val.penjualan_detail_performa_id + '\')" onkeyup="tambahStokProduksi(\'' + val.penjualan_detail_performa_id + '\')" type="number" value="' + val.stok + '" name="qty_stok_' + val.penjualan_detail_performa_id + '" id="qty_stok_' + val.penjualan_detail_performa_id + '" style=" text-align: right;  width:100%; border-radius:2px; background-color:white; color:black;"/></td>';
							}

							data_produksi += '  <td class="label-cell" style="border-bottom: solid gray 1px; border-top: background:' + warna + '; solid 1px; border-left: solid 1px;  border-color:gray;" align="right">' + (parseInt(val.penjualan_qty) - parseInt(val.stok)) + '</td>';
							if (val.style != null && val.style != 'none') {
								var style = val.style;
							} else {
								var style = '';
							}
							if (val.style != null && val.style != 'none') {
								var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
							} else {
								var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
							}
							data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;  background:' + warna + ';" class="label-cell"  align="left" ><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan" onclick="keteranganCustom(\'' + val.penjualan_detail_performa_id + '\')">' + spesifikasi + '</font></td>';

							if (val.keterangan == null || val.keterangan == "") {
								data_produksi += '  <td style="background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray; border-right: solid 1px; border-bottom: solid 1px;" class="label-cell"  align="center" >-</td>';

							} else {
								var str = val.keterangan;
								if (str.length > 15) {
									var truncated = str.substring(0, 15);
									data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"  width="18%" ><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan" onclick="keterangan(\'' + val.penjualan_detail_performa_id + '\')" >' + truncated + '<span style="font-size:25px;"> .....</span></p></td>';
								} else {
									data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"  width="18%" ><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan" onclick="keterangan(\'' + val.penjualan_detail_performa_id + '\')" >' + str + '</p></td>';
								}
							}
							var wilayah = "";
							if (val.wilayah != null) {
								wilayah = val.wilayah;
							} else {
								wilayah = '-';
							}

							var xtra = '';
							if (val.extra == 1) {
								xtra = "Xtra";
							} else if (val.extra == 0) {
								xtra = 'Grosir';
							}


							data_produksi += '  <td  style=" background:' + warna_telat + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="center" width="7%">' + xtra + '</td>';
							// data_produksi += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  align="center" >' + wilayah + '</td>';
							// data_produksi += '  <td class="label-cell" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;"><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"  data-popup=".input-alamat-kirim-pusat" onclick="shipmentNotifPusat(\'' + val.penjualan_id + '\')">Shipment</a></td>';
							data_produksi += '  <td style="border-bottom: solid 1px; border-right: solid 1px; border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"  >';
							if (val.bantuan_cabang != null) {
								if (val.bantuan_cabang != 'Milano') {
									var bg_color_select = 'background-color:#b20000; color:white;';
								} else {
									var bg_color_select = 'background-color:#ed1b99; color:white;';
								}

							} else {
								var bg_color_select = 'background-color:#121212; color:white;';
							}

							if (val.bantuan_cabang != null) {
								data_produksi += '	<select onchange="rubahCabangBantuan(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\');" style="width:100%; float:center; ' + bg_color_select + '" name="bantuan_cabang_' + val.penjualan_detail_performa_id + '" id="bantuan_cabang_' + val.penjualan_detail_performa_id + '">';
							} else {
								data_produksi += '	<select onchange="rubahCabangBantuan(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\');" style="width:100%; float:center; ' + bg_color_select + '" name="bantuan_cabang_' + val.penjualan_detail_performa_id + '" id="bantuan_cabang_' + val.penjualan_detail_performa_id + '"  >';

							}

							data_produksi += '	<option value="">Cabang</option>';

							jQuery.each(data.cabang_pembantu, function (i, cabang_pembantu_value) {
								if (val.bantuan_cabang == cabang_pembantu_value.nama_cabang) {
									data_produksi += '	<option value="' + cabang_pembantu_value.nama_cabang + '" selected>' + cabang_pembantu_value.text_cabang + '</option>';
								} else {
									data_produksi += '	<option value="' + cabang_pembantu_value.nama_cabang + '" >' + cabang_pembantu_value.text_cabang + '</option>';

								}
							});

							data_produksi += '  </select>';

							data_produksi += '  </td>	';

							data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;" class="label-cell"  align="left" >';

							if (val.foto_purchase_logo_selesai == null || val.foto_resin_selesai == null) {
								data_produksi += '<button data-popup=".get-logo-purchase"  onclick="getLogoPurchase(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_resin_selesai + '\');"  class="text-add-colour-black-soft bg-dark-gray-young btn-standard col button text-bold popup-open">Logo</button>';
							} else {
								data_produksi += '<button data-popup=".get-logo-purchase"  onclick="getLogoPurchase(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_resin_selesai + '\');" style="background-color:blue; color:white;" class="text-add-colour-black-soft btn-standard col button text-bold popup-open">Logo</button>';
							}

							data_produksi += '</td>';
							data_produksi += ' </tr>';
						}
					}
				});
			} else {
				data_produksi += ' <tr>';
				data_produksi += ' <td colspan="8">';
				data_produksi += ' <center> Data Kosong </center>';
				data_produksi += ' </td>';
				data_produksi += ' </tr>';

			}
			jQuery('#produk_data').html(data_produksi);
			jQuery('#total_data').html(data.data.length);


			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {

			jQuery('#total_data').html(0);
		}
	});
}

function shipmentNotifPusat(penjualan_id) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-Alamat",
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$("#input_alamat_kirim_pusat_popup")[0].reset();
		},
		success: function (data) {
			app.dialog.close();
			var alamat_kirim = "";
			var client_nama = "";
			var hp_alamat = "";
			if (data.data != null) {
				alamat_kirim = data.data.alamat_kirim_penjualan;
				client_nama = data.data.client_nama;
				hp_alamat = data.data.client_telp;
			} else {
				alamat_kirim = '-';
				client_nama = '-';
				hp_alamat = '-';
			}

			$$('#alamat_kirim_pusat_popup').val(alamat_kirim);
			$$('#nama_pusat_popup').val(client_nama);
			$$('#hp_pusat_alamat').val(hp_alamat);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getDataProduksiProses() {
	if (jQuery('#perusahaan_produksi_proses_filter').val() == '' || jQuery('#perusahaan_produksi_proses_filter').val() == null) {
		perusahaan_produksi_value = "empty";
	} else {
		perusahaan_produksi_value = jQuery('#perusahaan_produksi_proses_filter').val();
	}

	if (jQuery('#type_produksi_proses_filter').val() == '' || jQuery('#type_produksi_proses_filter').val() == null) {
		type_produksi_filter = "empty";
	} else {
		type_produksi_filter = jQuery('#type_produksi_proses_filter').val();
	}

	if (jQuery('#warna_produksi_filter_proses').val() == '' || jQuery('#warna_produksi_filter_proses').val() == null) {
		warna_produksi_filter = "empty";
	} else {
		warna_produksi_filter = jQuery('#warna_produksi_filter_proses').val();
	}


	var data_produksi1 = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-produksi-proses",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			perusahaan_produksi_value: perusahaan_produksi_value,
			type_produksi_filter: type_produksi_filter,
			warna_produksi_filter: warna_produksi_filter,
			akses: 'tabel'
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Proses Produksi, Harap Tunggu');
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
						data_produksi1 += '  <td style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  ><center><font style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-sales-produksi-proses" onclick="detailPenjualanProduksiProses(\'' + val.penjualan_id + '\')">' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</font></center></td>';
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
					data_produksi1 += '  <td  style="' + warna_telat2 + 'border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; ' + warna_telat2 + ' border-color:gray;" class="label-cell"   align="left"><font onclick="detail_button2(\'' + i + '\',\'proses_produksi\');">' + val.penjualan_jenis + '</font>';

					data_produksi1 += '<button id="button_proses2_' + i + '" onclick="updateStatusProduksi(\'' + val.penjualan_detail_performa_id + '\',0)" style=" display:none; border-radius: 10px;background-color: green; color:white;';
					data_produksi1 += '"> <center>Proses</center> </button><br>';
					data_produksi1 += '<button id="button_selesai2_' + i + '" onclick="updateStatusProduksi(\'' + val.penjualan_detail_performa_id + '\',1,1)" style=" display:none; background-color: blue; border-radius: 10px; color:white;"> <center>Selesai</center> </button> ';
					if (val.style != null && val.style != 'none') {
						var style = val.style;
					} else {
						var style = '';
					}
					if (val.style != null && val.style != 'none') {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
					} else {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
					}
					data_produksi1 += '</td>';
					data_produksi1 += '  <td class="label-cell" style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" align="right">' + val.penjualan_qty + '</td>';
					data_produksi1 += '  <td style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell"  align="left" ><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan2" onclick="keteranganCustom2(\'' + val.penjualan_detail_performa_id + '\')" >' + spesifikasi + '</font></td>';

					if (val.keterangan == null || val.keterangan == "") {
						data_produksi1 += '  <td style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell"  align="center" >-</td>';

					} else {
						var str = val.keterangan;
						if (str.length > 15) {
							var truncated = str.substring(0, 15);
							data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"  width="18%" ><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan" onclick="keterangan(\'' + val.penjualan_detail_performa_id + '\')" >' + truncated + '<span style="font-size:25px;"> .....</span></p></td>';
						} else {
							data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"  width="18%" ><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan" onclick="keterangan(\'' + val.penjualan_detail_performa_id + '\')" >' + str + '</p></td>';
						}
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

			jQuery('#produk_data_proses').html(data_produksi1);
			jQuery('#total_data_produk_proses').html(data.data.length);

			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function openCameraProduksiSelesai(id) {
	var srcType = Camera.PictureSourceType.CAMERA;
	var options = setOptions(srcType);
	var func = createNewFileEntry;
	navigator.camera.getPicture(function cameraSuccess(imageUri) {
		$$("#" + id + "_view").attr("src", imageUri);
		$$("#" + id).hide();
		toDataURL(imageUri, function (dataUrl) {
			localStorage.setItem(id, dataUrl);
			//$$("#"+id+"_value").val(dataUrl);
		})
	}, function cameraError(error) {
		console.debug("Unable to obtain picture: " + error, "app");
		alert("Unable to obtain picture: ");
	}, options);
}

function zoom_view(src) {
	console.log('KLIK');
	var gambar_zoom = src;
	var myPhotoBrowserPopupDark = app.photoBrowser.create({
		photos: [
			'' + gambar_zoom + ''
		],
		theme: 'dark',
		type: 'popup'
	});
	myPhotoBrowserPopupDark.open();
}

function getDataFotoProduksiSelesai(penjualan_detail_performa_id, foto_produksi_selesai) {
	console.log(foto_produksi_selesai);
	jQuery('#penjualan_detail_performa_id_foto_produksi_selesai').val(penjualan_detail_performa_id);
	localStorage.removeItem('file_foto_produksi');
	$('#file_foto_produksi_view').attr('src', '');
	$('#file_foto_produksi_view_now').attr('src', '');
	$$(".custom-file-upload-produk-selesai").show();
	if (foto_produksi_selesai != 'null') {
		jQuery('#file_foto_produksi_view_now').attr('src', BASE_PATH_IMAGE_BUKTI_PRODUKSI + '/' + foto_produksi_selesai);
	} else {
		jQuery('#file_foto_produksi_view_now').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
	}
}

function updateFotoProduksiSelesaiProcess() {

	var count_label_foto = $('.custom-file-upload-produk-selesai').is(":visible");
	if (count_label_foto == false) {
		var formData = new FormData(jQuery("#upload_foto_produksi_selesai")[0]);
		formData.append('file_foto_produksi', localStorage.getItem("file_foto_produksi"));
		formData.append('penjualan_detail_performa_id_foto_produksi_selesai', jQuery('#penjualan_detail_performa_id_foto_produksi_selesai').val());


		jQuery.ajax({
			type: "POST",
			url: "" + BASE_API + "/update-file-foto-produksi",
			dataType: "JSON",
			data: formData,
			contentType: false,
			processData: false,
			xhr: function () {
				var dialog = app.dialog.progress('Loading ', 0);
				dialog.setText('0%');
				var xhr = new window.XMLHttpRequest();
				xhr.upload.addEventListener("progress", function (evt) {

					if (evt.lengthComputable) {
						var percentComplete = evt.loaded / evt.total;
						dialog.setProgress(Math.round(percentComplete * 100));
						dialog.setText('' + (Math.round(percentComplete * 100)) + '%');
					}

				}, false);
				return xhr;
			},
			success: function (data) {
				getDataProduksiSelesai();
				app.popup.close();
				app.dialog.close();
				if (data.status == 'done') {
					app.dialog.alert('Berhasil update foto');
				} else if (data.status == 'failed') {
					app.dialog.alert('Gagal Update Foto');
				}
			}
		});
	} else {
		app.dialog.alert('Harap Isi Foto');
	}
}

function getDataProduksiSelesai() {
	if (jQuery('#perusahaan_produksi_selesai_filter').val() == '' || jQuery('#perusahaan_produksi_selesai_filter').val() == null) {
		perusahaan_produksi_value = "empty";
	} else {
		perusahaan_produksi_value = jQuery('#perusahaan_produksi_selesai_filter').val();
	}

	if (jQuery('#range-produksi-selesai').val() == '' || jQuery('#range-produksi-selesai').val() == null) {
		var startdate = "empty";
		var enddate = "empty";
	} else {
		var startdate_new = new Date(calendarRangeProduksiSelesai.value[0]);
		var enddate_new = new Date(calendarRangeProduksiSelesai.value[1]);
		var startdate = moment(startdate_new).add(5, 'days').format('YYYY-MM-DD');
		var enddate = moment(enddate_new).add(5, 'days').format('YYYY-MM-DD');
	}

	if (jQuery('#type_produksi_selesai_filter').val() == '' || jQuery('#type_produksi_selesai_filter').val() == null) {
		type_produksi_filter = "empty";
	} else {
		type_produksi_filter = jQuery('#type_produksi_selesai_filter').val();
	}

	if (jQuery('#warna_produksi_filter_selesai').val() == '' || jQuery('#warna_produksi_filter_selesai').val() == null) {
		warna_produksi_filter = "empty";
	} else {
		warna_produksi_filter = jQuery('#warna_produksi_filter_selesai').val();
	}

	var data_produksi2 = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-produksi-selesai",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			perusahaan_produksi_value: perusahaan_produksi_value,
			startdate: startdate,
			enddate: enddate,
			warna_produksi_filter: warna_produksi_filter,
			type_produksi_filter: type_produksi_filter,
			akses: 'tabel'
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi Selesai, Harap Tunggu');
			jQuery('#produk_data_selesai').html('');
		},
		success: function (data) {
			app.dialog.close();

			if (data.data.length != 0) {
				var nota = '';
				var nomor = 1;
				jQuery.each(data.data, function (i, val) {

					data_produksi2 += ' <tr>';
					if (nota != val.penjualan_id) {
						if (nomor % 2 == 1) {
							warna = '#4c2b2b';
						} else {
							warna = '#121212';
						}
						nota = val.penjualan_id;
						data_produksi2 += '  <td class="label-cell" style="padding:4px !important; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" ><center>' + (nomor++) + '</center></td>';
						data_produksi2 += '  <td class="label-cell" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;"  ><center>' + moment(val.penjualan_tanggal_kirim).format('DD-MMM') + '</center></td>';
						data_produksi2 += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell"  ><center><font style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-sales-produksi-selesai" onclick="detailPenjualanProduksiSelesai(\'' + val.penjualan_id + '\')">' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</font></center></td>';
						data_produksi2 += '  <td class="label-cell" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px;  border-color:gray;" align="left" >' + val.client_nama + '</td>';
					} else {

						data_produksi2 += '  <td class="label-cell" style="border-color:gray;" colspan="4"></td>';

					}
					if (val.style != null && val.style != 'none') {
						var style = val.style;
					} else {
						var style = '';
					}
					if (val.style != null && val.style != 'none') {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
					} else {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
					}
					data_produksi2 += '  <td  style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell popover-open " data-popover=".popover-links2' + i + '" align="left">' + val.penjualan_jenis + '';
					data_produksi2 += '</td>';
					data_produksi2 += '  <td class="label-cell" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" align="right">' + val.penjualan_qty + '</td>';
					data_produksi2 += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell"  align="left" ><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan3" onclick="keteranganCustom3(\'' + val.penjualan_detail_performa_id + '\')" >' + spesifikasi + '</font></td>';

					if (val.keterangan == null || val.keterangan == "") {
						data_produksi2 += '  <td style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell"  align="center" >-</td>';

					} else {
						var str = val.keterangan;
						if (str.length > 15) {
							var truncated = str.substring(0, 15);
							data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"  width="18%" ><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan" onclick="keterangan(\'' + val.penjualan_detail_performa_id + '\')" >' + truncated + '<span style="font-size:25px;"> .....</span></p></td>';
						} else {
							data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"  width="18%" ><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan" onclick="keterangan(\'' + val.penjualan_detail_performa_id + '\')" >' + str + '</p></td>';
						}
					}
					data_produksi2 += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-selesai-foto-pusat" onclick="getDataFotoProduksiSelesai(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_selesai + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold">Upload</button></td>';

				});
			} else {

				data_produksi2 += ' <tr>';
				data_produksi2 += ' <td colspan="8">';
				data_produksi2 += ' <center> Data Kosong </center>';
				data_produksi2 += ' </td>';
				data_produksi2 += ' </tr>';
			}

			jQuery('#produk_data_selesai').html(data_produksi2);
			jQuery('#total_data_produk_selesai').html(data.data.length);

			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getDataProduksiHarian() {
	if (jQuery('#perusahaan_produksi_selesai_filter_harian').val() == '' || jQuery('#perusahaan_produksi_selesai_filter_harian').val() == null) {
		perusahaan_produksi_value = "empty";
	} else {
		perusahaan_produksi_value = jQuery('#perusahaan_produksi_selesai_filter_harian').val();
	}

	if (jQuery('#range-produksi-selesai-harian').val() == '' || jQuery('#range-produksi-selesai-harian').val() == null) {
		var startdate = "empty";
		var enddate = "empty";
	} else {
		var startdate_new = new Date(calendarRangeProduksiSelesai.value[0]);
		var enddate_new = new Date(calendarRangeProduksiSelesai.value[1]);
		var startdate = moment(startdate_new).format('YYYY-MM-DD');
		var enddate = moment(enddate_new).format('YYYY-MM-DD');
	}

	if (jQuery('#type_produksi_selesai_filter').val() == '' || jQuery('#type_produksi_selesai_filter').val() == null) {
		type_produksi_filter = "empty";
	} else {
		type_produksi_filter = jQuery('#type_produksi_selesai_filter').val();
	}


	var data_produksi2 = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-produksi-harian",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			perusahaan_produksi_value: perusahaan_produksi_value,
			startdate: startdate,
			enddate: enddate,
			type_produksi_filter: type_produksi_filter,
			akses: 'tabel'
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi Selesai Harian, Harap Tunggu');
			jQuery('#produk_data_selesai').html('');
		},
		success: function (data) {
			app.dialog.close();

			if (data.data.length != 0) {
				var nota = '';
				var nomor = 1;
				jQuery.each(data.data, function (i, val) {

					data_produksi2 += ' <tr>';
					if (nota != val.penjualan_id) {
						if (nomor % 2 == 1) {
							warna = '#4c2b2b';
						} else {
							warna = '#121212';
						}
						nota = val.penjualan_id;
						if (moment(val.produksi_tanggal_selesai).format('dddd') == "Sunday") {
							var hari = "Minggu";
						} else if (moment(val.produksi_tanggal_selesai).format('dddd') == "Monday") {
							var hari = "Senin";
						} else if (moment(val.produksi_tanggal_selesai).format('dddd') == "Tuesday") {
							var hari = "Selasa";
						} else if (moment(val.produksi_tanggal_selesai).format('dddd') == "Wednesday") {
							var hari = "Rabu";
						} else if (moment(val.produksi_tanggal_selesai).format('dddd') == "Thursday") {
							var hari = "Kamis";
						} else if (moment(val.produksi_tanggal_selesai).format('dddd') == "Friday") {
							var hari = "Jumat";
						} else if (moment(val.produksi_tanggal_selesai).format('dddd') == "Saturday") {
							var hari = "Sabtu";
						}

						data_produksi2 += '  <td class="label-cell" style="padding:4px !important; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" ><center>' + (nomor++) + '</center></td>';
						data_produksi2 += '  <td class="label-cell" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;"  ><center>' + hari + ', ' + moment(val.produksi_tanggal_selesai).format('DD-MM-YY') + '</center></td>';
						data_produksi2 += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell"  ><center><font style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-sales-produksi-harian" onclick="detailPenjualanProduksiHarian(\'' + val.penjualan_id + '\')">' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</font></center></td>';
						data_produksi2 += '  <td class="label-cell" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px;  border-color:gray;" align="left" >' + val.client_nama + '</td>';
					} else {

						data_produksi2 += '  <td class="label-cell" style="border-color:gray;" colspan="4"></td>';

					}
					if (val.style != null && val.style != 'none') {
						var style = val.style;
					} else {
						var style = '';
					}
					if (val.style != null && val.style != 'none') {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
					} else {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
					}
					data_produksi2 += '  <td  style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell popover-open " data-popover=".popover-links2' + i + '" align="left">' + val.penjualan_jenis + '';
					data_produksi2 += '</td>';
					data_produksi2 += '  <td class="label-cell" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" align="right">' + val.penjualan_qty + '</td>';
					data_produksi2 += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell"  align="left" ><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan3" onclick="keteranganCustom3(\'' + val.penjualan_detail_performa_id + '\')" >' + spesifikasi + '</font></td>';

					if (val.keterangan == null || val.keterangan == "") {
						data_produksi2 += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell"  align="center" >-</td>';

					} else {
						var str = al.keterangan;
						if (str.length > 15) {
							var truncated = str.substring(0, 15);
							data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"  width="18%" ><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan" onclick="keterangan(\'' + val.penjualan_detail_performa_id + '\')" >' + truncated + '<span style="font-size:25px;"> .....</span></p></td>';
						} else {
							data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"  width="18%" ><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan" onclick="keterangan(\'' + val.penjualan_detail_performa_id + '\')" >' + str + '</p></td>';
						}
					}
				});
			} else {

				data_produksi2 += ' <tr>';
				data_produksi2 += ' <td colspan="8">';
				data_produksi2 += ' <center> Data Kosong </center>';
				data_produksi2 += ' </td>';
				data_produksi2 += ' </tr>';
			}

			jQuery('#produk_data_selesai_harian').html(data_produksi2);
			jQuery('#total_data_produk_selesai_harian').html(data.data.length);

			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

// -------------------------------------------------  Report / Laporan

function reportProduksi() {
	if (jQuery('#perusahaan_produksi_filter').val() == '' || jQuery('#perusahaan_produksi_filter').val() == null) {
		perusahaan_produksi_value = "empty";
	} else {
		perusahaan_produksi_value = jQuery('#perusahaan_produksi_filter').val();
	}

	if (jQuery('#range-produksi').val() == '' || jQuery('#range-produksi').val() == null) {
		var startdate = "empty";
		var enddate = "empty";
	} else {
		var startdate_new = new Date(calendarRangeProduksi.value[0]);
		var enddate_new = new Date(calendarRangeProduksi.value[1]);
		var startdate = moment(startdate_new).add(5, 'days').format('YYYY-MM-DD');
		var enddate = moment(enddate_new).add(5, 'days').format('YYYY-MM-DD');
	}
	var data_produksi = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-produksi",
		dataType: 'JSON',
		data: {
			perusahaan_produksi_value: perusahaan_produksi_value,
			startdate: startdate,
			enddate: enddate
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi, Harap Tunggu');
			data_produksi += ' <center><h3>Data SPK</h3></center>';
			data_produksi += '<table  border="1" width="100%" style="border-spacing: 0; background-color:white; color:black;">';
			data_produksi += ' <tr>';
			data_produksi += ' <th width="5%">No</th>';
			data_produksi += ' <th width="10%">Dateline</th>';
			data_produksi += ' <th width="15%">SPK</th>';
			data_produksi += ' <th width="18%">Nama</th>';
			data_produksi += ' <th width="11%">Type</th>';
			data_produksi += ' <th width="18%">Spesifikasi</th>';
			data_produksi += ' <th width="18%">Keterangan</th>';
			data_produksi += ' <th width="5%">Jumlah</th>';
			data_produksi += '</tr>';
			data_produksi += '<tbody>';
		},
		success: function (data) {
			app.dialog.close();
			if (data.data.length != 0) {

				var nota = '';
				var nomor = 1;
				var warna = '';
				var warna_telat = '';
				var now = moment();
				jQuery.each(data.data, function (i, val) {

					warna = "";
					warna_telat = "";
					if (val.status_produksi == 'proses') {
						warna = "linear-gradient(#4a8a4a , forestgreen); /* Standard syntax */ background: -webkit-linear-gradient(#4a8a4a , forestgreen); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#4a8a4a , forestgreen); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#4a8a4a , forestgreen); /* For Firefox 3.6 to 15 */ color:white;";
					} else if (val.status_produksi == 'selesai') {
						warna = "linear-gradient(#067afb , #002b46); /* Standard syntax */ background: -webkit-linear-gradient(#067afb , #002b46); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#067afb , #002b46); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#067afb , #002b46); /* For Firefox 3.6 to 15 */ color:white;";
					}

					if (nota != val.penjualan_id) {
						if (now >= moment(val.penjualan_tanggal_kirim).subtract(5, 'days')) {
							data_produksi += ' <tr>';
							warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
						} else {
							data_produksi += ' <tr >';
						}
						nota = val.penjualan_id;
						data_produksi += '  <td style="' + warna_telat + '" ><center>' + (nomor++) + '</center></td>';
						data_produksi += '  <td style="' + warna_telat + '"  ><center>' + moment(val.penjualan_tanggal_kirim).subtract(5, 'days').format('DD-MMM') + '</center></td>';
						data_produksi += '  <td style="' + warna_telat + '"  ><center><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
						data_produksi += '  <td style="' + warna_telat + '"  ><center>' + val.client_nama + '</center></td>';
					} else {
						data_produksi += ' <tr>';
						data_produksi += '  <td style="border-top: solid 1px;  border-color:gray;"  colspan="4"></td>';
					}

					data_produksi += '  <td  style="' + warna_telat + '" ><center>' + val.penjualan_jenis + '</center>';
					data_produksi += '</td>';
					if (val.style != null && val.style != 'none') {
						var style = val.style;
					} else {
						var style = '';
					}

					if (val.style != null && val.style != 'none') {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
					} else {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
					}
					data_produksi += '  <td  align="left" style=" background:' + warna + ';"  >' + spesifikasi + '</td>';
					data_produksi += '  <td  align="left" style=""  >' + val.keterangan + '</td>';

					data_produksi += '  <td><center>' + val.penjualan_qty + '</center></td>';
					data_produksi += ' </tr>';
				});

				data_produksi += '</tbody>';
				data_produksi += '</table>';
				let options = {
					documentSize: 'A4',
					type: 'share',
					fileName: 'Report_produksi.pdf'
				}
				console.log(data_produksi);
				pdf.fromData(data_produksi, options)
					.then((stats) => console.log('status', stats))
					.catch((err) => console.err(err));

			}

			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {

			jQuery('#total_data').html(0);
		}
	});
}

function reportProduksiProses() {
	if (jQuery('#perusahaan_produksi_proses_filter').val() == '' || jQuery('#perusahaan_produksi_proses_filter').val() == null) {
		perusahaan_produksi_value = "empty";
	} else {
		perusahaan_produksi_value = jQuery('#perusahaan_produksi_proses_filter').val();
	}

	if (jQuery('#range-produksi-proses').val() == '' || jQuery('#range-produksi-proses').val() == null) {
		var startdate = "empty";
		var enddate = "empty";
	} else {
		var startdate_new = new Date(calendarRangeProduksiProses.value[0]);
		var enddate_new = new Date(calendarRangeProduksiProses.value[1]);
		var startdate = moment(startdate_new).add(5, 'days').format('YYYY-MM-DD');
		var enddate = moment(enddate_new).add(5, 'days').format('YYYY-MM-DD');
	}
	var data_produksi = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-produksi-proses",
		dataType: 'JSON',
		data: {
			perusahaan_produksi_value: perusahaan_produksi_value,
			startdate: startdate,
			enddate: enddate,
			akses: 'tabel'
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi, Harap Tunggu');
			data_produksi += ' <center><h3>Data SPK / Proses Produksi</h3></center>';
			data_produksi += '<table  border="1" width="100%" style="border-spacing: 0; background-color:white; color:black;">';
			data_produksi += ' <tr>';
			data_produksi += ' <th width="5%">No</th>';
			data_produksi += ' <th width="10%">Dateline</th>';
			data_produksi += ' <th width="15%">SPK</th>';
			data_produksi += ' <th width="18%">Nama</th>';
			data_produksi += ' <th width="11%">Type</th>';
			data_produksi += ' <th width="18%">Spesifikasi</th>';
			data_produksi += ' <th width="18%">Keterangan</th>';
			data_produksi += ' <th width="5%">Jumlah</th>';
			data_produksi += '</tr>';
			data_produksi += '<tbody>';
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
							data_produksi += ' <tr>';
							warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
						} else {
							data_produksi += ' <tr >';
						}
						nota = val.penjualan_id;
						data_produksi += '  <td style=" ' + warna_telat + '" class="label-cell" ><center>' + (nomor++) + '</center></td>';
						data_produksi += '  <td style=" ' + warna_telat + '" class="label-cell"  ><center>' + moment(val.penjualan_tanggal_kirim).subtract(5, 'days').format('DD-MM') + '</center></td>';
						data_produksi += '  <td style="' + warna_telat + '"  ><center><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
						data_produksi += '  <td style=" ' + warna_telat + '" class="label-cell"  ><center>' + val.client_nama + '</center></td>';
					} else {
						data_produksi += ' <tr>';
						data_produksi += '  <td style="border-top: solid 1px;  border-color:gray;" class="label-cell"  colspan="4"></td>';
					}

					data_produksi += '  <td  class="label-cell popover-open " ><center>' + val.penjualan_jenis + '</center>';
					data_produksi += '</td>';
					if (val.style != null && val.style != 'none') {
						var style = val.style;
					} else {
						var style = '';
					}
					if (val.style != null && val.style != 'none') {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
					} else {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
					}
					data_produksi += '  <td class="label-cell" align="left">' + spesifikasi + '</td>';
					data_produksi += '  <td  align="left" style=""  >' + val.keterangan + '</td>';

					data_produksi += '  <td class="label-cell" ><center>' + val.penjualan_qty + '</center></td>';
					data_produksi += ' </tr>';
				});

				data_produksi += '</tbody>';
				data_produksi += '</table>';
				let options = {
					documentSize: 'A4',
					type: 'share',
					fileName: 'Report_produksi_proses.pdf'
				}
				console.log(data_produksi);
				pdf.fromData(data_produksi, options)
					.then((stats) => console.log('status', stats))
					.catch((err) => console.err(err));

			}

			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {

			jQuery('#total_data').html(0);
		}
	});
}

function reportProduksiSelesai() {
	if (jQuery('#perusahaan_produksi_selesai_filter').val() == '' || jQuery('#perusahaan_produksi_selesai_filter').val() == null) {
		perusahaan_produksi_value = "empty";
	} else {
		perusahaan_produksi_value = jQuery('#perusahaan_produksi_selesai_filter').val();
	}

	if (jQuery('#range-produksi-selesai').val() == '' || jQuery('#range-produksi-selesai').val() == null) {
		var startdate = "empty";
		var enddate = "empty";
	} else {
		var startdate_new = new Date(calendarRangeProduksiSelesai.value[0]);
		var enddate_new = new Date(calendarRangeProduksiSelesai.value[1]);
		var startdate = moment(startdate_new).add(5, 'days').format('YYYY-MM-DD');
		var enddate = moment(enddate_new).add(5, 'days').format('YYYY-MM-DD');
	}
	var data_produksi = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-produksi-selesai",
		dataType: 'JSON',
		data: {
			perusahaan_produksi_value: perusahaan_produksi_value,
			startdate: startdate,
			enddate: enddate,
			akses: 'tabel'
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi, Harap Tunggu');
			data_produksi += ' <center><h3>Data Hasil Produksi Selesai</h3></center>';
			data_produksi += '<table  border="1" width="100%" style="border-spacing: 0; background-color:white; color:black;">';
			data_produksi += ' <tr>';
			data_produksi += ' <th width="5%">No</th>';
			data_produksi += ' <th width="10%">Tanggal Pengiriman</th>';
			data_produksi += ' <th width="15%">SPK</th>';
			data_produksi += ' <th width="20%">Nama</th>';
			data_produksi += ' <th width="15%">Type</th>';
			data_produksi += ' <th width="30%">Spesifikasi</th>';
			data_produksi += ' <th width="5%">Jumlah</th>';
			data_produksi += '</tr>';
			data_produksi += '<tbody>';
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
						if (now >= moment(val.penjualan_tanggal_kirim)) {
							data_produksi += ' <tr>';
							warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
						} else {
							data_produksi += ' <tr >';
						}
						nota = val.penjualan_id;
						data_produksi += '  <td style=" ' + warna_telat + '" class="label-cell" ><center>' + (nomor++) + '</center></td>';
						data_produksi += '  <td style=" ' + warna_telat + '" class="label-cell"  ><center>' + moment(val.penjualan_tanggal_kirim).format('DD-MM') + '</center></td>';
						data_produksi += '  <td style="' + warna_telat + '"  ><center><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
						data_produksi += '  <td style=" ' + warna_telat + '" class="label-cell"  ><center>' + val.client_nama + '</center></td>';
					} else {
						data_produksi += ' <tr>';
						data_produksi += '  <td style="border-top: solid 1px;  border-color:gray;" class="label-cell"  colspan="4"></td>';
					}

					data_produksi += '  <td  class="label-cell popover-open " ><center>' + val.penjualan_jenis + '</center>';
					data_produksi += '</td>';
					if (val.style != null && val.style != 'none') {
						var style = val.style;
					} else {
						var style = '';
					}
					if (val.style != null && val.style != 'none') {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
					} else {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
					}
					data_produksi += '  <td class="label-cell" align="left">' + spesifikasi + '</td>';
					data_produksi += '  <td class="label-cell"  align="left" >' + val.keterangan + '</td>';

					data_produksi += '  <td class="label-cell" ><center>' + val.penjualan_qty + '</center></td>';
					data_produksi += ' </tr>';
				});

				data_produksi += '</tbody>';
				data_produksi += '</table>';
				let options = {
					documentSize: 'A4',
					type: 'share',
					fileName: 'Report_produksi_proses.pdf'
				}
				console.log(data_produksi);
				pdf.fromData(data_produksi, options)
					.then((stats) => console.log('status', stats))
					.catch((err) => console.err(err));

			}

			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {

			jQuery('#total_data').html(0);
		}
	});
}

function reportProduksiHarian() {
	if (jQuery('#perusahaan_produksi_selesai_filter_harian').val() == '' || jQuery('#perusahaan_produksi_selesai_filter_harian').val() == null) {
		perusahaan_produksi_value = "empty";
	} else {
		perusahaan_produksi_value = jQuery('#perusahaan_produksi_selesai_filter_harian').val();
	}

	if (jQuery('#range-produksi-selesai-harian').val() == '' || jQuery('#range-produksi-selesai-harian').val() == null) {
		var startdate = "empty";
		var enddate = "empty";
	} else {
		var startdate_new = new Date(calendarRangeProduksiSelesai.value[0]);
		var enddate_new = new Date(calendarRangeProduksiSelesai.value[1]);
		var startdate = moment(startdate_new).format('YYYY-MM-DD');
		var enddate = moment(enddate_new).format('YYYY-MM-DD');
	}
	var data_produksi = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-produksi-harian",
		dataType: 'JSON',
		data: {
			perusahaan_produksi_value: perusahaan_produksi_value,
			startdate: startdate,
			enddate: enddate,
			akses: 'tabel'
		},
		beforeSend: function () {



			app.dialog.preloader('Mengambil Data Produksi, Harap Tunggu');
			data_produksi += ' <center><h3>Data Hasil Produksi Harian</h3></center>';
			data_produksi += '<table  border="1" width="100%" style="border-spacing: 0; background-color:white; color:black;">';
			data_produksi += ' <tr>';
			data_produksi += ' <th width="3%">No</th>';
			data_produksi += ' <th width="10%">Tanggal Selesai</th>';
			data_produksi += ' <th width="10%">SPK</th>';
			data_produksi += ' <th width="14%">Nama</th>';
			data_produksi += ' <th width="10%">Type</th>';
			data_produksi += ' <th width="25%">Spesifikasi</th>';
			data_produksi += ' <th width="25%">Keterangan</th>';
			data_produksi += ' <th width="3%">Jumlah</th>';
			data_produksi += '</tr>';
			data_produksi += '<tbody>';
		},
		success: function (data) {
			app.dialog.close();
			if (data.data.length != 0) {

				var nota = '';
				var warna_telat = '';
				var nomor = 1;
				var now = moment();
				jQuery.each(data.data, function (i, val) {
					if (moment(val.produksi_tanggal_selesai).format('dddd') == "Sunday") {
						var hari = "Minggu";
					} else if (moment(val.produksi_tanggal_selesai).format('dddd') == "Monday") {
						var hari = "Senin";
					} else if (moment(val.produksi_tanggal_selesai).format('dddd') == "Tuesday") {
						var hari = "Selasa";
					} else if (moment(val.produksi_tanggal_selesai).format('dddd') == "Wednesday") {
						var hari = "Rabu";
					} else if (moment(val.produksi_tanggal_selesai).format('dddd') == "Thursday") {
						var hari = "Kamis";
					} else if (moment(val.produksi_tanggal_selesai).format('dddd') == "Friday") {
						var hari = "Jumat";
					} else if (moment(val.produksi_tanggal_selesai).format('dddd') == "Saturday") {
						var hari = "Sabtu";
					}


					warna_telat = "";
					if (nota != val.penjualan_id) {
						if (now >= moment(val.penjualan_tanggal_kirim)) {
							data_produksi += ' <tr>';
							warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
						} else {
							data_produksi += ' <tr >';
						}

						nota = val.penjualan_id;
						data_produksi += '  <td style=" ' + warna_telat + '" class="label-cell" ><center>' + (nomor++) + '</center></td>';
						data_produksi += '  <td style=" ' + warna_telat + '" class="label-cell"  ><center>' + hari + ', ' + moment(val.produksi_tanggal_selesai).format('DD-MM-YYYY') + '</center></td>';
						data_produksi += '  <td style="' + warna_telat + '"  ><center><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
						data_produksi += '  <td style=" ' + warna_telat + '" class="label-cell"  ><center>' + val.client_nama + '</center></td>';
					} else {
						data_produksi += ' <tr>';
						data_produksi += '  <td style="border-top: solid 1px;  border-color:gray;" class="label-cell"  colspan="4"></td>';
					}

					data_produksi += '  <td  class="label-cell popover-open " ><center>' + val.penjualan_jenis + '</center>';
					data_produksi += '</td>';
					if (val.style != null && val.style != 'none') {
						var style = val.style;
					} else {
						var style = '';
					}
					if (val.style != null && val.style != 'none') {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
					} else {
						var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
					}
					data_produksi += '  <td class="label-cell" align="left">' + spesifikasi + '</td>';
					data_produksi += '  <td class="label-cell"  align="left" >' + val.keterangan + '</td>';

					data_produksi += '  <td class="label-cell" ><center>' + val.penjualan_qty + '</center></td>';
					data_produksi += ' </tr>';
				});

				data_produksi += '</tbody>';
				data_produksi += '</table>';
				let options = {
					documentSize: 'A4',
					type: 'share',
					fileName: 'Report_produksi_proses.pdf'
				}
				console.log(data_produksi);
				pdf.fromData(data_produksi, options)
					.then((stats) => console.log('status', stats))
					.catch((err) => console.err(err));

			}

			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {

			jQuery('#total_data').html(0);
		}
	});
}

function getDashboardProduksi(jenis = null) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-dashboard-produksi",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id")
		},
		beforeSend: function () {
		},
		success: function (data) {
			var data_produksi = '';
			console.log(data);
			if (data.data.length != 0) {
				var nota = '';
				var now = moment();
				var idx = 0;
				jQuery.each(data.data, function (i, val) {
					if (now >= moment(val.penjualan_tanggal_kirim).subtract(8, 'days')) {
						if (nota != val.penjualan_id) {
							nota = val.penjualan_id;
							if (idx != 0) {
								data_produksi += ' &nbsp; &nbsp; <span style="color:black; font-weight:bold">|</span> &nbsp; &nbsp;  ';
							}
							idx++;

							data_produksi += moment(val.penjualan_tanggal_kirim).subtract(5, 'days').format('DD-MMM') + ' - ';
							data_produksi += moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + ' - ';
							data_produksi += val.client_nama + ' - ';
						} else {
							data_produksi += ', ';
						}
						data_produksi += val.penjualan_jenis;
					}
				});
				if (jenis == 'proses') {
					jQuery("#data_produksi_telat2").html(data_produksi);
				} else if (jenis == 'selesai') {
					jQuery("#data_produksi_telat3").html(data_produksi);
					jQuery("#data_produksi_telat4").html(data_produksi);
				} else if (jenis == 'body') {
					jQuery("#data_produksi_telat_body").html(data_produksi);
				} else {
					jQuery("#data_produksi_telat").html(data_produksi);
				}

			} else {
				if (jenis == 'proses') {
					jQuery("#data_produksi_telat2").html('Tidak Ada Produksi Terlambat');
				} else if (jenis == 'selesai') {
					jQuery("#data_produksi_telat3").html('Tidak Ada Produksi Terlambat');
					jQuery("#data_produksi_telat4").html('Tidak Ada Produksi Terlambat');
				} else {
					jQuery("#data_produksi_telat").html('Tidak Ada Produksi Terlambat');
				}
			}
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getYearHistoryProduksiPusat() {
	let startYear = 2010;
	let endYear = new Date().getFullYear();
	for (i = endYear; i > startYear; i--) {
		if (i == endYear) {
			$('.year_popup_produksi_selesai_pusat').append($('<option selected />').val(i).html(i));
		} else {
			$('.year_popup_produksi_selesai_pusat').append($('<option />').val(i).html(i));
		}
	}
}

function openDialogViewProduksi() {

	var popup;
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-count-status-view-notif-produksi",
		dataType: 'JSON',
		data: {
		},
		beforeSend: function () {
		},
		success: function (data) {
			if (data.data > 0 || data.data_performa > 0 || data.data_kirim > 0 || data.data_prospek > 0) {
				// app.popup.open('.status-view-manager');
				// Create popup

				if (!popup) {
					popup = app.popup.create({
						el: '.status-view-produksi',
						closeByBackdropClick: false,
						closeOnEscape: false,
						swipeToClose: false,
					});

					// Open it
					// popup.open();
					getViewProduksi(1);
				}
			}

			if (data.data > 0) {
				$$('#merah-sales').removeClass("card-color-red-important");
				$$('#merah-sales').addClass("card-color-red-important");
			} else {
				$$('#merah-sales').removeClass("card-color-red-important");
			}



		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getViewProduksi(page) {

	if (page == '' || page == null) {
		var page_now = 1;

	} else {
		var page_now = page;
	}

	var user_id = ""
	if (jQuery("#sales_id").val() == "" || jQuery("#sales_id").val() == null) {
		user_id = 'empty';
	} else {
		user_id = jQuery("#sales_id").val();
	}

	if (jQuery('#range-penjualan').val() == '' || jQuery('#range-penjualan').val() == null) {
		var startdate = "empty";
		var enddate = "empty";
	} else {
		var startdate_new = new Date(calendarRangePenjualan.value[0]);
		var enddate_new = new Date(calendarRangePenjualan.value[1]);
		var startdate = moment(startdate_new).format('YYYY-MM-DD');
		var enddate = moment(enddate_new).format('YYYY-MM-DD');
	}
	if (jQuery('#perusahaan_penjualan_filter').val() == '' || jQuery('#perusahaan_penjualan_filter').val() == null) {
		perusahaan_penjualan_value = "empty";
	} else {
		perusahaan_penjualan_value = jQuery('#perusahaan_penjualan_filter').val();
	}
	var penjualan_value = "";
	var pagination_button = "";

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-status-view-notif-produksi?page=" + page_now + "",
		dataType: 'JSON',
		data: {
			karyawan_id: user_id,
			startdate: startdate,
			enddate: enddate,
			perusahaan_penjualan_value: perusahaan_penjualan_value,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			no = 1;
			for (i = 0; i < data.data.last_page; i++) {
				no = i + 1;
				pagination_button += '<i onclick="getViewManager(' + no + ');"  style="border-radius:2px; width:40px; height:40px; background-color:#4c5269; padding-left:8px; padding-right:8px; margin:2px;">' + no + '</i>';
			}
			var no_row = 0;
			jQuery.each(data.data.data, function (i, item) {
				no_row++
				var wilayah = "";
				var nama_kota = "";
				if (item.wilayah_header == null) {
					wilayah = '-';
				} else {
					wilayah = item.wilayah_header;
				}
				if (item.nama_kota == null) {
					nama_kota = '-';
				} else {
					nama_kota = item.nama_kota;
				}
				penjualan_value += '<tr>';
				penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" class="label-cell">' + no_row + '</td>';
				penjualan_value += '<td style="border-bottom:1px solid gray; "  ><center><b>' + moment(item.dt_record).format('DDMMYY') + '-' + item.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></center></td>';
				penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.client_nama + '</td>';
				penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + item.karyawan_nama + '</td>';
				penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
				penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold"  data-popup=".detail-spk-po-produksi"  onclick="spkPo(\'' + item.penjualan_id_primary + '\',\'' + item.performa_id_relation + '\',\'' + item.performa_id_relation + '\',\'' + item.biaya_kirim + '\',\'' + item.client_alamat + '\',\'' + item.client_cp + '\',\'' + item.client_cp_posisi + '\',\'' + item.client_id + '\',\'' + item.client_kota + '\',\'' + item.client_nama + '\',\'' + item.client_telp + '\',\'' + item.jenis_penjualan + '\',\'' + item.karyawan_id + '\',\'' + item.penjualan_global_diskon + '\',\'' + item.penjualan_grandtotal + '\',\'' + item.penjualan_id + '\',\'' + item.penjualan_jumlah_pembayaran + '\',\'' + item.penjualan_keterangan + '\',\'' + item.penjualan_status + '\',\'' + item.penjualan_status_pembayaran + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.penjualan_total + '\',\'' + item.penjualan_void_keterangan + '\',\'' + item.penjualan_total_qty + '\',\'' + item.extra + '\');">Spk PO</button>';
				penjualan_value += '</td>';
				// penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + nama_kota + '</td>';
				penjualan_value += '<td align="left" style="border-right:1px solid gray; border-bottom:1px solid gray; border-left:1px solid gray;" >' + wilayah + '</td>';
				// penjualan_value += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
				// penjualan_value += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button popup-open text-bold" data-popup=".edit-penjualan" onclick="editPenjualan(\'' + item.penjualan_id + '\',\'' + item.penjualan_tanggal + '\',\'' + item.penjualan_tanggal_kirim + '\',\'' + item.client_id + '\',\'' + item.karyawan_id + '\',\'' + item.client_nama + '\',\'' + item.performa_header_id + '\');">Edit</button>';
				// penjualan_value += '</td>';
				penjualan_value += '<td align="center" style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
				penjualan_value += '   <label class="text-add-colour-white"><i style="margin-right:5px;" class="f7-icons" onclick="updateStatusViewProduksi(\'' + item.penjualan_id + '\',1);">eye</i></label>';
				penjualan_value += '</td>';
				penjualan_value += '</tr>';
			});

			jQuery('#data_status_view_manager').html(penjualan_value);

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function updateStatusViewProduksi(penjualan_id, status_view) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/update-status-view-notif-produksi",
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id,
			status_view: status_view
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			app.popup.close();
			openDialogViewProduksi();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function updateStatusViewProduksiSpk() {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/update-status-view-notif-produksi",
		dataType: 'JSON',
		data: {
			penjualan_id: jQuery("#penjualan_id_eye").val(),
			status_view: 1
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			$('#close-detail-spk-po-produksi').click();
			openDialogViewProduksi();
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function editPenjualan(penjualan_id, penjualan_tanggal, penjualan_tanggal_kirim, client_id, karyawan_id, client_nama, performa) {
	localStorage.setItem("penjualan_id", penjualan_id);
	localStorage.setItem("performa", performa);
	$('#id_penjualan_edit').val(penjualan_id);
	$('#penjualan_tanggal_edit').val(moment(penjualan_tanggal).format('YYYY-MM-DD'));
	$('#penjualan_tanggal_kirim_edit').val(moment(penjualan_tanggal_kirim).format('YYYY-MM-DD'));
	getClientEditPenjualan(client_id, client_nama);
	getDetailPenjualanOwner(penjualan_id);

}

function getClientEditPenjualan(client_id, client_nama) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-client-owner",
		dataType: "JSON",
		data: {
			user_id: localStorage.getItem("user_id")
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			var select_box_client_id;
			jQuery.each(data.data, function (i, val) {
				if (client_id == val.client_id) {
					select_box_client_id += '<option selected value="' + val.client_id + '">' + val.client_nama + ' | ' + val.client_kota + '</option>';
				} else {
					select_box_client_id += '<option value="' + val.client_id + '">' + val.client_nama + ' | ' + val.client_kota + '</option>';
				}

				if (client_id == val.client_id) {
					$$('.item-title-edit-penjualan').html(val.client_nama + ' | ' + val.client_kota);
				}
			});
			$$('#client_id_edit_penjualan').html(select_box_client_id);
		}
	});

}

function getDetailPenjualanOwner(penjualan_id) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/get-detail-penjualan-owner",
		dataType: "JSON",
		data: {
			penjualan_id: penjualan_id
		},
		beforeSend: function () {
		},
		success: function (data) {
			var detail_penjualan_val = "";
			jQuery.each(data.data, function (i, item) {
				detail_penjualan_val += '<tr>';

				detail_penjualan_val += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="20%">' + item.penjualan_jenis + '</td>';
				detail_penjualan_val += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="7%">' + item.penjualan_qty + '</td>';
				detail_penjualan_val += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="15%">' + number_format(item.penjualan_harga) + '</td>';
				detail_penjualan_val += '<td align="left" class="label-cell" style="border-bottom :1px solid gray; border-left :1px solid gray;" width="15%">' + number_format(item.penjualan_detail_grandtotal) + '</td>';
				detail_penjualan_val += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
				detail_penjualan_val += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open" data-popup=".edit-detail-manager-penjualan"  onclick="editDetailOwnerPenjualan(\'' + item.penjualan_detail_performa_id + '\');">Edit</button>';
				detail_penjualan_val += '</td>';
				detail_penjualan_val += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="8%">';
				detail_penjualan_val += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"   onclick="hapusDetailPenjualanOwner(\'' + item.penjualan_detail_performa_id + '\',\'' + item.penjualan_id + '\');">Hapus</button>';
				detail_penjualan_val += '</td>';
				detail_penjualan_val += '</tr>';

			});
			$$('#detail_penjualan_val').html(detail_penjualan_val);

		}
	});

}

function editDetailOwnerPenjualan(penjualan_detail_performa_id) {
	jQuery('#penjualan_harga_edit').mask('000,000,000,000', { reverse: true });
	jQuery('#penjualan_detail_grandtotal_edit').mask('000,000,000,000', { reverse: true });

	jQuery('#jenis_edit').val("");
	jQuery('#penjualan_id_edit_2').val("");
	jQuery('#penjualan_detail_performa_id_edit').val("");
	jQuery('#penjualan_qty_edit').val("");
	jQuery('#penjualan_harga_edit').val("");
	jQuery('#penjualan_detail_grandtotal_edit').val("");
	jQuery('#produk_keterangan_custom_edit').val("");
	jQuery('#keterangan_edit').val("");

	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/edit-detail-owner-penjualan-notif-produksi",
		dataType: 'JSON',
		data: {
			penjualan_detail_performa_id: penjualan_detail_performa_id
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			jQuery('#jenis_edit_popup').val(data.data.penjualan_jenis);
			jQuery('#penjualan_id_edit_2').val(data.data.penjualan_id);
			jQuery('#penjualan_detail_performa_id_edit').val(data.data.penjualan_detail_performa_id);
			jQuery('#penjualan_qty_edit').val(data.data.penjualan_qty);
			jQuery('#penjualan_harga_edit').val(number_format(data.data.penjualan_harga));
			jQuery('#penjualan_detail_grandtotal_edit').val(number_format(data.data.penjualan_qty * data.data.penjualan_harga));

			if (data.data.style != null && data.data.style != 'none') {
				var style = val.style;
			} else {
				var style = '';
			}
			if (data.data.produk_keterangan_kustom != null) {
				jQuery('#produk_keterangan_custom_edit').val(style + ' ' + data.data.produk_keterangan_kustom);
			} else {
				jQuery('#produk_keterangan_custom_edit').val("");
			}
			if (data.data.keterangan != null) {
				jQuery('#keterangan_edit').val(data.data.keterangan);
			} else {
				jQuery('#keterangan_edit').val("");
			}
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function spkPo(penjualan_id_primary, performa_id_relation, performa_header_id, biaya_kirim, client_alamat, client_cp, client_cp_posisi, client_id, client_kota, client_nama, client_telp, jenis_penjualan, karyawan_id, penjualan_global_diskon, penjualan_grandtotal, penjualan_id, penjualan_jumlah_pembayaran, penjualan_keterangan, penjualan_status, penjualan_status_pembayaran, penjualan_tanggal, penjualan_tanggal_kirim, penjualan_total, penjualan_void_keterangan, penjualan_total_qty, extra) {
	var invoice_penjualan = '';
	var no_invoice_penjualan = 0;
	var header_koper = "";
	var header_web = "";
	var tipe_grosir = "";

	if (extra == 1) {
		header_koper = 'KOPERINDO';
		header_web = 'www.koperindo.id';
		tipe_grosir = "Xtra"
	} else {
		header_koper = 'INDOKOPER';
		header_web = '';
		tipe_grosir = "Grosir"
	}
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/spk-po-manager",
		dataType: 'JSON',
		data: {
			karyawan_id: jQuery("#sales_id").val(),
			performa_header_id: performa_header_id,
			jenis_penjualan: jenis_penjualan,
			penjualan_id_primary: penjualan_id
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Po');
			invoice_penjualan += '<table width="100%" border="0">';

			// invoice_penjualan += 	'<tr>';
			// invoice_penjualan += '		<td colspan="5"  align="center"><b>' + header_koper + '</b><br>Industri Tas & Koper</td>';
			// invoice_penjualan += '	</tr>';
			// invoice_penjualan += '	<tr>';
			// invoice_penjualan += '		<td colspan="5" align="center">' + header_web + '';
			// invoice_penjualan += '			<hr>';
			// invoice_penjualan += '		</td>';
			// invoice_penjualan += '	</tr>';
			// invoice_penjualan += '	<tr>';
			// invoice_penjualan += '		<td colspan="5" align="center"><h2>SPK</h2><h3 style="color:red;margin-top:-10px">' + tipe_grosir + '</h3></td>';
			// invoice_penjualan += '	</tr>';
			// invoice_penjualan += '	<tr>';
			// invoice_penjualan += '		<td colspan="3" align="left" >Kepada Yth :  ' + client_nama.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + ' <br> <font style="padding:94px;">' + client_kota + '</font></td>';

			// invoice_penjualan += '		<td colspan="2" align="right">' + moment(penjualan_tanggal).format('DDMMYY') + '-' + penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</td>';
			// invoice_penjualan += '	</tr>';
			invoice_penjualan += '	<tr>';
			invoice_penjualan += '		<td style="border-bottom: solid 1px;border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">No</td>';
			invoice_penjualan += '		<td colspan="2" style="border-bottom: solid 1px;border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Spesifikasi</td>';
			invoice_penjualan += '		<td style="border-bottom: solid 1px;border-right: solid 1px;border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Qty</td>';
			// invoice_penjualan += '		<td style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Price Rp.</td>';
			// invoice_penjualan += '		<td style="border-top: solid 1px; border-right: solid 1px; border-left: solid 1px; font-weight:bold;" align="center">Total Rp.</td>';
			invoice_penjualan += '	</tr>';
		},
		success: function (data) {
			app.dialog.close();

			if (data.data.length != 0) {
				jQuery("#nama_invoice_po").html(client_nama.replace(/\PT. /g, '').replace(/\PT/g, '').replace(/\CV. /g, '').replace(/\CV/g, '').replace(/\UD. /g, '').replace(/\UD/g, '') + '(' + client_kota + ')');
				jQuery("#no_invoice_po").html('NO INVOICE : ' + moment(penjualan_tanggal).format('DDMMYY') + '-' + penjualan_id.replace(/\INV_/g, '').replace(/^0+/, ''));

				jQuery('#penjualan_id_eye').val(penjualan_id);

				var penjualan_total = 0;
				var invest_molding = data.data[0].invest_molding;

				invoice_penjualan += '<tbody>';
				jQuery.each(data.data, function (i, val) {
					if (val.style != null && val.style != 'none') {
						var style = val.style.replace(',', '<br>');
					} else {
						var style = '';
					}
					if (!val.keterangan) {
						var ket_item = '';
					} else {

						var ket_item = '<font color="red"><br>KET :<br>' + val.keterangan + '</font>';

					}


					if (val.gambar.substring(0, 5) == "koper") {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/product_image_new';
					} else {
						var path_image = 'https://tasindo-sale-webservice.digiseminar.id/performa_image';
					}

					invoice_penjualan += '		<tr>';
					invoice_penjualan += '			<td width="10%" class="label-cell text-align-left" style="border-bottom: solid 1px; border-left: solid 1px; "><center>' + (no_invoice_penjualan += 1) + '</center></td>';
					invoice_penjualan += '			<td width="35%" class="label-cell text-align-left" style="border-bottom: solid 1px; border-left: solid 1px; "><center>' + val.penjualan_jenis + '<br><img src="' + path_image + '/' + val.gambar + '" width="70%"></center></td>';
					invoice_penjualan += '			<td width="30%" class="label-cell" align="left" style="border-bottom: solid 1px; white-space: pre;">SPESIFIKASI<br>' + val.produk_keterangan_kustom + '<br>' + style + '<br>' + ket_item + '</td>';
					invoice_penjualan += '			<td width="25%" class="label-cell" style="border-bottom: solid 1px; border-left: solid 1px;border-right: solid 1px;">';
					invoice_penjualan += '				<center>' + val.penjualan_qty + '</center>';
					invoice_penjualan += '			</td>';
					// invoice_penjualan += '				<td width="20%" class="label-cell" style="border-top: solid 1px; border-left: solid 1px;">';
					// invoice_penjualan += '					<center>' + number_format(val.penjualan_harga) + '</center>';
					// invoice_penjualan += '				</td>';
					// invoice_penjualan += '				<td width="20%" colspan="2" class="label-cell text-align-center" style="border-top:  solid 1px; border-right: solid 1px; border-left: solid 1px;">';
					// invoice_penjualan += '					<center>' + number_format(val.penjualan_detail_grandtotal) + '</center>';
					// invoice_penjualan += '				</td>';
					invoice_penjualan += '		</tr>';

					penjualan_total += parseInt(val.penjualan_detail_grandtotal);
				});
				invoice_penjualan += '</tbody>';
				// invoice_penjualan += '		<tr>';
				// invoice_penjualan += '			<td colspan="4" style=" border-top: solid 1px; font-weight:bold;" align="right"></td>';
				// invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
				// invoice_penjualan += '				Total';
				// invoice_penjualan += '			</td>';
				// invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
				// invoice_penjualan += '			<font style="float:right;">' + number_format(penjualan_total) + '</font>';
				// invoice_penjualan += '			</td>';
				// invoice_penjualan += '		</tr>';
				// if (number_format(data.data[0].invest_molding) != 0) {
				// 	invoice_penjualan += '		<tr>';
				// 	invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
				// 	invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
				// 	invoice_penjualan += '				Molding';
				// 	invoice_penjualan += '			</td>';
				// 	invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
				// 	invoice_penjualan += '				 <font style="float:right; ">' + number_format(invest_molding) + '</font>';
				// 	invoice_penjualan += '			</td>';
				// 	invoice_penjualan += '		</tr>';
				// }
				// if (number_format(data.data[0].pembayaran_1) != 0) {
				// 	invoice_penjualan += '		<tr>';
				// 	invoice_penjualan += '			<td colspan="4" style="  font-weight:bold;" align="right"></td>';
				// 	invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
				// 	invoice_penjualan += '				Deposit';
				// 	invoice_penjualan += '			</td>';
				// 	invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; font-weight:bold;" align="left">';
				// 	invoice_penjualan += '			<font style="float:right; ">' + number_format(data.data[0].pembayaran_1) + '</font>';
				// 	invoice_penjualan += '			</td>';
				// 	invoice_penjualan += '		</tr>';
				// }
				// if (number_format(data.data[0].biaya_kirim) != 0) {
				// 	//invoice_penjualan += '		<tr>';
				// 	//invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
				// 	//invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; font-weight:bold;" align="left">';
				// 	//invoice_penjualan += '				Biaya Kirim';
				// 	//invoice_penjualan += '			</td>';
				// 	//invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px;  font-weight:bold;" align="left">';
				// 	//invoice_penjualan += '			<font style="float:right;">' + number_format(biaya_kirim) + '</font>';
				// 	//invoice_penjualan += '			</td>';
				// 	//invoice_penjualan += '		</tr>';
				// }


				// invoice_penjualan += '		<tr>';
				// invoice_penjualan += '			<td colspan="4" style="font-weight:bold;" align="right"></td>';
				// invoice_penjualan += '			<td colspan="1" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
				// invoice_penjualan += '				Jumlah';
				// invoice_penjualan += '			</td>';
				// invoice_penjualan += '			<td colspan="1" style=" border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" align="left">';
				// if (number_format(data.data[0].pembayaran_1) != 0) {
				// 	invoice_penjualan += '			 <font style="float:right;">' + number_format(parseFloat(penjualan_total) - parseFloat(data.data[0].pembayaran_1)) + '</font>';
				// } else {
				// 	invoice_penjualan += '			 <font style="float:right;">' + number_format(parseFloat(penjualan_total)) + '</font>';

				// }
				// invoice_penjualan += '			</td>';
				// invoice_penjualan += '		</tr>'

				invoice_penjualan += '		<tr>';
				invoice_penjualan += '			<td colspan="5"></td>';
				invoice_penjualan += '		</tr>';
				invoice_penjualan += '	</table>';

				invoice_penjualan += '	<table width="100%" border="0">';
				invoice_penjualan += '      <tr>';
				invoice_penjualan += '          <td style="border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Logo Emblem</td>';
				invoice_penjualan += '          <td style="border-top: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="34%" align="center">Logo Bordir</td>';
				invoice_penjualan += '          <td style="border-top: solid 1px;  border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Logo Tambah</td>';
				invoice_penjualan += '      </tr>';
				invoice_penjualan += '      <tr>';
				invoice_penjualan += '          <td style=" border-left: solid 1px; border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://tasindo-sale-webservice.digiseminar.id/customer_logo/' + data.data[0].customer_logo + '" width="80%" /></td>';

				if (data.data[0].customer_logo_bordir != "") {
					invoice_penjualan += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://tasindo-sale-webservice.digiseminar.id/customer_logo/' + data.data[0].customer_logo_bordir + '" width="80%" /> </td>';
				} else {
					invoice_penjualan += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Tidak Ada Gambar</td>';

				}

				if (data.data[0].customer_logo_tambahan != "") {
					invoice_penjualan += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center"><img src="https://tasindo-sale-webservice.digiseminar.id/customer_logo/' + data.data[0].customer_logo_tambahan + '" width="80%" /> </td>';
				} else {
					invoice_penjualan += '          <td style=" border-right: solid 1px; border-bottom: solid 1px; font-weight:bold;" width="33%" align="center">Tidak Ada Gambar</td>';

				}

				invoice_penjualan += '      </tr>';
				invoice_penjualan += '	</table>';



			}


			$$('#data-detail-spk-po').html(invoice_penjualan);
			// let options = {
			// 	documentSize: 'A4',
			// 	type: 'share',
			// 	fileName: 'report_' + client_nama + '.pdf'
			// }

			// pdf.fromData(invoice_penjualan, options)
			// 	.then((stats) => console.log('status', stats))
			// 	.catch((err) => console.err(err))

			// console.log(invoice_penjualan);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function editDetailOwnerPenjualanProses() {
	if (!$$('#edit_penjualan_detail_manager_form')[0].checkValidity()) {
		app.dialog.alert('Cek Isian Form Anda');
	} else {
		var formData = new FormData(jQuery("#edit_penjualan_detail_manager_form")[0]);
		formData.append('penjualan_id', $('#penjualan_id_edit_2').val());
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/edit-detail-manager-penjualan-proses",
			dataType: 'JSON',
			data: formData,
			contentType: false,
			processData: false,
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();
				$("#color_penjualan_edit_1").css("display", "none");
				$("#gambar_penjualan_edit_1").css("display", "none");
				$('#backbutton_owner').click();
				$('#edit_penjualan_detail_manager_form')[0].reset();
				getDetailPenjualanOwner($('#penjualan_id_edit_2').val());
				getPenjualanHeader(1);
			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}
}

function hapusDetailPenjualanOwner(penjualan_detail_performa_id_hapus, penjualan_id_hapus) {
	app.dialog.create({
		title: 'Hapus Client',
		text: 'Apakah Anda Yakin Menghapus Item Penjualan ini ? ',
		cssClass: 'custom-dialog',
		closeByBackdropClick: 'true',
		buttons: [
			{
				text: 'Ya',
				onClick: function () {
					jQuery.ajax({
						type: 'POST',
						url: "" + BASE_API + "/hapus-detail-penjualan-manager",
						dataType: 'JSON',
						data: {
							penjualan_detail_performa_id_hapus: penjualan_detail_performa_id_hapus,
							penjualan_id_hapus: penjualan_id_hapus
						},
						beforeSend: function () {
							app.dialog.preloader('Harap Tunggu');
						},
						success: function (data) {
							app.dialog.close();
							getDetailPenjualanOwner(penjualan_id_hapus);
							getPenjualanHeader(1);

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

// Tambah Penjualan
function doSearchByTypeTambahPopup(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		var tipe = jQuery('#jenis_tambah_popup').val();
		getKatalogTambahPopup(tipe);
	}, 2000);
}

function getKatalogTambahPopup(tipe) {
	if (tipe == "") {
		$$('#gambar_penjualan_tambah_1').css("display", "initial");
		$$('#color_penjualan_tambah_1').css("display", "none");
		$$('#type_penjualan_tambah_1').removeClass('col-100');
		$$('#type_penjualan_tambah_1').addClass('col-70');
	} else {
		var count = 1;
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/get-produk-proforma",
			dataType: 'JSON',
			data: {
				jenis_1: tipe.substr(3, 3)
			},
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();

				if (tipe.indexOf("HCC") != -1) {
					$$('#gambar_penjualan_tambah_1').css("display", "initial");
					$$('#color_penjualan_tambah_1').css("display", "none");
					$$('#type_penjualan_tambah_1').removeClass('col-100');
					$$('#type_penjualan_tambah_1').addClass('col-70');
					$$('#file_tambah_1').prop('required', true)
					$$('#file_tambah_1').prop('validate', true)
				} else if (tipe.indexOf("HC") != -1) {
					if (tipe.length >= 9) {
						if (data.data.length != 0) {
							$("#openPopupTambah_1").click();
							getKatalogPopupTambah(tipe.substr(3, 3));
							$$('#color_penjualan_tambah_1').css("display", "none");
							$$('#gambar_penjualan_tambah_1').css("display", "none");
							$$('#file_tambah_1').prop('required', false)
							$$('#file_tambah_1').prop('validate', false)
						} else {
							app.dialog.alert('Tidak Ada HC Dengan Tipe Ini');
							$$('#color_penjualan_tambah_1').css("display", "none");
							$$('#gambar_penjualan_tambah_1').css("display", "none");
							$$('#file_tambah_1').prop('required', false)
							$$('#file_tambah_1').prop('validate', false)
						}
					} else {
						app.dialog.alert('Panjang Huruf Tipe HC 9 Digit, Contoh : (HC-112.18)');
						$$('#gambar_penjualan_tambah_1').css("display", "initial");
						$$('#color_penjualan_tambah_1').css("display", "none");
						$$('#type_penjualan_tambah_1').removeClass('col-100');
						$$('#type_penjualan_tambah_1').addClass('col-70');
						$$('#jenis_tambah_popup').val("");
						$$('#file_tambah_1').prop('required', true)
						$$('#file_tambah_1').prop('validate', true)

					}
				} else {
					$$('#gambar_penjualan_tambah_1').css("display", "initial");
					$$('#color_penjualan_tambah_1').css("display", "none");
					$$('#type_penjualan_tambah_1').removeClass('col-100');
					$$('#type_penjualan_tambah_1').addClass('col-70');
					$$('#file_tambah_1').prop('required', true)
					$$('#file_tambah_1').prop('validate', true)
				}


			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}
}

function getKatalogPopupTambah(tipe) {
	var katalog_data = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-produk-proforma",
		dataType: 'JSON',
		data: {
			jenis_1: tipe
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			$.each(data.data, function (i, item) {

				katalog_data += '<div class="col-50" style="margin:4px;">';
				katalog_data += '<div class="text-bold block-title text-align-center" style="background-color:white; color:black;  padding:-20px; margin: 0px;  border-radius:14px;">';
				katalog_data += '   <img onclick="fillPenjualanTambahPopup(\'' + item.produk_detail_id + '\',\'' + item.kode_warna + '\',\'' + item.produk_id + '\');" src="' + BASE_PATH_IMAGE_PRODUCT_NEW + '/' + item.foto_depan + '" height="100%" width="100%" />';
				katalog_data += '  <h3 style="margin-top:2px;margin-bottom:5px;">' + item.produk_id + '</h3>';
				katalog_data += '  <h3 style="margin-top:2px;margin-bottom:5px;">' + item.nama_warna + '</h3>';
				katalog_data += ' <div style="margin-left:auto;margin-right:auto;">';
				katalog_data += '  <div style="margin-left:auto;margin-right:auto;margin-bottom:10px;width:100px;height:20px;background-color:' + item.kode_warna + '"></div>';
				katalog_data += ' </div>';
				katalog_data += '</div>';
				katalog_data += ' </div>';

			});

			app.dialog.close();
			jQuery('#katalog_data_tambah').html(katalog_data);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function fillPenjualanTambahPopup(produk_detail_id, kode_warna, produk_id) {

	$("#close-katalog-popup-tambah").click();
	$$('#color_penjualan_tambah_1').css("display", "inline");
	$$('#type_penjualan_tambah_1').removeClass('col-100');
	$$('#type_penjualan_tambah_1').addClass('col-70');

	$$('#color_tambah_popup_1').html('<div id="penjualan_color_tambah_popup_1" data-color="' + kode_warna + '" style="margin:5px;text-align:center;height:25px;background-color:' + kode_warna + '"></div>');
	$$('#penjualan_produk_detail_tambah_id_1').val(produk_detail_id);
	$$('#penjualan_produk_tambah_id_1').val(produk_id);
	// $$('#jenis_1').val(produk_id);

}

function gambarPenjualanTambahPopup(penjualan_table_id) {
	if (jQuery('#file_tambah_' + penjualan_table_id + '').val() == '' || jQuery('#file_tambah_' + penjualan_table_id + '').val() == null) {
		$$('#value_penjualan_tambah_' + penjualan_table_id + '').html('Gambar');
	} else {
		$$('#value_penjualan_tambah_' + penjualan_table_id + '').html($$('#file_tambah_' + penjualan_table_id + '').val().replace('fakepath', ''));
	}
}

function tambaHeaderPenjualanProses() {
	var formData = new FormData(jQuery("#tambah_header_penjualan_popup")[0]);
	formData.append('penjualan_id', localStorage.getItem("penjualan_id"));
	formData.append('performa', localStorage.getItem("penjualan_id"));
	if (localStorage.getItem("internet_koneksi") == 'fail') {
		app.dialog.alert('<font style="font-size:22px; color:white; font-weight:bold;">Gagal,Internet Tidak Stabil,Box Koneksi Harus Berwarna Hijau', function () {

		});
	} else {
		if (!$$('#tambah_header_penjualan_popup')[0].checkValidity()) {
			app.dialog.alert('Cek Isi Form Anda');
		} else {

			jQuery.ajax({
				type: 'POST',
				url: "" + BASE_API + "/tambah-penjualan-proses",
				dataType: 'JSON',
				data: formData,
				contentType: false,
				processData: false,
				beforeSend: function () {
					app.dialog.preloader('Harap Tunggu');
				},
				success: function (data) {
					app.dialog.close();
					$("#color_penjualan_tambah_1").css("display", "none");
					$("#gambar_penjualan_tambah_1").css("display", "none");
					$('#back_button_tambah_penjualan').trigger('click');
					$('#tambah_header_penjualan_popup')[0].reset();
					getDetailPenjualanOwner(localStorage.getItem("penjualan_id"));
					getPenjualanHeader(1);
				},
				error: function (xmlhttprequest, textstatus, message) {
				}
			});
		}
	}
}

//edit

function doSearchByTypeEdit(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		var tipe = jQuery('#jenis_edit_popup').val();
		getKatalogEdit(tipe);
	}, 2000);
}

function getKatalogEdit(tipe) {
	if (tipe == "") {
		$$('#gambar_penjualan_input_1').css("display", "initial");
		$$('#color_penjualan_input_1').css("display", "none");
		$$('#type_penjualan_input_1').removeClass('col-100');
		$$('#type_penjualan_input_1').addClass('col-70');
	} else {
		var count = 1;
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/get-produk-proforma",
			dataType: 'JSON',
			data: {
				jenis_1: tipe.substr(3, 3)
			},
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();

				if (tipe.indexOf("HCC") != -1) {
					$$('#gambar_penjualan_edit_1').css("display", "initial");
					$$('#color_penjualan_edit_1').css("display", "none");
					$$('#type_penjualan_edit_1').removeClass('col-100');
					$$('#type_penjualan_edit_1').addClass('col-70');
					$$('#file_edit_1').prop('required', true)
					$$('#file_edit_1').prop('validate', true)
				} else if (tipe.indexOf("HC") != -1) {
					if (tipe.length >= 9) {
						if (data.data.length != 0) {
							$("#openPopupEdit_1").click();
							getKatalogPopupEdit(tipe.substr(3, 3));
							$$('#color_penjualan_edit_1').css("display", "none");
							$$('#gambar_penjualan_edit_1').css("display", "none");
							$$('#file_edit_1').prop('required', false)
							$$('#file_edit_1').prop('validate', false)
						} else {
							app.dialog.alert('Tidak Ada HC Dengan Tipe Ini');
							$$('#color_penjualan_edit_1').css("display", "none");
							$$('#gambar_penjualan_edit_1').css("display", "none");
							$$('#file_edit_1').prop('required', false)
							$$('#file_edit_1').prop('validate', false)
						}
					} else {
						app.dialog.alert('Panjang Huruf Tipe HC 9 Digit, Contoh : (HC-112.18)');
						$$('#gambar_penjualan_edit_1').css("display", "initial");
						$$('#color_penjualan_edit_1').css("display", "none");
						$$('#type_penjualan_edit_1').removeClass('col-100');
						$$('#type_penjualan_edit_1').addClass('col-70');
						$$('#jenis_edit_popup').val("");
						$$('#file_edit_1').prop('required', true)
						$$('#file_edit_1').prop('validate', true)

					}
				} else {
					$$('#gambar_penjualan_edit_1').css("display", "initial");
					$$('#color_penjualan_edit_1').css("display", "none");
					$$('#type_penjualan_edit_1').removeClass('col-100');
					$$('#type_penjualan_edit_1').addClass('col-70');
					$$('#file_edit_1').prop('required', true)
					$$('#file_edit_1').prop('validate', true)
				}


			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}
}

function getKatalogPopupEdit(tipe) {
	var katalog_data = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-produk-proforma",
		dataType: 'JSON',
		data: {
			jenis_1: tipe
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			$.each(data.data, function (i, item) {

				katalog_data += '<div class="col-50" style="margin:4px;">';
				katalog_data += '<div class="text-bold block-title text-align-center" style="background-color:white; color:black;  padding:-20px; margin: 0px;  border-radius:14px;">';
				katalog_data += '   <img onclick="fillPenjualanEdit(\'' + item.produk_detail_id + '\',\'' + item.kode_warna + '\',\'' + item.produk_id + '\');" src="' + BASE_PATH_IMAGE_PRODUCT_NEW + '/' + item.foto_depan + '" height="100%" width="100%" />';
				katalog_data += '  <h3 style="margin-top:2px;margin-bottom:5px;">' + item.produk_id + '</h3>';
				katalog_data += '  <h3 style="margin-top:2px;margin-bottom:5px;">' + item.nama_warna + '</h3>';
				katalog_data += ' <div style="margin-left:auto;margin-right:auto;">';
				katalog_data += '  <div style="margin-left:auto;margin-right:auto;margin-bottom:10px;width:100px;height:20px;background-color:' + item.kode_warna + '"></div>';
				katalog_data += ' </div>';
				katalog_data += '</div>';
				katalog_data += ' </div>';

			});

			app.dialog.close();
			jQuery('#katalog_data_edit').html(katalog_data);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function fillPenjualanEdit(produk_detail_id, kode_warna, produk_id) {

	$("#close-katalog-popup-edit").click();
	$$('#color_penjualan_edit_1').css("display", "inline");
	$$('#type_penjualan_edit_1').removeClass('col-100');
	$$('#type_penjualan_edit_1').addClass('col-70');

	$$('#color_edit_1').html('<div id="penjualan_color_edit_1" data-color="' + kode_warna + '" style="margin:5px;text-align:center;height:25px;background-color:' + kode_warna + '"></div>');
	$$('#penjualan_produk_detail_edit_id_1').val(produk_detail_id);
	$$('#penjualan_produk_id_edit_1').val(produk_id);
	// $$('#jenis_1').val(produk_id);

}

function gambarPenjualanEdit(penjualan_id) {
	if (jQuery('#file_edit_' + penjualan_id + '').val() == '' || jQuery('#file_edit_' + penjualan_id + '').val() == null) {
		$$('#value_penjualan_edit_' + penjualan_id + '').html('Gambar');
	} else {
		$$('#value_penjualan_edit_' + penjualan_id + '').html($$('#file_edit_' + penjualan_id + '').val().replace('fakepath', ''));
	}
}

function getDataProduksiCabangPusatSpk() {

	if (jQuery('#perusahaan_produksi_filter').val() == '' || jQuery('#perusahaan_produksi_filter').val() == null) {
		perusahaan_produksi_value = "empty";
	} else {
		perusahaan_produksi_value = jQuery('#perusahaan_produksi_filter').val();
	}

	if (jQuery('#type_produksi_filter').val() == '' || jQuery('#type_produksi_filter').val() == null) {
		type_produksi_filter = "empty";
	} else {
		type_produksi_filter = jQuery('#type_produksi_filter').val();
	}

	if (jQuery('#warna_produksi_filter').val() == '' || jQuery('#warna_produksi_filter').val() == null) {
		warna_produksi_filter = "empty";
	} else {
		warna_produksi_filter = jQuery('#warna_produksi_filter').val();
	}

	if (jQuery('#range-produksi-cabang').val() == '' || jQuery('#range-produksi-cabang').val() == null) {
		var startdate = "empty";
		var enddate = "empty";
	} else {
		var startdate_new = new Date(calendarRangeProduksiSelesai.value[0]);
		var enddate_new = new Date(calendarRangeProduksiSelesai.value[1]);
		var startdate = moment(startdate_new).add(5, 'days').format('YYYY-MM-DD');
		var enddate = moment(enddate_new).add(5, 'days').format('YYYY-MM-DD');
	}

	var data_produksi = '';
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-data-produksi-cabang-api-new",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			cabang_pembantu: localStorage.getItem("server_pilihan_pabrik"),
			perusahaan_produksi_value: perusahaan_produksi_value,
			type_produksi_filter: type_produksi_filter,
			warna_produksi_filter: warna_produksi_filter,
			startdate: startdate,
			enddate: enddate,
			year: jQuery('#point_year_produksi_selesai').val()
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi, Harap Tunggu');
			jQuery('#produk_data').html('');
		},
		success: function (data) {
			app.dialog.close();
			console.log(data.data);
			if (data.data.length != 0) {
				var nota = '';
				var nomor = 1;
				var warna = '';
				var warna_telat = '';
				var warna_button_packing = '';
				var now = moment();
				jQuery.each(data.data, function (i, val) {

					var color_urgent_blink = '';
					var date_urgent = '';
					if (val.tgl_cs_deadline != null) {
						color_urgent_blink = 'card-color-red announcement';
						date_urgent = moment(val.penjualan_tanggal_kirim).subtract(5, 'days').format('DD-MMM');
					} else {
						color_urgent_blink = '';
						date_urgent = moment(val.penjualan_tanggal_kirim).subtract(5, 'days').format('DD-MMM');
					}

					console.log(val.penjualan_qty);
					if (val.total_terima_pabrik < val.penjualan_qty) {
						warna = "";
						warna_telat = "";
						if (val.status_produksi == 'proses') {
							warna = "linear-gradient(#4a8a4a , forestgreen); /* Standard syntax */ background: -webkit-linear-gradient(#4a8a4a , forestgreen); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#4a8a4a , forestgreen); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#4a8a4a , forestgreen); /* For Firefox 3.6 to 15 */ color:white;";
						} else if (val.status_produksi == 'selesai') {
							warna = "linear-gradient(#067afb , #002b46); /* Standard syntax */ background: -webkit-linear-gradient(#067afb , #002b46); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#067afb , #002b46); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#067afb , #002b46); /* For Firefox 3.6 to 15 */ color:white;";
						} else if (val.status_produksi == 'body') {
							warna = "linear-gradient(#c5a535  , #cf8600); /* Standard syntax */ background: -webkit-linear-gradient(#c5a535 , #cf8600); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#c5a535 , #cf8600); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#c5a535 , #cf8600); /* For Firefox 3.6 to 15 */ color:white;";
						}

						if (nota != val.penjualan_id) {

							if (now >= moment(val.penjualan_tanggal_kirim).subtract(5, 'days')) {
								data_produksi += ' <tr>';
								if (val.tgl_cs_deadline != null) {
									var warna_telat = '';
								} else {
									warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
								}
							} else {
								data_produksi += ' <tr>';
							}
							console.log(warna);
							nota = val.penjualan_id;

							var color_shipment_blink = '';
							if (val.packing == 'polos') {
								if (val.alamat_kirim_penjualan != null) {
									color_shipment_blink = 'announcement btn-color-greenWhite';
									warna_button_packing = '<button class="announcement btn-color-greenWhite text-add-colour-black-soft button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang-pusat" onclick="shipmentNotifCabangPusat(\'' + val.penjualan_id + '\')"></button>';
								} else {
									color_shipment_blink = '';
									warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold"></button>';
								}
							} else if (val.packing == 'plastik') {
								if (val.alamat_kirim_penjualan != null) {
									color_shipment_blink = 'announcement btn-color-greenWhite';
									warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang-pusat" onclick="shipmentNotifCabangPusat(\'' + val.penjualan_id + '\')">Plastik</button>';
								} else {
									color_shipment_blink = '';
									warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold">Plastik</button>';
								}
							} else if (val.packing == 'kardus') {
								if (val.alamat_kirim_penjualan != null) {
									color_shipment_blink = 'announcement btn-color-greenWhite';
									warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang-pusat" onclick="shipmentNotifCabangPusat(\'' + val.penjualan_id + '\')">Kardus</button>';
								} else {
									color_shipment_blink = '';
									warna_button_packing = '<button class="card-color-brown button-small col button text-bold">Kardus</button>';
								}
							} else {
								color_shipment_blink = '';
								warna_button_packing = '';
							}

							data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;padding:3px;" class="label-cell"  align="left" >';
							data_produksi += '    ' + warna_button_packing + '  ';
							data_produksi += '  </td>';
							data_produksi += '  <td align="left" style="padding:4px !important; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell" width="5.4%" >' + (nomor++) + '</td>';
							data_produksi += '  <td  align="left" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell ' + color_urgent_blink + '"  width="7.9%">' + date_urgent + '</td>';
							data_produksi += '  <td   align="left" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang-pusat" width="9.9%"><font  style="color:white;"  onclick="detailPenjualanProduksiCabangPusat(\'' + val.penjualan_detail_performa_id + '\')" class="text-add-colour-black-soft"  ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';

							data_produksi += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  align="left" width="18.8%">' + val.client_nama + '</td>';
						} else {
							data_produksi += ' <tr>';
							data_produksi += '  <td style="  border-color:gray;" class="label-cell"  colspan="5"></td>';
						}

						if (now >= moment(val.penjualan_tanggal_kirim).subtract(5, 'days')) {
							var warna_telat2 = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
						} else {
							var warna_telat2 = '';

						}


						data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; ' + warna_telat2 + ' border-color:gray;" class="label-cell"   align="left" width="11,3%"  ><font onclick="detail_button_cabang_pusat(\'' + i + '\',\'produksi\');">' + val.penjualan_jenis + '</font>';

						data_produksi += '<a id="button_body_' + i + '" onclick="getDataFotoProduksiSelesaiPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_body + '\',\'body\')"  data-popup=".produksi-selesai-foto-pusat" class="button-small col button popup-open" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: orange; color:white;';
						data_produksi += '"> <center>Body</center> </a>';
						data_produksi += '<a id="button_proses_' + i + '" onclick="getDataFotoProduksiSelesaiPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_proses + '\',\'proses\')"  data-popup=".produksi-selesai-foto-pusat" class="button-small col button popup-open" style="margin-top:7px; display:none;width:100%; border-radius: 10px;background-color: green; color:white;';
						data_produksi += '"> <center>Proses</center> </a>';
						data_produksi += '<br><a id="button_selesai_' + i + '" onclick="getDataFotoProduksiSelesaiPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_selesai + '\',\'selesai\')"  data-popup=".produksi-selesai-foto-pusat" class="button-small col button popup-open" style="margin-top:-16px; display:none;width:100%; background-color: blue; border-radius: 10px; color:white;"> <center>Selesai</center> </a> ';

						data_produksi += '</td>';
						if (val.style != null && val.style != 'none') {
							var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
						} else {
							var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
						}

						data_produksi += '  <td  style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="right" width="7%">' + val.penjualan_qty + '</td>';
						data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;  background:' + warna + ';" class="label-cell"  align="left" width="18%" ><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan-cabang-pusat" onclick="keteranganCustomCabangPusat(\'' + val.penjualan_detail_performa_id + '\')">' + spesifikasi + '</font></td>';

						if (val.keterangan == null || val.keterangan == "") {
							data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray; " class="label-cell"  align="center" width="18%">-</td>';

						} else {
							var str = val.keterangan;
							if (str.length > 15) {
								var truncated = str.substring(0, 15);
								data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"  width="18%" ><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang-pusat" onclick="keteranganCabangPusat(\'' + val.penjualan_detail_performa_id + '\')" >' + truncated + '<span style="font-size:25px;"> .....</span></p></td>';
							} else {
								data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"  width="18%" ><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang-pusat" onclick="keteranganCabangPusat(\'' + val.penjualan_detail_performa_id + '\')" >' + str + '</p></td>';
							}
						}
						//	data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;" class="label-cell"  align="left" width="11,3%">';

						//	data_produksi += '<button onclick="resetStatusProduksiCabang(\'' + val.penjualan_detail_performa_id + '\');"  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold">Reset</button>';

						//data_produksi += '</td>';

						data_produksi += '  <td style=" background:' + warna + ';  border-left: solid  gray 1px;   border-bottom: solid  gray 1px; " class="label-cell"  align="center"  width="12%" >';
						data_produksi += '' + (parseFloat(val.penjualan_qty) - parseFloat(val.stok)) - parseFloat(val.total_terima_pabrik) + '';
						data_produksi += '  </td>	';
						var wilayah = "";
						if (val.wilayah != null) {
							wilayah = val.wilayah;
						} else {
							wilayah = '-';
						}

						// data_produksi += '  <td class="label-cell" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;"><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"  data-popup=".input-alamat-kirim-cabang-pusat" onclick="shipmentNotifCabangPusat(\'' + val.penjualan_id + '\')">Shipment</a></td>';

						// if (val.status_produksi == 'selesai') {
						// if (val.foto_produksi_sjc != null) {
						// 	data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang-pusat" onclick="getDataFotoSjcSelesaiCabangPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button style="color:white;" class="card-color-blue button-small col button text-bold">SJC</button></td>';
						// } else {
						// 	data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang-pusat" onclick="getDataFotoSjcSelesaiCabangPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold">SJC</button></td>';
						// }
						// 	if (val.foto_produksi_selesai != null) {
						// 		data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-selesai-foto-pusat" onclick="getDataFotoProduksiSelesaiPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_selesai + '\')"><button style="background-color:#0355a7; color:white;" class="button-small col button text-bold">Foto</button></td>';
						// 	} else {
						// 		data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-selesai-foto-pusat" onclick="getDataFotoProduksiSelesaiPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_selesai + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold">Upload</button></td>';
						// 	}
						// } else {
						// 	data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" ></td>';

						// }

						// data_produksi += '  <td  style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="center" width="7%">' + wilayah + '</td>';
						data_produksi += '<td>';

						if (val.bantuan_cabang != null) {
							var bg_color_select = 'background-color:#b20000; color:white;';

						} else {
							var bg_color_select = 'background-color:#121212; color:white;';
						}


						data_produksi += '	<select onchange="rubahCabangBantuanPusatSpk(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\');" style="width:100%; float:center; ' + bg_color_select + '" name="bantuan_cabang_pusat_spk_' + val.penjualan_detail_performa_id + '" id="bantuan_cabang_pusat_spk_' + val.penjualan_detail_performa_id + '"  >';

						data_produksi += '	<option value="">Cabang</option>';

						jQuery.each(data.cabang_pembantu, function (i, cabang_pembantu_value) {
							if (val.bantuan_cabang == cabang_pembantu_value.nama_cabang) {
								data_produksi += '	<option value="' + cabang_pembantu_value.nama_cabang + '" selected>' + cabang_pembantu_value.text_cabang + '</option>';
							} else {
								data_produksi += '	<option value="' + cabang_pembantu_value.nama_cabang + '" >' + cabang_pembantu_value.text_cabang + '</option>';

							}
						});

						data_produksi += '  </select>';

						data_produksi += '</td>';

						data_produksi += ' </tr>';
					}
				});
			} else {
				data_produksi += ' <tr>';
				data_produksi += ' <td colspan="8">';
				data_produksi += ' <center> Data Kosong </center>';
				data_produksi += ' </td>';
				data_produksi += ' </tr>';

			}
			jQuery('#produk_data_cabang_pusat_spk').html(data_produksi);



			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {


		}
	});
}


function updateFotoProduksiSelesaiProcessPusat() {
	var status = jQuery('#status_produksi_pusat').val();
	var title = 'Ubah Status Produksi';
	var text = 'Ubah Status Produksi Menjadi (' + status + ') ? ';

	app.dialog.create({
		title: title,
		text: text,
		cssClass: 'custom-dialog',
		closeByBackdropClick: 'true',
		buttons: [
			{
				text: 'Ya',
				onClick: function () {
					if ($('#file_foto_produksi_pusat').val() != "") {
						var formData = new FormData(jQuery("#upload_foto_produksi_selesai_pusat")[0]);
						formData.append('penjualan_detail_performa_id_foto_produksi_selesai_pusat', jQuery('#penjualan_detail_performa_id_foto_produksi_selesai_pusat').val());
						var file = $('#file_foto_produksi_pusat').get(0).files[0];
						formData.append('file_foto_produksi', file);
						formData.append('status_produksi', status);
						formData.append('penjualan_id', jQuery('#penjualan_id_produksi_pusat').val());

						jQuery.ajax({
							type: "POST",
							url: "" + BASE_API + "/update-file-foto-produksi-cabang-new",
							dataType: "JSON",
							data: formData,
							contentType: false,
							processData: false,
							xhr: function () {
								var dialog = app.dialog.progress('Loading ', 0);
								dialog.setText('0%');
								var xhr = new window.XMLHttpRequest();
								xhr.upload.addEventListener("progress", function (evt) {

									if (evt.lengthComputable) {
										var percentComplete = evt.loaded / evt.total;
										dialog.setProgress(Math.round(percentComplete * 100));
										dialog.setText('' + (Math.round(percentComplete * 100)) + '%');
									}

								}, false);
								return xhr;
							},
							success: function (data) {
								getDataProduksi();
								app.popup.close();
								app.dialog.close();
								if (data.status == 'done') {
									app.dialog.alert('Berhasil update foto');
								} else if (data.status == 'failed') {
									app.dialog.alert('Gagal Update Foto');
								}
							}
						});
					} else {
						app.dialog.alert('Harap Isi Foto');
					}
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

function getDataFotoProduksiSelesaiPusat(penjualan_detail_performa_id, penjualan_id, foto_produksi_selesai, status) {

	var BASE_PATH_IMAGE_BUKTI_PRODUKSI_CABANG = 'https://tasindo-sale-webservice.digiseminar.id/foto_produksi';

	jQuery('#penjualan_detail_performa_id_foto_produksi_selesai_pusat').val(penjualan_detail_performa_id);
	jQuery('#status_produksi_pusat').val(status);
	jQuery('#penjualan_id_produksi_pusat').val(penjualan_id);

	localStorage.removeItem('file_foto_produksi_pusat');
	$('#file_foto_produksi_cabang_view').attr('src', '');
	$('#file_foto_produksi_view_now_pusat').attr('src', '');
	$$(".custom-file-upload-produk-selesai-cabang").show();
	if (foto_produksi_selesai != 'null') {
		jQuery('#file_foto_produksi_view_now_pusat').attr('src', BASE_PATH_IMAGE_BUKTI_PRODUKSI_CABANG + '/' + foto_produksi_selesai);
	} else {
		jQuery('#file_foto_produksi_view_now_pusat').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
	}
}