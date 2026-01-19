/**
 * Alert Cabang - Popup Pengiriman
 * Framework7 v7 + jQuery
 */

// Fungsi untuk menampilkan popup pengiriman
function alertPengiriman(data) {
    // Default data jika tidak ada parameter
    const defaultData = {
        title: 'Informasi Pengiriman',
        cabang: 'Cabang Pusat',
        alamat: '-',
        telepon: '-',
        status: 'aktif',
        waktuOperasional: '08:00 - 17:00',
        layanan: []
    };

    // Merge data dengan default
    const popupData = $.extend({}, defaultData, data);

    // Generate list layanan jika ada
    let layananHTML = '';
    if (popupData.layanan && popupData.layanan.length > 0) {
        layananHTML = `
            <div class="block-title">Layanan Tersedia</div>
            <div class="list simple-list">
                <ul>
                    ${popupData.layanan.map(layanan => `<li><i class="icon f7-icons">checkmark_circle_fill</i> ${layanan}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // HTML template popup
    const popupHTML = `
        <div class="popup popup-pengiriman" data-close-on-escape="true">
            <div class="navbar">
                <div class="navbar-bg"></div>
                <div class="navbar-inner">
                    <div class="title">${popupData.title}</div>
                    <div class="right">
                        <a href="#" class="link popup-close">
                            <i class="icon f7-icons">xmark</i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="page-content">
                <div class="block-title">Detail Cabang</div>
                <div class="list inset">
                    <ul>
                        <li class="item-content">
                            <div class="item-inner">
                                <div class="item-title">
                                    <div class="item-header">Nama Cabang</div>
                                    ${popupData.cabang}
                                </div>
                            </div>
                        </li>
                        <li class="item-content">
                            <div class="item-inner">
                                <div class="item-title">
                                    <div class="item-header">Alamat</div>
                                    ${popupData.alamat}
                                </div>
                            </div>
                        </li>
                        <li class="item-content">
                            <div class="item-inner">
                                <div class="item-title">
                                    <div class="item-header">Telepon</div>
                                    <a href="tel:${popupData.telepon}" class="external">${popupData.telepon}</a>
                                </div>
                            </div>
                        </li>
                        <li class="item-content">
                            <div class="item-inner">
                                <div class="item-title">
                                    <div class="item-header">Jam Operasional</div>
                                    ${popupData.waktuOperasional}
                                </div>
                            </div>
                        </li>
                        <li class="item-content">
                            <div class="item-inner">
                                <div class="item-title">
                                    <div class="item-header">Status</div>
                                    <span class="badge color-${popupData.status === 'aktif' ? 'green' : 'red'}">${popupData.status.toUpperCase()}</span>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                
                ${layananHTML}
                
                <div class="block">
                    <button class="button button-fill popup-close">Tutup</button>
                </div>
            </div>
        </div>
    `;

    // Hapus popup lama jika ada
    $('.popup-pengiriman').remove();

    // Tambahkan popup ke body
    $('body').append(popupHTML);

    // Buat instance popup Framework7
    const popup = app.popup.create({
        el: '.popup-pengiriman',
        closeByBackdropClick: true,
        on: {
            open: function () {
                console.log('Popup pengiriman dibuka');
            },
            close: function () {
                console.log('Popup pengiriman ditutup');
            },
            closed: function () {
                // Hapus popup dari DOM setelah ditutup
                $('.popup-pengiriman').remove();
            }
        }
    });

    // Buka popup
    popup.open();

    return popup;
}

// Contoh penggunaan dengan berbagai variasi

// 1. Penggunaan basic
function contohPenggunaanBasic() {
    alertPengiriman({
        cabang: 'Cabang Jakarta Selatan',
        alamat: 'Jl. Sudirman No. 123, Jakarta Selatan',
        telepon: '021-12345678'
    });
}

// 2. Penggunaan lengkap dengan layanan
function contohPenggunaanLengkap() {
    alertPengiriman({
        title: 'Detail Pengiriman',
        cabang: 'Cabang Bandung',
        alamat: 'Jl. Asia Afrika No. 45, Bandung, Jawa Barat',
        telepon: '022-87654321',
        status: 'aktif',
        waktuOperasional: 'Senin - Sabtu: 08:00 - 20:00',
        layanan: [
            'Pengiriman Same Day',
            'Pengiriman Regular',
            'Pengiriman Cargo',
            'Cash on Delivery (COD)',
            'Pick-up Service'
        ]
    });
}

// 3. Penggunaan dengan status non-aktif
function contohCabangNonAktif() {
    alertPengiriman({
        cabang: 'Cabang Surabaya',
        alamat: 'Jl. Pemuda No. 88, Surabaya',
        telepon: '031-98765432',
        status: 'tidak aktif',
        waktuOperasional: 'Tutup sementara'
    });
}

// Event listener jQuery - contoh trigger dari button
$(document).ready(function () {
    // Contoh: Trigger popup saat klik button dengan class .btn-info-pengiriman
    $(document).on('click', '.btn-info-pengiriman', function (e) {
        e.preventDefault();

        // Ambil data dari atribut data-* pada button
        const cabangData = {
            cabang: $(this).data('cabang') || 'Cabang Pusat',
            alamat: $(this).data('alamat') || '-',
            telepon: $(this).data('telepon') || '-',
            status: $(this).data('status') || 'aktif',
            waktuOperasional: $(this).data('waktu') || '08:00 - 17:00'
        };

        // Ambil layanan jika ada (format: "layanan1|layanan2|layanan3")
        const layananStr = $(this).data('layanan');
        if (layananStr) {
            cabangData.layanan = layananStr.split('|');
        }

        alertPengiriman(cabangData);
    });
});