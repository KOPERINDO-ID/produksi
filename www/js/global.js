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

var BASE_API = 'https://tasindo-sale-webservice.digiseminar.id/api'; /** Production Base API */
// var BASE_API = 'https://tasindo-service-staging.digiseminar.id/api'; /** Staging Base API */
// var BASE_API = 'http://127.0.0.1:8000/api' /** Development Base API */

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
		url: BASE_API + "/check-internet",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id")
		},
		beforeSend: function () {
		},
		success: function (data) {
			localStorage.setItem("internet_koneksi", "good");

			// Update styling dengan class untuk efek glow hijau
			$("#box_internet").removeClass("disconnected").addClass("connected");

			console.log(localStorage.getItem("internet_koneksi"));
		},
		error: function (xmlhttprequest, textstatus, message) {
			if (textstatus === "timeout") {
				localStorage.setItem("internet_koneksi", "fail");

				// Update styling dengan class untuk efek glow merah
				$("#box_internet").removeClass("connected").addClass("disconnected");

			} else {
				localStorage.setItem("internet_koneksi", "fail");

				// Update styling dengan class untuk efek glow merah
				$("#box_internet").removeClass("connected").addClass("disconnected");
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
	if (typeof app !== 'undefined' && app.dialog) {
		app.dialog.preloader('Logging out...');
	}

	cleanupNotificationManager(function () {
		localStorage.removeItem("login");
		localStorage.removeItem("user_id");
		localStorage.removeItem("lokasi_pabrik");
		localStorage.removeItem("fcm_token");
		localStorage.removeItem("token_registered");
		localStorage.removeItem("token_registered_at");
		localStorage.removeItem("token_registered_user");
		localStorage.clear();

		if (typeof app !== 'undefined' && app.dialog) {
			app.dialog.close();
		}

		return app.views.main.router.navigate('/login');
	});
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

// ============================================
// SPK URGENT POPUP - GLOBAL
// Menggunakan Framework7 Popup (bukan Dialog)
// Popup akan muncul terus menerus jika ada SPK dengan 
// keterangan_urgent & tgl_produksi_selesai_urgent masih NULL
// ============================================

var spkUrgentData = [];
var spkUrgentInterval = null;

/**
 * Inisialisasi popup container di DOM (panggil sekali saat app init)
 */
function initSpkUrgentPopup() {
	// Hapus jika sudah ada
	$$('.popup.spk-urgent-popup').remove();
	$$('.popup.spk-urgent-detail-popup').remove();

	// Buat popup container untuk list
	var popupListHtml = '' +
		'<div class="popup spk-urgent-popup">' +
		'  <div class="view">' +
		'    <div class="page">' +
		'      <div class="navbar">' +
		'        <div class="navbar-bg" style="background:#ff9800;"></div>' +
		'        <div class="navbar-inner">' +
		'          <div class="title" style="color:#fff;">' +
		'            <i class="f7-icons" style="font-size:20px;">exclamationmark_triangle_fill</i> ' +
		'            SPK URGENT' +
		'          </div>' +
		'          <div class="right">' +
		'            <a href="#" class="link popup-close" data-popup=".spk-urgent-popup" style="color:#fff;">' +
		'              <i class="f7-icons">xmark</i>' +
		'            </a>' +
		'          </div>' +
		'        </div>' +
		'      </div>' +
		'      <div class="toolbar toolbar-bottom">' +
		'        <div class="toolbar-inner">' +
		'          <a href="#" class="link" onclick="showSpkUrgentPopup();">' +
		'            <i class="f7-icons">arrow_clockwise</i> REFRESH' +
		'          </a>' +
		'          <a href="#" class="link popup-close" data-popup=".spk-urgent-popup">' +
		'            <i class="f7-icons">xmark_circle</i> TUTUP SEMENTARA' +
		'          </a>' +
		'        </div>' +
		'      </div>' +
		'      <div class="page-content" id="spk-urgent-list-content" style="padding-top:10px;padding-bottom:60px;">' +
		'      </div>' +
		'    </div>' +
		'  </div>' +
		'</div>';

	// Buat popup container untuk detail
	var popupDetailHtml = '' +
		'<div class="popup spk-urgent-detail-popup">' +
		'  <div class="view">' +
		'    <div class="page">' +
		'      <div class="navbar">' +
		'        <div class="navbar-bg" style="background:#2196f3;"></div>' +
		'        <div class="navbar-inner">' +
		'          <div class="left">' +
		'            <a href="#" class="link" onclick="backToSpkUrgentList();" style="color:#fff;">' +
		'              <i class="f7-icons">chevron_left</i> Kembali' +
		'            </a>' +
		'          </div>' +
		'        </div>' +
		'      </div>' +
		'      <div class="toolbar toolbar-bottom">' +
		'        <div class="toolbar-inner">' +
		'          <a href="#" class="link" onclick="saveSpkUrgent();" style="color:#4caf50;font-weight:bold;">' +
		'            <i class="f7-icons">checkmark_circle_fill</i> SIMPAN' +
		'          </a>' +
		'        </div>' +
		'      </div>' +
		'      <div class="page-content" id="spk-urgent-detail-content" style="padding-top:10px;padding-bottom:60px;background:#fff;">' +
		'      </div>' +
		'    </div>' +
		'  </div>' +
		'</div>';

	// Append ke body
	$$('body').append(popupListHtml);
	$$('body').append(popupDetailHtml);
}

/**
 * Check apakah ada SPK urgent yang perlu diisi
 */
function checkSpkUrgent() {
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + '/spk-urgent-check',
		dataType: 'JSON',
		data: {
			lokasi_pabrik: localStorage.getItem("lokasi_pabrik") || ''
		},
		beforeSend: function () {
		},
		success: function (res) {
			if (res && res.status && res.has_urgent && res.count > 0) {
				showSpkUrgentPopup();
			}
		},
		error: function (xhr, status, err) {
			console.log('error check spk urgent', status, err);
		}
	});
}

/**
 * Tampilkan popup SPK Urgent dengan list data
 */
function showSpkUrgentPopup() {
	// Init popup jika belum ada
	if ($$('.popup.spk-urgent-popup').length === 0) {
		initSpkUrgentPopup();
	}

	jQuery.ajax({
		type: 'POST',
		url: BASE_API + '/spk-urgent-list',
		dataType: 'JSON',
		data: {
			lokasi_pabrik: localStorage.getItem("lokasi_pabrik") || ''
		},
		beforeSend: function () {
			app.dialog.preloader('Memuat data SPK Urgent...');
		},
		success: function (res) {
			app.dialog.close();

			if (!res || !res.data || res.data.length === 0) {
				app.popup.close('.spk-urgent-popup');
				return;
			}

			spkUrgentData = res.data;

			var rowsHtml = '';
			jQuery.each(res.data, function (i, item) {
				var no = i + 1;

				// Format nomor SPK
				var nomorSpk = moment(item.dt_record).format('DDMMYY') + '-' +
					item.penjualan_id.replace(/INV_/g, '').replace(/^0+/, '');

				// Hitung hari tersisa
				var tanggalKirim = moment(item.penjualan_tanggal_kirim);
				var today = moment();
				var hariTersisa = tanggalKirim.diff(today, 'days');

				// Badge hari
				var hariBadge = '';
				if (hariTersisa < 0) {
					hariBadge = '<span class="badge" style="background:#dc3545;color:#fff;">' + Math.abs(hariTersisa) + ' hari lalu</span>';
				} else if (hariTersisa <= 7) {
					hariBadge = '<span class="badge" style="background:#ffc107;color:#333;">' + hariTersisa + ' hari</span>';
				} else {
					hariBadge = '<span class="badge" style="background:#28a745;color:#fff;">' + hariTersisa + ' hari</span>';
				}

				// Format tanggal kirim
				var tglKirim = item.penjualan_tanggal_kirim
					? moment(item.penjualan_tanggal_kirim).format('DD-MMM-YY')
					: '-';

				let btnDetailStyle = item.keterangan_urgent === null ? 'color-gray' : 'color-orange';

				rowsHtml += '' +
					'<tr>' +
					'  <td style="border:1px solid #444;padding:8px;" align="center">' + no + '</td>' +
					'  <td style="border:1px solid #444;padding:8px;white-space:nowrap;" align="center"><b style="color:#2196f3;">' + nomorSpk + '</b></td>' +
					'  <td style="border:1px solid #444;padding:8px;">' + (item.client_nama || '-') + '</td>' +
					'  <td style="border:1px solid #444;padding:8px;white-space:nowrap;" align="center">' + hariBadge + '</td>' +
					'  <td style="border:1px solid #444;padding:8px;white-space:nowrap;" align="center">' + tglKirim + '</td>' +
					'  <td style="border:1px solid #444;padding:8px;" align="center">' +
					`    <button class="button button-fill button-small ${btnDetailStyle}" onclick="showSpkUrgentDetail('${item.penjualan_id}')">` +
					'      <i class="f7-icons" style="font-size:12px;">eye_fill</i> Detail' +
					'    </button>' +
					'  </td>' +
					'</tr>';
			});

			var contentHtml = '' +
				'<div class="block" style="margin:10px;">' +
				'  <div class="card" style="background:#fff3cd;margin:60px 0 15px 0;">' +
				'    <div class="card-content card-content-padding" style="color:#856404;">' +
				'      <p style="margin:0;"><b><i class="f7-icons" style="font-size:16px;">exclamationmark_triangle_fill</i> Perhatian!</b></p>' +
				'      <p style="margin:5px 0 0 0;">Terdapat <b style="color:#dc3545;font-size:18px;">' + res.data.length + '</b> SPK yang memerlukan keterangan urgent dan tanggal selesai produksi.</p>' +
				'    </div>' +
				'  </div>' +
				'  <div class="data-table" style="overflow-x:auto;">' +
				'    <table style="width:100%;border-collapse:collapse;font-size:12px;min-width:600px;">' +
				'      <thead>' +
				'        <tr style="background:#333;">' +
				'          <th style="border:1px solid #444;padding:10px;width:40px;color:#fff;" align="center">No</th>' +
				'          <th style="border:1px solid #444;padding:10px;width:100px;color:#fff;" align="center">No. SPK</th>' +
				'          <th style="border:1px solid #444;padding:10px;color:#fff;">Client</th>' +
				'          <th style="border:1px solid #444;padding:10px;width:90px;color:#fff;" align="center">Sisa Hari</th>' +
				'          <th style="border:1px solid #444;padding:10px;width:90px;color:#fff;" align="center">Tgl Kirim</th>' +
				'          <th style="border:1px solid #444;padding:10px;width:80px;color:#fff;" align="center">Aksi</th>' +
				'        </tr>' +
				'      </thead>' +
				'      <tbody>' + rowsHtml + '</tbody>' +
				'    </table>' +
				'  </div>' +
				'</div>';

			// Set content dan buka popup
			$('#spk-urgent-list-content').html(contentHtml);
			app.popup.open('.spk-urgent-popup');
		},
		error: function (xhr, status, err) {
			app.dialog.close();
			console.log('error get spk urgent list', status, err);
		}
	});
}

/**
 * Tampilkan detail performa SPK
 */
function showSpkUrgentDetail(penjualan_id) {
	jQuery.ajax({
		type: 'POST',
		url: BASE_API + '/spk-urgent-detail',
		dataType: 'JSON',
		data: {
			penjualan_id: penjualan_id
		},
		beforeSend: function () {
			app.dialog.preloader('Memuat detail...');
		},
		success: function (res) {
			app.dialog.close();

			if (!res || !res.status) {
				app.dialog.alert(res && res.message ? res.message : 'Gagal memuat detail.');
				return;
			}

			var header = res.header;
			var details = res.details || [];

			// Format nomor SPK
			var nomorSpk = moment(header.dt_record).format('DDMMYY') + '-' +
				header.penjualan_id.replace(/INV_/g, '').replace(/^0+/, '');

			// Update title
			// $('#spk-urgent-detail-title').text('Detail SPK - ' + nomorSpk); /** Tidak diperlukan lagi */

			// Info header
			var infoHtml = '' +
				'<div class="card" style="margin:64px 0 15px 0;background:#fff;border:1px solid #999">' +
				'  <div class="card-content card-content-padding">' +
				'    <div class="row">' +
				'      <div class="col-50">' +
				'        <small style="color:#999;">No. SPK</small><br>' +
				'        <b style="color:#2196f3;font-size:14px;white-space:nowrap;">' + nomorSpk + '</b>' +
				'      </div>' +
				'      <div class="col-50">' +
				'        <small style="color:#999;">Client</small><br>' +
				'        <b style="color:#fff;">' + (header.client_nama || '-') + '</b>' +
				'      </div>' +
				'    </div>' +
				'    <div class="row" style="margin-top:10px;">' +
				'      <div class="col-50">' +
				'        <small style="color:#999;">Tgl Kirim</small><br>' +
				'        <span style="color:#ff9800;font-weight:bold;">' + moment(header.penjualan_tanggal_kirim).format('DD MMMM YYYY') + '</span>' +
				'      </div>' +
				'      <div class="col-50">' +
				'        <small style="color:#999;">Total Qty</small><br>' +
				'        <span style="color:#4caf50;font-weight:bold;font-size:16px;">' + (header.penjualan_total_qty || 0) + '</span>' +
				'      </div>' +
				'    </div>' +
				'  </div>' +
				'</div>';

			// Detail items table
			var detailRowsHtml = '';

			jQuery.each(details, function (i, item) {
				detailRowsHtml += '' +
					'<tr>' +
					'  <td style="border:1px solid #444;padding:6px;" align="center">' + (i + 1) + '</td>' +
					'  <td style="border:1px solid #444;padding:6px;">' + (item.penjualan_jenis || '-') + '</td>' +
					'  <td style="border:1px solid #444;padding:6px;font-size:10px;">' + (item.produk_keterangan_kustom || '-') + '</td>' +
					'  <td style="border:1px solid #444;padding:6px;" align="center">' + (item.penjualan_qty || 0) + '</td>' +
					'</tr>';
			});

			var tableHtml = '' +
				'<div class="card" style="margin:0 0 15px 0;">' +
				'  <div class="card-header" style="background:#333;color:#fff;">Detail Performa</div>' +
				'  <div class="card-content" style="padding:0;overflow-x:auto;">' +
				'    <table style="width:100%;border-collapse:collapse;font-size:11px;">' +
				'      <thead>' +
				'        <tr style="background:#444;">' +
				'          <th style="border:1px solid #555;padding:8px;width:40px;color:#fff;">No</th>' +
				'          <th style="border:1px solid #555;padding:8px;color:#fff;">Jenis</th>' +
				'          <th style="border:1px solid #555;padding:8px;color:#fff;">Spesifikasi</th>' +
				'          <th style="border:1px solid #555;padding:8px;width:60px;color:#fff;">Qty</th>' +
				'        </tr>' +
				'      </thead>' +
				'      <tbody>' + detailRowsHtml + '</tbody>' +
				'    </table>' +
				'  </div>' +
				'</div>';

			// Form input urgent
			var todayStr = moment().format('YYYY-MM-DD');
			var formHtml = '' +
				'<div class="card" style="margin:0;background:#1a1a1a;border:2px solid #ff9800;">' +
				'  <div class="card-header" style="background:#ff9800;color:#fff;">' +
				'    <i class="f7-icons" style="font-size:16px;">pencil</i> Isi Data Urgent' +
				'  </div>' +
				'  <div class="card-content card-content-padding">' +
				'    <input type="hidden" id="urgent_penjualan_id" value="' + penjualan_id + '">' +
				'    <div class="list no-hairlines-md" style="margin:0;">' +
				'      <ul style="background:transparent;">' +
				'        <li class="item-content item-input">' +
				'          <div class="item-inner">' +
				'            <div class="item-title item-label" style="color:#ff9800;">Keterangan Urgent <span style="color:red;">*</span></div>' +
				'            <div class="item-input-wrap">' +
				'              <textarea id="urgent_keterangan" placeholder="Masukkan keterangan urgent..." rows="3" style="background:#2a2a2a;color:#fff;border:1px solid #444;border-radius:5px;padding:10px;width:100%;"></textarea>' +
				'            </div>' +
				'          </div>' +
				'        </li>' +
				'        <li class="item-content item-input">' +
				'          <div class="item-inner">' +
				'            <div class="item-title item-label" style="color:#ff9800;">Tanggal Produksi Selesai <span style="color:red;">*</span></div>' +
				'            <div class="item-input-wrap">' +
				'              <input type="date" id="urgent_tgl_selesai" value="' + todayStr + '" style="background:#2a2a2a;color:#fff;border:1px solid #444;border-radius:5px;padding:10px;width:100%;">' +
				'            </div>' +
				'          </div>' +
				'        </li>' +
				'      </ul>' +
				'    </div>' +
				'  </div>' +
				'</div>';

			var contentHtml = '' +
				'<div class="block" style="margin:10px; background:none;">' +
				infoHtml +
				tableHtml +
				formHtml +
				'</div>';

			// Set content dan buka popup detail
			$('#spk-urgent-detail-content').html(contentHtml);

			// Tutup popup list dan buka popup detail
			app.popup.close('.spk-urgent-popup');
			setTimeout(function () {
				app.popup.open('.spk-urgent-detail-popup');
			}, 300);
		},
		error: function (xhr, status, err) {
			app.dialog.close();
			app.dialog.alert('Gagal memuat detail performa.');
			console.log('error get spk urgent detail', status, err);
		}
	});
}

/**
 * Kembali ke list SPK Urgent
 */
function backToSpkUrgentList() {
	app.popup.close('.spk-urgent-detail-popup');
	setTimeout(function () {
		app.popup.open('.spk-urgent-popup');
	}, 300);
}

/**
 * Simpan data SPK Urgent
 */
function saveSpkUrgent() {
	var penjualan_id = jQuery('#urgent_penjualan_id').val();
	var keterangan = jQuery('#urgent_keterangan').val().trim();
	var tglSelesai = jQuery('#urgent_tgl_selesai').val();

	// Validasi
	if (!keterangan) {
		app.dialog.alert('Keterangan urgent harus diisi!');
		return;
	}

	if (!tglSelesai) {
		app.dialog.alert('Tanggal produksi selesai harus diisi!');
		return;
	}

	app.dialog.confirm('Apakah Anda yakin ingin menyimpan data urgent ini?', 'Konfirmasi', function () {
		jQuery.ajax({
			type: 'POST',
			url: BASE_API + '/spk-urgent-save',
			dataType: 'JSON',
			data: {
				penjualan_id: penjualan_id,
				keterangan_urgent: keterangan,
				tgl_produksi_selesai_urgent: tglSelesai,
				user_modified: localStorage.getItem("user_id") || ''
			},
			beforeSend: function () {
				app.dialog.preloader('Menyimpan...');
			},
			success: function (res) {
				app.dialog.close();

				if (!res || !res.status) {
					app.dialog.alert(res && res.message ? res.message : 'Gagal menyimpan data.');
					return;
				}

				app.dialog.alert('Data SPK Urgent berhasil disimpan!', function () {
					// Tutup popup detail
					app.popup.close('.spk-urgent-detail-popup');

					// Cek lagi apakah masih ada data urgent
					setTimeout(function () {
						checkSpkUrgent();
					}, 500);
				});
			},
			error: function (xhr, status, err) {
				app.dialog.close();
				app.dialog.alert('Terjadi kesalahan saat menyimpan data.');
				console.log('error save spk urgent', status, err);
			}
		});
	});
}

/**
 * Set interval untuk check SPK Urgent secara berkala
 */
function startSpkUrgentInterval() {
	// Init popup container
	initSpkUrgentPopup();

	// Check pertama kali
	checkSpkUrgent();

	// Set interval setiap 60 detik
	if (spkUrgentInterval) {
		clearInterval(spkUrgentInterval);
	}

	spkUrgentInterval = setInterval(function () {
		// Hanya check jika tidak ada popup yang sedang terbuka
		var listPopupOpened = $$('.spk-urgent-popup').hasClass('modal-in');
		var detailPopupOpened = $$('.spk-urgent-detail-popup').hasClass('modal-in');

		if (!listPopupOpened && !detailPopupOpened) {
			checkSpkUrgent();
		}
	}, 60000);
}

/**
 * Stop interval SPK Urgent (panggil saat logout)
 */
function stopSpkUrgentInterval() {
	if (spkUrgentInterval) {
		clearInterval(spkUrgentInterval);
		spkUrgentInterval = null;
	}

	// Tutup semua popup
	app.popup.close('.spk-urgent-popup');
	app.popup.close('.spk-urgent-detail-popup');
}


// ============================================
// END SPK URGENT POPUP
// ============================================


setInterval(function () {
	checkInternet();
}, 5000);


if (localStorage.getItem("lokasi_pabrik") != 'Pusat') {
	setInterval(function () {
		getPlayAudio();
	}, 60000);
}