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
				if(lower_api == 'pusat'){
					localStorage.setItem("lower_api_pabrik", 'surabaya');
				}else{
					localStorage.setItem("lower_api_pabrik", lower_api);
				}
				console.log(localStorage.getItem("jabatan_kantor"));

				setTimeout(function () {
					if (localStorage.getItem("lokasi_pabrik") == 'Pusat') {
						return app.views.main.router.navigate('/produksi_pusat');
					} else {
						return app.views.main.router.navigate('/cabang');
					}
				}, 1000);
			}

		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}