document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Device is ready');

    // PERBAIKAN: Ambil userId dari localStorage
    var userId = localStorage.getItem('user_id');

    // Hanya init jika sudah login (ada userId)
    if (userId) {
        console.log('[debug_notif] User logged in, userId:', userId);
        // NotificationManager.init(userId); // DICOMMENT karena sudah dipanggil di app.js
    } else {
        console.log('[debug_notif] No user logged in, skipping notification init');
    }

    console.log('cordova:', typeof cordova);
    console.log('cordova.plugins:', typeof cordova.plugins);
    console.log('firebase:', cordova.plugins ? cordova.plugins.firebase : 'N/A');
    console.log('messaging:', cordova.plugins && cordova.plugins.firebase ? cordova.plugins.firebase.messaging : 'N/A');

    setTimeout(function () {
        NotificationManager.playNotificationSound();

        NotificationManager.addNotification(
            'New Order Penjualan',
            'Ada orderan baru dari PT. ABC dengan invoice INV_00123',
            {
                type: 'new_order',
                invoice_id: 'INV_00123',
                client_name: 'PT. ABC'
            }
        );
    }, 3000);

    setTimeout(function () {
        NotificationManager.playNotificationSound();

        NotificationManager.addNotification(
            'Pembayaran Diterima',
            'Pembayaran untuk invoice INV_00120 telah diterima',
            {
                type: 'payment',
                invoice_id: 'INV_00120'
            }
        );
    }, 6000);
}

/**
 * Test notification manually - panggil dari console
 */
function testNotification() {
    if (typeof NotificationManager === 'undefined') {
        console.error('NotificationManager not loaded');
        alert('NotificationManager not loaded!');
        return;
    }

    if (!NotificationManager.isInitialized) {
        console.error('NotificationManager not initialized');
        alert('NotificationManager not initialized! Please login first.');
        return;
    }

    NotificationManager.addNotification(
        'Test Notification',
        'Ini adalah test notifikasi dari aplikasi - ' + new Date().toLocaleTimeString(),
        {
            type: 'test',
            timestamp: new Date().toISOString()
        }
    );

    console.log('Test notification added');
}

/**
 * Test notification dengan sound
 */
function testNotificationWithSound() {
    if (typeof NotificationManager === 'undefined' || !NotificationManager.isInitialized) {
        alert('NotificationManager not ready!');
        return;
    }

    // Play sound dulu
    NotificationManager.playNotificationSound();

    // Lalu tambah notification
    NotificationManager.addNotification(
        'Test dengan Sound',
        'Notifikasi ini seharusnya ada suaranya',
        {
            type: 'test',
            timestamp: new Date().toISOString()
        }
    );
}

/**
 * Debug info
 */
function debugNotifInfo() {
    console.log('========== NOTIFICATION DEBUG INFO ==========');
    console.log('NotificationManager exists:', typeof NotificationManager !== 'undefined');

    if (typeof NotificationManager !== 'undefined') {
        console.log('isInitialized:', NotificationManager.isInitialized);
        console.log('userId:', NotificationManager.userId);
        console.log('fcmToken:', NotificationManager.fcmToken ? NotificationManager.fcmToken.substring(0, 20) + '...' : 'null');
        console.log('notifications count:', NotificationManager.notifications.length);
        console.log('unreadCount:', NotificationManager.unreadCount);
        console.log('apiUrl:', NotificationManager.config.apiUrl);
    }

    console.log('localStorage user_id:', localStorage.getItem('user_id'));
    console.log('localStorage fcm_token:', localStorage.getItem('fcm_token') ? 'EXISTS' : 'NULL');
    console.log('localStorage token_registered:', localStorage.getItem('token_registered'));
    console.log('==============================================');
}

console.log('[debug_notif.js] Loaded. Available commands: testNotification(), testNotificationWithSound(), debugNotifInfo()');