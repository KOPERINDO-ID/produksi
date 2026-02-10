/**
 * ============================================
 * SPK WARNING MODULE
 * ============================================
 * Popup F7 v7 fullscreen + tabel data
 *
 * Requires:
 * - spk_warning_popup.html (popup markup in index.html)
 * - spk_warning_popup.css
 */

// ============================================
// CONFIGURATION
// ============================================
var SpkWarningConfig = {
    apiUrl: BASE_API + '/notifications/spk-warning',
    lastCheckTime: null,

    // ===== DEBUG MODE =====
    debugMode: true, // <-- UBAH KE false SETELAH SELESAI STYLING

    // ===== Scheduled Popup Config =====
    scheduledHours: [8, 13],
    scheduledTriggered: {},

    // ===== Sound Config =====
    soundFile: 'audio/spk-warning.mp3',
    soundVolume: 1
};

// ============================================
// INIT
// ============================================
function initSpkWarning() {
    console.log('[SPK Warning] Initializing...');

    if (localStorage.getItem("login") !== "true") {
        console.log('[SPK Warning] User not logged in, skipping init');
        return;
    }

    var userId = localStorage.getItem("user_id");
    if (!userId) {
        console.log('[SPK Warning] No user_id found, skipping init');
        return;
    }

    console.log('[SPK Warning] User ID:', userId);

    if (SpkWarningConfig.debugMode) {
        console.log('[SPK Warning] ⚠️ DEBUG MODE AKTIF');
        setTimeout(function () {
            playWarningSound();
            checkSpkWarning(false);
        }, 1500);
        return;
    }

    initScheduledWarning();
    console.log('[SPK Warning] Initialized successfully');
}

// ============================================
// SOUND
// ============================================
function playWarningSound() {
    console.log('[SPK Warning] Playing notification sound...');

    if (SpkWarningConfig.soundFile) {
        try {
            var audio = new Audio(SpkWarningConfig.soundFile);
            audio.volume = SpkWarningConfig.soundVolume;
            var p = audio.play();
            if (p !== undefined) {
                p.then(function () {
                    console.log('[SPK Warning] Sound played');
                }).catch(function () {
                    // playGeneratedBeep();
                    console.log('[SPK Warning] Sound doesnt played');
                });
            }
            tryVibrate();
            return;
        } catch (e) {
            console.log('[SPK Warning] Sound file error:', e.message);
        }
    } else {
        // playGeneratedBeep();
        tryVibrate();
    }
}

function playGeneratedBeep() {
    try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { tryCordovaBeep(); return; }

        var ctx = new AC();
        var seq = [
            { t: 0, d: 0.15, f: 880 },
            { t: 0.25, d: 0.15, f: 880 },
            { t: 0.50, d: 0.3, f: 1046 }
        ];

        seq.forEach(function (b) {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = b.f;
            gain.gain.setValueAtTime(0, ctx.currentTime + b.t);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + b.t + 0.02);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + b.t + b.d);
            osc.start(ctx.currentTime + b.t);
            osc.stop(ctx.currentTime + b.t + b.d);
        });

        setTimeout(function () { ctx.close(); }, 1500);
    } catch (e) {
        // tryCordovaBeep();
        console.log('[SPK Warning] Sound doesnt played');
    }
}

function tryCordovaBeep() {
    try {
        if (navigator.notification && navigator.notification.beep) {
            navigator.notification.beep(2);
        }
    } catch (e) { }
}

function tryVibrate() {
    try {
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 300]);
        }
    } catch (e) { }
}

// ============================================
// SCHEDULED
// ============================================
function initScheduledWarning() {
    resetScheduledTriggeredDaily();
    setInterval(checkScheduledTime, 30000);
    checkScheduledTime();
    console.log('[SPK Warning] Scheduled:', SpkWarningConfig.scheduledHours.join(', '));
}

function checkScheduledTime() {
    if (localStorage.getItem("login") !== "true") return;

    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    var dk = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

    SpkWarningConfig.scheduledHours.forEach(function (th) {
        var key = dk + '_' + th;
        if (SpkWarningConfig.scheduledTriggered[key]) return;

        if (h === th && m <= 4) {
            SpkWarningConfig.scheduledTriggered[key] = true;
            saveScheduledTriggered();
            playWarningSound();
            checkSpkWarning(false);
        } else if (h === th && m > 4 && !SpkWarningConfig.scheduledTriggered[key]) {
            SpkWarningConfig.scheduledTriggered[key] = true;
            saveScheduledTriggered();
            playWarningSound();
            checkSpkWarning(false);
        }
    });
}

function resetScheduledTriggeredDaily() {
    loadScheduledTriggered();
    setInterval(function () {
        var now = new Date();
        var dk = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
        var keys = Object.keys(SpkWarningConfig.scheduledTriggered);
        var cleaned = false;
        keys.forEach(function (k) {
            if (k.indexOf(dk) !== 0) {
                delete SpkWarningConfig.scheduledTriggered[k];
                cleaned = true;
            }
        });
        if (cleaned) saveScheduledTriggered();
    }, 60000);
}

function saveScheduledTriggered() {
    try { localStorage.setItem('spk_scheduled_triggered', JSON.stringify(SpkWarningConfig.scheduledTriggered)); } catch (e) { }
}

function loadScheduledTriggered() {
    try {
        var s = localStorage.getItem('spk_scheduled_triggered');
        if (s) SpkWarningConfig.scheduledTriggered = JSON.parse(s);
    } catch (e) {
        SpkWarningConfig.scheduledTriggered = {};
    }
}

// ============================================
// FILTER: 1 tahun terakhir
// ============================================
function getOneYearAgoDate() {
    var now = new Date();
    return (now.getFullYear() - 1) + '-01-01';
}

function filterDataByYear(items) {
    if (!items || !items.length) return [];
    var cutoff = getOneYearAgoDate();
    return items.filter(function (i) {
        var d = i.tanggal_acuan || i.tanggal_acuan_terdekat || i.tgl_kirim_cabang || null;
        return !d || d >= cutoff;
    });
}

function filterSummaryByYear(items) {
    if (!items || !items.length) return [];
    var cutoff = getOneYearAgoDate();
    return items.filter(function (i) {
        var d = i.tanggal_acuan_terdekat || i.tgl_kirim_cabang_terdekat || null;
        return !d || d >= cutoff;
    });
}

// ============================================
// CHECK SPK WARNING (fetch data)
// ============================================
function checkSpkWarning(silentMode) {
    silentMode = silentMode || false;

    var userId = localStorage.getItem("user_id");
    if (!userId) return;

    if (!silentMode) app.preloader.show();

    jQuery.ajax({
        type: 'GET',
        url: SpkWarningConfig.apiUrl,
        data: { user_id: userId },
        dataType: 'json',
        timeout: 10000,
        success: function (res) {
            if (!silentMode) app.preloader.hide();
            SpkWarningConfig.lastCheckTime = new Date();

            if (res.success) {
                var summary = filterSummaryByYear(res.data.summary || []);
                var details = filterDataByYear(res.data.details || []);

                if (details.length > 0) {
                    openSpkWarningPopup(summary, details, res.filter_info);
                } else if (!silentMode) {
                    app.dialog.alert('Tidak ada SPK yang melewati deadline (data 1 tahun terakhir)', 'SPK Warning');
                }
            } else if (!silentMode) {
                app.dialog.alert(res.message || 'Gagal mengambil data warning', 'Error');
            }
        },
        error: function () {
            if (!silentMode) {
                app.preloader.hide();
                app.dialog.alert('Gagal mengambil data warning.', 'Error');
            }
        }
    });
}

// ============================================
// OPEN WARNING POPUP + populate table
// ============================================
function openSpkWarningPopup(summary, details, filterInfo) {
    // Summary numbers
    var totalItemEl = document.getElementById('spk-total-item');
    var totalSpkEl = document.getElementById('spk-total-spk');
    if (totalItemEl) totalItemEl.textContent = details.length;
    if (totalSpkEl) totalSpkEl.textContent = summary.length;

    // Build table rows
    var tbody = document.getElementById('spk-warning-tbody');
    if (!tbody) return;

    var rows = '';
    summary.forEach(function (spk, idx) {
        var hari = spk.hari_terlambat_max || 0;
        var badgeClass = hari > 7 ? 'red' : (hari > 3 ? 'orange' : 'blue');

        var tglAcuan = spk.tanggal_acuan_terdekat || spk.tgl_kirim_cabang_terdekat;
        var tglDisplay = tglAcuan ? moment(tglAcuan).format('DD MMM YYYY') : '-';

        rows += '<tr class="spk-row-link table-body-theme" style="height: 36px;" onclick="showSpkDeadlineDetail(\'' + spk.penjualan_id + '\')">';
        rows += '<td class="spk-cell-rownum">' + (idx + 1) + '</td>';
        rows += '<td class="spk-cell-spk">' + (spk.no_spk || spk.penjualan_id) + '</td>';
        rows += '<td class="spk-cell-client">' + (spk.client_nama || '-') + '</td>';
        rows += '<td class="spk-cell-kota">' + (spk.client_kota || '-') + '</td>';
        rows += '<td class="spk-cell-date">' + tglDisplay + '</td>';
        rows += '<td class="spk-cell-number">' + (spk.total_item || 0) + '</td>';
        rows += '<td class="spk-cell-number">' + (spk.total_qty_belum_kirim || 0) + '</td>';
        rows += '<td style="text-align: center;"><span class="spk-terlambat-badge ' + badgeClass + '">' + hari + ' Hari</span></td>';
        rows += '</tr>';
    });

    tbody.innerHTML = rows;

    // Last check time
    var lastCheckEl = document.getElementById('spk-last-check');
    if (lastCheckEl) lastCheckEl.textContent = moment().format('DD MMM YYYY HH:mm');

    // Open popup
    app.popup.open('#spk-warning-popup', true);
}

// ============================================
// DETAIL: fetch + open detail popup
// ============================================
function showSpkDeadlineDetail(penjualanId) {
    var userId = localStorage.getItem("user_id");

    app.preloader.show();

    jQuery.ajax({
        type: 'GET',
        url: SpkWarningConfig.apiUrl + '/' + penjualanId,
        data: { user_id: userId },
        dataType: 'json',
        timeout: 10000,
        success: function (res) {
            app.preloader.hide();

            if (res.success && res.data && res.data.length > 0) {
                var filtered = filterDataByYear(res.data);
                if (filtered.length > 0) {
                    openSpkDetailPopup(filtered, res.filter_info);
                } else {
                    app.dialog.alert('Tidak ada detail SPK dalam periode 1 tahun terakhir', 'Info');
                }
            } else {
                app.dialog.alert('Detail SPK tidak ditemukan', 'Error');
            }
        },
        error: function () {
            app.preloader.hide();
            app.dialog.alert('Gagal mengambil detail SPK', 'Error');
        }
    });
}

// ============================================
// OPEN DETAIL POPUP + populate table
// ============================================
function openSpkDetailPopup(details, filterInfo) {
    var first = details[0];

    // Set header info
    var titleEl = document.getElementById('spk-detail-title');
    var clientEl = document.getElementById('spk-detail-client');
    var kotaEl = document.getElementById('spk-detail-kota');

    if (titleEl) titleEl.textContent = first.no_spk || first.penjualan_id || 'Detail SPK';
    if (clientEl) clientEl.textContent = first.client_nama || '-';
    if (kotaEl) kotaEl.textContent = first.client_kota || '-';

    // Build table rows
    var tbody = document.getElementById('spk-detail-tbody');
    if (!tbody) return;

    var rows = '';
    details.forEach(function (item, idx) {
        var hari = item.hari_terlambat || 0;
        var badgeClass = hari > 7 ? 'red' : (hari > 3 ? 'orange' : 'blue');

        var namaProduk = item.nama_produk || item.produk_keterangan_kustom || 'Tanpa nama';

        var tglAcuan = item.tanggal_acuan || item.tgl_kirim_cabang ||
            (item.penjualan_tanggal_kirim ? moment(item.penjualan_tanggal_kirim).format('YYYY-MM-DD') : null);
        var tglDisplay = tglAcuan ? moment(tglAcuan).format('DD MMM YYYY') : '-';

        var deadlineSrc = '';
        if (item.tgl_kirim_cabang) deadlineSrc = 'Cabang';
        else if (item.penjualan_tanggal_kirim) deadlineSrc = 'Header';

        var status = item.status_produksi || '-';
        var statusClass = 'default';
        if (status === 'selesai') statusClass = 'selesai';
        else if (status === 'proses') statusClass = 'proses';
        else if (status === 'body') statusClass = 'body';

        var qtyBelum = (item.qty_belum_kirim || 0) + ' / ' + (item.penjualan_qty || 0);
        var keterangan = item.detail_keterangan || '-';

        rows += '<tr>';
        rows += '<td class="spk-cell-rownum">' + (idx + 1) + '</td>';
        rows += '<td class="spk-cell-client">' + namaProduk + '</td>';
        rows += '<td class="spk-cell-date">' + tglDisplay;
        if (deadlineSrc) rows += '<br><span style="font-size:9px;color:rgba(255,255,255,0.4);">' + deadlineSrc + '</span>';
        rows += '</td>';
        rows += '<td><span class="spk-status ' + statusClass + '">' + status + '</span></td>';
        rows += '<td class="spk-cell-qty-belum">' + qtyBelum + '</td>';
        rows += '<td class="spk-cell-kota">' + (item.penjualan_jenis || '-') + '</td>';
        rows += '<td><span class="spk-terlambat-badge ' + badgeClass + '">' + hari + ' Hari</span></td>';
        rows += '<td class="spk-cell-keterangan">' + keterangan + '</td>';
        rows += '</tr>';
    });

    tbody.innerHTML = rows;

    // Open detail popup
    app.popup.open('#spk-detail-popup', true);
}