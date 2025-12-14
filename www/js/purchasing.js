var delayTimer;
function doSearchPartner(text) {
	clearTimeout(delayTimer);
	delayTimer = setTimeout(function () {
		getDataPartner();
	}, 1000);
}

function hapusPartner(id_partner) {

	app.dialog.create({
		title: 'Hapus Partner',
		text: 'Apakah Anda Yakin Menghapus Partner ini ? ',
		cssClass: 'custom-dialog',
		closeByBackdropClick: 'true',
		buttons: [
			{
				text: 'Ya',
				onClick: function () {
					jQuery.ajax({
						type: 'POST',
						url: "" + BASE_API + "/hapus-partner",
						dataType: 'JSON',
						data: {
							id_partner: id_partner
						},
						beforeSend: function () {
							app.dialog.preloader('Harap Tunggu');
						},
						success: function (data) {
							app.dialog.close();
							getDataPartner();

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



function tambahPartnerProses(id_user) {
	if (!$$('#tambah_partner_form')[0].checkValidity()) {
		app.dialog.alert('Cek Isian Form Anda');
	} else {
		jQuery.ajax({
			type: 'POST',
			url: "" + BASE_API + "/tambah-partner-proses",
			dataType: 'JSON',
			data: {
				nama_partner: $('#nama_partner').val(),
				pic: $('#pic').val(),
				no_hp: $('#no_hp').val(),
				kota: $('#kota').val(),
				alamat: $('#alamat').val()
			},
			beforeSend: function () {
				app.dialog.preloader('Harap Tunggu');
			},
			success: function (data) {
				app.dialog.close();
				app.popup.close();
				getDataPartner();
			},
			error: function (xmlhttprequest, textstatus, message) {
			}
		});
	}

}

function getDataPartner() {
	if (jQuery('#partner_filter_search').val() == '' || jQuery('#partner_filter_search').val() == null) {
		partner_filter_search = "empty";
	} else {
		partner_filter_search = jQuery('#partner_filter_search').val();
	}
	var data_produksi = '';
	jQuery.ajax({
		type: 'POST',
		url: "" + BASE_API + "/get-data-partner",
		dataType: 'JSON',
		data: {
			karyawan_id: localStorage.getItem("user_id"),
			partner_filter_search: partner_filter_search
		},
		beforeSend: function () {
			app.dialog.preloader('Mengambil Data partner, Harap Tunggu');
			jQuery('#produk_data').html('');
		},
		success: function (data) {
			app.dialog.close();
			var nomor = 1;
			data_partner = '';
			jQuery.each(data.data, function (i, val) {
				data_partner += '<tr>';
				data_partner += '  <td class="label-cell" style="padding:4px !important; border-bottom: solid 1px; border-top: solid 1px; border-left: solid 1px;  border-color:gray;" ><center>' + (nomor++) + '</center></td>';
				data_partner += '  <td class="label-cell" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px;  border-color:gray;" align="left" >' + val.nama_partner + '</td>';
				data_partner += '  <td class="label-cell" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px;  border-color:gray;" align="left" >' + val.no_hp + '</td>';
				data_partner += '  <td class="label-cell" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px;  border-color:gray;" align="left" >' + val.pic + '</td>';
				data_partner += '  <td class="label-cell" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px;  border-color:gray;" align="left" >' + val.kota + '</td>';
				data_partner += '  <td class="label-cell" style="border-top: solid 1px; border-left: solid 1px; border-bottom: solid 1px;  border-color:gray;" align="left" >' + val.alamat + '</td>';
				data_partner += '<td style="border-right:1px solid gray; border-bottom:1px solid gray;" class="label-cell" width="15%">';
				data_partner += '   <button  class="text-add-colour-black-soft bg-dark-gray-young button-small col button text-bold"   onclick="hapusPartner(\'' + val.id_partner + '\');">Hapus</button>';
				data_partner += '</td>';
				data_partner += '</tr>';
			});

			jQuery('#partner_data').html(data_partner);
		},
		error: function (xmlhttprequest, textstatus, message) {
		}
	});
}