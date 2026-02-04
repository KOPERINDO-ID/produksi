/**
 * ============================================================
 * FCM TOKEN DEBUG HELPER
 * ============================================================
 * Gunakan file ini untuk debugging FCM token registration
 * 
 * CARA PAKAI:
 * 1. Load file ini di index.html (setelah notification.js)
 * 2. Di Chrome DevTools Console, ketik: FCMDebug.checkAll()
 * 3. Lihat hasil diagnostic
 */

var FCMDebug = {
    // Check semua komponen
    checkAll: function () {
        console.log('========================================');
        console.log('FCM TOKEN DEBUG - FULL CHECK');
        console.log('========================================');

        this.checkEnvironment();
        this.checkNotificationManager();
        this.checkFirebasePlugin();
        this.checkUserData();
        this.checkAPIConnection();

        console.log('========================================');
        console.log('END OF DEBUG CHECK');
        console.log('========================================');
    },

    // Check 1: Environment
    checkEnvironment: function () {
        console.log('\n1. ENVIRONMENT CHECK:');
        console.log('   - Running in Cordova:', typeof cordova !== 'undefined');
        console.log('   - Device ready:', window.cordova_ready || false);
        console.log('   - BASE_API:', typeof BASE_API !== 'undefined' ? BASE_API : 'NOT DEFINED');
        console.log('   - jQuery loaded:', typeof jQuery !== 'undefined');
        console.log('   - Framework7 loaded:', typeof Framework7 !== 'undefined');
    },

    // Check 2: NotificationManager
    checkNotificationManager: function () {
        console.log('\n2. NOTIFICATION MANAGER CHECK:');
        console.log('   - NotificationManager loaded:', typeof NotificationManager !== 'undefined');

        if (typeof NotificationManager !== 'undefined') {
            console.log('   - Config:', NotificationManager.config);
            console.log('   - User ID:', localStorage.getItem('user_id'));

            try {
                NotificationManager.debugInfo();
            } catch (e) {
                console.error('   - Error calling debugInfo:', e);
            }
        }
    },

    // Check 3: Firebase Plugin
    checkFirebasePlugin: function () {
        console.log('\n3. FIREBASE PLUGIN CHECK:');

        var firebaseMessaging = null;

        // Check cordova-plugin-firebase-messaging
        if (typeof cordova !== 'undefined' &&
            cordova.plugins &&
            cordova.plugins.firebase &&
            cordova.plugins.firebase.messaging) {
            firebaseMessaging = cordova.plugins.firebase.messaging;
            console.log('   ✅ cordova-plugin-firebase-messaging loaded');
        }
        // Check FirebasePlugin (legacy)
        else if (typeof FirebasePlugin !== 'undefined') {
            firebaseMessaging = FirebasePlugin;
            console.log('   ✅ FirebasePlugin (legacy) loaded');
        }
        else {
            console.log('   ❌ No Firebase plugin loaded');
            console.log('   Available cordova.plugins:',
                typeof cordova !== 'undefined' && cordova.plugins ?
                    Object.keys(cordova.plugins).join(', ') : 'N/A');
            return;
        }

        console.log('   - Trying to get token...');

        firebaseMessaging.getToken(
            function (token) {
                console.log('   ✅ Token received:', token.substring(0, 30) + '...');
                console.log('   ✅ Token length:', token.length);

                // Auto-save to localStorage for testing
                localStorage.setItem('fcm_token_debug', token);
                console.log('   ✅ Token saved to localStorage (fcm_token_debug)');
            },
            function (error) {
                console.error('   ❌ Failed to get token:', error);
            }
        );
    },

    // Check 4: User Data
    checkUserData: function () {
        console.log('\n4. USER DATA CHECK:');
        console.log('   - Login status:', localStorage.getItem('login'));
        console.log('   - User ID:', localStorage.getItem('user_id'));
        console.log('   - Username:', localStorage.getItem('username'));
        console.log('   - FCM Token:', localStorage.getItem('fcm_token') ?
            localStorage.getItem('fcm_token').substring(0, 30) + '...' : 'NULL');
    },

    // Check 5: API Connection
    checkAPIConnection: function () {
        console.log('\n5. API CONNECTION CHECK:');

        if (typeof BASE_API === 'undefined') {
            console.error('   ❌ BASE_API not defined');
            return;
        }

        console.log('   - Testing connection to:', BASE_API);

        // Test basic API call
        $.ajax({
            type: 'GET',
            url: BASE_API + '/check-internet',
            timeout: 5000,
            success: function () {
                console.log('   ✅ API reachable');
            },
            error: function (xhr, status, error) {
                console.error('   ❌ API not reachable:', error);
            }
        });
    },

    // Manual token registration test
    testTokenRegistration: function () {
        console.log('\n========================================');
        console.log('MANUAL TOKEN REGISTRATION TEST');
        console.log('========================================');

        var userId = localStorage.getItem('user_id');
        var token = localStorage.getItem('fcm_token') || localStorage.getItem('fcm_token_debug');

        if (!userId) {
            console.error('❌ No user_id found. Please login first.');
            return;
        }

        if (!token) {
            console.error('❌ No FCM token found. Run FCMDebug.checkAll() first.');
            return;
        }

        console.log('User ID:', userId);
        console.log('Token:', token.substring(0, 30) + '...');
        console.log('API URL:', BASE_API + '/fcm/register');
        console.log('\nSending request...');

        $.ajax({
            type: 'POST',
            url: BASE_API + '/fcm/register',
            data: {
                user_id: userId,
                fcm_token: token
            },
            dataType: 'json',
            success: function (response) {
                console.log('✅ SUCCESS:', response);

                if (response.success) {
                    console.log('✅ Token registered to database!');
                    console.log('   Unread notifications sent:', response.unread_notifications_sent);
                } else {
                    console.error('❌ Registration failed:', response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('❌ ERROR:', error);
                console.error('   Status:', status);
                console.error('   Response:', xhr.responseText);
            }
        });
    },

    // Force token refresh and register
    forceRefreshAndRegister: function () {
        console.log('\n========================================');
        console.log('FORCE TOKEN REFRESH & REGISTER');
        console.log('========================================');

        var firebaseMessaging = null;

        // Get Firebase Messaging instance
        if (typeof cordova !== 'undefined' &&
            cordova.plugins &&
            cordova.plugins.firebase &&
            cordova.plugins.firebase.messaging) {
            firebaseMessaging = cordova.plugins.firebase.messaging;
            console.log('Using cordova-plugin-firebase-messaging');
        } else if (typeof FirebasePlugin !== 'undefined') {
            firebaseMessaging = FirebasePlugin;
            console.log('Using FirebasePlugin (legacy)');
        }

        if (!firebaseMessaging) {
            console.error('❌ No Firebase plugin available');
            return;
        }

        if (typeof NotificationManager === 'undefined') {
            console.error('❌ NotificationManager not loaded');
            return;
        }

        var userId = localStorage.getItem('user_id');
        if (!userId) {
            console.error('❌ No user_id found. Please login first.');
            return;
        }

        console.log('Step 1: Getting FCM token...');

        firebaseMessaging.getToken(
            function (token) {
                console.log('✅ Token received:', token.substring(0, 30) + '...');

                console.log('Step 2: Registering to server...');

                $.ajax({
                    type: 'POST',
                    url: BASE_API + '/fcm/register',
                    data: {
                        user_id: userId,
                        fcm_token: token
                    },
                    dataType: 'json',
                    success: function (response) {
                        console.log('✅ Registration successful:', response);
                        localStorage.setItem('fcm_token', token);

                        console.log('Step 3: Fetching notifications...');
                        if (NotificationManager.init) {
                            NotificationManager.init(userId, true);
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('❌ Registration failed:', error);
                        console.error('   Response:', xhr.responseText);
                    }
                });
            },
            function (error) {
                console.error('❌ Failed to get token:', error);
            }
        );
    },

    // Check database (requires manual SQL check)
    checkDatabase: function () {
        console.log('\n========================================');
        console.log('DATABASE CHECK INSTRUCTIONS');
        console.log('========================================');
        console.log('Run this SQL query in your database:');
        console.log('');
        console.log('SELECT user_id, ');
        console.log('       LEFT(fcm_token, 30) as token_preview,');
        console.log('       CHAR_LENGTH(fcm_token) as token_length,');
        console.log('       dt_modified');
        console.log('FROM users');
        console.log('WHERE user_id = ' + localStorage.getItem('user_id') + ';');
        console.log('');
        console.log('Expected:');
        console.log('- token_length should be > 100');
        console.log('- token_preview should start with letters/numbers');
        console.log('- dt_modified should be recent');
    },

    // Listen to Firebase events
    listenFirebaseEvents: function () {
        console.log('\n========================================');
        console.log('LISTENING TO FIREBASE EVENTS');
        console.log('========================================');
        console.log('This will log all Firebase events...');

        var firebaseMessaging = null;

        // Get Firebase Messaging instance
        if (typeof cordova !== 'undefined' &&
            cordova.plugins &&
            cordova.plugins.firebase &&
            cordova.plugins.firebase.messaging) {
            firebaseMessaging = cordova.plugins.firebase.messaging;
            console.log('Using cordova-plugin-firebase-messaging');
        } else if (typeof FirebasePlugin !== 'undefined') {
            firebaseMessaging = FirebasePlugin;
            console.log('Using FirebasePlugin (legacy)');
        }

        if (!firebaseMessaging) {
            console.error('❌ No Firebase plugin available');
            return;
        }

        // Listen for token refresh
        firebaseMessaging.onTokenRefresh(
            function (token) {
                console.log('🔄 Token refreshed:', token.substring(0, 30) + '...');
            },
            function (error) {
                console.error('❌ Token refresh error:', error);
            }
        );

        // Listen for messages (support both method names)
        var onMessageMethod = firebaseMessaging.onMessage || firebaseMessaging.onMessageReceived;
        if (onMessageMethod) {
            onMessageMethod.call(firebaseMessaging,
                function (message) {
                    console.log('📩 Message received:', message);
                },
                function (error) {
                    console.error('❌ Message receive error:', error);
                }
            );
        }

        console.log('✅ Listeners registered. Events will appear in console.');
    }
};

// Auto-run basic check when file loads (only in debug mode)
if (localStorage.getItem('debug_mode') === 'true') {
    setTimeout(function () {
        console.log('🔍 Auto-running FCM Debug Check...');
        FCMDebug.checkAll();
    }, 2000);
}

// Expose to window
window.FCMDebug = FCMDebug;

console.log('========================================');
console.log('FCM DEBUG HELPER LOADED');
console.log('========================================');
console.log('Available commands:');
console.log('  FCMDebug.checkAll()                    - Run all checks');
console.log('  FCMDebug.testTokenRegistration()       - Test token registration');
console.log('  FCMDebug.forceRefreshAndRegister()     - Force refresh & register');
console.log('  FCMDebug.checkDatabase()               - Show SQL query to check DB');
console.log('  FCMDebug.listenFirebaseEvents()        - Listen to Firebase events');
console.log('========================================');