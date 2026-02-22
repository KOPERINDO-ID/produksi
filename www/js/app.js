function daysInThisMonth() {
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

function daysNameInThisMonth() {
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDay();
}

function abbreviateNumber(number) {
  var SI_PREFIXES = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: ' Ribu' },
    { value: 1e6, symbol: ' Juta' },
    { value: 1e9, symbol: ' Milyar' },
    { value: 1e12, symbol: ' Triliun' },
  ]
  if (number === 0) return number

  var tier = SI_PREFIXES.filter((n) => number >= n.value).pop()
  var numberFixed = (number / tier.value).toFixed(0)

  return numberFixed + tier.symbol
}


var $$ = Dom7;
var app = new Framework7({
  photoBrowser: {
    type: 'popup',
    toolbar: false
  },
  root: '#app',
  id: 'id.vertice.tasindosalesapp',
  name: 'Produksi App',
  theme: 'md',
  data: function () {
    return {};
  },
  methods: {},
  routes: routes,
  input: {
    scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
    scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
  },
  statusbar: {
    iosOverlaysWebView: true,
    androidOverlaysWebView: false,
  },
  on: {
    init: function () {
      var f7 = this;
      if (f7.device.cordova) {
        cordovaApp.init(f7);
      }

      if (localStorage.getItem("login") != "true") {
        setTimeout(function () {
          return app.views.main.router.navigate('/login');
        }, 300);
      } else {
        // ============================================
        // PERBAIKAN: Init notification SETELAH deviceready
        // ============================================
        console.log('[App] User logged in, initializing notification...');

        // Cek apakah Cordova app
        if (f7.device.cordova) {
          console.log('[App] Cordova app detected, waiting for deviceready...');

          // Set flag untuk track deviceready
          if (!window.cordovaDeviceReady) {
            document.addEventListener('deviceready', function () {
              console.log('[App] ✅ deviceready event fired!');
              window.cordovaDeviceReady = true;

              // Init notification setelah deviceready
              initNotificationManagerOnStartup();
            }, false);
          } else {
            // deviceready sudah fired sebelumnya
            console.log('[App] deviceready already fired, init now');
            initNotificationManagerOnStartup();
          }
        } else {
          // Bukan Cordova app (web browser)
          console.log('[App] Not a Cordova app, init directly');
          setTimeout(function () {
            initNotificationManagerOnStartup();
          }, 500);
        }

        var lower_api = localStorage.getItem("lokasi_pabrik").toLowerCase();

        if (lower_api == 'pusat') {
          localStorage.setItem("lower_api_pabrik", 'surabaya');
        } else {
          localStorage.setItem("lower_api_pabrik", lower_api);
        }

        var lokasi_pabrik = '';
        if (!localStorage.getItem("lokasi_pabrik")) {
          logOut()
        } else {
          lokasi_pabrik = localStorage.getItem("lokasi_pabrik");
        }

        if (lokasi_pabrik == 'Pusat') {
          setTimeout(function () {
            startTimeMain();
            getDataProduksi();
            getDashboardProduksi();
            dateRangeDeclarationProduksi();
            openDialogViewProduksi();
            checkConnection();
            getYearPointProduksi();
            getYearHistoryProduksiPusat()
            return app.views.main.router.navigate('/produksi_pusat');
          }, 100);
        } else {
          setTimeout(function () {
            startTimeMain();
            getPlayAudio();
            chooseDataProduksiCabangRedirect('pusat');
            dateRangeDeclarationProduksiCabangPusat();
            getYearProduksiSelesai();
            initSpkWarning();
            return app.views.main.router.navigate('/cabang');
          }, 100);
        }
      }
    },
  },
});


// Page Kunjungan On load
$$(document).on('page:afterin', '.page[data-name="kunjungan"]', function (e) {
  checkLogin();
  getProspekHeader();
  dateRangeDeclarationProspek();
  checkConnection();
})

$$(document).on('page:afterin', '.page[data-name="prospek_input"]', function (e) {
  selectBoxClientKunjungan();
  var today = moment().format('YYYY-MM-DD');
  document.getElementsByName("tanggal_janjian")[0].setAttribute('min', today);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      $$('#hasil_pertemuan1').val('');
      localStorage.setItem("lat_usr", position.coords.latitude);
      localStorage.setItem("lng_usr", position.coords.longitude);
    });
  } else {
    return app.views.main.router.navigate('/kunjungan');
  }
  checkConnection();
})

// Page Katalog On load
$$(document).on('page:afterin', '.page[data-name="katalog"]', function (e) {
  checkLogin();
  getProduk();
  checkConnection();
})

// Page Detail Product On load
$$(document).on('page:afterin', '.page[data-name="detail_product"]', function (e) {
  checkLogin();
  getProdukDetail();
  getProdukWarna();
  checkConnection();
  $$('.switch_frame').on('click', function () {
    jQuery("#main_frame").fadeOut('fast', function () {
      jQuery("#main_frame").fadeIn('fast');
    });
    jQuery("#main_frame").attr("src", jQuery(this).attr('data-src'));
  });
})

// Page Penjualan On load
$$(document).on('page:afterin', '.page[data-name="penjualan"]', function (e) {
  checkLogin();
  getPenjualanHeader();
  getPerformaHeaderPenjualan();
  dateRangeDeclarationPenjualan();
  selectBankPembayaran();
  checkConnection();
})

// Page Home / main On load
$$(document).on('page:afterin', '.page[data-name="home"]', function (e) {
  checkConnection();
  getDashboardProspekLine();
  showday();
  showLineGraph();
  getDashboardProspek();
  getFee();
  getDashboardPenjualan();
  getDashboardBlockOrder();
});

// Page penjualan input On load
$$(document).on('page:afterin', '.page[data-name="penjualan_input"]', function (e) {
  checkLogin();
  selectBank();
  penjualanGetPerformaData();
  checkConnection();
  jQuery('#tanggal_pemesanan_1').val(moment().format('YYYY-MM-DD'));
});

$$(document).on('page:afterin', '.page[data-name="surat_jalan"]', function (e) {
  checkLogin();
  getHeaderPenjualanKunjungan(1);
  checkConnection();
});

$$(document).on('page:afterin', '.page[data-name="cabang-pusat"]', function (e) {
  checkLogin();
  chooseDataProduksiCabangPusat();
  dateRangeDeclarationProduksiCabangPusat();
  getYearProduksiSelesai();
})

$$(document).on('page:afterin', '.page[data-name="cabang"]', function (e) {
  checkLogin();
  chooseDataProduksiCabangRedirect('pusat');
  dateRangeDeclarationProduksiCabang();
  getYearHistoryPointProduksi();
  localStorage.removeItem('arsip');
  kardusProduksi.init();
})

$$(document).on('page:afterin', '.page[data-name="purchasing"]', function (e) {
  checkLogin();
  initPurchasingPage();
})

$$(document).on('page:afterin', '.page[data-name="produksi-pusat"]', function (e) {
  checkLogin();
  $("#spk_data").hide();
  $("#pusat_data").hide();
  getDashboardProduksi();
  dateRangeDeclarationProduksi();
  openDialogViewProduksi();
  checkConnection();
  getYearPointProduksi();
  getYearHistoryProduksiPusat();
  choosePabrikSby('Sby');
})

$$(document).on('page:afterin', '.page[data-name="produksi-body"]', function (e) {
  checkLogin();
  getDataProduksiBody();
  getDashboardProduksi('body');
  dateRangeDeclarationProduksiBody();
  checkConnection();
})

$$(document).on('page:afterin', '.page[data-name="partner"]', function (e) {
  checkLogin();
  getDataPartnerLaporan();
  checkConnection();
})

$$(document).on('page:afterin', '.page[data-name="laporan_cabang"]', function (e) {
  checkLogin();
  getDataPartnerLaporanCabang();
  checkConnection();
})

$$(document).on('page:afterin', '.page[data-name="produksi-proses"]', function (e) {
  checkLogin();
  getDataProduksiProses();
  getDashboardProduksi('proses');
  dateRangeDeclarationProduksiProses();
  checkConnection();
})

$$(document).on('page:afterin', '.page[data-name="produksi-selesai"]', function (e) {
  checkLogin();
  getDataProduksiSelesai();
  getDashboardProduksi('selesai');
  dateRangeDeclarationProduksiSelesai();
  checkConnection();
})

$$(document).on('page:afterin', '.page[data-name="produksi-harian"]', function (e) {
  checkLogin();
  getDataProduksiHarian();
  getDashboardProduksi('selesai');
  dateRangeDeclarationProduksiHarian();
  checkConnection();
})

$$(document).on('page:afterin', '.page[data-name="login"]', function (e) {
  jQuery('#logout_logo').hide();
  jQuery('#notifIcon').hide();
  checkConnection();
});

$$(document).on('page:afterin', '.page[data-name="performa_input"]', function (e) {
  checkLogin();
  selectBoxClient();
  $$('#count_performa').val($$('.performa_group_field_count').length);
  jQuery('.input-item-price').mask('000,000,000,000', { reverse: false });
  checkConnection();
});

$$(document).on('page:afterin', '.page[data-name="penjualan_input_non_performa"]', function (e) {
  checkLogin();
  addNonPerforma();
  checkConnection();
});

// ============================================
// NOTIFICATION MANAGER HELPER FUNCTIONS
// ============================================

/**
 * Init NotificationManager saat app startup (user sudah login sebelumnya)
 * MODE: STARTUP - Load dari localStorage, tidak fetch dari server
 */
function initNotificationManagerOnStartup() {
  var userId = localStorage.getItem("user_id");

  if (!userId) {
    console.log('[App] No user_id, skipping notification init');
    return;
  }

  console.log('[App] 🚀 Initializing NotificationManager on startup');
  console.log('[App]    User ID:', userId);
  console.log('[App]    Mode: STARTUP (no fetch)');

  // Cek NotificationManager tersedia
  if (typeof NotificationManager === 'undefined') {
    console.error('[App] ❌ NotificationManager not loaded!');
    console.error('[App]    Make sure notification.js is included in index.html');
    return;
  }

  // Update API URL
  if (typeof BASE_API !== 'undefined') {
    NotificationManager.config.apiUrl = BASE_API;
    console.log('[App]    API URL:', BASE_API);
  }

  // Init dengan forceRefresh = FALSE
  // Ini akan:
  // 1. Load notifikasi dari localStorage
  // 2. Setup UI listeners
  // 3. Setup Firebase listeners (jika token sudah ada)
  // 4. TIDAK fetch dari server
  // 5. TIDAK request token baru
  NotificationManager.init(userId, false);

  console.log('[App] ✅ NotificationManager initialized (startup mode)');
}

/**
 * Init NotificationManager setelah login berhasil
 * MODE: LOGIN - Request token, register ke server, fetch dari server
 */
function initNotificationManagerAfterLogin() {
  var userId = localStorage.getItem("user_id");

  if (!userId) {
    console.error('[Login] ❌ No user_id after login');
    return;
  }

  console.log('[Login] 🚀 Initializing NotificationManager after login');
  console.log('[Login]    User ID:', userId);
  console.log('[Login]    Mode: LOGIN (full init)');

  // Cek NotificationManager tersedia
  if (typeof NotificationManager === 'undefined') {
    console.error('[Login] ❌ NotificationManager not loaded!');
    return;
  }

  // Update API URL
  if (typeof BASE_API !== 'undefined') {
    NotificationManager.config.apiUrl = BASE_API;
    console.log('[Login]    API URL:', BASE_API);
  }

  // CRITICAL: Cek apakah Cordova ready
  if (typeof cordova !== 'undefined') {
    console.log('[Login] 📱 Cordova detected');

    if (window.cordovaDeviceReady) {
      // deviceready sudah fired
      console.log('[Login] ✅ deviceready already fired, init now');
      _doInitNotificationLogin(userId);
    } else {
      // Tunggu deviceready
      console.log('[Login] ⏳ Waiting for deviceready event...');

      // Set timeout sebagai fallback
      var timeoutId = setTimeout(function () {
        console.warn('[Login] ⚠️ deviceready timeout, init anyway');
        _doInitNotificationLogin(userId);
      }, 5000); // 5 detik timeout

      document.addEventListener('deviceready', function deviceReadyHandler() {
        console.log('[Login] ✅ deviceready fired!');
        clearTimeout(timeoutId);
        window.cordovaDeviceReady = true;

        // Remove listener to prevent multiple calls
        document.removeEventListener('deviceready', deviceReadyHandler);

        _doInitNotificationLogin(userId);
      }, false);
    }
  } else {
    // Bukan Cordova app
    console.log('[Login] 🌐 Not Cordova, init directly');
    setTimeout(function () {
      _doInitNotificationLogin(userId);
    }, 500);
  }
}

/**
 * Actual initialization setelah deviceready
 */
function _doInitNotificationLogin(userId) {
  console.log('[Login] 🔧 _doInitNotificationLogin executing...');

  // Debug: Cek Firebase plugin availability
  if (typeof cordova !== 'undefined') {
    console.log('[Login] 🔍 Debug Info:');
    console.log('[Login]    cordova.platformId:', cordova.platformId);
    console.log('[Login]    cordova.plugins:', cordova.plugins ? Object.keys(cordova.plugins).join(', ') : 'undefined');

    if (cordova.plugins && cordova.plugins.firebase) {
      console.log('[Login]    ✅ cordova.plugins.firebase exists');
      console.log('[Login]    firebase properties:', Object.keys(cordova.plugins.firebase).join(', '));

      if (cordova.plugins.firebase.messaging) {
        console.log('[Login]    ✅ firebase.messaging exists!');
      } else {
        console.error('[Login]    ❌ firebase.messaging NOT FOUND');
      }
    } else {
      console.error('[Login]    ❌ cordova.plugins.firebase NOT FOUND');
      console.error('[Login]    Available plugins:', cordova.plugins ? Object.keys(cordova.plugins).join(', ') : 'none');
    }
  }

  // Init dengan forceRefresh = TRUE
  // Ini akan:
  // 1. Request notification permission
  // 2. Get FCM token dari Firebase
  // 3. Register token ke server
  // 4. Setup Firebase listeners
  // 5. Fetch notifications dari server
  console.log('[Login] 🎯 Calling NotificationManager.init(userId, true)...');
  NotificationManager.init(userId, true);

  console.log('[Login] ✅ NotificationManager.init called');

  // Force refresh token setelah delay untuk memastikan Firebase ready
  setTimeout(function () {
    console.log('[Login] 🔄 Force refreshing FCM token...');

    if (NotificationManager.isFirebaseAvailable && NotificationManager.isFirebaseAvailable()) {
      console.log('[Login]    ✅ Firebase available, getting token');

      if (typeof NotificationManager.getFirebaseToken === 'function') {
        NotificationManager.getFirebaseToken();
      } else {
        console.warn('[Login]    ⚠️ getFirebaseToken method not found');
      }
    } else {
      console.error('[Login]    ❌ Firebase NOT available!');
      console.error('[Login]    Possible causes:');
      console.error('[Login]    1. Plugin not installed: cordova plugin add cordova-plugin-firebase-messaging');
      console.error('[Login]    2. google-services.json missing');
      console.error('[Login]    3. App not built for Android');
      console.error('[Login]    4. deviceready not fired yet (should not happen here)');
    }
  }, 2000);
}

/**
 * Cleanup NotificationManager sebelum logout
 */
function cleanupNotificationManager(callback) {
  console.log('[App] 🧹 Cleaning up NotificationManager...');

  if (typeof NotificationManager !== 'undefined') {
    NotificationManager.cleanup(function () {
      console.log('[App] ✅ NotificationManager cleaned up');
      if (callback) callback();
    });
  } else {
    console.warn('[App] ⚠️ NotificationManager not found, skipping cleanup');
    if (callback) callback();
  }
}