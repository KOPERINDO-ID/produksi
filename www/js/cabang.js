//Config Get Image From Camera
function setOptionsSjc(srcType) {
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

function getFileEntrySjc(imgUri) {
	window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

		// Do something with the FileEntry object, like write to it, upload it, etc.
		// writeFile(fileEntry, imgUri);
		alert("got file: " + fileEntry.nativeURL);
		// displayFileData(fileEntry.nativeURL, "Native URL");

	}, function () {
		// If don't get the FileEntry (which may happen when testing
		// on some emulators), copy to a new FileEntry.
		createNewFileEntrySjc(imgUri);
	});
}

function createNewFileEntrySjc(imgUri) {
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


function getFileContentAsBase64Sjc(path, callback) {
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

function openCameraSjc(selection) {

	var srcType = Camera.PictureSourceType.CAMERA;
	var options = setOptionsSjc(srcType);
	var func = createNewFileEntrySjc;

	navigator.camera.getPicture(function cameraSuccess(imageUri) {

		// displayImage(imageUri);
		// // You may choose to copy the picture, save it somewhere, or upload.

		getFileContentAsBase64Sjc(imageUri, function (base64Image) {
			//window.open(base64Image);
			localStorage.setItem("file_foto_sjc", base64Image);
			changeTextFotoSjc(imageUri);
			jQuery('#button_tambah_fill_file_sjc').hide();
			// $("#button_tambah_fill_camera_sjc").removeClass("col");
			// $("#button_tambah_fill_camera_sjc").addClass("col-100");
			// Then you'll be able to handle the myimage.png file as base64
		});

	}, function cameraError(error) {
		console.debug("Unable to obtain picture: " + error, "app");
		alert("Unable to obtain picture: ");

	}, options);
}

function changeTextFotoSjc(imageUri) {
	var arr = imageUri.split('/');
	$$('#text_file_path_sjc').html(arr[9]);
	// $$('#test_text').val(arr);
}

function donwloadProduksiSelesaiPopupCabang() {
	if (jQuery('#bulan_popup_produksi_selesai_cabang').val() == "") {
		var bulan_popup_produksi_selesai = moment().format('M');
		jQuery('#bulan_popup_produksi_selesai_cabang').val(moment().format('M'));
	} else {
		var bulan_popup_produksi_selesai = jQuery('#bulan_popup_produksi_selesai_cabang').val();
	}

	if (jQuery('#perusahaan_popup_produksi_filter_cabang').val() == '' || jQuery('#perusahaan_popup_produksi_filter_cabang').val() == null) {
		perusahaan_popup_produksi_filter = "empty";
	} else {
		perusahaan_popup_produksi_filter = jQuery('#perusahaan_popup_produksi_filter_cabang').val();
	}

	var tahun_popup_produksi_selesai = jQuery('#year_popup_produksi_selesai_cabang').val();

	var data_produksi = '';
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-data-produksi-selesai-popup-" + localStorage.getItem("lower_api_pabrik") + "-cabang",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			extra: localStorage.getItem("extra_parameter"),
			bulan_popup_produksi_selesai: bulan_popup_produksi_selesai,
			tahun_popup_produksi_selesai: tahun_popup_produksi_selesai,
			perusahaan_popup_produksi_filter: perusahaan_popup_produksi_filter,
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi Selesai, Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			data_produksi += '	<table   cellspacing="1" cellpadding="1"  width="100%">';
			data_produksi += '	<thead class="text-align-center">';
			data_produksi += '		<tr>';
			data_produksi += '			<th colspan="6" style="border-right: solid 1px; border-top: solid 1px; border-left: solid 1px;  " class="label-cell" ><font style="float:left; font-weight:bold; font-size:16px; padding:3px;"> Produksi Selesai : ' + localStorage.getItem("lokasi_pabrik") + '</font> <font style="float:right; font-weight:bold; font-size:16px; padding:3px;"> ' + moment(bulan_popup_produksi_selesai).format('MMMM') + '</font></th>';
			data_produksi += '		</tr>';
			data_produksi += '		<tr>';
			data_produksi += '			<th style="border-top: solid gray 1px; border-left: solid gray 1px;  " class="label-cell" align="center" width="3%">No</th>';
			data_produksi += '			<th style="border-top: solid gray 1px; border-left: solid gray 1px;  " class="label-cell" width="5%">Tgl Selesai</th>';
			data_produksi += '			<th style="border-top: solid gray 1px; border-left: solid gray 1px;  " class="label-cell" width="10%">SPK</th>';
			data_produksi += '			<th style="border-top: solid gray 1px; border-left: solid gray 1px;  " class="label-cell" width="10%">Nama</th>';
			data_produksi += '			<th style="border-top: solid gray 1px; border-left: solid gray 1px;  " class="label-cell" width="10%">Type</th>';
			data_produksi += '			<th style="border-top: solid gray 1px; border-left: solid gray 1px; border-right: solid gray 1px; " class="label-cell" width="3%">Jumlah</th>';
			data_produksi += '		</tr>';
			data_produksi += '	</thead>';
			data_produksi += '	<tbody class="text-align-center">';
			if (data.data.length != 0) {


				var nota = '';
				var nomor = 1;
				var jumlah_qty_produksi = 0;
				var now = moment();


				var garis_kosong = "";
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

							garis_kosong = 'ada';
							nota = val.penjualan_id;
							data_produksi += '  <td style="border-top: solid gray 1px; border-left: solid gray 1px; " class="label-cell" width="5.4%" ><center>' + (nomor++) + '</center></td>';
							data_produksi += '  <td style="border-top: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  width="7.9%"><center>' + moment(val.produksi_tanggal_selesai).format('DD-MMM') + '</center></td>';
							data_produksi += '  <td style="border-top: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  width="9.9%"><center><font  class="text-add-colour-black-soft popup-open" data-popup=".detail-sales-produksi" onclick="detailPenjualanProduksi(\'' + val.penjualan_id + '\')"><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></center></td>';
							data_produksi += '  <td style="border-top: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  align="center" width="18.8%">' + val.client_nama + ' </td>';
							data_produksi += '  <td style="border-top: solid gray 1px; border-left: solid gray 1px;" class="label-cell"   align="center" width="11,3%"><font>' + val.penjualan_jenis + '</font></td>';
							data_produksi += '  <td style="border-top: solid gray 1px; border-left: solid gray 1px; border-right: solid gray 1px;" class="label-cell" align="right" width="7%">' + val.penjualan_qty + '</td>';
						} else {
							garis_kosong = 'tidak';
							data_produksi += ' <tr>';
							data_produksi += '  <td colspan="4" style="border-top: solid gray 1px;"></td>';
							data_produksi += '  <td  style="border-top: solid gray 1px;  border-left: solid gray 1px;" class="label-cell"   align="center" width="11,3%"><font>' + val.penjualan_jenis + '</font></td>';
							data_produksi += '  <td  style="border-top: solid gray 1px; border-left: solid gray 1px; border-right: solid gray 1px;" class="label-cell" align="right" width="7%">' + val.penjualan_qty + '</td>';
							data_produksi += ' </tr>';
						}
					}
				});
				data_produksi += ' <tr>';

				if (garis_kosong != 'ada') {
					data_produksi += ' <td colspan="4"></td>';
					data_produksi += ' <td style="border-top: solid gray 1px;"></td>';
				} else {
					data_produksi += ' <td colspan="5" style="border-top: solid gray 1px;"></td>';
				}
				data_produksi += ' <td  align="right" style="border-top: solid gray 1px;border-bottom: solid gray 1px; border-left: solid gray 1px;  border-right: solid gray 1px;" class="label-cell">';
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
				fileName: 'produksi_selesai_' + localStorage.getItem("lower_api_pabrik") + '_cabang' + moment().format('M') + '.pdf'
			}

			pdf.fromData(data_produksi, options)
				.then((stats) => console.log('status', stats))
				.catch((err) => console.err(err))


		},
		error: function (xmlhttprequest, textstatus, message) {


		}
	});
}

function produksiSelesaiPopupCabang() {

	if (jQuery('#bulan_popup_produksi_selesai_cabang').val() == "") {
		var bulan_popup_produksi_selesai = moment().format('M');
		jQuery('#bulan_popup_produksi_selesai_cabang').val(moment().format('M'));
	} else {
		var bulan_popup_produksi_selesai = jQuery('#bulan_popup_produksi_selesai_cabang').val();
	}

	if (jQuery('#perusahaan_popup_produksi_filter_cabang').val() == '' || jQuery('#perusahaan_popup_produksi_filter_cabang').val() == null) {
		perusahaan_popup_produksi_filter = "empty";
	} else {
		perusahaan_popup_produksi_filter = jQuery('#perusahaan_popup_produksi_filter_cabang').val();
	}

	var tahun_popup_produksi_selesai = jQuery('#year_popup_produksi_selesai_cabang').val();

	var data_produksi = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API2 + "/get-data-produksi-selesai-popup-" + localStorage.getItem("lower_api_pabrik") + "-cabang",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			extra: localStorage.getItem("extra_parameter"),
			bulan_popup_produksi_selesai: bulan_popup_produksi_selesai,
			tahun_popup_produksi_selesai: tahun_popup_produksi_selesai,
			perusahaan_popup_produksi_filter: perusahaan_popup_produksi_filter
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi Selesai, Harap Tunggu');
			jQuery('#produksi_selesai_popup_data_cabang').html('');
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
							data_produksi += '  <td style="border-bottom: solid gray 1px; border-left: solid gray 1px;" class="label-cell"  align="left" width="18.8%">' + val.client_nama + '</td>';
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

			jQuery('#produksi_selesai_popup_data_cabang').html(data_produksi);



			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {


		}
	});
}

function keteranganCabang(penjualan_detail_performa_id) {
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
			jQuery('#detail_keterangan_cabang').html('-' + data.data[0].keterangan.replace(/\r\n|\r|\n/g, "<br />-"));
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function keteranganCustomCabang(penjualan_detail_performa_id) {
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
			jQuery('#detail_custom_keterangan_cabang').html(spesifikasi);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}



var delayTimer;
function doSearchPopupProduksiByPerusahaanCabang(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		produksiSelesaiPopupCabang();
	}, 1000);
}

var delayTimer;
function doSearchPopupBulanProduksiSelesaiCabang(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		produksiSelesaiPopupCabang();
	}, 100);
}

var delayTimer;
function doSearchPopupYearProduksiSelesaiCabang(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		produksiSelesaiPopupCabang();
	}, 100);
}

function refreshDataCabang() {
	if (localStorage.getItem('extra_parameter') == 0) {
		getDataProduksiCabang();
	} else {
		getDataExtraCabang();
	}
}


var delayTimerTypeCabang;
function doSearchProduksiTypeCabang(text) {
	clearTimeout(delayTimerTypeCabang);
	if (localStorage.getItem('extra_parameter') == 0) {
		delayTimerPerusahaanCabang = setTimeout(function () {
			getDataProduksiCabang();
		}, 1000);
	} else {
		delayTimerTypeCabang = setTimeout(function () {
			getDataExtraCabang();
		}, 1000);
	}
}

var delayTimerPerusahaanCabang;
function doSearchProduksiByPerusahaanCabang(text) {
	clearTimeout(delayTimerPerusahaanCabang);
	if (localStorage.getItem('extra_parameter') == 0) {
		delayTimerPerusahaanCabang = setTimeout(function () {
			getDataProduksiCabang();
		}, 1000);
	} else {
		delayTimerPerusahaanCabang = setTimeout(function () {
			getDataExtraCabang();
		}, 1000);
	}
}

function chooseDataProduksiCabangRedirect(cabang_value) {

	var pusat = 'https://tasindo-sale-webservice.digiseminar.id/api';
	localStorage.setItem('server_pilihan_cabang', pusat);
	console.log(cabang_value);

	if (cabang_value == 'pusat') {
		localStorage.setItem('extra_parameter', 0);
		localStorage.setItem('pilihan_cabang', cabang_value);
		$(".surabayaFilterCabangBtn").addClass("bg-dark-gray-medium");
		$(".extraFilterCabangBtn").removeClass("bg-dark-gray-medium");
		// $(".absensiFilterCabangBtn").removeClass("bg-dark-gray-medium");
		getDataProduksiCabang();
	} else if (cabang_value == 'extra') {
		localStorage.setItem('extra_parameter', 1);
		localStorage.setItem('pilihan_cabang', cabang_value);
		$$("#type_produksi_filter_cabang").val('');
		$$("#perusahaan_produksi_filter_cabang").val('');
		$(".extraFilterCabangBtn").addClass("bg-dark-gray-medium");
		$(".surabayaFilterCabangBtn").removeClass("bg-dark-gray-medium");
		// $(".absensiFilterCabangBtn").removeClass("bg-dark-gray-medium");
		getDataExtraCabang()
	}

}

function arsipSalesLocalstorage() {
	if (localStorage.getItem('arsip') == 'aktif') {
		$$("#arsipBtn").css("color", "white");
		localStorage.removeItem('arsip');
	} else if (localStorage.getItem('arsip') == '' || localStorage.getItem('arsip') == null) {
		$$("#arsipBtn").css("color", "red");
		localStorage.setItem('arsip', 'aktif')
	}
	chooseDataProduksiCabangRedirect(localStorage.getItem("pilihan_cabang"));
}

function dateRangeDeclarationProduksiCabang() {
	calendarRangeProduksiSelesai = app.calendar.create({
		inputEl: '#range-produksi-cabang',
		rangePicker: true,
		dateFormat: 'dd-mm-yyyy',
		closeOnSelect: true,
		rangePickerMinDays: 2,
		on: {
			close: function () {
				getDataProduksiCabang();
			}
		}
	});
}

function getDataFotoProduksiCabang(
	produksi_tanggal_body,
	produksi_tanggal_proses,
	produksi_tanggal_selesai,
	foto_produksi_body,
	foto_produksi_proses,
	foto_produksi_selesai
) {

	var image_path_cabang = localStorage.getItem("server_pilihan_cabang");

	var BASE_PATH_IMAGE_BUKTI_PRODUKSI_CABANG = "";
	if (image_path_cabang == 'https://tasindo-sale-webservice.digiseminar.id/api') {
		BASE_PATH_IMAGE_BUKTI_PRODUKSI_CABANG = 'https://tasindo-sale-webservice.digiseminar.id/foto_produksi';
	} else {
		BASE_PATH_IMAGE_BUKTI_PRODUKSI_CABANG = image_path_cabang.replace('/api', '') + '/foto_produksi';
	}

	var NO_IMAGE = 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg';

	function safeFormatTanggal(tgl) {
		if (!tgl || tgl === 'null' || tgl === '-' || tgl === '0000-00-00') {
			return '-';
		}
		var m = moment(tgl);
		return m.isValid() ? m.format('DD-MMM-YYYY') : '-';
	}

	// ===== BODY =====
	$('#data_produksi_tanggal_body').html(safeFormatTanggal(produksi_tanggal_body));
	$('#file_foto_produksi_view_now_body_cabang').attr('src', '');
	if (foto_produksi_body && foto_produksi_body !== 'null') {
		jQuery('#file_foto_produksi_view_now_body_cabang').attr(
			'src',
			BASE_PATH_IMAGE_BUKTI_PRODUKSI_CABANG + '/' + foto_produksi_body
		);
	} else {
		jQuery('#file_foto_produksi_view_now_body_cabang').attr('src', NO_IMAGE);
	}

	// ===== PROSES =====
	$('#data_produksi_tanggal_proses').html(safeFormatTanggal(produksi_tanggal_proses));
	$('#file_foto_produksi_view_now_proses_cabang').attr('src', '');
	if (foto_produksi_proses && foto_produksi_proses !== 'null') {
		jQuery('#file_foto_produksi_view_now_proses_cabang').attr(
			'src',
			BASE_PATH_IMAGE_BUKTI_PRODUKSI_CABANG + '/' + foto_produksi_proses
		);
	} else {
		jQuery('#file_foto_produksi_view_now_proses_cabang').attr('src', NO_IMAGE);
	}

	// ===== SELESAI =====
	$('#data_produksi_tanggal_selesai').html(safeFormatTanggal(produksi_tanggal_selesai));
	$('#file_foto_produksi_view_now_selesai_cabang').attr('src', '');
	if (foto_produksi_selesai && foto_produksi_selesai !== 'null') {
		jQuery('#file_foto_produksi_view_now_selesai_cabang').attr(
			'src',
			BASE_PATH_IMAGE_BUKTI_PRODUKSI_CABANG + '/' + foto_produksi_selesai
		);
	} else {
		jQuery('#file_foto_produksi_view_now_selesai_cabang').attr('src', NO_IMAGE);
	}
}




function getDataFotoSjcSelesaiCabang(penjualan_detail_performa_id, foto_sjc_selesai) {

	jQuery(".clear_tambah_transaksi_sjc").val('');

	localStorage.removeItem('file_foto_sjc');
	var image_path_cabang = localStorage.getItem("server_pilihan_cabang");
	if (image_path_cabang == 'https://tasindo-sale-webservice.digiseminar.id/api') {
		var BASE_PATH_IMAGE_BUKTI_SJC_CABANG = 'https://tasindo-sale-webservice.digiseminar.id/file_foto_sjc';
	} else if (image_path_cabang == 'https://tasindo-sale-webservice.digiseminar.id/api') {
		var BASE_PATH_IMAGE_BUKTI_SJC_CABANG = 'https://tasindo-sale-webservice.digiseminar.id/file_foto_sjc';
	}
	// $$('#text_file_path_sjc').html('Upload');
	console.log(image_path_cabang);
	jQuery('#penjualan_detail_performa_id_foto_sjc_selesai_cabang').val(penjualan_detail_performa_id);
	localStorage.removeItem('file_foto_produksi_cabang');
	$('#file_foto_sjc_view_now_cabang').attr('src', '');
	$('#file_foto_sjc_cabang').attr('src', '');
	$('#file_foto_sjc_cabang').val('');
	if (foto_sjc_selesai != 'null') {
		jQuery('#file_foto_sjc_view_now_cabang').attr('src', BASE_PATH_IMAGE_BUKTI_SJC_CABANG + '/' + foto_sjc_selesai);
	} else {
		jQuery('#file_foto_sjc_view_now_cabang').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
	}


	$('#button_tambah_fill_camera_sjc').show();
	$('#button_tambah_fill_file_sjc').show();
	// $("#button_tambah_fill_camera_sjc").removeClass("col-100");
	// $("#button_tambah_fill_file_sjc").removeClass("col-100");
	// $("#button_tambah_fill_camera_sjc").addClass("col");
	// $("#button_tambah_fill_file_sjc").addClass("col");

	jQuery("#text_file_path_sjc").html('Camera');
	gambarSjc();
}

function gambarSjc() {
	if (jQuery('#tambah_file_acc_1_sjc').val() == '' || jQuery('#tambah_file_acc_1_sjc').val() == null) {
		$$('#tambah_value_acc_1_sjc').html('Upload');
	} else {
		$$('#tambah_value_acc_1_sjc').html($$('#tambah_file_acc_1_sjc').val().replace('fakepath', ''));
		jQuery('#button_tambah_fill_camera_sjc').hide();
		// $('#button_tambah_fill_file_sjc').removeClass("col");
		// $('#button_tambah_fill_file_sjc').addClass("col-100");
	}
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
								getDataProduksiCabang();
							} else {
								app.dialog.alert('Gagal Reset Status Produksi');
								getDataProduksiCabang();
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

function detail_button_cabang(id, produksi) {
	if (jQuery('#button_proses_cabang_' + id + '').is(":visible")) {
		jQuery('#button_selesai_cabang_' + id + '').hide();
		jQuery('#button_proses_cabang_' + id + '').hide();
		jQuery('#button_body_cabang_' + id + '').hide();
		jQuery('#button_noted_cabang_' + id + '').hide();

	} else {
		jQuery('#button_selesai_cabang_' + id + '').show();
		jQuery('#button_proses_cabang_' + id + '').show();
		jQuery('#button_body_cabang_' + id + '').show();
		jQuery('#button_noted_cabang_' + id + '').show();
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


function updateFotoProduksiSelesaiProcessCabang() {


	if ($('#file_foto_produksi_cabang').val() != "") {


		var formData = new FormData(jQuery("#upload_foto_produksi_selesai_cabang")[0]);
		formData.append('penjualan_detail_performa_id_foto_produksi_selesai_cabang', jQuery('#penjualan_detail_performa_id_foto_produksi_selesai_cabang').val());
		var file = $('#file_foto_produksi_cabang').get(0).files[0];
		formData.append('file_foto_produksi', file);

		jQuery.ajax({
			type: "POST",
			url: BASE_API + "/update-file-foto-produksi-cabang",
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
				getDataProduksiCabang();
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


function updateFotoSjcProcessCabang() {

	// app.dialog.alert(localStorage.getItem("file_foto_sjc"));
	// if ($('#file_foto_sjc_cabang').val() != "") {

	if (localStorage.getItem("file_foto_sjc") != null || jQuery('#tambah_file_acc_1_sjc').val() != '') {
		var formData = new FormData(jQuery("#upload_foto_sjc_selesai_cabang")[0]);
		formData.append('penjualan_detail_performa_id_foto_produksi_selesai_cabang', jQuery('#penjualan_detail_performa_id_foto_sjc_selesai_cabang').val());
		// var file = $('#file_foto_sjc_cabang').get(0).files[0];
		// var file = localStorage.getItem("file_foto_sjc");
		formData.append('file_foto_sjc_galeri', jQuery('#tambah_file_acc_1_sjc').prop('files')[0]);
		formData.append('file_foto_sjc', localStorage.getItem("file_foto_sjc"));
		jQuery.ajax({
			type: "POST",
			url: BASE_API + "/update-file-foto-sjc-cabang-backup",
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
				$$('.clear_tambah_transaksi_sjc').val('');
				if (data.status == 'success') {
					app.dialog.alert('Berhasil update foto');
					localStorage.removeItem('file_foto_sjc');
					chooseDataProduksiCabangRedirect(localStorage.getItem("pilihan_cabang"));
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



function rubahStatusProduksi(penjualan_detail_perofrma_id, penjualan_id, status) {


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
								if (localStorage.getItem('extra_parameter') == 0) {
									getDataProduksiCabang();
								} else {
									getDataExtraCabang();
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

				if (localStorage.getItem('extra_parameter') == 0) {
					getDataProduksiCabang();
				} else {
					getDataExtraCabang();
				}

			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}

}


function detailPenjualanProduksiCabang(penjualan_id, penjualan_detail_performa_id) {
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
			penjualan_id: penjualan_id,
			penjualan_detail_performa_id: penjualan_detail_performa_id
		},
		beforeSend: function () {
			$$('#detail_sales_data').html('');
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			var no_spk = moment(data.data[0].penjualan_tanggal).format('DDMMYY') + '-' + data.data[0].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '');

			if (localStorage.getItem('extra_parameter') == 0) {
				$("#title_spk_cabang").html('Xtra | ' + no_spk);
			} else {
				$("#title_spk_cabang").html('Grosir | ' + no_spk);
			}

			app.dialog.close();
			console.log(data.data.length);
			if (data.data.length != 0) {
				jQuery.each(data.data, function (i, val) {
					detail_sales_data += '<table  width="100%" style="border-collapse: collapse; border:1px solid gray;" border="1">';
					detail_sales_data += '<tbody>';
					detail_sales_data += ' <tr class="bg-dark-gray-medium">';
					detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
					detail_sales_data += '   Produk #1';
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
						var path_image_cabang = image_server + '/product_image_new';
					} else {
						var path_image_cabang = image_server + '/performa_image';
					}

					if (val.kode_warna != null) {
						var kode_warna = val.kode_warna;
					} else {
						var kode_warna = '-';
					}

					detail_sales_data += ' <tr>';
					detail_sales_data += '   <td colspan="1" class="label-cell text-align-center" width="40%">' + val.penjualan_jenis + '<br>';
					detail_sales_data += '   	<img onclick="zoom_view(this.src);" width="100%" src="' + path_image_cabang + '/' + val.gambar + '" />';
					detail_sales_data += '	 </td>';
					detail_sales_data += '   <td colspan="2" class="label-cell text-align-center" width="60%" style="white-space: pre;">' + val.produk_keterangan_kustom + '<br>' + style + '<br>' + kode_warna + '<br><font color="red">' + keterangan_fix + '</font></td>';
					detail_sales_data += '</tr>';
					detail_sales_data += ' <tr class="">';
					detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">Qty : ' + val.penjualan_qty + '</td>';
					detail_sales_data += ' </tr>';
					detail_sales_data += '</tbody>';
					detail_sales_data += '</table><br>';

					detail_sales_data += '<table  width="100%" style="border-collapse: collapse; border:1px solid gray;" border="1">';
					detail_sales_data += '<tbody>';
					detail_sales_data += ' <tr class="bg-dark-gray-medium">';
					detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
					detail_sales_data += '   Customer Logo';
					detail_sales_data += ' </td>';
					detail_sales_data += '</tr>';
					detail_sales_data += ' <tr >';
					detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';

					if (val.customer_logo != "") {
						detail_sales_data += '  <img onclick="zoom_view(this.src);" width="70%" src="' + image_server + '/customer_logo/' + val.customer_logo + '" />';
					} else {
						detail_sales_data += 'Tidak Ada Logo Customer';
					}

					detail_sales_data += ' </td>';
					detail_sales_data += '</tr>';
					// detail_sales_data += ' <tr class="bg-dark-gray-medium">';
					// detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
					// detail_sales_data += '   Logo Bordir';
					// detail_sales_data += ' </td>';
					// detail_sales_data += '</tr>';
					// detail_sales_data += ' <tr >';
					// detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
					// if (val.customer_logo_bordir != "") {
					// 	detail_sales_data += '  <img onclick="zoom_view(this.src);" width="70%" src="' + image_server + '/customer_logo/' + val.customer_logo_bordir + '" />';
					// } else {
					// 	detail_sales_data += 'Tidak Ada Logo Bordir';
					// }
					// detail_sales_data += ' </td>';
					// detail_sales_data += '</tr>';

					if (val.customer_logo_tambahan != "") {
						detail_sales_data += ' <tr class="bg-dark-gray-medium">';
						detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
						detail_sales_data += '   Logo Tambahan';
						detail_sales_data += ' </td>';
						detail_sales_data += '</tr>';
						detail_sales_data += ' <tr >';
						detail_sales_data += '  <td colspan="3" class="label-cell text-align-center">';
						detail_sales_data += '  <img onclick="zoom_view(this.src);" width="70%" src="' + image_server + '/customer_logo/' + val.customer_logo_tambahan + '" />';
						detail_sales_data += ' </td>';
						detail_sales_data += '</tr>';
					}
					detail_sales_data += '</table>';


				});





				$$('#detail_sales_data_produksi_cabang').html(detail_sales_data);
			} else {
				$$('#detail_sales_data_produksi_cabang').html('<center><h3>Tidak Ada Data</h3></center>');
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


function getBuktiTerima(id_terima_qty_pabrik, bukti) {
	jQuery('#file_bukti_terima_view_now').attr('src', '');
	jQuery('#foto_bukti_terima').val("");
	jQuery('#id_terima_qty_pabrik_bukti_terima').val(id_terima_qty_pabrik);
	localStorage.removeItem('file_bukti_terima');
	$('#file_bukti_terima_view').attr('src', '');
	$('#file_bukti_terima_view_now').attr('src', '');
	var server_pilihan_cabang = localStorage.getItem("server_pilihan_cabang");
	var BASE_PATH_IMAGE_URL = server_pilihan_cabang.replace('/api', '') + '/foto_bukti_terima';

	if (bukti != 'null') {
		jQuery('#file_bukti_terima_view_now').attr('src', BASE_PATH_IMAGE_URL + '/' + bukti);
	} else {
		jQuery('#file_bukti_terima_view_now').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
	}
}


// function terimaPabrikOld(penjualan_detail_performa_id, penjualan_qty, client_nama) {
// 	$("#terima_qty_penjualan_detail_performa_id").val(penjualan_detail_performa_id);
// 	$$('#sisa_terima_pabrik').html("");
// 	$("#terima_qty_pabrik").val("");
// 	$("#terima_tgl").val("");
// 	$("#terima_no_sj").val("");


// 	jQuery.ajax({
// 		type: 'POST',
// 		url: BASE_API + "/terima-pabrik",
// 		dataType: 'JSON',
// 		data: {
// 			penjualan_detail_performa_id: $("#terima_qty_penjualan_detail_performa_id").val()
// 		},
// 		beforeSend: function () {
// 			app.dialog.preloader('Harap Tunggu');
// 		},
// 		success: function (data) {

// 			app.dialog.close();
// 			var terima_qty_pabrik_value = '';
// 			var no = 0;
// 			if (data.data.length != 0) {

// 				$('.terima_not_empty').show();
// 				$('#client_terima').html(client_nama);
// 				$('#penjualan_id_terima').html(moment(data.data[0].dt_record).format('DDMMYY') + '-' + data.data[0].penjualan_id.replace(/\INV_/g, '').replace(/^0+/, ''));
// 				$('#penjualan_jenis_terima').html(data.data[0].penjualan_jenis);

// 				jQuery.each(data.data, function (i, val) {


// 					no++
// 					terima_qty_pabrik_value += '<tr>';
// 					terima_qty_pabrik_value += '<td align="center">' + no + '</td>';
// 					terima_qty_pabrik_value += '<td>' + moment(val.dt_record).format('DD-MMM') + '</td>';
// 					terima_qty_pabrik_value += '<td align="center">' + val.no_sj + '</td>';
// 					terima_qty_pabrik_value += '<td align="right">' + val.qty_terima + '</td>';
// 					if (val.bukti != null) {
// 						terima_qty_pabrik_value += '<td><button style="background-color:blue; color:white;"  class="text-add-colour-black-soft button-small col button text-bold popup-open" data-popup=".bukti-terima" onclick="getBuktiTerima(\'' + val.id_terima_qty_pabrik + '\',\'' + val.bukti + '\');">Bukti</button></td>';
// 					} else {
// 						terima_qty_pabrik_value += '<td><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open" data-popup=".bukti-terima" onclick="getBuktiTerima(\'' + val.id_terima_qty_pabrik + '\',\'' + val.bukti + '\');">Bukti</button></td>';
// 					}
// 					terima_qty_pabrik_value += '</tr>';
// 				});
// 			} else {
// 				$('.terima_not_empty').hide();
// 				terima_qty_pabrik_value += '<tr>';
// 				terima_qty_pabrik_value += '<td colspan="7" align="center">Tidak Ada Data</td>';
// 				terima_qty_pabrik_value += '</tr>';
// 			}
// 			$$('#terima_qty_pabrik_value').html(terima_qty_pabrik_value);
// 			$$('#total_qty_pabrik_value').html(penjualan_qty);
// 			if (data.data != "") {
// 				$$('#sisa_terima_pabrik').html(parseFloat(data.data[0].penjualan_qty) - parseFloat(data.data[0].total_terima_pabrik));
// 			} else {
// 				$$('#sisa_terima_pabrik').html(penjualan_qty);

// 			}

// 		},
// 		error: function (xmlhttprequest, textstatus, message) {
// 		}
// 	});
// }

function terimaPabrik(penjualan_detail_performa_id, penjualan_qty, stok, client_nama, penjualan_id, penjualan_jenis, penjualan_tanggal) {
	$("#terima_qty_penjualan_detail_performa_id").val(penjualan_detail_performa_id);
	$$('#sisa_terima_pabrik').html("");
	$("#terima_tgl").html("");

	$("#terima_tgl").html(moment().format('DD/MM/YYYY'));

	localStorage.setItem('penjualan_qty_terima', penjualan_qty);
	localStorage.setItem('stok_terima', stok);
	localStorage.setItem('client_nama', client_nama);
	localStorage.setItem('penjualan_id_terima', penjualan_id);
	localStorage.setItem('penjualan_jenis_terima', penjualan_jenis);
	localStorage.setItem('penjualan_tanggal_terima', penjualan_tanggal);


	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/terima-pabrik",
		dataType: 'JSON',
		data: {
			penjualan_detail_performa_id: $("#terima_qty_penjualan_detail_performa_id").val()
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			$('.terima_not_empty').show();
			app.dialog.close();
			var terima_qty_pabrik_value = '';
			var no = 0;
			$('#client_terima').html(client_nama);
			$('#penjualan_id_terima').html(moment(penjualan_tanggal).format('DDMMYY') + '-' + penjualan_id.replace(/\INV_/g, '').replace(/^0+/, ''));
			$('#penjualan_jenis_terima').html(penjualan_jenis);
			if (data.data.length != 0) {


				jQuery.each(data.data, function (i, val) {
					no++
					terima_qty_pabrik_value += '<tr>';
					terima_qty_pabrik_value += '<td width="50px" align="center">' + no + '</td>';
					terima_qty_pabrik_value += '<td width="50px">' + moment(val.tanggal).format('DD-MMM') + '</td>';
					terima_qty_pabrik_value += '<td width="50px">' + val.no_sj + '</td>';
					terima_qty_pabrik_value += '<td align="right" width="50px">' + val.qty_terima + '</td>';
					if (val.bukti != null) {
						terima_qty_pabrik_value += '<td width="100px"><button style="background-color:blue; color:white;"  class="text-add-colour-black-soft button-small col button text-bold popup-open" data-popup=".bukti-terima" onclick="getBuktiTerima(\'' + val.id_terima_qty_pabrik + '\',\'' + val.bukti + '\');">Bukti</button></td>';
					} else {
						terima_qty_pabrik_value += '<td width="100px"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open" data-popup=".bukti-terima" onclick="getBuktiTerima(\'' + val.id_terima_qty_pabrik + '\',\'' + val.bukti + '\');">Bukti</button></td>';
					}
					terima_qty_pabrik_value += '</tr>';
				});
			} else {

				terima_qty_pabrik_value += '<tr>';
				terima_qty_pabrik_value += '<td colspan="5" align="center">Tidak Ada Data</td>';
				terima_qty_pabrik_value += '</tr>';
			}
			$$('#terima_qty_pabrik_value').html(terima_qty_pabrik_value);
			$$('#total_qty_pabrik_value').html(penjualan_qty);

			if (data.data != "") {
				$$('#sisa_terima_pabrik').html((parseFloat(data.data[0].penjualan_qty)) - parseFloat(data.data[0].total_terima_pabrik));
			} else {
				$$('#sisa_terima_pabrik').html(parseFloat(penjualan_qty) - parseInt(stok));

			}

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getDataProduksiCabang() {

	jQuery(".wilayah-column").hide();

	if (jQuery('#perusahaan_produksi_filter_cabang').val() == '' || jQuery('#perusahaan_produksi_filter_cabang').val() == null) {
		perusahaan_produksi_value = "empty";
	} else {
		perusahaan_produksi_value = jQuery('#perusahaan_produksi_filter_cabang').val();
	}

	if (jQuery('#type_produksi_filter_cabang').val() == '' || jQuery('#type_produksi_filter_cabang').val() == null) {
		type_produksi_filter = "empty";
	} else {
		type_produksi_filter = jQuery('#type_produksi_filter_cabang').val();
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
		url: BASE_API + "/get-produksi-cabang-" + localStorage.getItem("lower_api_pabrik"),
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			status: 'new_app',
			cabang_pembantu: localStorage.getItem("lokasi_pabrik"),
			perusahaan_produksi_value: perusahaan_produksi_value,
			type_produksi_filter: type_produksi_filter,
			startdate: startdate,
			enddate: enddate
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data Produksi, Harap Tunggu');
			jQuery('#produk_data').html('');
		},
		success: function (data) {
			app.dialog.close();
			console.log(data.data);
			if (data.data.length != 0 && data.data.extra != 0) {
				var nota = '';
				var nomor = 1;
				var warna = '';
				var warna_telat = '';
				var now = moment();
				var count_qty_produksi = 0;
				var sisa_qty_produksi = 0;
				var warna_button_packing = '';
				jQuery.each(data.data, function (i, val) {

					var sisa_kirim_sj = parseFloat(val.penjualan_qty) - parseFloat(data.surat_jalan_count[val.penjualan_detail_performa_id]);

					if (localStorage.getItem('arsip') == null || localStorage.getItem('arsip') == '') {
						var arsip_value = "empty";
					} else {
						var arsip_value = localStorage.getItem('arsip');
					}
					if (arsip_value == 'empty') {
						if (val.extra == null || val.extra == 1) {
							if (val.total_terima_pabrik < (val.penjualan_qty - val.stok)) {
								// if (sisa_kirim_sj > 0 || val.penjualan_total_kirim == null) {
								if (val.foto_produksi_selesai == null || val.foto_produksi_sjc == null) {
									warna = "";
									warna_telat = "";
									if (val.status_produksi == 'proses') {
										warna = "linear-gradient(#4a8a4a , forestgreen); /* Standard syntax */ background: -webkit-linear-gradient(#4a8a4a , forestgreen); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#4a8a4a , forestgreen); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#4a8a4a , forestgreen); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'selesai') {
										warna = "linear-gradient(#067afb , #002b46); /* Standard syntax */ background: -webkit-linear-gradient(#067afb , #002b46); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#067afb , #002b46); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#067afb , #002b46); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'body') {
										warna = "linear-gradient(#c5a535  , #cf8600); /* Standard syntax */ background: -webkit-linear-gradient(#c5a535 , #cf8600); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#c5a535 , #cf8600); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#c5a535 , #cf8600); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'noted') {
										warna = "linear-gradient(#918f8a  , #b3afaa); /* Standard syntax */ background: -webkit-linear-gradient(#918f8a  , #b3afaa); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#918f8a  , #b3afaa); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#918f8a  , #b3afaa); /* For Firefox 3.6 to 15 */ color:white;";
									}


									if (nota != val.penjualan_id) {

										const oneDay_2 = 24 * 60 * 60 * 1000;
										const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
										const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

										const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
										if (firstDate_2 >= secondDate_2) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										} else {
											if (diffDays_2 > 0 && diffDays_2 < 3) {
												var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

											} else if (diffDays_2 == 0) {
												var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
											}
										}

										var row_produksi = '';
										if (localStorage.getItem("lokasi_pabrik") == 'Jakarta') {
											if (val.hide_produksi == 0) {
												row_produksi = 'class="bg-color-yellow" onclick="changeStatusHideProduksi(' + val.penjualan_detail_performa_id + ');"'
											} else {
												row_produksi = ''
											}
										} else {
											row_produksi = ''
										}
										data_produksi += ' <tr ' + row_produksi + '>';
										console.log(warna);
										nota = val.penjualan_id;


										var color_shipment_blink = '';
										if (val.packing == 'polos') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite text-add-colour-black-soft button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')"></button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold"></button>';
											}
										} else if (val.packing == 'plastik') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Plastik</button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold">Plastik</button>';
											}
										} else if (val.packing == 'kardus') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Kardus</button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="card-color-brown button-small col button text-bold">Kardus</button>';
											}
										} else {
											color_shipment_blink = '';
											warna_button_packing = '';
										}

										data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;padding:2px;" class="label-cell"  align="left" >';
										data_produksi += '    ' + warna_button_packing + '  ';
										data_produksi += '  </td>';

										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
										data_produksi += '  <td  align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
										data_produksi += '  <td   align="left" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')"><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';

										data_produksi += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  align="left">' + val.client_nama + '</td>';
									} else {

										const oneDay_2 = 24 * 60 * 60 * 1000;
										const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
										const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

										const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
										if (firstDate_2 >= secondDate_2) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										} else {
											if (diffDays_2 > 0 && diffDays_2 < 3) {
												var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

											} else if (diffDays_2 == 0) {
												var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
											}
										}
										data_produksi += ' <tr>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-right: solid 1px; border-color:gray;padding:2px;" class="label-cell"></td>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
										data_produksi += '  <td align="left" style="border-bottom: solid 1px; border-right: solid 1px;border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font  style="color:white;"  onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')" class="text-add-colour-black-soft"  ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';
										data_produksi += '  <td style="  border-color:gray;" class="label-cell"  colspan="1"></td>';
									}

									if (now >= moment(val.penjualan_tanggal_kirim).subtract(8, 'days')) {
										var warna_telat2 = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
									} else {
										var warna_telat2 = '';

									}

									const oneDay = 24 * 60 * 60 * 1000;
									const firstDate = new Date(moment().format('YYYY, MM, DD'));
									const secondDate = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));


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


									data_produksi += '<td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; ' + warna_telat2 + ' border-color:gray;" class="label-cell"   align="left"><font onclick="detail_button_cabang(\'' + i + '\',\'produksi\');">' + val.penjualan_jenis + '</font>';
									data_produksi += '<a id="button_noted_cabang_' + i + '" onclick="rubahStatusProduksi(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'noted\')" class="button-small col button" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: lightgrey; color:black;';
									data_produksi += '"> <center>Noted</center> </a>';
									data_produksi += '<a id="button_body_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_body + '\',\'body\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: orange; color:white;';
									data_produksi += '"> <center>Body</center> </a>';
									data_produksi += '<a id="button_proses_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_proses + '\',\'proses\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:7px; display:none;width:100%; border-radius: 10px;background-color: green; color:white;';
									data_produksi += '"> <center>Proses</center> </a>';
									data_produksi += '<br><a id="button_selesai_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_selesai + '\',\'selesai\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:-16px; display:none;width:100%; background-color: blue; border-radius: 10px; color:white;"> <center>Selesai</center> </a> ';
									data_produksi += '</td>';

									if (val.style != null && val.style != 'none') {
										var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
									} else {
										var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
									}


									data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;  background:' + warna + ';" class="label-cell"  align="left"><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan-cabang" onclick="keteranganCustomCabang(\'' + val.penjualan_detail_performa_id + '\')">' + spesifikasi + '</font></td>';
									if (val.keterangan == null || val.keterangan == "") {
										data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray; " class="label-cell"  align="center">-</td>';

									} else {
										var str = val.keterangan;
										if (str.length > 15) {
											var truncated = str.substring(0, 15);
											data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + truncated + '<span style="font-size:25px;"> .....</span></p></td>';
										} else {
											data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + str + '</p></td>';
										}
									}
									//	data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;" class="label-cell"  align="left" width="11,3%">';

									//	data_produksi += '<button onclick="resetStatusProduksiCabang(\'' + val.penjualan_detail_performa_id + '\');"  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold">Reset</button>';

									//data_produksi += '</td>';


									data_produksi += '  <td  style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="right">' + (parseInt(val.penjualan_qty) - parseInt(val.stok)) + '</td>';

									data_produksi += '  <td style=" background:' + warna + ';  border-left: solid  gray 1px;   border-bottom: solid  gray 1px; " class="label-cell"  align="center">';


									if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
										data_produksi += '' + sisa_kirim_sj + '';
									} else {
										data_produksi += '' + ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik)) + '';
									}

									data_produksi += '  </td>	';

									if (val.wilayah != null) {
										wilayah = val.wilayah;
									} else {
										wilayah = '-';
									}

									// data_produksi += '  <td class="label-cell" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;"><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"  data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Shipment</a></td>';

									// data_produksi += '  <td class="label-cell" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;">' + wilayah + '</td>';
									if (val.status_produksi == 'selesai') {
										if (val.foto_produksi_selesai != null) {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">Foto</button></td>';
										} else {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;">Foto</button></td>';
										}

										if (val.foto_produksi_sjc != null) {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">SJC</button></td>';
										} else {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;">SJC</button></td>';
										}


										if (sisa_kirim_sj <= 0) {
											var color_btn_sj_id = "btn-color-blueWhite";
										} else if (val.penjualan_total_kirim == null) {
											var color_btn_sj_id = "bg-dark-gray-young text-add-colour-black-soft";
										} else if (sisa_kirim_sj > 0) {
											var color_btn_sj_id = "btn-color-greenWhite";
										}

										if (val.total_terima_pabrik == null || val.total_terima_pabrik == 0) {
											var color_btn_terima_id = "bg-dark-gray-young text-add-colour-black-soft";
										} else if (val.total_terima_pabrik > 0) {
											var color_btn_terima_id = "btn-color-greenWhite";
										}

										if (val.total_terima_pabrik != null || val.total_terima_pabrik != 0) {
											if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {

												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

												data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';

												data_produksi += '</td>';
											} else {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

												data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';

												data_produksi += '</td>';
											}

										} else {
											if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

												data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';

												data_produksi += '</td>';

											} else {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

												data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" data-popup=".terima-pabrik" style="width: 85px;" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';

												data_produksi += '</td>';
											}
										}

									} else {
										data_produksi += '  <td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
										data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
										data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
									}



									data_produksi += ' </tr>';
									count_qty_produksi += (parseInt(val.penjualan_qty) - parseInt(val.stok));
									// sisa_qty_produksi += ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik));

								} else if (val.foto_produksi_selesai == null || val.total_terima_pabrik == 0) {
									warna = "";
									warna_telat = "";
									if (val.status_produksi == 'proses') {
										warna = "linear-gradient(#4a8a4a , forestgreen); /* Standard syntax */ background: -webkit-linear-gradient(#4a8a4a , forestgreen); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#4a8a4a , forestgreen); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#4a8a4a , forestgreen); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'selesai') {
										warna = "linear-gradient(#067afb , #002b46); /* Standard syntax */ background: -webkit-linear-gradient(#067afb , #002b46); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#067afb , #002b46); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#067afb , #002b46); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'body') {
										warna = "linear-gradient(#c5a535  , #cf8600); /* Standard syntax */ background: -webkit-linear-gradient(#c5a535 , #cf8600); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#c5a535 , #cf8600); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#c5a535 , #cf8600); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'noted') {
										warna = "linear-gradient(#918f8a  , #b3afaa); /* Standard syntax */ background: -webkit-linear-gradient(#918f8a  , #b3afaa); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#918f8a  , #b3afaa); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#918f8a  , #b3afaa); /* For Firefox 3.6 to 15 */ color:white;";
									}


									if (nota != val.penjualan_id) {

										const oneDay_2 = 24 * 60 * 60 * 1000;
										const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
										const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

										const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
										if (firstDate_2 >= secondDate_2) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										} else {
											if (diffDays_2 > 0 && diffDays_2 < 3) {
												var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

											} else if (diffDays_2 == 0) {
												var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
											}
										}


										data_produksi += ' <tr>';
										console.log(warna);
										nota = val.penjualan_id;


										var color_shipment_blink = '';
										if (val.packing == 'polos') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite text-add-colour-black-soft button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')"></button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold"></button>';
											}
										} else if (val.packing == 'plastik') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Plastik</button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold">Plastik</button>';
											}
										} else if (val.packing == 'kardus') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Kardus</button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="card-color-brown button-small col button text-bold">Kardus</button>';
											}
										} else {
											color_shipment_blink = '';
											warna_button_packing = '';
										}

										data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;padding:2px;" class="label-cell"  align="left" >';
										data_produksi += '    ' + warna_button_packing + '  ';
										data_produksi += '  </td>';

										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
										data_produksi += '  <td  align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
										data_produksi += '  <td   align="left" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font  style="color:white;"  onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')" class="text-add-colour-black-soft"  ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';

										data_produksi += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  align="left">' + val.client_nama + '</td>';
									} else {

										const oneDay_2 = 24 * 60 * 60 * 1000;
										const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
										const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

										const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
										if (firstDate_2 >= secondDate_2) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										} else {
											if (diffDays_2 > 0 && diffDays_2 < 3) {
												var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

											} else if (diffDays_2 == 0) {
												var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
											}
										}
										data_produksi += ' <tr>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-right: solid 1px; border-color:gray;padding:2px;" class="label-cell"></td>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
										data_produksi += '  <td align="left" style="border-bottom: solid 1px; border-right: solid 1px;border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font  style="color:white;"  onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')" class="text-add-colour-black-soft"  ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';
										data_produksi += '  <td style="  border-color:gray;" class="label-cell"  colspan="1"></td>';
									}

									if (now >= moment(val.penjualan_tanggal_kirim).subtract(8, 'days')) {
										var warna_telat2 = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
									} else {
										var warna_telat2 = '';

									}

									const oneDay = 24 * 60 * 60 * 1000;
									const firstDate = new Date(moment().format('YYYY, MM, DD'));
									const secondDate = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));


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


									data_produksi += '<td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; ' + warna_telat2 + ' border-color:gray;" class="label-cell"   align="left"><font onclick="detail_button_cabang(\'' + i + '\',\'produksi\');">' + val.penjualan_jenis + '</font>';
									data_produksi += '<a id="button_noted_cabang_' + i + '" onclick="rubahStatusProduksi(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'noted\')" class="button-small col button" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: lightgrey; color:black;';
									data_produksi += '"> <center>Noted</center> </a>';
									data_produksi += '<a id="button_body_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_body + '\',\'body\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: orange; color:white;';
									data_produksi += '"> <center>Body</center> </a>';
									data_produksi += '<a id="button_proses_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_proses + '\',\'proses\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:7px; display:none;width:100%; border-radius: 10px;background-color: green; color:white;';
									data_produksi += '"> <center>Proses</center> </a>';
									data_produksi += '<br><a id="button_selesai_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_selesai + '\',\'selesai\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:-16px; display:none;width:100%; background-color: blue; border-radius: 10px; color:white;"> <center>Selesai</center> </a> ';
									data_produksi += '</td>';

									if (val.style != null && val.style != 'none') {
										var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
									} else {
										var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
									}


									data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;  background:' + warna + ';" class="label-cell"  align="left"><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan-cabang" onclick="keteranganCustomCabang(\'' + val.penjualan_detail_performa_id + '\')">' + spesifikasi + '</font></td>';
									if (val.keterangan == null || val.keterangan == "") {
										data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray; " class="label-cell"  align="center">-</td>';

									} else {
										var str = val.keterangan;
										if (str.length > 15) {
											var truncated = val.keterangan.substring(0, 15);
											data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + truncated + '<span style="font-size:25px;"> .....</span></p></td>';
										} else {
											data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + str + '</p></td>';
										}
									}
									//	data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;" class="label-cell"  align="left" width="11,3%">';

									//	data_produksi += '<button onclick="resetStatusProduksiCabang(\'' + val.penjualan_detail_performa_id + '\');"  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold">Reset</button>';

									//data_produksi += '</td>';


									data_produksi += '  <td  style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="right">' + (parseInt(val.penjualan_qty) - parseInt(val.stok)) + '</td>';

									data_produksi += '  <td style=" background:' + warna + ';  border-left: solid  gray 1px;   border-bottom: solid  gray 1px; " class="label-cell"  align="center">';


									if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
										data_produksi += '' + sisa_kirim_sj + '';
									} else {
										data_produksi += '' + ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik)) + '';
									}

									data_produksi += '  </td>	';

									if (val.wilayah != null) {
										wilayah = val.wilayah;
									} else {
										wilayah = '-';
									}

									// data_produksi += '  <td class="label-cell" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;"><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"  data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Shipment</a></td>';

									// data_produksi += '  <td class="label-cell" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;">' + wilayah + '</td>';
									if (val.status_produksi == 'selesai') {
										if (val.foto_produksi_selesai != null) {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">Foto</button></td>';
										} else {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;">Foto</button></td>';
										}

										if (val.foto_produksi_sjc != null) {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">SJC</button></td>';
										} else {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;">SJC</button></td>';
										}


										if (sisa_kirim_sj <= 0) {
											var color_btn_sj_id = "btn-color-blueWhite";
										} else if (val.penjualan_total_kirim == null) {
											var color_btn_sj_id = "bg-dark-gray-young text-add-colour-black-soft";
										} else if (sisa_kirim_sj > 0) {
											var color_btn_sj_id = "btn-color-greenWhite";
										}

										if (val.total_terima_pabrik == null || val.total_terima_pabrik == 0) {
											var color_btn_terima_id = "bg-dark-gray-young text-add-colour-black-soft";
										} else if (val.total_terima_pabrik > 0) {
											var color_btn_terima_id = "btn-color-greenWhite";
										}

										if (val.total_terima_pabrik != null || val.total_terima_pabrik != 0) {
											if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {

												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

												data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';

												data_produksi += '</td>';
											} else {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

												data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';

												data_produksi += '</td>';
											}

										} else {
											if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

												data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';

												data_produksi += '</td>';

											} else {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

												data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';

												data_produksi += '</td>';
											}
										}

									} else {
										data_produksi += '  <td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
										data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
										data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
									}



									data_produksi += ' </tr>';
									count_qty_produksi += (parseInt(val.penjualan_qty) - parseInt(val.stok));
									// sisa_qty_produksi += ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik));

								}
								// }
							}
						}
					} else {
						if (val.extra == null || val.extra == 1) {
							if (val.total_terima_pabrik >= val.penjualan_qty) {
								warna = "";
								warna_telat = "";
								if (val.status_produksi == 'proses') {
									warna = "linear-gradient(#4a8a4a , forestgreen); /* Standard syntax */ background: -webkit-linear-gradient(#4a8a4a , forestgreen); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#4a8a4a , forestgreen); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#4a8a4a , forestgreen); /* For Firefox 3.6 to 15 */ color:white;";
								} else if (val.status_produksi == 'selesai') {
									warna = "linear-gradient(#067afb , #002b46); /* Standard syntax */ background: -webkit-linear-gradient(#067afb , #002b46); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#067afb , #002b46); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#067afb , #002b46); /* For Firefox 3.6 to 15 */ color:white;";
								} else if (val.status_produksi == 'body') {
									warna = "linear-gradient(#c5a535  , #cf8600); /* Standard syntax */ background: -webkit-linear-gradient(#c5a535 , #cf8600); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#c5a535 , #cf8600); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#c5a535 , #cf8600); /* For Firefox 3.6 to 15 */ color:white;";
								} else if (val.status_produksi == 'noted') {
									warna = "linear-gradient(#918f8a  , #b3afaa); /* Standard syntax */ background: -webkit-linear-gradient(#918f8a  , #b3afaa); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#918f8a  , #b3afaa); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#918f8a  , #b3afaa); /* For Firefox 3.6 to 15 */ color:white;";
								}


								if (nota != val.penjualan_id) {

									const oneDay_2 = 24 * 60 * 60 * 1000;
									const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
									const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

									const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
									if (firstDate_2 >= secondDate_2) {
										var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
									} else {
										if (diffDays_2 > 0 && diffDays_2 < 3) {
											var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

										} else if (diffDays_2 == 0) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										}
									}

									var row_produksi = '';
									if (localStorage.getItem("lokasi_pabrik") == 'Jakarta') {
										if (val.hide_produksi == 0) {
											row_produksi = 'class="bg-color-yellow" onclick="changeStatusHideProduksi(' + val.penjualan_detail_performa_id + ');"'
										} else {
											row_produksi = ''
										}
									} else {
										row_produksi = ''
									}
									data_produksi += ' <tr ' + row_produksi + '>';
									console.log(warna);
									nota = val.penjualan_id;


									var color_shipment_blink = '';
									if (val.packing == 'polos') {
										if (val.alamat_kirim_penjualan != null) {
											color_shipment_blink = 'announcement btn-color-greenWhite';
											warna_button_packing = '<button class="announcement btn-color-greenWhite text-add-colour-black-soft button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')"></button>';
										} else {
											color_shipment_blink = '';
											warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold"></button>';
										}
									} else if (val.packing == 'plastik') {
										if (val.alamat_kirim_penjualan != null) {
											color_shipment_blink = 'announcement btn-color-greenWhite';
											warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Plastik</button>';
										} else {
											color_shipment_blink = '';
											warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold">Plastik</button>';
										}
									} else if (val.packing == 'kardus') {
										if (val.alamat_kirim_penjualan != null) {
											color_shipment_blink = 'announcement btn-color-greenWhite';
											warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Kardus</button>';
										} else {
											color_shipment_blink = '';
											warna_button_packing = '<button class="card-color-brown button-small col button text-bold">Kardus</button>';
										}
									} else {
										color_shipment_blink = '';
										warna_button_packing = '';
									}

									data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;padding:2px;" class="label-cell"  align="left" >';
									data_produksi += '    ' + warna_button_packing + '  ';
									data_produksi += '  </td>';

									data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
									data_produksi += '  <td  align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
									data_produksi += '  <td   align="left" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')"><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';

									data_produksi += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  align="left">' + val.client_nama + '</td>';
								} else {

									const oneDay_2 = 24 * 60 * 60 * 1000;
									const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
									const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

									const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
									if (firstDate_2 >= secondDate_2) {
										var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
									} else {
										if (diffDays_2 > 0 && diffDays_2 < 3) {
											var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

										} else if (diffDays_2 == 0) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										}
									}
									data_produksi += ' <tr>';
									data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-right: solid 1px; border-color:gray;padding:2px;" class="label-cell"></td>';
									data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
									data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
									data_produksi += '  <td align="left" style="border-bottom: solid 1px; border-right: solid 1px;border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font  style="color:white;"  onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')" class="text-add-colour-black-soft"  ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';
									data_produksi += '  <td style="  border-color:gray;" class="label-cell"  colspan="1"></td>';
								}

								if (now >= moment(val.penjualan_tanggal_kirim).subtract(8, 'days')) {
									var warna_telat2 = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
								} else {
									var warna_telat2 = '';

								}

								const oneDay = 24 * 60 * 60 * 1000;
								const firstDate = new Date(moment().format('YYYY, MM, DD'));
								const secondDate = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));


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


								data_produksi += '<td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; ' + warna_telat2 + ' border-color:gray;" class="label-cell"   align="left"><font onclick="detail_button_cabang(\'' + i + '\',\'produksi\');">' + val.penjualan_jenis + '</font>';
								data_produksi += '<a id="button_noted_cabang_' + i + '" onclick="rubahStatusProduksi(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'noted\')" class="button-small col button" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: lightgrey; color:black;';
								data_produksi += '"> <center>Noted</center> </a>';
								data_produksi += '<a id="button_body_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_body + '\',\'body\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: orange; color:white;';
								data_produksi += '"> <center>Body</center> </a>';
								data_produksi += '<a id="button_proses_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_proses + '\',\'proses\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:7px; display:none;width:100%; border-radius: 10px;background-color: green; color:white;';
								data_produksi += '"> <center>Proses</center> </a>';
								data_produksi += '<br><a id="button_selesai_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_selesai + '\',\'selesai\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:-16px; display:none;width:100%; background-color: blue; border-radius: 10px; color:white;"> <center>Selesai</center> </a> ';
								data_produksi += '</td>';


								if (val.style != null && val.style != 'none') {
									var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
								} else {
									var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
								}


								data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;  background:' + warna + ';" class="label-cell"  align="left"><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan-cabang" onclick="keteranganCustomCabang(\'' + val.penjualan_detail_performa_id + '\')">' + spesifikasi + '</font></td>';
								if (val.keterangan == null || val.keterangan == "") {
									data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray; " class="label-cell"  align="center">-</td>';

								} else {
									var str = val.keterangan;
									if (str.length > 15) {
										var truncated = val.keterangan.substring(0, 15);
										data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + truncated + '<span style="font-size:25px;"> .....</span></p></td>';
									} else {
										data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + str + '</p></td>';
									}
								}
								//	data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;" class="label-cell"  align="left" width="11,3%">';

								//	data_produksi += '<button onclick="resetStatusProduksiCabang(\'' + val.penjualan_detail_performa_id + '\');"  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold">Reset</button>';

								//data_produksi += '</td>';


								data_produksi += '  <td  style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="right">' + (parseInt(val.penjualan_qty) - parseInt(val.stok)) + '</td>';

								data_produksi += '  <td style=" background:' + warna + ';  border-left: solid  gray 1px;   border-bottom: solid  gray 1px; " class="label-cell"  align="center">';


								if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
									data_produksi += '' + sisa_kirim_sj + '';
								} else {
									data_produksi += '' + ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik)) + '';
								}

								data_produksi += '  </td>	';

								if (val.wilayah != null) {
									wilayah = val.wilayah;
								} else {
									wilayah = '-';
								}

								// data_produksi += '  <td class="label-cell" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;"><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"  data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Shipment</a></td>';

								// data_produksi += '  <td class="label-cell" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;">' + wilayah + '</td>';
								if (val.status_produksi == 'selesai') {
									if (val.foto_produksi_selesai != null) {
										data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">Foto</button></td>';
									} else {
										data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;">Foto</button></td>';
									}

									if (val.foto_produksi_sjc != null) {
										data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">SJC</button></td>';
									} else {
										data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;">SJC</button></td>';
									}


									if (sisa_kirim_sj <= 0) {
										var color_btn_sj_id = "btn-color-blueWhite";
									} else if (val.penjualan_total_kirim == null) {
										var color_btn_sj_id = "bg-dark-gray-young text-add-colour-black-soft";
									} else if (sisa_kirim_sj > 0) {
										var color_btn_sj_id = "btn-color-greenWhite";
									}

									if (val.total_terima_pabrik == null || val.total_terima_pabrik == 0) {
										var color_btn_terima_id = "bg-dark-gray-young text-add-colour-black-soft";
									} else if (val.total_terima_pabrik > 0) {
										var color_btn_terima_id = "btn-color-greenWhite";
									}

									if (val.total_terima_pabrik != null || val.total_terima_pabrik != 0) {
										if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {

											data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

											data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';

											data_produksi += '</td>';
										} else {
											data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

											data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';

											data_produksi += '</td>';
										}

									} else {
										if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
											data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

											data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';

											data_produksi += '</td>';

										} else {
											data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';

											data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';

											data_produksi += '</td>';
										}
									}

								} else {
									data_produksi += '  <td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
									data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
									data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
								}



								data_produksi += ' </tr>';
								count_qty_produksi += (parseInt(val.penjualan_qty) - parseInt(val.stok));
								// sisa_qty_produksi += ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik));

							}
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
			data_produksi += ' <tr>';
			data_produksi += ' <td style="border-top:1px solid gray" colspan="8"></td>';
			data_produksi += ' <td align="right"  style="border-right: solid gray 1px; border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell"   align="center" width="11,3%"><font>' + count_qty_produksi + '</font>';
			// data_produksi += '  <td align="right"  style="border-right: solid gray 1px; border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell"   align="center" width="11,3%"><font>' + sisa_qty_produksi + '</font>';

			data_produksi += ' </tr>';

			jQuery('#produk_data_cabang').html(data_produksi);



			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {


		}
	});
}

function changeStatusHideProduksi(penjualan_detail_performa_id) {
	jQuery.ajax({
		type: "POST",
		url: "" + BASE_API + "/update-status-hide-produksi",
		dataType: "JSON",
		data: {
			penjualan_detail_performa_id: penjualan_detail_performa_id,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
		},
		success: function (data) {
			app.dialog.close();
			if (data.status == 'success') {
				app.dialog.alert('Berhasil Update Data');
				chooseDataProduksiCabangRedirect(localStorage.getItem("pilihan_cabang"));
			} else if (data.status == 'failed') {
				app.dialog.alert('Gagal Update Data');
				chooseDataProduksiCabangRedirect(localStorage.getItem("pilihan_cabang"));
			}
		},
		error: function (xmlhttprequest, textstatus, message) {
			app.dialog.alert('Ada kendala pada koneksi server, Silahkan Coba Kembali');
			jQuery("#back-input-alamat-kirim-notif").click();
			app.popup.close();
		}
	});
}


function shipmentNotif(penjualan_id) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-Alamat",
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id,
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$("#input_alamat_kirim_cabang_popup")[0].reset();
		},
		success: function (data) {
			app.dialog.close();
			var alamat_kirim = "";
			var client_nama = "";
			var hp_alamat = "";
			var tgl_kirim_cabang_alamat = "";
			var keterangan_cabang_alamat = "";
			if (data.data != null) {
				alamat_kirim = data.data.alamat_kirim_penjualan;
				client_nama = data.data.client_nama;
				hp_alamat = data.data.client_telp;
				if (data.data.tgl_kirim_cabang != null) {
					tgl_kirim_cabang_alamat = moment(data.data.tgl_kirim_cabang).format('DD-MMM-YY');
				} else {
					tgl_kirim_cabang_alamat = '-';
				}
				if (data.data.tgl_kirim_cabang != null) {
					keterangan_cabang_alamat = data.data.keterangan_cabang;
				} else {
					keterangan_cabang_alamat = '-';
				}
			} else {
				alamat_kirim = '-';
				client_nama = '-';
				hp_alamat = '-';
				tgl_kirim_cabang_alamat = '-';
				keterangan_cabang_alamat = '-';
			}

			$$('#alamat_kirim_cabang_popup').val(alamat_kirim);
			$$('#nama_cabang_popup').val(client_nama);
			$$('#hp_cabang_alamat').val(hp_alamat);
			$$('#tgl_kirim_cabang_alamat').val(tgl_kirim_cabang_alamat);
			$$('#keterangan_cabang_alamat').val(keterangan_cabang_alamat);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getSuratJalanDetailCabang(penjualan_detail_performa_id, penjualan_id, penjualan_qty, client_nama, kode_spk) {

	jQuery('#popup-pembayaran-td-client_nama1').html(client_nama + ' - ' + kode_spk);

	$('#file_foto_surat_jalan').val('');

	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-penjualan-surat-jalan-" + localStorage.getItem("lower_api_pabrik"),
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id
		},
		beforeSend: function () {
		},
		success: function (data) {
			var total_stock = 0;
			$.each(data.data, function (i_pjl_qty, item_pjl_qty) {
				total_stock += item_pjl_qty.penjualan_qty;
			});

			$$('#stok_sj').html(total_stock);
			getSuratJalanListCabang(penjualan_id, penjualan_qty);
			var penjualan_value = "";
			var penjualan_value_2 = "";
			penjualan_value_2 += '<tr>';
			penjualan_value_2 += '<td width="50%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><input style="height:28px; width:100%;" type="hidden" id="penjualan_total_qty_detail" name="penjualan_total_qty_detail" placeholder="penjualan_total_qty_detail" value="' + total_stock + '" required validate/> <input type="hidden" id="penjualan_id_sj" name="penjualan_id_sj" placeholder="penjualan_id_sj" value="' + penjualan_id + '" required validate/> <input type="text" style="width:100%; height:28px;" id="kendaraan" name="kendaraan" placeholder="kendaraan" required validate/></td>';
			penjualan_value_2 += '<td width="50%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><input style="height:28px; width:100%;" type="text" id="plat" name="plat" placeholder="Plat" required validate/></td>';
			penjualan_value_2 += '</tr>';
			penjualan_value_2 += '<tr>';
			penjualan_value_2 += '<td width="50%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><input style="height:28px; width:100%;" type="text" id="pengirim" name="pengirim" placeholder="pengirim" required validate/></td>';
			penjualan_value_2 += '<td width="50%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><input style="height:28px; width:100%;" type="text" onclick="SJValue();" id="no_surat_jalan" name="no_surat_jalan" placeholder="No Surat Jalan" required validate/></td>';
			penjualan_value_2 += '</tr>';
			penjualan_value_2 += '<tr >';
			penjualan_value_2 += '<td colspan="2">';

			penjualan_value_2 += '  <div class="card">';
			penjualan_value_2 += '	  <center>';
			penjualan_value_2 += ' <input   type="file" name="file_foto_surat_jalan" id="file_foto_surat_jalan" accept="image/*;capture=camera" required validate /></center>';

			penjualan_value_2 += '	  </center>';



			penjualan_value_2 += '  </div>';

			penjualan_value_2 += '</td>';
			penjualan_value_2 += '</tr>';
			var total_fix_qty_kirim = 0;
			$.each(data.data, function (i2, item2) {
				jQuery.ajax({
					type: 'POST',
					url: BASE_API + "/get-surat-jalan-detail",
					dataType: 'JSON',
					data: {
						penjualan_detail_performa_id: item2.penjualan_detail_performa_id
					},
					beforeSend: function () {
					},
					success: function (data) {
						var stock_item = 0;
						var jumlah_pesanan = 0;

						$.each(data.data, function (stok_detail_qty, item_stok_detail) {
							stock_item += item_stok_detail.jumlah_kirim;
						});

						$.each(data.data_sj, function (stok_detail_qty_2, item_stok_detail_2) {
							jumlah_pesanan += item_stok_detail_2.penjualan_qty;
						});
						var total_fix = parseInt(jumlah_pesanan) - parseInt(stock_item);
						total_fix_qty_kirim += total_fix;
						//	console.log(total_fix_qty_kirim);
						$('#jumlah_stok_item_' + item2.penjualan_detail_performa_id + '').html(total_fix);
						$('#kirim_stok_item_' + item2.penjualan_detail_performa_id + '').html(stock_item);
						$('#total_stok_item_' + item2.penjualan_detail_performa_id + '').html(jumlah_pesanan);
						if (total_fix <= 0) {
							$('#jumlah_' + i2 + '').css("background-color", "blue");
							$('.td_jumlah_' + i2 + '').css("background-color", "blue");
							$('#jumlah_' + i2 + '').attr('readonly', true);
							$('#jumlah_' + i2 + '').val(0);
							$('#jumlah_' + i2 + '').prop("onclick", null).off("click");

						}
					},
					error: function (xmlhttprequest, textstatus, message) {
					}
				});

				penjualan_value += '<tr>';
				penjualan_value += '<td width="28%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item2.penjualan_jenis + '</td>';
				penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell" id="total_stok_item_' + item2.penjualan_detail_performa_id + '" ></td>';
				penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell" id="kirim_stok_item_' + item2.penjualan_detail_performa_id + '" ></td>';
				penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell" id="jumlah_stok_item_' + item2.penjualan_detail_performa_id + '" ></td>';

				console.log(localStorage.getItem('total_fix_qty_sisa'));
				if (item2.status_produksi == 'selesai') {

					penjualan_value += '<td width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell td_jumlah_' + i2 + '"><input style="width:100%; height:28px; background-color:white; color:black;" type="number" class="jumlah_item_sj" id="jumlah_' + i2 + '" name="jumlah_' + i2 + '" placeholder="Jumlah" value="0" onclick="SJEmptyValue(' + i2 + ');" required validate/><input  type="hidden" id="kode_' + i2 + '" value="' + item2.penjualan_detail_performa_id + '" name="kode_' + i2 + '" /></td>';


				} else {
					penjualan_value += '<td width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell td_jumlah_' + i2 + '"><input style="width:100%; height:28px; background-color:red; color:white;" type="number" class="jumlah_item_sj" id="jumlah_' + i2 + '" name="jumlah_' + i2 + '" placeholder="Jumlah" value="0"  required validate readonly/><input  type="hidden" id="kode_' + i2 + '" value="' + item2.penjualan_detail_performa_id + '" name="kode_' + i2 + '" /></td>';


				}
				penjualan_value += '</tr>'


			});


			$$('#detail_surat_jalan_cabang').html(penjualan_value);
			$$('#detail_surat_jalan1_cabang').html(penjualan_value_2);
			$('.jumlah_item_sj').val("");

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function getSuratJalanListCabang(penjualan_id, penjualan_qty) {

	var server_pilihan_cabang = localStorage.getItem("server_pilihan_cabang");
	var image_server = server_pilihan_cabang.replace('/api', '');
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-surat-jalan-list",
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id
		},
		beforeSend: function () {
			app.dialog.preloader('Harap Tunggu');
			$$('#terkirim_sj').html('-');
			$$('#kurang_terkirim_sj').html('-');
		},
		success: function (data) {
			app.dialog.close();

			var penjualan_value = "";
			var total_qty = 0;
			var total_stok_sj = $$('#stok_sj').html();

			if (data.data.length != 0) {
				$.each(data.data, function (i_qty, item_qty) {
					total_qty += item_qty.jumlah_kirim;
				});
				$$('#terkirim_sj').html(total_qty);
				$$('#kurang_terkirim_sj').html(total_stok_sj - total_qty);
			}

			$.each(data.data_distinct, function (i_d, item_d) {
				penjualan_value += '<tr>';
				penjualan_value += '<td  style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;" align="center"  class="label-cell col col-border bg-dark-gray-medium">' + item_d.no_surat_jalan + '</td>';
				penjualan_value += '<td align="center" colspan="3" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell col col-border bg-dark-gray-medium">' + moment(item_d.tanggal).format('DD-MMM-YY hh:mm') + '</td>';
				if (item_d.foto_surat_jalan != null) {
					penjualan_value += '<td align="center"  style="  border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><button style="background-color: blue; color:white;" class="text-add-colour-black-soft button-small col button text-bold"  onclick="lihatFotoSuratJalanCabang(\'' + item_d.foto_surat_jalan + '\',\'' + image_server + '\');">Foto</button></td>';
				} else {
					penjualan_value += '<td align="center"  style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell"><button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold"  onclick="lihatFotoSuratJalanCabang(\'' + item_d.foto_surat_jalan + '\',\'' + image_server + '\');">Foto</button></td>';
				}
				penjualan_value += '</tr>';
				penjualan_value += '<tr>';
				penjualan_value += '<td align="center" width="12%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Jumlah</td>';
				penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Type</td>';
				penjualan_value += '<td align="center" width="17%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Plat</td>';
				penjualan_value += '<td align="center" width="20%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Kendaraan</td>';
				penjualan_value += '<td align="center" width="15%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell bg-dark-gray-young">Pengirim</td>';

				penjualan_value += '</tr>';
				$.each(data.data, function (i, item) {
					if (item.jumlah_kirim != null && item.jumlah_kirim != 0) {
						if (item_d.tanggal == item.tanggal) {
							penjualan_value += '<tr>';
							penjualan_value += '<td align="center" width="12%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.jumlah_kirim + '</td>';
							penjualan_value += '<td align="center" width="18%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.penjualan_jenis + '</td>';
							penjualan_value += '<td align="center" width="17%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.plat + '</td>';
							penjualan_value += '<td align="center" width="20%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.kendaraan + '</td>';
							penjualan_value += '<td align="center" width="15%" style="border-left:1px solid gray;  border-right:1px solid gray; border-bottom:1px solid gray;"  class="label-cell">' + item.pengirim + '</td>';

							penjualan_value += '</tr>';
						}
					}
				});

			});


			$$('#detail_surat_jalan_history_cabang').html(penjualan_value);

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function lihatFotoSuratJalanCabang(src, image_server) {
	console.log('KLIK');
	var gambar_zoom = image_server + '/foto_surat_jalan/' + src;
	var myPhotoBrowserPopupDark = app.photoBrowser.create({
		photos: [
			'' + gambar_zoom + ''
		],
		theme: 'dark',
		type: 'popup'
	});
	myPhotoBrowserPopupDark.open();
}

function prosesSuratJalanCabang() {

	var count_jumlah_item_sj = 0;
	$$('.jumlah_item_sj').each(function () {
		count_jumlah_item_sj++;
	});


	if (count_jumlah_item_sj == 0) {
		app.dialog.alert('Tidak Ada Jumlah Qty Kirim');
	} else {
		if (!$$('#surat_jalan_form_cabang')[0].checkValidity()) {
			app.dialog.alert('Cek Isian Surat Anda');
		} else {
			var formData = new FormData(jQuery("#surat_jalan_form_cabang")[0]);

			formData.append('jumlah_item_sj', count_jumlah_item_sj);
			if (!$$('#surat_jalan_form_cabang')[0].checkValidity()) {
				app.dialog.alert('Cek Isian Surat Jalan Anda');
			} else {

				jQuery.ajax({
					type: 'POST',
					url: BASE_API + "/surat-jalan-proses-" + localStorage.getItem("lower_api_pabrik"),
					dataType: 'JSON',
					data: formData,
					contentType: false,
					processData: false,
					beforeSend: function () {
						app.dialog.preloader('Harap Tunggu');
					},
					success: function (data) {
						getHeaderPenjualanKunjungan(1);
						app.dialog.close();
						app.popup.close();
						$$('#surat_jalan_field').empty();
						if (data.status == 'done') {
							app.dialog.alert('Berhasil Input Surat Jalan');
						} else if (data.status == 'failed') {
							app.dialog.alert('Gagal Input Surat Jalan');
						}
					},
					error: function (xmlhttprequest, textstatus, message) {
					}
				});

			}

		}
	}



}

function getDataExtraCabang() {
	jQuery(".wilayah-column").show();
	if (jQuery('#perusahaan_produksi_filter_cabang').val() == '' || jQuery('#perusahaan_produksi_filter_cabang').val() == null) {
		perusahaan_produksi_value = "empty";
	} else {
		perusahaan_produksi_value = jQuery('#perusahaan_produksi_filter_cabang').val();
	}

	if (jQuery('#type_produksi_filter_cabang').val() == '' || jQuery('#type_produksi_filter_cabang').val() == null) {
		type_produksi_filter = "empty";
	} else {
		type_produksi_filter = jQuery('#type_produksi_filter_cabang').val();
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
		url: BASE_API + "/get-data-extra-produksi-" + localStorage.getItem("lower_api_pabrik"),
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			status: 'new_app',
			perusahaan_produksi_value: perusahaan_produksi_value,
			type_produksi_filter: type_produksi_filter,
			startdate: startdate,
			enddate: enddate
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
				var now = moment();
				var count_qty_produksi = 0;
				var sisa_qty_produksi = 0;
				var warna_button_packing = '';
				jQuery.each(data.data, function (i, val) {
					var sisa_kirim_sj = parseFloat(val.penjualan_qty) - parseFloat(data.surat_jalan_count[val.penjualan_detail_performa_id]);
					if (localStorage.getItem('arsip') == null || localStorage.getItem('arsip') == '') {
						var arsip_value = "empty";
					} else {
						var arsip_value = localStorage.getItem('arsip');
					}


					if (arsip_value == 'empty') {
						if (val.total_terima_pabrik < (val.penjualan_qty - val.stok)) {
							if (val.foto_produksi_selesai == null || sisa_kirim_sj > 0 || val.penjualan_total_kirim == null) {
								if (val.foto_produksi_selesai == null || val.foto_produksi_sjc == null) {
									warna = "";
									warna_telat = "";
									if (val.status_produksi == 'proses') {
										warna = "linear-gradient(#4a8a4a , forestgreen); /* Standard syntax */ background: -webkit-linear-gradient(#4a8a4a , forestgreen); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#4a8a4a , forestgreen); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#4a8a4a , forestgreen); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'selesai') {
										warna = "linear-gradient(#067afb , #002b46); /* Standard syntax */ background: -webkit-linear-gradient(#067afb , #002b46); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#067afb , #002b46); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#067afb , #002b46); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'body') {
										warna = "linear-gradient(#c5a535  , #cf8600); /* Standard syntax */ background: -webkit-linear-gradient(#c5a535 , #cf8600); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#c5a535 , #cf8600); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#c5a535 , #cf8600); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'noted') {
										warna = "linear-gradient(#918f8a  , #b3afaa); /* Standard syntax */ background: -webkit-linear-gradient(#918f8a  , #b3afaa); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#918f8a  , #b3afaa); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#918f8a  , #b3afaa); /* For Firefox 3.6 to 15 */ color:white;";
									}

									if (nota != val.penjualan_id) {

										const oneDay_2 = 24 * 60 * 60 * 1000;
										const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
										const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

										const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
										if (firstDate_2 >= secondDate_2) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										} else {
											if (diffDays_2 > 0 && diffDays_2 < 3) {
												var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

											} else if (diffDays_2 == 0) {
												var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
											}
										}


										var row_produksi = '';
										if (localStorage.getItem("lokasi_pabrik") == 'Jakarta') {
											if (val.hide_produksi == 0) {
												row_produksi = 'class="bg-color-yellow" onclick="changeStatusHideProduksi(' + val.penjualan_detail_performa_id + ');"'
											} else {
												row_produksi = ''
											}
										} else {
											row_produksi = ''
										}
										data_produksi += ' <tr ' + row_produksi + '>';
										console.log(warna);
										nota = val.penjualan_id;


										var color_shipment_blink = '';
										if (val.packing == 'polos') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite text-add-colour-black-soft button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')"></button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold"></button>';
											}
										} else if (val.packing == 'plastik') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Plastik</button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold">Plastik</button>';
											}
										} else if (val.packing == 'kardus') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = '';
												warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Kardus</button>';
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

										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
										data_produksi += '  <td  align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
										data_produksi += '  <td   align="left" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font  style="color:white;"  onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')" ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';

										data_produksi += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  align="left">' + val.client_nama + '</td>';
									} else {

										const oneDay_2 = 24 * 60 * 60 * 1000;
										const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
										const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

										const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
										if (firstDate_2 >= secondDate_2) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										} else {
											if (diffDays_2 > 0 && diffDays_2 < 3) {
												var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

											} else if (diffDays_2 == 0) {
												var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
											}
										}
										data_produksi += ' <tr>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-right: solid 1px; border-color:gray;padding:3px;" class="label-cell"></td>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
										data_produksi += '  <td align="left" style="border-bottom: solid 1px; border-right: solid 1px;border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font  style="color:white;"  onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')" class="text-add-colour-black-soft"  ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';
										data_produksi += '  <td style="  border-color:gray;" class="label-cell"  colspan="1"></td>';
									}

									if (now >= moment(val.penjualan_tanggal_kirim).subtract(8, 'days')) {
										var warna_telat2 = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
									} else {
										var warna_telat2 = '';

									}

									const oneDay = 24 * 60 * 60 * 1000;
									const firstDate = new Date(moment().format('YYYY, MM, DD'));
									const secondDate = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));


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


									data_produksi += '<td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; ' + warna_telat2 + ' border-color:gray;" class="label-cell"   align="left"><font onclick="detail_button_cabang(\'' + i + '\',\'produksi\');">' + val.penjualan_jenis + '</font>';
									data_produksi += '<a id="button_noted_cabang_' + i + '" onclick="rubahStatusProduksi(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'noted\')" class="button-small col button" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: lightgrey; color:black;';
									data_produksi += '"> <center>Noted</center> </a>';
									data_produksi += '<a id="button_body_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_body + '\',\'body\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: orange; color:white;';
									data_produksi += '"> <center>Body</center> </a>';
									data_produksi += '<a id="button_proses_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_proses + '\',\'proses\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:7px; display:none;width:100%; border-radius: 10px;background-color: green; color:white;';
									data_produksi += '"> <center>Proses</center> </a>';
									data_produksi += '<br><a id="button_selesai_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_selesai + '\',\'selesai\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:-16px; display:none;width:100%; background-color: blue; border-radius: 10px; color:white;"> <center>Selesai</center> </a> ';

									data_produksi += '</td>';


									if (val.style != null && val.style != 'none') {
										var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
									} else {
										var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
									}


									data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;  background:' + warna + ';" class="label-cell"  align="left"><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan-cabang" onclick="keteranganCustomCabang(\'' + val.penjualan_detail_performa_id + '\')">' + spesifikasi + '</font></td>';
									if (val.keterangan == null || val.keterangan == "") {
										data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray; " class="label-cell"  align="center">-</td>';

									} else {
										var str = val.keterangan;
										if (str.length > 15) {
											var truncated = val.keterangan.substring(0, 15);
											data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + truncated + '<span style="font-size:25px;"> .....</span></p></td>';
										} else {
											data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + str + '</p></td>';
										}
									}
									//	data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;" class="label-cell"  align="left" width="11,3%">';

									//	data_produksi += '<button onclick="resetStatusProduksiCabang(\'' + val.penjualan_detail_performa_id + '\');"  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold">Reset</button>';

									//data_produksi += '</td>';


									data_produksi += '  <td  style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="right">' + (parseInt(val.penjualan_qty) - parseInt(val.stok)) + '</td>';
									data_produksi += '  <td style=" background:' + warna + ';  border-left: solid  gray 1px;   border-bottom: solid  gray 1px; " class="label-cell"  align="right">';



									if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
										data_produksi += '' + sisa_kirim_sj + '';
									} else {
										data_produksi += '' + ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik)) + '';
									}



									// if (val.wilayah != null) {
									// 	data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell" >' + val.wilayah + '</td>';

									// } else {
									// 	data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell" >-</td>';
									// }

									// data_produksi += '  </td>	';
									// data_produksi += '  <td class="label-cell" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;"><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"  data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Shipment</a></td>';
									if (val.status_produksi == 'selesai') {

										if (val.foto_produksi_selesai != null) {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">Foto</button></td>';
										} else {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;">Foto</button></td>';
										}

										if (val.foto_produksi_sjc != null) {
											data_produksi += '  <td class="label-cell popup-open" style="order-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">SJC</button></td>';
										} else {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;">SJC</button></td>';
										}

										var sisa_kirim_sj = parseFloat(val.penjualan_qty) - parseFloat(data.surat_jalan_count[val.penjualan_detail_performa_id]);

										if (sisa_kirim_sj <= 0) {
											var color_btn_sj_id = "btn-color-blueWhite";
										} else if (val.penjualan_total_kirim == null) {
											var color_btn_sj_id = "bg-dark-gray-young text-add-colour-black-soft";
										} else if (sisa_kirim_sj > 0) {
											var color_btn_sj_id = "btn-color-greenWhite";
										}

										if (val.total_terima_pabrik == null || val.total_terima_pabrik == 0) {
											var color_btn_terima_id = "bg-dark-gray-young text-add-colour-black-soft";
										} else if (val.total_terima_pabrik > 0) {
											var color_btn_terima_id = "btn-color-greenWhite";
										}

										if (val.total_terima_pabrik != null || val.total_terima_pabrik != 0) {
											if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';
												data_produksi += '</td>';
											} else {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';
												data_produksi += '</td>';
											}
										} else {
											if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';
												data_produksi += '</td>';
											} else {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';
												data_produksi += '</td>';
											}
										}

									} else {
										data_produksi += '  <td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
										data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
										data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
									}



									data_produksi += ' </tr>';
									count_qty_produksi += (parseInt(val.penjualan_qty) - parseInt(val.stok));
									// sisa_qty_produksi += ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik));

								} else if (val.foto_produksi_selesai == null || val.total_terima_pabrik == 0) {
									warna = "";
									warna_telat = "";
									if (val.status_produksi == 'proses') {
										warna = "linear-gradient(#4a8a4a , forestgreen); /* Standard syntax */ background: -webkit-linear-gradient(#4a8a4a , forestgreen); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#4a8a4a , forestgreen); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#4a8a4a , forestgreen); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'selesai') {
										warna = "linear-gradient(#067afb , #002b46); /* Standard syntax */ background: -webkit-linear-gradient(#067afb , #002b46); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#067afb , #002b46); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#067afb , #002b46); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'body') {
										warna = "linear-gradient(#c5a535  , #cf8600); /* Standard syntax */ background: -webkit-linear-gradient(#c5a535 , #cf8600); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#c5a535 , #cf8600); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#c5a535 , #cf8600); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'noted') {
										warna = "linear-gradient(#918f8a  , #b3afaa); /* Standard syntax */ background: -webkit-linear-gradient(#918f8a  , #b3afaa); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#918f8a  , #b3afaa); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#918f8a  , #b3afaa); /* For Firefox 3.6 to 15 */ color:white;";
									}

									if (nota != val.penjualan_id) {

										const oneDay_2 = 24 * 60 * 60 * 1000;
										const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
										const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

										const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
										if (firstDate_2 >= secondDate_2) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										} else {
											if (diffDays_2 > 0 && diffDays_2 < 3) {
												var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

											} else if (diffDays_2 == 0) {
												var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
											}
										}


										data_produksi += ' <tr>';
										console.log(warna);
										nota = val.penjualan_id;


										var color_shipment_blink = '';
										if (val.packing == 'polos') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite text-add-colour-black-soft button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')"></button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold"></button>';
											}
										} else if (val.packing == 'plastik') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Plastik</button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold">Plastik</button>';
											}
										} else if (val.packing == 'kardus') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = '';
												warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Kardus</button>';
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

										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
										data_produksi += '  <td  align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
										data_produksi += '  <td   align="left" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font  style="color:white;"  onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')" class="text-add-colour-black-soft"  ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';

										data_produksi += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  align="left">' + val.client_nama + '</td>';
									} else {

										const oneDay_2 = 24 * 60 * 60 * 1000;
										const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
										const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

										const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
										if (firstDate_2 >= secondDate_2) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										} else {
											if (diffDays_2 > 0 && diffDays_2 < 3) {
												var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

											} else if (diffDays_2 == 0) {
												var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
											}
										}
										data_produksi += ' <tr>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-right: solid 1px; border-color:gray;padding:3px;" class="label-cell"></td>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
										data_produksi += '  <td align="left" style="border-bottom: solid 1px; border-right: solid 1px;border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font  style="color:white;"  onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')" class="text-add-colour-black-soft"  ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';
										data_produksi += '  <td style="  border-color:gray;" class="label-cell"  colspan="1"></td>';
									}

									if (now >= moment(val.penjualan_tanggal_kirim).subtract(8, 'days')) {
										var warna_telat2 = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
									} else {
										var warna_telat2 = '';

									}

									const oneDay = 24 * 60 * 60 * 1000;
									const firstDate = new Date(moment().format('YYYY, MM, DD'));
									const secondDate = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));


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


									data_produksi += '<td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; ' + warna_telat2 + ' border-color:gray;" class="label-cell"   align="left"><font onclick="detail_button_cabang(\'' + i + '\',\'produksi\');">' + val.penjualan_jenis + '</font>';
									data_produksi += '<a id="button_noted_cabang_' + i + '" onclick="rubahStatusProduksi(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'noted\')" class="button-small col button" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: lightgrey; color:black;';
									data_produksi += '"> <center>Noted</center> </a>';
									data_produksi += '<a id="button_body_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_body + '\',\'body\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: orange; color:white;';
									data_produksi += '"> <center>Body</center> </a>';
									data_produksi += '<a id="button_proses_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_proses + '\',\'proses\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:7px; display:none;width:100%; border-radius: 10px;background-color: green; color:white;';
									data_produksi += '"> <center>Proses</center> </a>';
									data_produksi += '<br><a id="button_selesai_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_selesai + '\',\'selesai\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:-16px; display:none;width:100%; background-color: blue; border-radius: 10px; color:white;"> <center>Selesai</center> </a> ';
									data_produksi += '</td>';


									if (val.style != null && val.style != 'none') {
										var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
									} else {
										var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
									}


									data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;  background:' + warna + ';" class="label-cell"  align="left"><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan-cabang" onclick="keteranganCustomCabang(\'' + val.penjualan_detail_performa_id + '\')">' + spesifikasi + '</font></td>';
									if (val.keterangan == null || val.keterangan == "") {
										data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray; " class="label-cell"  align="center">-</td>';

									} else {
										var str = val.keterangan;
										if (str.length > 15) {
											var truncated = val.keterangan.substring(0, 15);
											data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + truncated + '<span style="font-size:25px;"> .....</span></p></td>';
										} else {
											data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + str + '</p></td>';
										}
									}
									//	data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;" class="label-cell"  align="left" width="11,3%">';

									//	data_produksi += '<button onclick="resetStatusProduksiCabang(\'' + val.penjualan_detail_performa_id + '\');"  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold">Reset</button>';

									//data_produksi += '</td>';


									data_produksi += '  <td  style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="right">' + (parseInt(val.penjualan_qty) - parseInt(val.stok)) + '</td>';
									data_produksi += '  <td style=" background:' + warna + ';  border-left: solid  gray 1px;   border-bottom: solid  gray 1px; " class="label-cell"  align="right">';



									if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
										data_produksi += '' + sisa_kirim_sj + '';
									} else {
										data_produksi += '' + ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik)) + '';
									}



									// if (val.wilayah != null) {
									// 	data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell" >' + val.wilayah + '</td>';

									// } else {
									// 	data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell" >-</td>';
									// }

									// data_produksi += '  </td>	';
									// data_produksi += '  <td class="label-cell" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;"><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"  data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Shipment</a></td>';
									if (val.status_produksi == 'selesai') {

										if (val.foto_produksi_selesai != null) {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">Foto</button></td>';
										} else {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;">Foto</button></td>';
										}

										if (val.foto_produksi_sjc != null) {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">SJC</button></td>';
										} else {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;">SJC</button></td>';
										}

										var sisa_kirim_sj = parseFloat(val.penjualan_qty) - parseFloat(data.surat_jalan_count[val.penjualan_detail_performa_id]);

										if (sisa_kirim_sj <= 0) {
											var color_btn_sj_id = "btn-color-blueWhite";
										} else if (val.penjualan_total_kirim == null) {
											var color_btn_sj_id = "bg-dark-gray-young text-add-colour-black-soft";
										} else if (sisa_kirim_sj > 0) {
											var color_btn_sj_id = "btn-color-greenWhite";
										}

										if (val.total_terima_pabrik == null || val.total_terima_pabrik == 0) {
											var color_btn_terima_id = "bg-dark-gray-young text-add-colour-black-soft";
										} else if (val.total_terima_pabrik > 0) {
											var color_btn_terima_id = "btn-color-greenWhite";
										}

										if (val.total_terima_pabrik != null || val.total_terima_pabrik != 0) {
											if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';
												data_produksi += '</td>';
											} else {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';
												data_produksi += '</td>';
											}
										} else {
											if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';
												data_produksi += '</td>';
											} else {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';
												data_produksi += '</td>';
											}
										}

									} else {
										data_produksi += '  <td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
										data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
										data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
									}



									data_produksi += ' </tr>';
									count_qty_produksi += (parseInt(val.penjualan_qty) - parseInt(val.stok));
									// sisa_qty_produksi += ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik));
								}
							}
						}
					} else {
						if (val.total_terima_pabrik >= val.penjualan_qty) {
							if (val.foto_produksi_selesai == null || sisa_kirim_sj > 0 || val.penjualan_total_kirim == null) {
								if (val.foto_produksi_selesai == null || val.foto_produksi_sjc == null) {
									warna = "";
									warna_telat = "";
									if (val.status_produksi == 'proses') {
										warna = "linear-gradient(#4a8a4a , forestgreen); /* Standard syntax */ background: -webkit-linear-gradient(#4a8a4a , forestgreen); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#4a8a4a , forestgreen); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#4a8a4a , forestgreen); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'selesai') {
										warna = "linear-gradient(#067afb , #002b46); /* Standard syntax */ background: -webkit-linear-gradient(#067afb , #002b46); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#067afb , #002b46); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#067afb , #002b46); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'body') {
										warna = "linear-gradient(#c5a535  , #cf8600); /* Standard syntax */ background: -webkit-linear-gradient(#c5a535 , #cf8600); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#c5a535 , #cf8600); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#c5a535 , #cf8600); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'noted') {
										warna = "linear-gradient(#918f8a  , #b3afaa); /* Standard syntax */ background: -webkit-linear-gradient(#918f8a  , #b3afaa); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#918f8a  , #b3afaa); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#918f8a  , #b3afaa); /* For Firefox 3.6 to 15 */ color:white;";
									}

									if (nota != val.penjualan_id) {

										const oneDay_2 = 24 * 60 * 60 * 1000;
										const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
										const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

										const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
										if (firstDate_2 >= secondDate_2) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										} else {
											if (diffDays_2 > 0 && diffDays_2 < 3) {
												var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

											} else if (diffDays_2 == 0) {
												var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
											}
										}


										var row_produksi = '';
										if (localStorage.getItem("lokasi_pabrik") == 'Jakarta') {
											if (val.hide_produksi == 0) {
												row_produksi = 'class="bg-color-yellow" onclick="changeStatusHideProduksi(' + val.penjualan_detail_performa_id + ');"'
											} else {
												row_produksi = ''
											}
										} else {
											row_produksi = ''
										}
										data_produksi += ' <tr ' + row_produksi + '>';
										console.log(warna);
										nota = val.penjualan_id;


										var color_shipment_blink = '';
										if (val.packing == 'polos') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite text-add-colour-black-soft button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')"></button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold"></button>';
											}
										} else if (val.packing == 'plastik') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Plastik</button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold">Plastik</button>';
											}
										} else if (val.packing == 'kardus') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = '';
												warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Kardus</button>';
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

										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
										data_produksi += '  <td  align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
										data_produksi += '  <td   align="left" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font  style="color:white;"  onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')" ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';

										data_produksi += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  align="left">' + val.client_nama + '</td>';
									} else {

										const oneDay_2 = 24 * 60 * 60 * 1000;
										const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
										const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

										const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
										if (firstDate_2 >= secondDate_2) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										} else {
											if (diffDays_2 > 0 && diffDays_2 < 3) {
												var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

											} else if (diffDays_2 == 0) {
												var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
											}
										}
										data_produksi += ' <tr>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-right: solid 1px; border-color:gray;padding:3px;" class="label-cell"></td>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
										data_produksi += '  <td align="left" style="border-bottom: solid 1px; border-right: solid 1px;border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font  style="color:white;"  onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')" class="text-add-colour-black-soft"  ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';
										data_produksi += '  <td style="  border-color:gray;" class="label-cell"  colspan="1"></td>';
									}

									if (now >= moment(val.penjualan_tanggal_kirim).subtract(8, 'days')) {
										var warna_telat2 = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
									} else {
										var warna_telat2 = '';

									}

									const oneDay = 24 * 60 * 60 * 1000;
									const firstDate = new Date(moment().format('YYYY, MM, DD'));
									const secondDate = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));


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


									data_produksi += '<td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; ' + warna_telat2 + ' border-color:gray;" class="label-cell"   align="left"><font onclick="detail_button_cabang(\'' + i + '\',\'produksi\');">' + val.penjualan_jenis + '</font>';
									data_produksi += '<a id="button_noted_cabang_' + i + '" onclick="rubahStatusProduksi(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'noted\')" class="button-small col button" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: lightgrey; color:black;';
									data_produksi += '"> <center>Noted</center> </a>';
									data_produksi += '<a id="button_body_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_body + '\',\'body\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: orange; color:white;';
									data_produksi += '"> <center>Body</center> </a>';
									data_produksi += '<a id="button_proses_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_proses + '\',\'proses\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:7px; display:none;width:100%; border-radius: 10px;background-color: green; color:white;';
									data_produksi += '"> <center>Proses</center> </a>';
									data_produksi += '<br><a id="button_selesai_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_selesai + '\',\'selesai\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:-16px; display:none;width:100%; background-color: blue; border-radius: 10px; color:white;"> <center>Selesai</center> </a> ';
									data_produksi += '</td>';


									if (val.style != null && val.style != 'none') {
										var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
									} else {
										var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
									}


									data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;  background:' + warna + ';" class="label-cell"  align="left"><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan-cabang" onclick="keteranganCustomCabang(\'' + val.penjualan_detail_performa_id + '\')">' + spesifikasi + '</font></td>';
									if (val.keterangan == null || val.keterangan == "") {
										data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray; " class="label-cell"  align="center">-</td>';

									} else {
										var str = val.keterangan;
										if (str.length > 15) {
											var truncated = val.keterangan.substring(0, 15);
											data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + truncated + '<span style="font-size:25px;"> .....</span></p></td>';
										} else {
											data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + str + '</p></td>';
										}
									}
									//	data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;" class="label-cell"  align="left" width="11,3%">';

									//	data_produksi += '<button onclick="resetStatusProduksiCabang(\'' + val.penjualan_detail_performa_id + '\');"  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold">Reset</button>';

									//data_produksi += '</td>';


									data_produksi += '  <td  style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="right">' + (parseInt(val.penjualan_qty) - parseInt(val.stok)) + '</td>';
									data_produksi += '  <td style=" background:' + warna + ';  border-left: solid  gray 1px;   border-bottom: solid  gray 1px; " class="label-cell"  align="right">';



									if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
										data_produksi += '' + sisa_kirim_sj + '';
									} else {
										data_produksi += '' + ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik)) + '';
									}



									// if (val.wilayah != null) {
									// 	data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell" >' + val.wilayah + '</td>';

									// } else {
									// 	data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell" >-</td>';
									// }

									// data_produksi += '  </td>	';
									// data_produksi += '  <td class="label-cell" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;"><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"  data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Shipment</a></td>';
									if (val.status_produksi == 'selesai') {

										if (val.foto_produksi_selesai != null) {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">Foto</button></td>';
										} else {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;">Foto</button></td>';
										}

										if (val.foto_produksi_sjc != null) {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">SJC</button></td>';
										} else {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;>SJC</button></td>';
										}

										var sisa_kirim_sj = parseFloat(val.penjualan_qty) - parseFloat(data.surat_jalan_count[val.penjualan_detail_performa_id]);

										if (sisa_kirim_sj <= 0) {
											var color_btn_sj_id = "btn-color-blueWhite";
										} else if (val.penjualan_total_kirim == null) {
											var color_btn_sj_id = "bg-dark-gray-young text-add-colour-black-soft";
										} else if (sisa_kirim_sj > 0) {
											var color_btn_sj_id = "btn-color-greenWhite";
										}

										if (val.total_terima_pabrik == null || val.total_terima_pabrik == 0) {
											var color_btn_terima_id = "bg-dark-gray-young text-add-colour-black-soft";
										} else if (val.total_terima_pabrik > 0) {
											var color_btn_terima_id = "btn-color-greenWhite";
										}

										if (val.total_terima_pabrik != null || val.total_terima_pabrik != 0) {
											if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';
												data_produksi += '</td>';
											} else {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';
												data_produksi += '</td>';
											}
										} else {
											if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';
												data_produksi += '</td>';
											} else {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';
												data_produksi += '</td>';
											}
										}

									} else {
										data_produksi += '  <td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
										data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
										data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
									}



									data_produksi += ' </tr>';
									count_qty_produksi += (parseInt(val.penjualan_qty) - parseInt(val.stok));
									// sisa_qty_produksi += ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik));

								} else if (val.foto_produksi_selesai == null || val.total_terima_pabrik == 0) {
									warna = "";
									warna_telat = "";
									if (val.status_produksi == 'proses') {
										warna = "linear-gradient(#4a8a4a , forestgreen); /* Standard syntax */ background: -webkit-linear-gradient(#4a8a4a , forestgreen); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#4a8a4a , forestgreen); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#4a8a4a , forestgreen); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'selesai') {
										warna = "linear-gradient(#067afb , #002b46); /* Standard syntax */ background: -webkit-linear-gradient(#067afb , #002b46); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#067afb , #002b46); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#067afb , #002b46); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'body') {
										warna = "linear-gradient(#c5a535  , #cf8600); /* Standard syntax */ background: -webkit-linear-gradient(#c5a535 , #cf8600); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#c5a535 , #cf8600); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#c5a535 , #cf8600); /* For Firefox 3.6 to 15 */ color:white;";
									} else if (val.status_produksi == 'noted') {
										warna = "linear-gradient(#918f8a  , #b3afaa); /* Standard syntax */ background: -webkit-linear-gradient(#918f8a  , #b3afaa); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#918f8a  , #b3afaa); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#918f8a  , #b3afaa); /* For Firefox 3.6 to 15 */ color:white;";
									}

									if (nota != val.penjualan_id) {

										const oneDay_2 = 24 * 60 * 60 * 1000;
										const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
										const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

										const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
										if (firstDate_2 >= secondDate_2) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										} else {
											if (diffDays_2 > 0 && diffDays_2 < 3) {
												var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

											} else if (diffDays_2 == 0) {
												var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
											}
										}


										data_produksi += ' <tr>';
										console.log(warna);
										nota = val.penjualan_id;


										var color_shipment_blink = '';
										if (val.packing == 'polos') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite text-add-colour-black-soft button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')"></button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold"></button>';
											}
										} else if (val.packing == 'plastik') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = 'announcement btn-color-greenWhite';
												warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Plastik</button>';
											} else {
												color_shipment_blink = '';
												warna_button_packing = '<button class="bg-dark-gray-young text-add-colour-black-soft button-small col button text-bold">Plastik</button>';
											}
										} else if (val.packing == 'kardus') {
											if (val.alamat_kirim_penjualan != null) {
												color_shipment_blink = '';
												warna_button_packing = '<button class="announcement btn-color-greenWhite button-small col button text-bold popup-open" data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Kardus</button>';
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

										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
										data_produksi += '  <td  align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
										data_produksi += '  <td   align="left" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font  style="color:white;"  onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')" class="text-add-colour-black-soft"  ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';

										data_produksi += '  <td style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell"  align="left">' + val.client_nama + '</td>';
									} else {

										const oneDay_2 = 24 * 60 * 60 * 1000;
										const firstDate_2 = new Date(moment().format('YYYY, MM, DD'));
										const secondDate_2 = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));

										const diffDays_2 = Math.round(Math.abs((firstDate_2 - secondDate_2) / oneDay_2));
										if (firstDate_2 >= secondDate_2) {
											var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
										} else {
											if (diffDays_2 > 0 && diffDays_2 < 3) {
												var warna_telat = 'background: linear-gradient(#FF5733 , #FF5733); /* Standard syntax */ background: -webkit-linear-gradient(#FF5733 , #FF5733); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#FF5733 , #FF5733); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#FF5733 , #FF5733); /* For Firefox 3.6 to 15 */ background-color:#FF5733; color:white;';

											} else if (diffDays_2 == 0) {
												var warna_telat = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
											}
										}
										data_produksi += ' <tr>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-right: solid 1px; border-color:gray;padding:3px;" class="label-cell"></td>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px; border-right: solid 1px; border-color:gray; ' + warna_telat + '" class="label-cell">' + (nomor++) + '</td>';
										data_produksi += '  <td align="center" style="border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell">' + moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('DD-MMM') + '</td>';
										data_produksi += '  <td align="left" style="border-bottom: solid 1px; border-right: solid 1px;border-top: solid 1px; border-left: solid 1px;  border-color:gray; ' + warna_telat + '" class="label-cell popup-open" data-popup=".detail-sales-produksi-cabang"><font  style="color:white;"  onclick="detailPenjualanProduksiCabang(\'' + val.penjualan_id + '\',\'' + val.penjualan_detail_performa_id + '\')" class="text-add-colour-black-soft"  ><b>' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '</b></font></td>';
										data_produksi += '  <td style="  border-color:gray;" class="label-cell"  colspan="1"></td>';
									}

									if (now >= moment(val.penjualan_tanggal_kirim).subtract(8, 'days')) {
										var warna_telat2 = 'background: linear-gradient(#b53737 , #b20000); /* Standard syntax */ background: -webkit-linear-gradient(#b53737 , #b20000); /* For Safari 5.1 to 6.0 */ background: -o-linear-gradient(#b53737 , #b20000); /* For Opera 11.1 to 12.0 */ background: -moz-linear-gradient(#b53737 , #b20000); /* For Firefox 3.6 to 15 */ background-color:#b20000; color:white;';
									} else {
										var warna_telat2 = '';

									}

									const oneDay = 24 * 60 * 60 * 1000;
									const firstDate = new Date(moment().format('YYYY, MM, DD'));
									const secondDate = new Date(moment(val.penjualan_tanggal_kirim).subtract(8, 'days').format('YYYY-MM-DD'));


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


									data_produksi += '<td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px; ' + warna_telat2 + ' border-color:gray;" class="label-cell" width="11,3%"  align="left"><font onclick="detail_button_cabang(\'' + i + '\',\'produksi\');">' + val.penjualan_jenis + '</font>';
									data_produksi += '<a id="button_noted_cabang_' + i + '" onclick="rubahStatusProduksi(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'noted\')" class="button-small col button" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: lightgrey; color:black;';
									data_produksi += '"> <center>Noted</center> </a>';
									data_produksi += '<a id="button_body_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_body + '\',\'body\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:15px; display:none;width:100%; border-radius: 10px;background-color: orange; color:white;';
									data_produksi += '"> <center>Body</center> </a>';
									data_produksi += '<a id="button_proses_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_proses + '\',\'proses\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:7px; display:none;width:100%; border-radius: 10px;background-color: green; color:white;';
									data_produksi += '"> <center>Proses</center> </a>';
									data_produksi += '<br><a id="button_selesai_cabang_' + i + '" onclick="getDataFotoProduksiSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.foto_produksi_selesai + '\',\'selesai\')"  data-popup=".produksi-selesai-foto-cabang" class="button-small col button popup-open" style="margin-top:-16px; display:none;width:100%; background-color: blue; border-radius: 10px; color:white;"> <center>Selesai</center> </a> ';
									data_produksi += '</td>';


									if (val.style != null && val.style != 'none') {
										var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0] + '<br>- ' + val.style.replace(',', '<br>- ');
									} else {
										var spesifikasi = '- ' + val.produk_keterangan_kustom.split('\n')[0];
									}


									data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;  background:' + warna + ';" class="label-cell"  align="left"><font  style="color:white;" class="text-add-colour-black-soft popup-open" data-popup=".detail-custom-keterangan-cabang" onclick="keteranganCustomCabang(\'' + val.penjualan_detail_performa_id + '\')">' + spesifikasi + '</font></td>';
									if (val.keterangan == null || val.keterangan == "") {
										data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray; " class="label-cell"  align="center">-</td>';

									} else {
										var str = val.keterangan;
										if (str.length > 15) {
											var truncated = val.keterangan.substring(0, 15);
											data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + truncated + '<span style="font-size:25px;"> .....</span></p></td>';
										} else {
											data_produksi += '  <td style=" background:' + warna + '; border-bottom: solid 1px;  border-left: solid 1px; border-color:gray;" class="label-cell"  align="left"><p  style="color:white;margin:0px;" class="text-add-colour-black-soft popup-open" data-popup=".detail-keterangan-cabang" onclick="keteranganCabang(\'' + val.penjualan_detail_performa_id + '\')" >' + str + '</p></td>';
										}
									}
									//	data_produksi += '  <td  style="border-bottom: solid gray 1px; border-top: solid 1px; border-right: solid 1px;  border-color:gray;" class="label-cell"  align="left" width="11,3%">';

									//	data_produksi += '<button onclick="resetStatusProduksiCabang(\'' + val.penjualan_detail_performa_id + '\');"  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold">Reset</button>';

									//data_produksi += '</td>';


									data_produksi += '  <td  style=" background:' + warna + '; border-bottom: solid 1px; border-left: solid 1px; border-color:gray;" class="label-cell" align="right">' + (parseInt(val.penjualan_qty) - parseInt(val.stok)) + '</td>';
									data_produksi += '  <td style=" background:' + warna + ';  border-left: solid  gray 1px;   border-bottom: solid  gray 1px; " class="label-cell"  align="right">';



									if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
										data_produksi += '' + sisa_kirim_sj + '';
									} else {
										data_produksi += '' + ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik)) + '';
									}



									// if (val.wilayah != null) {
									// 	data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell" >' + val.wilayah + '</td>';

									// } else {
									// 	data_produksi += '  <td style="border-bottom: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell" >-</td>';
									// }

									// data_produksi += '  </td>	';
									// data_produksi += '  <td class="label-cell" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;"><a class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold popup-open"  data-popup=".input-alamat-kirim-cabang" onclick="shipmentNotif(\'' + val.penjualan_id + '\')">Shipment</a></td>';
									if (val.status_produksi == 'selesai') {

										if (val.foto_produksi_selesai != null) {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">Foto</button></td>';
										} else {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".data-produksi-selesai-foto-cabang" onclick="getDataFotoProduksiCabang(\'' + val.produksi_tanggal_body + '\',\'' + val.produksi_tanggal_proses + '\',\'' + val.produksi_tanggal_selesai + '\',\'' + val.foto_produksi_body + '\',\'' + val.foto_produksi_proses + '\',\'' + val.foto_produksi_selesai + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;">Foto</button></td>';
										}

										if (val.foto_produksi_sjc != null) {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button style="color:white; width: 85px;" class="card-color-blue button-small col button text-bold">SJC</button></td>';
										} else {
											data_produksi += '  <td class="label-cell popup-open" style="border-right: solid 1px; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" data-popup=".produksi-sjc-foto-cabang" onclick="getDataFotoSjcSelesaiCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.foto_produksi_sjc + '\')"><button class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold" style="width: 85px;">SJC</button></td>';
										}

										var sisa_kirim_sj = parseFloat(val.penjualan_qty) - parseFloat(data.surat_jalan_count[val.penjualan_detail_performa_id]);

										if (sisa_kirim_sj <= 0) {
											var color_btn_sj_id = "btn-color-blueWhite";
										} else if (val.penjualan_total_kirim == null) {
											var color_btn_sj_id = "bg-dark-gray-young text-add-colour-black-soft";
										} else if (sisa_kirim_sj > 0) {
											var color_btn_sj_id = "btn-color-greenWhite";
										}

										if (val.total_terima_pabrik == null || val.total_terima_pabrik == 0) {
											var color_btn_terima_id = "bg-dark-gray-young text-add-colour-black-soft";
										} else if (val.total_terima_pabrik > 0) {
											var color_btn_terima_id = "btn-color-greenWhite";
										}

										if (val.total_terima_pabrik != null || val.total_terima_pabrik != 0) {
											if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';
												data_produksi += '</td>';
											} else {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';
												data_produksi += '</td>';
											}
										} else {
											if (val.tujuan_kirim != null && val.tujuan_kirim == "customer") {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_sj_id + ' button-small col button popup-open text-bold" data-popup=".surat-jalan-cabang" onclick="getSuratJalanDetailCabang(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_total_qty + '\',\'' + val.client_nama + '\',\'' + moment(val.penjualan_tanggal).format('DDMMYY') + '-' + val.penjualan_id.replace(/\INV_/g, '').replace(/^0+/, '') + '\');">Customer</button>';
												data_produksi += '</td>';
											} else {
												data_produksi += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell">';
												data_produksi += '   <button class="' + color_btn_terima_id + ' button-small col button popup-open text-bold" style="width: 85px;" data-popup=".terima-pabrik" onclick="terimaPabrik(\'' + val.penjualan_detail_performa_id + '\',\'' + val.penjualan_qty + '\',\'' + val.stok + '\',\'' + val.client_nama + '\',\'' + val.penjualan_id + '\',\'' + val.penjualan_jenis.replace(/\"/g, '').replace(/\'/g, '') + '\',\'' + val.penjualan_tanggal + '\');">Pusat</button>';
												data_produksi += '</td>';
											}
										}

									} else {
										data_produksi += '  <td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
										data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
										data_produksi += '	<td class="label-cell" style="border-right: 1px solid gray; border-bottom:1px solid gray;"></td>';
									}



									data_produksi += ' </tr>';
									count_qty_produksi += (parseInt(val.penjualan_qty) - parseInt(val.stok));
									// sisa_qty_produksi += ((parseInt(val.penjualan_qty) - parseInt(val.stok)) - parseFloat(val.total_terima_pabrik));
								}
							}
						}
					}

				});

				data_produksi += ' <tr>';
				data_produksi += ' <td colspan="8" style="border-top: 1px solid gray;"></td>';
				data_produksi += '  <td align="right"  style="border-right: solid gray 1px; border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell"   align="center" width="11,3%"><font>' + count_qty_produksi + '</font>';
				// data_produksi += '  <td align="right"  style="border-right: solid gray 1px; border-bottom: solid gray 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" class="label-cell"   align="center" width="11,3%"><font>' + sisa_qty_produksi + '</font>';

				data_produksi += ' </tr>';
			} else {
				data_produksi += ' <tr>';
				data_produksi += ' <td colspan="8">';
				data_produksi += ' <center> Data Kosong </center>';
				data_produksi += ' </td>';
				data_produksi += ' </tr>';

			}


			jQuery('#produk_data_cabang').html(data_produksi);



			app.dialog.close();
		},
		error: function (xmlhttprequest, textstatus, message) {


		}
	});
}

function getYearHistoryPointProduksi() {
	let startYear = 2010;
	let endYear = new Date().getFullYear();
	for (i = endYear; i > startYear; i--) {
		if (i == endYear) {
			$('.year_popup_produksi_selesai_cabang').append($('<option selected />').val(i).html(i));
		} else {
			$('.year_popup_produksi_selesai_cabang').append($('<option />').val(i).html(i));
		}
	}
}

function updateFotoProduksiSelesaiProcessCabang() {
	var status = jQuery('#status_produksi_cabang').val();
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
					if ($('#file_foto_produksi_cabang').val() != "") {
						var formData = new FormData(jQuery("#upload_foto_produksi_selesai_cabang")[0]);
						formData.append('penjualan_detail_performa_id_foto_produksi_selesai_pusat', jQuery('#penjualan_detail_performa_id_foto_produksi_selesai_cabang').val());
						var file = $('#file_foto_produksi_cabang').get(0).files[0];
						formData.append('file_foto_produksi', file);
						formData.append('status_produksi', status);
						formData.append('penjualan_id', jQuery('#penjualan_id_produksi_cabang').val());

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
								if (localStorage.getItem("extra_parameter") == 0) {
									getDataProduksiCabang();
								} else {
									getDataExtraCabang()
								}
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

function getDataFotoProduksiSelesaiCabang(penjualan_detail_performa_id, penjualan_id, foto_produksi_selesai, status) {

	var BASE_PATH_IMAGE_BUKTI_PRODUKSI_CABANG = 'https://tasindo-sale-webservice.digiseminar.id/foto_produksi';

	jQuery('#penjualan_detail_performa_id_foto_produksi_selesai_cabang').val(penjualan_detail_performa_id);
	jQuery('#status_produksi_cabang').val(status);
	jQuery('#penjualan_id_produksi_cabang').val(penjualan_id);

	localStorage.removeItem('file_foto_produksi_cabang');
	$('#file_foto_produksi_cabang_view').attr('src', '');
	$('#file_foto_produksi_view_now_cabang').attr('src', '');
	$$(".custom-file-upload-produk-selesai-cabang").show();
	if (foto_produksi_selesai != 'null') {
		jQuery('#file_foto_produksi_view_now_cabang').attr('src', BASE_PATH_IMAGE_BUKTI_PRODUKSI_CABANG + '/' + foto_produksi_selesai);
	} else {
		jQuery('#file_foto_produksi_view_now_cabang').attr('src', 'https://tasindo-sale-webservice.digiseminar.id/noimage.jpg');
	}
}