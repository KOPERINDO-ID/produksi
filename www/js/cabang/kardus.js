// ============================================
// KARDUS PRODUKSI - VIEW ONLY
// Menampilkan data kardus dari halaman produksi
// Tidak dapat menambahkan data klaim (read-only)
// ============================================

var kardusProduksi = {
    data: {
        summary: {
            klaim: 0,
            terima: 0,
            sisa: 0
        },
        klaimList: [],
        filteredData: [],
        currentFilter: {
            bulan: new Date().getMonth() + 1,
            tahun: new Date().getFullYear(),
            search: ''
        },
        currentCabang: '',
        currentTipe: '',
        riwayatKlaim: []
    },

    /**
     * Inisialisasi
     */
    init: function () {
        console.log('Kardus Produksi: Initializing...');
        this.setupEventListeners();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners: function () {
        var self = this;

        // Tombol kardus di halaman produksi (pakai id yg sudah ada di HTML)
        $$(document).on('click', '#btnKardusKlaim', function () {
            var cabang = localStorage.getItem('lokasi_pabrik') || '-';
            var tipe = localStorage.getItem('pilihan_cabang') || 'pusat';
            self.data.currentCabang = cabang;
            self.data.currentTipe = tipe;
            self.openKlaimPopup();
        });

        // Dropdown bulan
        $$(document).on('change', '#filterBulanKardusProduksi', function () {
            self.data.currentFilter.bulan = parseInt($$(this).val());
            self.filterData();
        });

        // Dropdown tahun
        $$(document).on('change', '#filterTahunKardusProduksi', function () {
            self.data.currentFilter.tahun = parseInt($$(this).val());
            self.filterData();
        });

        // Search
        $$(document).on('input', '#searchKardusProduksi', function () {
            self.data.currentFilter.search = $$(this).val().toLowerCase();
            self.filterData();
        });

        // Refresh
        $$(document).on('click', '#btnRefreshKardusProduksi', function () {
            self.loadKlaimData();
        });

        // Tombol riwayat klaim
        $$(document).on('click', '#btnRiwayatKardusProduksi', function () {
            self.openRiwayatPopup();
        });

        // Refresh riwayat
        $$(document).on('click', '#btnRefreshRiwayatProduksi', function () {
            self.loadRiwayatKlaim();
        });

        // Lihat foto bukti
        $$(document).on('click', '.btnLihatBuktiProduksi', function () {
            var fotoUrl = $$(this).attr('data-foto');
            self.lihatFotoBukti(fotoUrl);
        });
    },

    /**
     * Membuka popup kardus di halaman produksi
     */
    openKlaimPopup: function () {
        var self = this;

        // Generate dropdown bulan
        var namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        var currentMonth = new Date().getMonth() + 1;
        var currentYear = new Date().getFullYear();

        var bulanOptions = '';
        for (var i = 1; i <= 12; i++) {
            bulanOptions += '<option value="' + i + '"' + (i === currentMonth ? ' selected' : '') + '>' +
                namaBulan[i - 1] + '</option>';
        }

        var yearOptions = '';
        for (var i = 0; i < 3; i++) {
            var year = currentYear - i;
            yearOptions += '<option value="' + year + '"' + (i === 0 ? ' selected' : '') + '>' + year + '</option>';
        }

        $$('#filterBulanKardusProduksi').html(bulanOptions);
        $$('#filterTahunKardusProduksi').html(yearOptions);

        // Sync currentFilter dengan dropdown yang baru dirender
        self.data.currentFilter.bulan = currentMonth;
        self.data.currentFilter.tahun = currentYear;
        self.data.currentFilter.search = '';
        $$('#searchKardusProduksi').val('');

        app.popup.create({ el: '.popup-kardus-produksi' }).open();

        self.loadKlaimData();
    },

    /**
     * Load data SPK kardus yang dapat diklaim
     */
    loadKlaimData: function () {
        var self = this;

        if (!self.data.currentCabang) {
            app.dialog.alert('Cabang tidak dikenali', 'Info');
            return;
        }

        app.preloader.show();

        app.request({
            url: BASE_API + '/kardus/detail-klaim',
            method: 'GET',
            data: {
                id_cabang: self.data.currentCabang,
                bulan: self.data.currentFilter.bulan,
                tahun: self.data.currentFilter.tahun,
                tipe: self.data.currentTipe
            },
            dataType: 'json',
            success: function (response) {
                app.preloader.hide();
                if (response.success) {
                    self.data.summary.klaim = response.summary.total_klaim_tersedia || 0;
                    self.data.summary.terima = response.summary.jumlah_klaim || 0;
                    self.data.summary.sisa = response.summary.sisa_klaim || 0;

                    self.updateSummaryDisplay();

                    self.data.klaimList = response.data || [];
                    self.filterData();
                } else {
                    app.dialog.alert(response.message || 'Gagal memuat data', 'Error');
                }
            },
            error: function (xhr) {
                app.preloader.hide();
                app.dialog.alert('Gagal memuat data kardus', 'Error');
            }
        });
    },

    /**
     * Filter data berdasarkan bulan, tahun, dan search
     */
    filterData: function () {
        var self = this;

        var filtered = this.data.klaimList.filter(function (item) {
            // Filter bulan & tahun dari tanggal SPK
            if (item.tanggal) {
                var tgl = new Date(item.tanggal);
                var bulan = tgl.getMonth() + 1;
                var tahun = tgl.getFullYear();

                if (bulan !== self.data.currentFilter.bulan) return false;
                if (tahun !== self.data.currentFilter.tahun) return false;
            }

            // Filter search
            if (!self.data.currentFilter.search) return true;

            var searchTerm = self.data.currentFilter.search;
            var spkTampil = (self.formatTanggalSpk(item.tanggal) + '-' + (item.spk || '')).toLowerCase();
            var perusahaan = (item.perusahaan || '').toLowerCase();
            var tanggal = self.formatTanggalShort(item.tanggal).toLowerCase();
            var jumlah = String(item.jumlah || '');

            return spkTampil.includes(searchTerm) ||
                perusahaan.includes(searchTerm) ||
                tanggal.includes(searchTerm) ||
                jumlah.includes(searchTerm);
        });

        this.data.filteredData = filtered;
        this.renderTable();
    },

    /**
     * Render tabel SPK kardus (view-only, tanpa aksi)
     */
    renderTable: function () {
        var self = this;
        var tbody = $$('#tableKardusBodyProduksi');
        var countData = $$('#countDataProduksi');

        countData.text(this.data.filteredData.length);

        if (this.data.filteredData.length === 0) {
            tbody.html('<tr><td colspan="5" style="padding: 20px; text-align: center; color: #999;"><i class="f7-icons" style="font-size: 60px; color: #ddd;">tray</i><p style="margin-top: 10px; font-size: 14px;">Belum ada data kardus</p></td></tr>');
            return;
        }

        var html = '';
        this.data.filteredData.forEach(function (item, index) {
            var bgColor = index % 2 === 0 ? '#000' : '#1d1d1c';
            var tanggal = self.formatTanggalShort(item.tanggal);

            html += `
            <tr style="background: ${bgColor};">
                <td style="padding: 10px 8px; text-align: center; font-size: 13px; color: #fff; border-right: 1px solid #fff; border-bottom: 1px solid #fff;">${index + 1}</td>
                <td style="padding: 10px 8px; text-align: center; font-size: 13px; color: #fff; border-right: 1px solid #fff; border-bottom: 1px solid #fff;">${tanggal}</td>
                <td style="padding: 10px 8px; text-align: left; font-size: 13px; color: #fff; border-right: 1px solid #fff; border-bottom: 1px solid #fff;">${self.formatTanggalSpk(item.tanggal)}-${item.spk}</td>
                <td style="padding: 10px 8px; text-align: left; font-size: 13px; color: #fff; border-right: 1px solid #fff; border-bottom: 1px solid #fff;">${item.perusahaan || '-'}</td>
                <td style="padding: 10px 8px; text-align: right; font-size: 13px; color: #fff; font-weight: bold; border-bottom: 1px solid #fff;">${item.jumlah}</td>
            </tr>`;
        });

        tbody.html(html);
    },

    /**
     * Update summary card di popup produksi
     */
    updateSummaryDisplay: function () {
        var klaim = this.data.summary.klaim;
        var terima = this.data.summary.terima;
        var sisa = this.data.summary.sisa;

        $$('#totalKlaimProduksi').text(klaim.toLocaleString('id-ID'));
        $$('#totalTerimaProduksi').text(terima.toLocaleString('id-ID'));
        $$('#totalSisaProduksi').text(sisa.toLocaleString('id-ID'));
    },

    /**
     * Membuka popup riwayat klaim (view-only)
     */
    openRiwayatPopup: function () {
        var self = this;
        self.updateSummaryRiwayat();
        app.popup.create({ el: '.popup-riwayat-kardus-produksi' }).open();
        self.loadRiwayatKlaim();
    },

    /**
     * Load riwayat via GET /kardus/klaim
     */
    loadRiwayatKlaim: function () {
        var self = this;

        app.preloader.show();

        app.request({
            url: BASE_API + '/kardus/klaim',
            method: 'GET',
            data: {
                id_cabang: self.data.currentCabang,
                tipe: self.data.currentTipe
            },
            dataType: 'json',
            success: function (response) {
                app.preloader.hide();
                if (response.success) {
                    self.data.riwayatKlaim = response.data || [];
                    self.renderRiwayatTable();
                } else {
                    app.dialog.alert(response.message || 'Gagal memuat riwayat', 'Error');
                }
            },
            error: function (xhr) {
                app.preloader.hide();
                var msg = 'Gagal memuat riwayat klaim';
                try { msg = JSON.parse(xhr.responseText).message || msg; } catch (e) { }
                app.dialog.alert(msg, 'Error');
            }
        });
    },

    /**
     * Render tabel riwayat klaim
     */
    renderRiwayatTable: function () {
        var self = this;
        var tbody = $$('#tableRiwayatBodyProduksi');
        var countEl = $$('#countRiwayatProduksi');

        countEl.text(self.data.riwayatKlaim.length);

        if (self.data.riwayatKlaim.length === 0) {
            tbody.html(
                '<tr><td colspan="4" style="padding:20px; text-align:center; color:#999;">' +
                '<i class="f7-icons" style="font-size:60px; color:#555;">tray</i>' +
                '<p style="margin-top:10px; font-size:14px;">Belum ada riwayat klaim</p></td></tr>'
            );
            return;
        }

        var namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        var html = '';

        self.data.riwayatKlaim.forEach(function (item, index) {
            var bgColor = index % 2 === 0 ? '#000' : '#1d1d1c';
            var periode = namaBulan[(parseInt(item.bulan) - 1)] + ' ' + item.tahun;
            var jumlah = parseFloat(item.jumlah_klaim || 0).toLocaleString('id-ID');

            var btnBukti = item.foto_url
                ? '<button class="btnLihatBuktiProduksi button button-small button-fill" ' +
                'data-foto="' + item.foto_url + '" ' +
                'style="background:#1565C0; height:28px; padding:0 10px; min-width:0;">' +
                '<i class="f7-icons" style="font-size:14px;">photo</i>' +
                '</button>'
                : '<span style="color:#555; font-size:11px;">-</span>';

            html +=
                '<tr style="background:' + bgColor + ';">' +
                '<td style="padding:8px; text-align:center; font-size:12px; color:#fff; border-right:1px solid #333; border-bottom:1px solid #333;">' + (index + 1) + '</td>' +
                '<td style="padding:8px; text-align:center; font-size:12px; color:#fff; border-right:1px solid #333; border-bottom:1px solid #333;">' + periode + '</td>' +
                '<td style="padding:8px; text-align:center; font-size:13px; color:#fff; font-weight:bold; border-right:1px solid #333; border-bottom:1px solid #333;">' + jumlah + '</td>' +
                '<td style="padding:8px; text-align:center; border-bottom:1px solid #333;">' + btnBukti + '</td>' +
                '</tr>';
        });

        tbody.html(html);
    },

    /**
     * Tampilkan foto bukti
     */
    lihatFotoBukti: function (fotoUrl) {
        if (!fotoUrl) { app.dialog.alert('Foto bukti tidak tersedia', 'Info'); return; }
        $$('#imgFotoBuktiKardusProduksi').attr('src', fotoUrl);
        app.popup.create({ el: '.popup-foto-bukti-kardus-produksi' }).open();
    },

    /**
     * Mirror summary ke popup riwayat
     */
    updateSummaryRiwayat: function () {
        $$('#totalKlaimRiwayatProduksi').text(this.data.summary.klaim.toLocaleString('id-ID'));
        $$('#totalTerimaRiwayatProduksi').text(this.data.summary.terima.toLocaleString('id-ID'));
        $$('#totalSisaRiwayatProduksi').text(this.data.summary.sisa.toLocaleString('id-ID'));
    },

    /**
     * Format tanggal untuk prefix SPK: DDMMYY (contoh: 120625)
     */
    formatTanggalSpk: function (tanggal) {
        var date = new Date(tanggal);
        var dd = ('0' + date.getDate()).slice(-2);
        var mm = ('0' + (date.getMonth() + 1)).slice(-2);
        var yy = date.getFullYear().toString().slice(-2);
        return dd + mm + yy;
    },

    /**
     * Format tanggal short (DD-MMM-YY)
     */
    formatTanggalShort: function (tanggal) {
        var date = new Date(tanggal);
        var bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        var dd = ('0' + date.getDate()).slice(-2);
        var mmm = bulan[date.getMonth()];
        var yy = date.getFullYear().toString().slice(-2);
        return dd + '-' + mmm + '-' + yy;
    }
};