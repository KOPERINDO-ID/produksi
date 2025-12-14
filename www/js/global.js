

// Configuration APP
function checkConnection() {
	var networkState = navigator.connection.type;

	var states = {};
	states[Connection.UNKNOWN] = 'Unknown connection';
	states[Connection.ETHERNET] = 'Ethernet connection';
	states[Connection.WIFI] = 'WiFi connection';
	states[Connection.CELL_2G] = 'Cell 2G connection';
	states[Connection.CELL_3G] = 'Cell 3G connection';
	states[Connection.CELL_4G] = 'Cell 4G connection';
	states[Connection.CELL] = 'Cell generic connection';
	states[Connection.NONE] = 'no_network';

	if (states[networkState] == 'no_network') {
		app.dialog.alert('Internet Sangat Lambat, Cek Koneksi Lalu Klik Oke', function () {
			app.views.main.router.navigate(app.views.main.router.currentRoute.url, {
				ignoreCache: true,
				reloadCurrent: true
			});
		});
	}
}




var BASE_API = 'https://tasindo-sale-webservice.digiseminar.id/api';

var BASE_API2 = 'https://tasindo-sale-webservice.digiseminar.id/api';
var BASE_PATH_IMAGE = 'https://tasindo-sale-webservice.digiseminar.id/kunjungan';
var BASE_PATH_IMAGE_PERFORMA = 'https://tasindo-sale-webservice.digiseminar.id/performa_image';
var BASE_PATH_IMAGE_CUSTOMER = 'https://tasindo-sale-webservice.digiseminar.id/customer_logo';
var BASE_PATH_IMAGE_PRODUCT = 'https://tasindo-sale-webservice.digiseminar.id/product_image';
var BASE_PATH_IMAGE_PRODUCT_NEW = 'https://tasindo-sale-webservice.digiseminar.id/product_image_new';
var BASE_PATH_IMAGE_BUKTI_PRODUKSI = 'https://tasindo-sale-webservice.digiseminar.id/foto_produksi';
var BASE_PATH_IMAGE_BUKTI_PURCHASE = 'https://tasindo-sale-webservice.digiseminar.id/foto_purchasing_logo';
var BASE_PATH_IMAGE_BUKTI_PURCHASE_RISEN = 'https://tasindo-sale-webservice.digiseminar.id/foto_purchasing_resin';



function refreshPage() {
	return app.views.main.router.navigate(app.views.main.router.currentRoute.url, { reloadCurrent: true, ignoreCache: true, });
}


function checkInternet() {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/check-internet",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id")
		},
		beforeSend: function () {
		},
		success: function (data) {
			localStorage.setItem("internet_koneksi", "good");
			$("#box_internet").css("background-color", "green");

			console.log(localStorage.getItem("internet_koneksi"));
		},
		error: function (xmlhttprequest, textstatus, message) {
			if (textstatus === "timeout") {
				$("#box_internet").css("background-color", "red");
				localStorage.setItem("internet_koneksi", "fail")

			} else {
				$("#box_internet").css("background-color", "red");
				localStorage.setItem("internet_koneksi", "fail")

			}
		}
	});
}

function hideMenuProduksi() {
	if (localStorage.getItem("lokasi_pabrik") != 'Pusat') {
		$$('.hide_pabrik_cabang').hide();
		$$('.hide_pusat_cabang').show();
	} else {
		$$('.hide_pabrik_cabang').show();
		$$('.hide_pusat_cabang').hide();
	}
}

function inputLog(id_transaksi, jenis, keterangan) {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/input-log-proses",
		dataType: 'JSON',
		data: {
			id_transaksi: id_transaksi,
			jenis: jenis,
			keterangan: keterangan
		},
		beforeSend: function () {
		},
		success: function (data) {
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}


function getPlayAudio() {
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-view-status",
		dataType: 'JSON',
		data: {
			cabang_pembantu: localStorage.getItem("lokasi_pabrik"),
		},
		beforeSend: function () {
		},
		success: function (data) {
			var today = new Date();
			if (today.getHours() == 8 || today.getHours() == 12) {
				if (data.data > 0) {
					var audio = new Audio('img/sound/audio.wav');
					audio.play();
					setTimeout(() => {
						audio.pause();
						audio.currentTime = 0; // Mengatur ulang waktu audio ke awal
						console.log('Audio berhenti.');
					}, 20000);
				}
			}

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}

function selectBank() {
	if (localStorage.getItem("user_location") == 'luar_pulau') {
		$(".input-item-bank option[value='BCA']").remove();
		$(".input-item-bank option[value='BRI']").remove();
		$(".input-item-bank option[value='Mandiri']").remove();
	} else {
		$(".input-item-bank option[value='Mandiri Bisnis']").remove();
	}
}

function selectBankPembayaran() {
	if (localStorage.getItem("user_location") == 'luar_pulau') {
		$(".bank_pembayaran option[value='BCA']").remove();
		$(".bank_pembayaran option[value='BRI']").remove();
		$(".bank_pembayaran option[value='Mandiri']").remove();
	} else {
		$(".bank_pembayaran option[value='Mandiri Bisnis']").remove();
	}
}

function checkLogin() {
	if (localStorage.getItem("login") != "true") {
		return app.views.main.router.navigate('/login');
	} else {
		console.log('is_login');
		console.log(localStorage.getItem("login"));
		console.log(localStorage.getItem("user_location"));
	}
}


function logOut() {
	localStorage.clear();
	return app.views.main.router.navigate('/login');
}

function writeLog(str) {
	if (!logOb) return;
	var log = str + " [" + (new Date()) + "]\n";
	logOb.createWriter(function (fileWriter) {
		fileWriter.seek(fileWriter.length);
		var blob = new Blob([log], { type: 'text/plain' });
		fileWriter.write(blob);
	}, fail);
}

function screenshot_me(client_nama) {
	jQuery('#button_invoice').remove();
	jQuery('.menu-detail-product').hide();
	jQuery('.navbar').hide();


	setTimeout(function () {
		navigator.screenshot.save(function (error, res) {
			if (error) {
				app.dialog.preloader('Gagal');
				setTimeout(function () {
					app.dialog.close();
					app.popup.close();
				}, 2000);
				jQuery('.menu-detail-product').show();
				jQuery('.navbar').show();
			} else {
				app.dialog.preloader('Berhasil');
				setTimeout(function () {
					app.dialog.close();
					app.popup.close();
				}, 2000);
				jQuery('.menu-detail-product').show();
				jQuery('.navbar').show();
			}
		}, 'jpg', 50, '' + client_nama + '_' + moment().format('DDMMYYYYHHmmss') + '');
	}, 1000);
}

function number_format(number, decimals, dec_point, thousands_sep) {

	number = (number + '').replace(/[^0-9+\-Ee.]/g, '');

	var n = !isFinite(+number) ? 0 : +number,

		prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),

		sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,

		dec = (typeof dec_point === 'undefined') ? '.' : dec_point,

		s = '',

		toFixedFix = function (n, prec) {

			var k = Math.pow(10, prec);

			return '' + Math.round(n * k) / k;

		};

	// Fix for IE parseFloat(0.55).toFixed(0) = 0;

	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');

	if (s[0].length > 3) {

		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);

	}

	if ((s[1] || '').length < prec) {

		s[1] = s[1] || '';

		s[1] += new Array(prec - s[1].length + 1).join('0');

	}

	return s.join(dec);

}

/**
 * Popup global: menampilkan semua data yang punya tgl_cs_deadline != null
 * Panggil misalnya di page:afterin atau setelah login: checkCsDeadline();
 */
function checkCsDeadline() {
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + '/cs-deadline-list',
		dataType: 'JSON',
		data: {
			lokasi_pabrik: localStorage.getItem("lokasi_pabrik") || ''
		},
		beforeSend: function () {
			// optional: loader global
		},
		success: function (res) {
			if (!res || !res.data || res.data.length === 0) {
				return; // tidak ada data, tidak perlu popup
			}

			var rowsHtml = '';
			jQuery.each(res.data, function (i, item) {
				var no = i + 1;
				var tgl = item.tgl_cs_deadline
					? moment(item.tgl_cs_deadline).format('DD/MM/YYYY')
					: '-';

				rowsHtml += '' +
					'<tr>' +
					'  <td align="center">' + no + '</td>' +
					'  <td>' + (item.no_spk || '-') + '</td>' +
					'  <td>' + tgl + '</td>' +
					'  <td>' + (item.client_nama || '-') + '</td>' +
					'  <td align="center">' +
					'    <a href="#" class="button button-fill button-small" ' +
					'       onclick="openCsDeadlineForm(\'' + item.penjualan_id + '\', \'' + (item.penjualan_jenis || '') + '\')">' +
					'       Input Selesai' +
					'    </a>' +
					'  </td>' +
					'</tr>';
			});

			var html = '' +
				'<div class="cs-deadline-wrapper">' +
				'  <div class="data-table data-table-init">' +
				'    <table class="table table-striped table-bordered" style="width:100%;" cellpadding="1">' +
				'      <thead>' +
				'        <tr>' +
				'          <th style="width:40px;" align="center">No</th>' +
				'          <th>NO SPK</th>' +
				'          <th>TANGGAL</th>' +
				'          <th>PERUSAHAAN</th>' +
				'          <th style="width:90px;" align="center">OPSI</th>' +
				'        </tr>' +
				'      </thead>' +
				'      <tbody>' + rowsHtml + '</tbody>' +
				'    </table>' +
				'  </div>' +
				'</div>';

			var dialog = app.dialog.create({
				title: 'Estimasi Selesai Produksi',
				content: html,
				buttons: [
					{
						text: 'Tutup',
						close: true
					}
				]
			});

			dialog.open();
		},
		error: function (xhr, status, err) {
			console.log('error get cs deadline', status, err);
		}
	});
}

/**
 * Popup untuk input keterangan & tanggal selesai produksi per penjualan_jenis
 */
function openCsDeadlineForm(penjualan_id, penjualan_jenis) {

	var todayStr = moment().format('YYYY-MM-DD');

	var htmlForm = '' +
		'<div class="list no-hairlines-md">' +
		'  <ul>' +
		'    <li class="item-content item-input">' +
		'      <div class="item-inner">' +
		'        <div class="item-title item-label">Tanggal Selesai Produksi</div>' +
		'        <div class="item-input-wrap">' +
		'          <input type="date" id="cs_tanggal_selesai" name="cs_tanggal_selesai" value="' + todayStr + '" />' +
		'        </div>' +
		'      </div>' +
		'    </li>' +
		'    <li class="item-content item-input">' +
		'      <div class="item-inner">' +
		'        <div class="item-title item-label">Keterangan</div>' +
		'        <div class="item-input-wrap">' +
		'          <textarea id="cs_keterangan" name="cs_keterangan" placeholder="Isi keterangan selesai produksi"></textarea>' +
		'        </div>' +
		'      </div>' +
		'    </li>' +
		'  </ul>' +
		'</div>';

	var dialogForm = app.dialog.create({
		title: 'Input Selesai Produksi',
		content: htmlForm,
		buttons: [
			{
				text: 'Batal',
				onClick: function () {
					// close otomatis
				}
			},
			{
				text: 'Simpan',
				bold: true,
				onClick: function () {
					var tgl = jQuery('#cs_tanggal_selesai').val();
					var ket = jQuery('#cs_keterangan').val();

					saveCsDeadline(penjualan_id, penjualan_jenis, tgl, ket);
				}
			}
		]
	});

	dialogForm.open();
}

/**
 * Kirim ke API untuk simpan tanggal selesai & keterangan
 */
function saveCsDeadline(penjualan_id, penjualan_jenis, tanggal_selesai, keterangan) {
	if (!tanggal_selesai) {
		app.dialog.alert('Tanggal selesai produksi wajib diisi.');
		return;
	}

	jQuery.ajax({
		type: 'POST',
		url: BASE_API + '/cs-deadline-update',
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id,
			penjualan_jenis: penjualan_jenis,
			tanggal_selesai: tanggal_selesai,
			keterangan: keterangan,
			user_modified: localStorage.getItem("user_id") || ''
		},
		beforeSend: function () {
			app.dialog.preloader('Menyimpan...');
		},
		success: function (res) {
			app.dialog.close(); // tutup preloader

			if (!res || !res.status) {
				app.dialog.alert(res && res.message ? res.message : 'Gagal menyimpan data.');
				return;
			}

			app.dialog.alert('Data selesai produksi berhasil disimpan.', function () {
				// refresh popup / halaman jika perlu
				// misal: refreshPage(); atau panggil ulang checkCsDeadline();
				checkCsDeadline();
			});
		},
		error: function (xhr, status, err) {
			app.dialog.close();
			app.dialog.alert('Terjadi kesalahan saat menyimpan data.');
			console.log('error cs-deadline-update', status, err);
		}
	});
}

setInterval(function () {
	checkInternet();
}, 5000);


if (localStorage.getItem("lokasi_pabrik") != 'Pusat') {
	setInterval(function () {
		getPlayAudio();
	}, 60000);
}
