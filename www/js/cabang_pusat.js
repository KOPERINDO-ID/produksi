function donwloadProduksiSelesaiPopupCabangPusat() {
	if (jQuery('#bulan_popup_produksi_selesai_cabang_pusat').val() == "") {
		var bulan_popup_produksi_selesai = moment().format('M');
		jQuery('#bulan_popup_produksi_selesai_cabang_pusat').val(moment().format('M'));
	} else {
		var bulan_popup_produksi_selesai = jQuery('#bulan_popup_produksi_selesai_cabang_pusat').val();
	}

	if (jQuery('#perusahaan_popup_produksi_filter_cabang_pusat').val() == '' || jQuery('#perusahaan_popup_produksi_filter_cabang_pusat').val() == null) {
		perusahaan_popup_produksi_filter = "empty";
	} else {
		perusahaan_popup_produksi_filter = jQuery('#perusahaan_popup_produksi_filter_cabang_pusat').val();
	}

	var data_produksi = '';
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-data-produksi-selesai-popup-cabang-api",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			bulan_popup_produksi_selesai: bulan_popup_produksi_selesai,
			perusahaan_popup_produksi_filter: perusahaan_popup_produksi_filter,
			server_pilihan_pabrik: localStorage.getItem("server_pilihan_pabrik"),
			cabang_pembantu: 'Surabaya',
			year: jQuery('#point_year_produksi_selesai').val()
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi Selesai, Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			data_produksi += '	<table   cellspacing="1" cellpadding="1"  width="100%">';
			data_produksi += '	<thead class="text-align-center">';
			data_produksi += '		<tr>';
			data_produksi += '			<th colspan="6" style="border-right: solid 1px; border-top: solid 1px; border-left: solid 1px;  " class="label-cell" ><font style="float:left; font-weight:bold; font-size:16px; padding:3px;"> Produksi Selesai : Xinyao</font> <font style="float:right; font-weight:bold; font-size:16px; padding:3px;"> ' + moment(bulan_popup_produksi_selesai).format('MMMM') + '</font></th>';
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
					if (val.total_terima_pabrik >= val.penjualan_qty) {
						var sisa_terima_pabrik = parseFloat(val.penjualan_qty) - parseFloat(val.total_terima_pabrik);


						jumlah_qty_produksi += val.penjualan_qty;

						if (nota != val.penjualan_id) {
							if (now >= moment(val.penjualan_tanggal_kirim).subtract(5, 'days')) {
								data_produksi += ' <tr>';
							} else {
								data_produksi += ' <tr ">';
							}

							nota = val.penjualan_id;
							data_produksi += '  <td style="border-bottom: solid gray 1px; border-left: solid gray 1px; " class="label-cell" width="5.4%" ><center>' + (nomor++) + '</center></td>';
							data_produksi += '  <td style="border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  width="7.9%"><center>' + moment(val.produksi_tanggal_selesai).format('DD-MMM') + '</center></td>';
							data_produksi += '  <td style="border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  width="9.9%"><center><font  class="text-add-colour-black-soft popup-open" data-popup=".detail-sales-produksi" onclick="detailPenjualanProduksi(\'' + val.penjualan_id + '\')"><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></center></td>';
							data_produksi += '  <td style="border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  align="center" width="18.8%">' + val.client_nama + ' | ' + val.client_kota + '</td>';
						} else {
							data_produksi += ' <tr>';
							data_produksi += '  <td style=" border-bottom: solid gray 1px;" class="label-cell"  colspan="4"></td>';
						}



						data_produksi += '  <td  style="border-bottom: solid gray 1px;  border-left: solid gray 1px;" class="label-cell"   align="center" width="11,3%"><font>' + val.penjualan_jenis + '</font>';



						data_produksi += '</td>';


						data_produksi += '  <td  style="border-bottom: solid gray 1px; border-left: solid gray 1px; border-right: solid gray 1px;" class="label-cell" align="right" width="7%">' + val.penjualan_qty + '</td>';

						data_produksi += ' </tr>';


					}
				});
				data_produksi += ' <tr>';
				data_produksi += ' <td colspan="5" style="" class="label-cell">';
				data_produksi += ' </td>';
				data_produksi += ' <td  align="right" style="border-bottom: solid gray 1px; border-left: solid gray 1px;  border-right: solid gray 1px;" class="label-cell">';
				data_produksi += ' ' + jumlah_qty_produksi + '';
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
				fileName: 'produksi_selesai_xinyao_cabang' + moment().format('M') + '.pdf'
			}

			pdf.fromData(data_produksi, options)
				.then((stats) => console.log('status', stats))
				.catch((err) => console.err(err))


		},
		error: function (xmlhttprequest, textstatus, message) {


		}
	});
}

function produksiSelesaiPopupCabangPusat() {

	if (jQuery('#bulan_popup_produksi_selesai_cabang_pusat').val() == "") {
		var bulan_popup_produksi_selesai = moment().format('M');
		jQuery('#bulan_popup_produksi_selesai_cabang_pusat').val(moment().format('M'));
	} else {
		var bulan_popup_produksi_selesai = jQuery('#bulan_popup_produksi_selesai_cabang_pusat').val();
	}

	if (jQuery('#perusahaan_popup_produksi_filter_cabang_pusat').val() == '' || jQuery('#perusahaan_popup_produksi_filter_cabang_pusat').val() == null) {
		perusahaan_popup_produksi_filter = "empty";
	} else {
		perusahaan_popup_produksi_filter = jQuery('#perusahaan_popup_produksi_filter_cabang_pusat').val();
	}


	var data_produksi = '';
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-data-produksi-selesai-popup-cabang-api",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			bulan_popup_produksi_selesai: bulan_popup_produksi_selesai,
			perusahaan_popup_produksi_filter: perusahaan_popup_produksi_filter,
			server_pilihan_pabrik: localStorage.getItem("server_pilihan_pabrik"),
			cabang_pembantu: 'Surabaya',
			year: jQuery('#point_year_produksi_selesai').val()
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi Selesai, Harap Tunggu');
			jQuery('#produksi_selesai_popup_data_cabang_pusat').html('');
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

					if (val.total_terima_pabrik >= val.penjualan_qty) {
						var sisa_terima_pabrik = parseFloat(val.penjualan_qty) - parseFloat(val.total_terima_pabrik);


						jumlah_qty_produksi += val.penjualan_qty;

						if (nota != val.penjualan_id) {
							if (now >= moment(val.penjualan_tanggal_kirim).subtract(5, 'days')) {
								data_produksi += ' <tr>';
							} else {
								data_produksi += ' <tr ">';
							}

							nota = val.penjualan_id;
							data_produksi += '  <td style="border-bottom: solid gray 1px; border-left: solid gray 1px; " class="label-cell" width="5.4%" ><center>' + (nomor++) + '</center></td>';
							data_produksi += '  <td style="border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  width="7.9%"><center>' + moment(val.produksi_tanggal_selesai).format('DD-MMM') + '</center></td>';
							data_produksi += '  <td style="border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  width="9.9%"><center><font  style="color:white;" class="text-add-colour-black-soft" ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></center></td>';
							data_produksi += '  <td style="border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  align="left" width="18.8%">' + val.client_nama + ' | ' + val.client_kota + '</td>';
						} else {
							data_produksi += ' <tr>';
							data_produksi += '  <td style="border-bottom: solid gray 1px;  " class="label-cell"  colspan="4"></td>';
						}



						data_produksi += '  <td  style="border-bottom: solid gray 1px;  border-left: solid gray 1px;" class="label-cell"   align="center" width="11,3%"><font>' + val.penjualan_jenis + '</font>';



						data_produksi += '</td>';


						data_produksi += '  <td  style="border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell" align="right" width="7%">' + val.penjualan_qty + '</td>';

						data_produksi += ' </tr>';


					}
				});
				data_produksi += ' <tr>';
				data_produksi += ' <td colspan="5" style="" class="label-cell">';
				data_produksi += ' </td>';
				data_produksi += ' <td  align="right" style="border-bottom: solid gray 1px; border-left: solid gray 1px; " class="label-cell">';
				data_produksi += ' ' + jumlah_qty_produksi + '';
				data_produksi += ' </td>';
				data_produksi += ' </tr>';
			} else {
				data_produksi += ' <tr>';
				data_produksi += ' <td colspan="5">';
				data_produksi += ' <center> Data Kosong </center>';
				data_produksi += ' </td>';
				data_produksi += ' </tr>';

			}

			jQuery('#produksi_selesai_popup_data_cabang_pusat').html(data_produksi);



			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {


		}
	});
}

function keteranganCabangPusat(penjualan_detail_performa_id) {
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-detail-penjualan-id",
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
			jQuery('#detail_keterangan_cabang_pusat').html('- ' + data.data[0].keterangan.replace(/\r\n|\r|\n/g, "<br />-"));
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function keteranganCustomCabangPusat(penjualan_detail_performa_id) {
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-detail-penjualan-id",
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
				var spesifikasi = '- ' + data.data[0].produk_keterangan_kustom.replace(/\r\n|\r|\n/g, "<br />-") + '<br>- ' + data.data[0].style.replace(',', '<br>- ');
			} else {
				var spesifikasi = '- ' + data.data[0].produk_keterangan_kustom.replace(/\r\n|\r|\n/g, "<br />-");
			}
			jQuery('#detail_custom_keterangan_cabang_pusat').html(spesifikasi);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}



var delayTimer;
function doSearchPopupProduksiByPerusahaanCabangPusat(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		produksiSelesaiPopupCabangPusat();
	}, 1000);
}

var delayTimer;
function doSearchPopupBulanProduksiSelesaiCabangPusat(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		produksiSelesaiPopupCabangPusat();
	}, 100);
}



var delayTimerTypeCabang;
function doSearchProduksiTypeCabangPusat(text) {
	clearTimeout(delayTimerTypeCabang);
	delayTimerTypeCabang = setTimeout(function () {
		getDataProduksiCabangPusat();
	}, 1000);
}

var delayTimerPerusahaanCabang;
function doSearchProduksiByPerusahaanCabangPusat(text) {
	clearTimeout(delayTimerPerusahaanCabang);
	delayTimerPerusahaanCabang = setTimeout(function () {
		getDataProduksiCabangPusat();
	}, 1000);
}

function chooseDataProduksiCabangRedirectPusat(cabang_value) {
	localStorage.setItem('server_pilihan_cabang', 'https://tasindo-sale-webservice.digiseminar.id/api');
	app.views.main.router.navigate(app.views.main.router.currentRoute.url, {
		ignoreCache: true,
		reloadCurrent: true
	});
}

function choosePabrikJakarta(pabrik) {

	if (pabrik == 'Jakarta') {
		localStorage.setItem('server_pilihan_pabrik', pabrik);
		$(".xinyaoFilterCabangBtn").addClass("bg-dark-gray-medium");
		$(".asiaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".milanoFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".genevaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".vienaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".wisdomFilterCabangBtn").removeClass("bg-dark-gray-medium");
	} else if (pabrik == 'Asia') {
		localStorage.setItem('server_pilihan_pabrik', pabrik);
		$(".asiaFilterCabangBtn").addClass("bg-dark-gray-medium");
		$(".xinyaoFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".milanoFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".genevaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".vienaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".wisdomFilterCabangBtn").removeClass("bg-dark-gray-medium");
	} else if (pabrik == 'Milano') {
		localStorage.setItem('server_pilihan_pabrik', pabrik);
		$(".asiaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".xinyaoFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".milanoFilterCabangBtn").addClass("bg-dark-gray-medium");
		$(".genevaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".vienaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".wisdomFilterCabangBtn").removeClass("bg-dark-gray-medium");
	} else if (pabrik == 'Geneva') {
		localStorage.setItem('server_pilihan_pabrik', pabrik);
		$(".asiaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".xinyaoFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".milanoFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".genevaFilterCabangBtn").addClass("bg-dark-gray-medium");
		$(".vienaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".wisdomFilterCabangBtn").removeClass("bg-dark-gray-medium");
	} else if (pabrik == 'Viena') {
		localStorage.setItem('server_pilihan_pabrik', pabrik);
		$(".asiaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".xinyaoFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".milanoFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".genevaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".vienaFilterCabangBtn").addClass("bg-dark-gray-medium");
		$(".wisdomFilterCabangBtn").removeClass("bg-dark-gray-medium");
	} else if (pabrik == 'Wisdom') {
		localStorage.setItem('server_pilihan_pabrik', pabrik);
		$(".asiaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".xinyaoFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".milanoFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".genevaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".vienaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$(".wisdomFilterCabangBtn").addClass("bg-dark-gray-medium");
	}

	getDataProduksiCabangPusat();
}

function chooseDataProduksiCabangPusat(cabang_value) {

	if (typeof localStorage.getItem('server_pilihan_cabang') === "undefined") {
		$(".jakartaFilterCabangBtnPusat").addClass("bg-dark-gray-medium");
		$(".palembangFilterCabangBtn").removeClass("bg-dark-gray-medium");
		$('.nav-jakarta').hide();
	} else {
		if (localStorage.getItem('server_pilihan_cabang') == 'https://tasindo-sale-webservice.digiseminar.id/api') {
			$(".jakartaFilterCabangBtnPusat").addClass("bg-dark-gray-medium");
			$(".palembangFilterCabangBtn").removeClass("bg-dark-gray-medium");
			$('.nav-jakarta').show();
			$(".xinyaoFilterCabangBtn").addClass("bg-dark-gray-medium");
			localStorage.setItem('server_pilihan_pabrik', 'Jakarta');
		} else {
			$('.nav-jakarta').hide();
			$(".palembangFilterCabangBtn").addClass("bg-dark-gray-medium");
			$(".jakartaFilterCabangBtnPusat").removeClass("bg-dark-gray-medium");
		}
	}
	getDataProduksiCabangPusat();
}

function dateRangeDeclarationProduksiCabangPusat() {
	calendarRangeProduksiSelesai = app.calendar.create({
		inputEl: '#range-produksi-cabang',
		rangePicker: true,
		dateFormat: 'dd-mm-yyyy',
		closeOnSelect: true,
		rangePickerMinDays: 2,
		on: {
			close: function () {
				getDataProduksiCabangPusat();
			}
		}
	});
}

function resetStatusProduksiCabang(penjualan_detail_performa_id) {

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
						url: BASE_API + "/reset-status-produksi",
						dataType: 'JSON',
						data: {
							penjualan_detail_performa_id: penjualan_detail_performa_id
						},
						beforeSend: function () {
							app.dialog.preloader('Harap Tunggu');
						},
						success: function (data) {
							app.dialog.close();
							if (data.status == 'done') {
								app.dialog.alert('Berhasil Reset Status Produksi');
								getDataProduksiCabangPusat();
							} else {
								app.dialog.alert('Gagal Reset Status Produksi');
								getDataProduksiCabangPusat();
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

function detail_button_cabang_pusat(id, produksi) {
	if (jQuery('#button_proses_cabang_' + id + '').is(":visible")) {
		jQuery('#button_selesai_cabang_' + id + '').hide();
		jQuery('#button_proses_cabang_' + id + '').hide();
		jQuery('#button_body_cabang_' + id + '').hide();

	} else {
		jQuery('#button_selesai_cabang_' + id + '').show();
		jQuery('#button_proses_cabang_' + id + '').show();
		jQuery('#button_body_cabang_' + id + '').show();
	}
}

function openCameraProduksiSelesaiCabang(id) {
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


function updateFotoProduksiSelesaiProcessCabangPusat() {
	var status = jQuery('#status_produksi_cabang_pusat').val();
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
					if ($('#file_foto_produksi_cabang_pusat').val() != "") {
						var formData = new FormData(jQuery("#upload_foto_produksi_selesai_cabang_pusat")[0]);
						formData.append('penjualan_detail_performa_id_foto_produksi_selesai_pusat', jQuery('#penjualan_detail_performa_id_foto_produksi_selesai_cabang_pusat').val());
						var file = $('#file_foto_produksi_cabang_pusat').get(0).files[0];
						formData.append('file_foto_produksi', file);
						formData.append('status_produksi', status);
						formData.append('penjualan_id', jQuery('#penjualan_id_produksi_cabang_pusat').val());

						jQuery.ajax({
							type: "POST",
							url: BASE_API + "/update-file-foto-produksi-cabang-new",
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
								getDataProduksiCabangPusat();
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

function getDataFotoProduksiSelesaiCabangPusat(penjualan_detail_performa_id, penjualan_id, foto_produksi_selesai, status) {

	var BASE_PATH_IMAGE_BUKTI_PRODUKSI_CABANG = 'https://tasindo-sale-webservice.digiseminar.id/foto_produksi';

	jQuery('#penjualan_detail_performa_id_foto_produksi_selesai_cabang_pusat').val(penjualan_detail_performa_id);
	jQuery('#status_produksi_cabang_pusat').val(status);
	jQuery('#penjualan_id_produksi_cabang_pusat').val(penjualan_id);

	localStorage.removeItem('file_foto_produksi_cabang_pusat');
	$('#file_foto_produksi_cabang_view').attr('src', '');
	$('#file_foto_produksi_view_now_cabang_pusat').attr('src', '');
	$$(".custom-file-upload-produk-selesai-cabang").show();
	if (foto_produksi_selesai != 'null') {
		jQuery('#file_foto_produksi_view_now_cabang_pusat').attr('src', BASE_PATH_IMAGE_BUKTI_PRODUKSI_CABANG + '/' + foto_produksi_selesai);
	} else {
		jQuery('#file_foto_produksi_view_now_cabang_pusat').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
	}
}


function rubahStatusProduksiPusat(penjualan_detail_perofrma_id, penjualan_id, status, menu) {


	if (status == 'selesai') {
		app.dialog.create({
			title: 'Ubah Status Produksi',
			text: 'Ubah Status Produksi Menjadi (Selesai) ? ',
			cssClass: 'custom-dialog',
			closeByBackdropClick: 'true',
			buttons: [
				{
					text: 'Ya',
					onClick: function () {
						jQuery.ajax({
							type: 'POST',
							url: BASE_API + "/update-produksi-status",
							dataType: 'JSON',
							data: {
								id: penjualan_detail_perofrma_id,
								status_produksi: status
							},
							beforeSend: function () {
								app.dialog.preloader('Harap Tunggu');
							},
							success: function (data) {
								app.popover.close();
								app.dialog.close();
								app.popup.close();
								if (menu == 1) {
									getDataProduksiCabangPusatSpk();
								} else {
									getDataProduksiCabangPusat();
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
	} else {
		jQuery.ajax({
			type: 'POST',
			url: BASE_API + "/update-produksi-status",
			dataType: 'JSON',
			data: {
				id: penjualan_detail_perofrma_id,
				status_produksi: status
			},
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.popover.close();
				app.dialog.close();
				app.popup.close();

				getDataProduksiCabangPusat();

			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}

}


function detailPenjualanProduksiCabangPusat(penjualan_detail_performa_id) {
	detail_sales_data = '';
	var server_pilihan_cabang = localStorage.getItem("server_pilihan_cabang");
	var image_server = server_pilihan_cabang.replace('/api', '');
	console.log(image_server);
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-penjualan-detail-performa-produksi-new",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			penjualan_detail_performa_id: penjualan_detail_performa_id
		},
		beforeSend: function () {
			$$('#detail_sales_data_produksi_cabang').html('');
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
						var path_image = '/product_image_new/';
					} else {
						var path_image = '/performa_image/';
					}
					if (val.kode_warna != null) {
						var kode_warna = val.kode_warna;
					} else {
						var kode_warna = '-';
					}
					detail_sales_data += ' <tr>';
					detail_sales_data += '   <td colspan="1" class="label-cell text-align-center" width="40%">' + val.penjualan_jenis + '<br><img data-image-src="' + image_server + path_image + val.gambar + '" class="pb-popup-dark-cabang" src="' + image_server + path_image + val.gambar + '" width="100%"></td>';
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
				detail_sales_data += '  <img onclick="zoom_view(this.src);" width="70%" src="' + image_server + '/customer_logo/' + data.data[0].customer_logo + '" />';
				detail_sales_data += ' </td>';
				detail_sales_data += '</tr>';
				detail_sales_data += ' <tr class="bg-dark-gray-medium">';
				detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
				detail_sales_data += '   Logo Bordir';
				detail_sales_data += ' </td>';
				detail_sales_data += '</tr>';
				detail_sales_data += ' <tr >';
				detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
				detail_sales_data += '  <img onclick="zoom_view(this.src);" width="70%" src="' + image_server + '/customer_logo/' + data.data[0].customer_logo_bordir + '" />';
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
					detail_sales_data += '  <img onclick="zoom_view(this.src);" width="70%" src="' + image_server + '/customer_logo/' + data.data[0].customer_logo_tambahan + '" />';
					detail_sales_data += ' </td>';
					detail_sales_data += '</tr>';
				}
				detail_sales_data += '</table>';




				$$('#detail_sales_data_produksi_cabang_pusat').html(detail_sales_data);
			} else {
				$$('#detail_sales_data_produksi_cabang_pusat').html('<center><h3>Tidak Ada Data</h3></center>');
			}

			$$('.pb-popup-dark-cabang').on('click', function () {
				console.log($$(this).attr("data-image-src-cabang"));
				var gambar_zoom = $$(this).attr("data-image-src-cabang");
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
function getYearProduksiSelesai() {
	let startYear = 2010;
	let endYear = new Date().getFullYear();
	for (i = endYear; i > startYear; i--) {
		if (i == endYear) {
			$('.point_years_produksi_selesai').append($('<option selected />').val(i).html(i));
		} else {
			$('.point_years_produksi_selesai').append($('<option />').val(i).html(i));
		}
	}
}

function getDataProduksiCabangPusat() {

	if (jQuery('#perusahaan_produksi_filter_cabang_pusat').val() == '' || jQuery('#perusahaan_produksi_filter_cabang_pusat').val() == null) {
		perusahaan_produksi_value = "empty";
	} else {
		perusahaan_produksi_value = jQuery('#perusahaan_produksi_filter_cabang_pusat').val();
	}

	if (jQuery('#type_produksi_filter_cabang_pusat').val() == '' || jQuery('#type_produksi_filter_cabang_pusat').val() == null) {
		type_produksi_filter = "empty";
	} else {
		type_produksi_filter = jQuery('#type_produksi_filter_cabang_pusat').val();
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


						data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; ' + warna_telat2 + ' border-color:gray;" class="label-cell"   align="center" width="11,3%"  ><font onclick="detail_button_cabang_pusat(\'' + i + '\',\'produksi\');">' + val.penjualan_jenis + '</font>';

						data_produksi += '<a id="button_body_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabangPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_body + '\',\'body\')"  data-popup=".produksi-selesai-foto-cabang-pusat" class="button-small col button popup-open" style="margin-top:15px; display:none;width:100px; border-radius: 10px;background-color: orange; color:white;';
						data_produksi += '"> <center>Body</center> </a>';
						data_produksi += '<a id="button_proses_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabangPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_proses + '\',\'proses\')"  data-popup=".produksi-selesai-foto-cabang-pusat" class="button-small col button popup-open" style="margin-top:7px; display:none;width:100px; border-radius: 10px;background-color: green; color:white;';
						data_produksi += '"> <center>Proses</center> </a>';
						data_produksi += '<br><a id="button_selesai_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabangPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_selesai + '\',\'selesai\')"  data-popup=".produksi-selesai-foto-cabang-pusat" class="button-small col button popup-open" style="margin-top:-16px; display:none;width:100px; background-color: blue; border-radius: 10px; color:white;"> <center>Selesai</center> </a> ';

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
						// 	// if (val.foto_produksi_sjc != null) {
						// 	// 	data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang-pusat" onclick="getDataFotoSjcSelesaiCabangPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button style="color:white;" class="card-color-blue button-small col button text-bold">SJC</button></td>';
						// 	// } else {
						// 	// 	data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang-pusat" onclick="getDataFotoSjcSelesaiCabangPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold">SJC</button></td>';
						// 	// }
						// 	if (val.foto_produksi_selesai != null) {
						// 		data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-selesai-foto-cabang-pusat" onclick="getDataFotoProduksiSelesaiCabangPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_selesai + '\')"><button style="background-color:#0355a7; color:white;" class="button-small col button text-bold">Foto</button></td>';
						// 	} else {
						// 		data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-selesai-foto-cabang-pusat" onclick="getDataFotoProduksiSelesaiCabangPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_selesai + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold">Upload</button></td>';
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


						data_produksi += '	<select onchange="rubahCabangBantuanPusat(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\');" style="width:100%; float:center; ' + bg_color_select + '" name="bantuan_cabang_pusat_' + val.penjualan_detail_performa_id + '" id="bantuan_cabang_pusat_' + val.penjualan_detail_performa_id + '"  >';

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
			jQuery('#produk_data_cabang_pusat').html(data_produksi);



			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {


		}
	});
}


function rubahCabangBantuanPusat(penjualan_detail_performa_id, penjualan_id) {
	console.log(jQuery('#bantuan_cabang_pusat_' + penjualan_id + '').val());
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/rubah-cabang-bantuan",
		dataType: 'JSON',
		data: {
			penjualan_detail_performa_id: penjualan_detail_performa_id,
			bantuan_cabang: jQuery('#bantuan_cabang_pusat_' + penjualan_detail_performa_id + '').val()
		},
		beforeSend: function () {
			$$('#detail_sales_data').html('');
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			if (data.status == 'done') {
				app.dialog.alert('Berhasil Update Cabang Bantuan');
				getDataProduksiCabangPusat();
			} else {
				app.dialog.alert('Gagal Update Cabang Bantuan');
				getDataProduksiCabangPusat();
			}
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}



function shipmentNotifCabangPusat(penjualan_id) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-Alamat",
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$("#input_alamat_kirim_cabang_pusat_popup")[0].reset();
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

			$$('#alamat_kirim_cabang_pusat_popup').val(alamat_kirim);
			$$('#nama_cabang_pusat_popup').val(client_nama);
			$$('#hp_cabang_pusat_alamat').val(hp_alamat);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function getDataFotoSjcSelesaiCabangPusat(penjualan_detail_performa_id, foto_sjc_selesai) {

	jQuery(".clear_tambah_transaksi_sjc_cabang_pusat").val('');

	var image_path_cabang = localStorage.getItem("server_pilihan_cabang");
	if (image_path_cabang == 'https://tasindo-sale-webservice.digiseminar.id/api') {
		var BASE_PATH_IMAGE_BUKTI_SJC_CABANG = 'https://tasindo-sale-webservice.digiseminar.id/file_foto_sjc';
	} else if (image_path_cabang == 'https://tasindo-sale-webservice.digiseminar.id/api') {
		var BASE_PATH_IMAGE_BUKTI_SJC_CABANG = 'https://tasindo-sale-webservice.digiseminar.id/file_foto_sjc';
	}
	// $$('#text_file_path_sjc').html('Upload');
	console.log(image_path_cabang);
	jQuery('#penjualan_detail_performa_id_foto_sjc_selesai_cabang_pusat').val(penjualan_detail_performa_id);
	localStorage.removeItem('file_foto_produksi_cabang_pusat');
	$('#file_foto_sjc_view_now_cabang_pusat').attr('src', '');
	$('#file_foto_sjc_cabang_pusat').attr('src', '');
	$('#file_foto_sjc_cabang_pusat').val('');
	if (foto_sjc_selesai != 'null') {
		jQuery('#file_foto_sjc_view_now_cabang_pusat').attr('src', BASE_PATH_IMAGE_BUKTI_SJC_CABANG + '/' + foto_sjc_selesai);
	} else {
		jQuery('#file_foto_sjc_view_now_cabang_pusat').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
	}


	$('#button_tambah_fill_camera_sjc_cabang_pusat').show();
	$('#button_tambah_fill_file_sjc_cabang_pusat').show();
	$("#button_tambah_fill_camera_sjc_cabang_pusat").removeClass("col-100");
	$("#button_tambah_fill_file_sjc_cabang_pusat").removeClass("col-100");
	$("#button_tambah_fill_camera_sjc_cabang_pusat").addClass("col");
	$("#button_tambah_fill_file_sjc_cabang_pusat").addClass("col");

	jQuery("#text_file_path_sjc_cabang_pusat").html('Camera');
	gambarSjcCabangPusat();
}


function updateFotoSjcProcessCabangPusat() {
	if (localStorage.getItem("file_foto_sjc_cabang_pusat") != null || jQuery('#tambah_file_acc_1_sjc_cabang_pusat').val() != '') {
		var formData = new FormData(jQuery("#upload_foto_sjc_selesai_cabang_pusat")[0]);
		formData.append('penjualan_detail_performa_id_foto_produksi_selesai_cabang', jQuery('#penjualan_detail_performa_id_foto_sjc_selesai_cabang_pusat').val());
		formData.append('file_foto_sjc_galeri', jQuery('#tambah_file_acc_1_sjc_cabang_pusat').prop('files')[0]);
		formData.append('file_foto_sjc', localStorage.getItem("file_foto_sjc_cabang_pusat"));
		jQuery.ajax({
			type: "POST",
			url: "" + BASE_API + "/update-file-foto-sjc",
			dataType: "JSON",
			data: formData,
			timeout: 7000,
			contentType: false,
			processData: false,
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();
				$$('.clear_tambah_transaksi_sjc_cabang_pusat').val('');
				if (data.status == 'success') {
					app.dialog.alert('Berhasil update foto');
					localStorage.removeItem('file_foto_sjc_cabang_pusat');
					getDataProduksiCabangPusat();
					app.popup.close();
				} else if (data.status == 'failed') {
					app.dialog.alert('Gagal Update Foto');
				}
			},
			error: function (xmlhttprequest, textstatus, message) {
				app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
				app.popup.close();
			}

		});
	} else {
		app.dialog.alert('Harap Isi Foto');
	}
}

//Config Get Image From Camera
function setOptionsSjcCabangPusat(srcType) {
	var options = {
		// Some common settings are 20, 50, and 100
		quality: 50,
		destinationType: Camera.DestinationType.FILE_URI,
		// In this app, dynamically set the picture source, Camera or photo gallery
		sourceType: srcType,
		encodingType: Camera.EncodingType.JPEG,
		mediaType: Camera.MediaType.PICTURE,
		allowEdit: false,
		correctOrientation: true  //Corrects Android orientation quirks
	}
	return options;
}

function getFileEntrySjcCabangPusat(imgUri) {
	window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

		// Do something with the FileEntry object, like write to it, upload it, etc.
		// writeFile(fileEntry, imgUri);
		alert("got file: " + fileEntry.nativeURL);
		// displayFileData(fileEntry.nativeURL, "Native URL");

	}, function () {
		// If don't get the FileEntry (which may happen when testing
		// on some emulators), copy to a new FileEntry.
		createNewFileEntrySjcCabangPusat(imgUri);
	});
}

function createNewFileEntrySjcCabangPusat(imgUri) {
	window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {
		// JPEG file
		dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {
			// Do something with it, like write to it, upload it, etc.
			// writeFile(fileEntry, imgUri);
			alert("got file file entry: " + fileEntry.fullPath);


			// displayFileData(fileEntry.fullPath, "File copied to");
		}, onErrorCreateFile);
	}, onErrorResolveUrl);
}


function getFileContentAsBase64SjcCabangPusat(path, callback) {
	window.resolveLocalFileSystemURL(path, gotFile, fail);

	function fail(e) {
		alert('Cannot found requested file');
	}

	function gotFile(fileEntry) {
		fileEntry.file(function (file) {
			var reader = new FileReader();
			reader.onloadend = function (e) {
				var content = this.result;
				callback(content);
			};
			// The most important point, use the readAsDatURL Method from the file plugin
			reader.readAsDataURL(file);
		});
	}
}

function openCameraSjcCabangPusat(selection) {

	var srcType = Camera.PictureSourceType.CAMERA;
	var options = setOptionsSjcCabangPusat(srcType);
	var func = createNewFileEntrySjcCabangPusat;

	navigator.camera.getPicture(function cameraSuccess(imageUri) {

		// displayImage(imageUri);
		// // You may choose to copy the picture, save it somewhere, or upload.

		getFileContentAsBase64SjcCabangPusat(imageUri, function (base64Image) {
			//window.open(base64Image);
			localStorage.setItem("file_foto_sjc_cabang_pusat", base64Image);
			changeTextFotoSjcCabangPusat(imageUri);
			jQuery('#button_tambah_fill_file_sjc_cabang_pusat').hide();
			$("#button_tambah_fill_camera_sjc_cabang_pusat").removeClass("col");
			$("#button_tambah_fill_camera_sjc_cabang_pusat").addClass("col-100");
			// Then you'll be able to handle the myimage.png file as base64
		});

	}, function cameraError(error) {
		console.debug("Unable to obtain picture: " + error, "app");
		alert("Unable to obtain picture: ");

	}, options);
}

function changeTextFotoSjcCabangPusat(imageUri) {
	var arr = imageUri.split('/');
	$$('#text_file_path_sjc_cabang_pusat').html(arr[8]);
}