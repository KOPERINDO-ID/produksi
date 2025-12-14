console.log('========================================');
console.log('🚀 Firebase Debug Script Loaded');
console.log('========================================');

// Status tracking
const status = {
    jsLoaded: false,
    deviceReady: false,
    cordovaAvailable: false,
    firebaseAvailable: false,
    messagingAvailable: false,
    permissionGranted: false,
    tokenReceived: false
};

// Statistics
let messagesReceived = 0;
let errorsCount = 0;

// Step 1: JavaScript Loaded
status.jsLoaded = true;
console.log('✅ [1/7] JavaScript loaded successfully');
console.log('Time:', new Date().toLocaleTimeString());

// Step 2: Wait for DeviceReady
console.log('⏳ [2/7] Waiting for deviceready event...');
document.addEventListener('deviceready', onDeviceReady, false);

// DeviceReady timeout
const deviceReadyTimeout = setTimeout(() => {
    if (!status.deviceReady) {
        console.error('❌ DeviceReady TIMEOUT after 10 seconds!');
        console.error('Possible causes:');
        console.error('  - cordova.js not loaded');
        console.error('  - Testing in browser (use real device)');
        console.error('  - Platform not added correctly');
        errorsCount++;
    }
}, 10000);

function onDeviceReady() {
    clearTimeout(deviceReadyTimeout);
    status.deviceReady = true;

    console.log('========================================');
    console.log('✅ [2/7] DeviceReady event fired!');
    console.log('========================================');

    try {
        // Step 3: Check Cordova
        console.log('🔍 [3/7] Checking Cordova...');

        if (!window.cordova) {
            console.error('❌ Cordova object not found!');
            console.error('window.cordova:', window.cordova);
            errorsCount++;
            return;
        }

        status.cordovaAvailable = true;
        console.log('✅ Cordova available');
        console.log('   Version:', cordova.version);
        console.log('   Platform:', cordova.platformId);
        console.log('   Device:', device ? device.model : 'Unknown');

        // Step 4: Check Cordova Plugins
        console.log('🔍 [4/7] Checking Cordova Plugins...');

        if (!cordova.plugins) {
            console.error('❌ cordova.plugins is undefined!');
            errorsCount++;
            return;
        }

        console.log('✅ cordova.plugins available');
        console.log('   Available plugins:', Object.keys(cordova.plugins));

        // Step 5: Check Firebase Plugin
        console.log('🔍 [5/7] Checking Firebase Plugin...');

        if (!cordova.plugins.firebase) {
            console.error('❌ Firebase plugin NOT FOUND!');
            console.error('💡 Install with: cordova plugin add cordova-plugin-firebase-messaging');
            console.error('   Available plugins:', Object.keys(cordova.plugins));
            errorsCount++;
            return;
        }

        status.firebaseAvailable = true;
        console.log('✅ Firebase plugin detected');
        console.log('   Firebase object:', typeof cordova.plugins.firebase);

        // Step 6: Check Firebase Messaging
        console.log('🔍 [6/7] Checking Firebase Messaging...');

        if (!cordova.plugins.firebase.messaging) {
            console.error('❌ Firebase Messaging NOT FOUND!');
            console.error('   firebase.messaging:', cordova.plugins.firebase.messaging);
            errorsCount++;
            return;
        }

        status.messagingAvailable = true;
        console.log('✅ Firebase Messaging available');
        console.log('   Messaging object:', typeof cordova.plugins.firebase.messaging);
        console.log('   Methods:', Object.keys(cordova.plugins.firebase.messaging));

        // Step 7: Initialize Firebase
        console.log('🔥 [7/7] Initializing Firebase...');
        initializeFirebase();

    } catch (error) {
        console.error('========================================');
        console.error('❌ EXCEPTION in onDeviceReady!');
        console.error('========================================');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        errorsCount++;
    }
}

function initializeFirebase() {
    console.log('========================================');
    console.log('🔥 Firebase Initialization Started');
    console.log('========================================');

    // Request Permission
    console.log('⏳ Step 1: Requesting notification permission...');

    cordova.plugins.firebase.messaging.requestPermission()
        .then(() => {
            status.permissionGranted = true;
            console.log('✅ Permission GRANTED!');
            console.log('   User accepted notifications');

            // Get Token
            console.log('⏳ Step 2: Getting FCM token...');
            return cordova.plugins.firebase.messaging.getToken();
        })
        .then((token) => {
            status.tokenReceived = true;

            console.log('========================================');
            console.log('✅ FCM TOKEN RECEIVED!');
            console.log('========================================');
            console.log('Token:', token);
            console.log('Token length:', token.length, 'characters');
            console.log('Token preview:', token.substring(0, 50) + '...');
            console.log('========================================');
            console.log('📋 COPY THIS TOKEN TO TEST NOTIFICATIONS');
            console.log('========================================');

            // Setup Notification Handlers
            console.log('⏳ Step 3: Setting up notification handlers...');
            setupNotificationHandlers();

            // Success Summary
            printSuccessSummary();

        })
        .catch((error) => {
            console.error('========================================');
            console.error('❌ FIREBASE INITIALIZATION FAILED!');
            console.error('========================================');
            console.error('Error object:', error);
            console.error('Error message:', error.message || 'No message');
            console.error('Error code:', error.code || 'No code');
            console.error('Error details:', JSON.stringify(error, null, 2));

            if (error.message && error.message.includes('permission')) {
                console.error('💡 User denied notification permission');
                console.error('   Go to: Settings > Apps > Your App > Notifications');
            }

            errorsCount++;
            printStatus();
        });
}

function setupNotificationHandlers() {
    console.log('🔧 Setting up notification handlers...');

    // Handler 1: Foreground Messages
    cordova.plugins.firebase.messaging.onMessage((payload) => {
        messagesReceived++;

        console.log('========================================');
        console.log('📩 FOREGROUND NOTIFICATION RECEIVED!');
        console.log('========================================');
        console.log('Time:', new Date().toLocaleTimeString());
        console.log('Full payload:', JSON.stringify(payload, null, 2));

        if (payload.notification) {
            console.log('📬 Notification:');
            console.log('   Title:', payload.notification.title);
            console.log('   Body:', payload.notification.body);
            console.log('   Icon:', payload.notification.icon);
            console.log('   Sound:', payload.notification.sound);
        }

        if (payload.data) {
            console.log('📦 Data payload:');
            console.log(JSON.stringify(payload.data, null, 2));
        }

        console.log('📊 Statistics:');
        console.log('   Total messages received:', messagesReceived);
        console.log('========================================');
    });

    // Handler 2: Background Messages
    cordova.plugins.firebase.messaging.onBackgroundMessage((payload) => {
        messagesReceived++;

        console.log('========================================');
        console.log('📩 BACKGROUND NOTIFICATION TAPPED!');
        console.log('========================================');
        console.log('Time:', new Date().toLocaleTimeString());
        console.log('Full payload:', JSON.stringify(payload, null, 2));

        if (payload.notification) {
            console.log('📬 Notification:');
            console.log('   Title:', payload.notification.title);
            console.log('   Body:', payload.notification.body);
        }

        if (payload.data) {
            console.log('📦 Data payload:');
            console.log(JSON.stringify(payload.data, null, 2));
        }

        console.log('📊 Statistics:');
        console.log('   Total messages received:', messagesReceived);
        console.log('========================================');
    });

    // Handler 3: Token Refresh
    cordova.plugins.firebase.messaging.onTokenRefresh((newToken) => {
        console.log('========================================');
        console.log('🔄 FCM TOKEN REFRESHED!');
        console.log('========================================');
        console.log('New token:', newToken);
        console.log('Token length:', newToken.length);
        console.log('Time:', new Date().toLocaleTimeString());
        console.log('========================================');
        console.log('📋 UPDATE THIS TOKEN IN YOUR BACKEND!');
        console.log('========================================');
    });

    console.log('✅ All notification handlers registered');
    console.log('   - onMessage (foreground)');
    console.log('   - onBackgroundMessage (background/closed)');
    console.log('   - onTokenRefresh (token updates)');
}

function printSuccessSummary() {
    console.log('');
    console.log('========================================');
    console.log('🎉 FIREBASE SETUP COMPLETE!');
    console.log('========================================');
    console.log('Status Summary:');
    console.log('  ✅ JavaScript loaded');
    console.log('  ✅ Device ready');
    console.log('  ✅ Cordova available');
    console.log('  ✅ Firebase plugin detected');
    console.log('  ✅ Firebase Messaging available');
    console.log('  ✅ Permission granted');
    console.log('  ✅ FCM Token received');
    console.log('  ✅ Notification handlers registered');
    console.log('========================================');
    console.log('📱 Ready to receive push notifications!');
    console.log('========================================');
    console.log('');
    console.log('🧪 HOW TO TEST:');
    console.log('  1. Copy the FCM token above');
    console.log('  2. Go to Firebase Console > Messaging');
    console.log('  3. Click "Send test message"');
    console.log('  4. Paste your token and send');
    console.log('');
    console.log('📊 Current Statistics:');
    console.log('   Messages received:', messagesReceived);
    console.log('   Errors:', errorsCount);
    console.log('========================================');
}

function printStatus() {
    console.log('');
    console.log('========================================');
    console.log('📊 CURRENT STATUS');
    console.log('========================================');
    console.log('JavaScript loaded:', status.jsLoaded ? '✅' : '❌');
    console.log('Device ready:', status.deviceReady ? '✅' : '❌');
    console.log('Cordova available:', status.cordovaAvailable ? '✅' : '❌');
    console.log('Firebase available:', status.firebaseAvailable ? '✅' : '❌');
    console.log('Messaging available:', status.messagingAvailable ? '✅' : '❌');
    console.log('Permission granted:', status.permissionGranted ? '✅' : '❌');
    console.log('Token received:', status.tokenReceived ? '✅' : '❌');
    console.log('========================================');
    console.log('Statistics:');
    console.log('   Messages received:', messagesReceived);
    console.log('   Errors:', errorsCount);
    console.log('========================================');
}

// Global Error Handler
window.onerror = function (msg, url, line, col, error) {
    console.error('========================================');
    console.error('❌ JAVASCRIPT ERROR!');
    console.error('========================================');
    console.error('Message:', msg);
    console.error('URL:', url);
    console.error('Line:', line, 'Column:', col);
    if (error) {
        console.error('Error object:', error);
        console.error('Stack trace:', error.stack);
    }
    console.error('========================================');
    errorsCount++;
    return false;
};

// Print initial status after 1 second
setTimeout(() => {
    if (!status.deviceReady) {
        console.warn('⚠️ DeviceReady not fired yet...');
        console.warn('Still waiting... (timeout in 9 seconds)');
    }
}, 1000);

console.log('');
console.log('📱 Waiting for device to be ready...');
console.log('🔍 Monitoring will continue in logcat...');
console.log('');