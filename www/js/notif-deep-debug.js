/**
 * ================================================================
 * FIREBASE PLUGIN DEEP DEBUG
 * ================================================================
 * Paste code ini di Chrome DevTools Console untuk debug
 */

console.log('========================================');
console.log('FIREBASE PLUGIN DEEP DEBUG');
console.log('========================================');

// 1. Check Cordova
console.log('\n1. CORDOVA CHECK:');
console.log('   typeof cordova:', typeof cordova);
console.log('   cordova defined:', typeof cordova !== 'undefined');

if (typeof cordova !== 'undefined') {
    console.log('   ✅ Cordova available');

    // 2. Check cordova.plugins
    console.log('\n2. CORDOVA.PLUGINS CHECK:');
    console.log('   typeof cordova.plugins:', typeof cordova.plugins);

    if (cordova.plugins) {
        console.log('   ✅ cordova.plugins available');
        console.log('   Available plugins:', Object.keys(cordova.plugins));

        // 3. Check firebase
        console.log('\n3. FIREBASE CHECK:');
        console.log('   typeof cordova.plugins.firebase:', typeof cordova.plugins.firebase);

        if (cordova.plugins.firebase) {
            console.log('   ✅ cordova.plugins.firebase available');
            console.log('   Firebase properties:', Object.keys(cordova.plugins.firebase));

            // 4. Check messaging
            console.log('\n4. MESSAGING CHECK:');
            console.log('   typeof cordova.plugins.firebase.messaging:', typeof cordova.plugins.firebase.messaging);

            if (cordova.plugins.firebase.messaging) {
                console.log('   ✅ cordova.plugins.firebase.messaging available!');
                console.log('   Messaging methods:', Object.keys(cordova.plugins.firebase.messaging));

                // Test getToken
                console.log('\n5. TEST GET TOKEN:');
                cordova.plugins.firebase.messaging.getToken(
                    function (token) {
                        console.log('   ✅ SUCCESS! Token:', token.substring(0, 30) + '...');
                        console.log('   Token length:', token.length);
                    },
                    function (error) {
                        console.log('   ❌ FAILED! Error:', error);
                    }
                );
            } else {
                console.log('   ❌ cordova.plugins.firebase.messaging NOT FOUND');
            }
        } else {
            console.log('   ❌ cordova.plugins.firebase NOT FOUND');
        }
    } else {
        console.log('   ❌ cordova.plugins NOT FOUND');
    }
} else {
    console.log('   ❌ Cordova NOT available');
    console.log('   Are you running in device/emulator?');
}

// 6. Check FirebasePlugin (legacy)
console.log('\n6. LEGACY FIREBASEPLUGIN CHECK:');
console.log('   typeof FirebasePlugin:', typeof FirebasePlugin);
if (typeof FirebasePlugin !== 'undefined') {
    console.log('   ✅ FirebasePlugin (legacy) available');
} else {
    console.log('   ❌ FirebasePlugin (legacy) NOT available');
}

// 7. Device ready check
console.log('\n7. DEVICE READY CHECK:');
console.log('   window.cordova_ready:', window.cordova_ready);
console.log('   document.readyState:', document.readyState);

// 8. Installed plugins check
console.log('\n8. TRY TO LIST INSTALLED PLUGINS:');
if (typeof cordova !== 'undefined' && cordova.require) {
    try {
        var plugins = cordova.require("cordova/plugin_list");
        console.log('   Installed plugins:', plugins.metadata);
    } catch (e) {
        console.log('   Cannot get plugin list:', e.message);
    }
}

console.log('\n========================================');
console.log('END OF DEEP DEBUG');
console.log('========================================');