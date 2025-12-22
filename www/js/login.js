function getDataUser() {
	var username = jQuery('#username').val();
	var password = jQuery('#password').val();
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-login",
		dataType: 'JSON',
		data: {
			username: username,
			password: password
		},
		beforeSend: function () {
		},
		success: function (data) {
			if (data == 0) {
				app.dialog.preloader('Username Atau Password Salah');
				setTimeout(function () {
					app.dialog.close();
				}, 1000);
			} else {
				console.log(data);
				app.dialog.close();
				jQuery('#logout_logo').show();
				jQuery('#notifIcon').show();
				startTimeMain();
				localStorage.setItem("user_id", data.user_id);
				localStorage.setItem("username", data.username);
				localStorage.setItem("karyawan_nama", data.karyawan_nama);
				localStorage.setItem("login", "true");
				localStorage.setItem("jabatan", data.user_position);
				localStorage.setItem("jabatan_kantor", data.jabatan);
				localStorage.setItem("sales_kota", data.kota);
				localStorage.setItem("lokasi_pabrik", data.lokasi_pabrik);
				app.dialog.preloader('Berhasil Login');
				$$("#header_name").html(localStorage.getItem("lokasi_pabrik"));
				var lower_api = localStorage.getItem("lokasi_pabrik").toLowerCase();
				if (lower_api == 'pusat') {
					localStorage.setItem("lower_api_pabrik", 'surabaya');
				} else {
					localStorage.setItem("lower_api_pabrik", lower_api);
				}
				console.log(localStorage.getItem("jabatan_kantor"));

				// ============================================
				// TAMBAHAN: Inisialisasi FCM setelah login
				// ============================================
				initNotificationManagerAfterLogin();

				setTimeout(function () {
					app.dialog.close();
					if (localStorage.getItem("lokasi_pabrik") == 'Pusat') {
						return app.views.main.router.navigate('/produksi_pusat');
					} else {
						return app.views.main.router.navigate('/cabang');
					}
				}, 1000);
			}

		},
		error: function (xmlhttprequest, textstatus, message) {
			app.dialog.close();
			app.dialog.alert('Gagal login. Periksa koneksi internet.');
		}
	});
}

/**
 * Inisialisasi NotificationManager setelah login berhasil
 * Fungsi ini memastikan FCM token di-generate dan di-register ke server
 */
function initNotificationManagerAfterLogin() {
	var userId = localStorage.getItem("user_id");

	if (!userId) {
		console.error('[Login] No user_id found after login');
		return;
	}

	console.log('[Login] Initializing NotificationManager for user:', userId);

	// Tunggu sedikit untuk memastikan semua localStorage sudah tersimpan
	setTimeout(function () {
		if (typeof NotificationManager === 'undefined') {
			console.error('[Login] NotificationManager not loaded');
			return;
		}

		// Update API URL
		if (typeof BASE_API !== 'undefined') {
			NotificationManager.config.apiUrl = BASE_API;
		}

		// Inisialisasi dengan forceRefresh = true
		NotificationManager.init(userId, true);

		// Force get FCM token setelah delay tambahan
		setTimeout(function () {
			if (NotificationManager.isFirebaseAvailable()) {
				console.log('[Login] Getting FCM token...');
				NotificationManager.getFirebaseToken();
			} else {
				console.warn('[Login] Firebase plugin not available');
			}
		}, 1500);

	}, 500);
}