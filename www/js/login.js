function getDataUser() {
	var username = jQuery('#username').val();
	var password = jQuery('#password').val();

	// Validasi input
	if (!username || !password) {
		app.dialog.alert('Username dan password harus diisi!');
		return;
	}

	jQuery.ajax({
		type: 'POST',
		url: BASE_API + "/get-data-login",
		dataType: 'JSON',
		data: {
			username: username,
			password: password
		},
		beforeSend: function () {
			app.dialog.preloader('Logging in...');
		},
		success: function (data) {
			app.dialog.close();

			if (data == 0 || !data) {
				app.dialog.alert('Username atau Password Salah');
				return;
			}

			console.log('[Login] Login successful:', data);

			// Show UI elements
			jQuery('#logout_logo').show();
			jQuery('#notifIcon').show();
			startTimeMain();

			// ============================================
			// CRITICAL: Save user data to localStorage FIRST
			// ============================================
			localStorage.setItem("user_id", data.user_id);
			localStorage.setItem("username", data.username);
			localStorage.setItem("karyawan_nama", data.karyawan_nama);
			localStorage.setItem("login", "true");
			localStorage.setItem("jabatan", data.user_position);
			localStorage.setItem("jabatan_kantor", data.jabatan);
			localStorage.setItem("sales_kota", data.kota);
			localStorage.setItem("lokasi_pabrik", data.lokasi_pabrik);

			console.log('[Login] User data saved to localStorage');
			console.log('[Login] User ID:', data.user_id);
			console.log('[Login] Lokasi Pabrik:', data.lokasi_pabrik);

			// Show success message
			app.dialog.preloader('Berhasil Login');

			// Update header
			$$("#header_name").html(localStorage.getItem("lokasi_pabrik"));

			// Set lower API
			var lower_api = localStorage.getItem("lokasi_pabrik").toLowerCase();
			if (lower_api == 'pusat') {
				localStorage.setItem("lower_api_pabrik", 'surabaya');
			} else {
				localStorage.setItem("lower_api_pabrik", lower_api);
			}

			// ============================================
			// CRITICAL: Initialize NotificationManager AFTER saving data
			// Function ini ada di app.js
			// ============================================
			console.log('[Login] 🔔 Initializing NotificationManager...');

			// Pastikan function tersedia
			if (typeof initNotificationManagerAfterLogin === 'function') {
				initNotificationManagerAfterLogin();
				console.log("MASUK");
			} else {
				console.error('[Login] ❌ initNotificationManagerAfterLogin function not found!');
				console.error('[Login]    Make sure app.js is loaded before login.js');
			}

			// ============================================
			// Navigate to home page
			// ============================================
			setTimeout(function () {
				app.dialog.close();

				var lokasi = localStorage.getItem("lokasi_pabrik");
				console.log('[Login] Navigating to home page for:', lokasi);

				if (lokasi == 'Pusat') {
					app.views.main.router.navigate('/produksi_pusat', {
						reloadCurrent: false,
						ignoreCache: true
					});
				} else {
					app.views.main.router.navigate('/cabang', {
						reloadCurrent: false,
						ignoreCache: true
					});
				}
			}, 1000);
		},
		error: function (xhr, status, error) {
			app.dialog.close();

			console.error('[Login] ❌ Login failed');
			console.error('[Login]    Status:', status);
			console.error('[Login]    Error:', error);
			console.error('[Login]    Response:', xhr.responseText);

			// Show user-friendly error message
			if (status === 'timeout') {
				app.dialog.alert('Koneksi timeout. Periksa koneksi internet Anda.');
			} else if (xhr.status === 0) {
				app.dialog.alert('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
			} else if (xhr.status >= 500) {
				app.dialog.alert('Server error. Silakan coba lagi nanti.');
			} else {
				app.dialog.alert('Gagal login. Periksa username dan password Anda.');
			}
		},
		timeout: 15000 // 15 second timeout
	});
}