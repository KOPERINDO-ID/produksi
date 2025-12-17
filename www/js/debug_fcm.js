var FCMDebug = {
    // Configuration
    enabled: true,
    showUIErrors: true,
    logToConsole: true,

    // Error storage
    errors: [],
    warnings: [],

    // Initialize
    init: function () {
        var self = this;

        if (!this.enabled) return;

        this.log('='.repeat(50));
        this.log('FCM DEBUG MODE INITIALIZED');
        this.log('='.repeat(50));

        // Create error display container
        this.createErrorContainer();

        // Run initial checks
        setTimeout(function () {
            self.checkAll();
        }, 1000);
    },

    // Create error display container in DOM
    createErrorContainer: function () {
        if ($('#fcm-debug-container').length) return;

        var html = `
            <div id="fcm-debug-container" style="display:none;">
                <div id="fcm-debug-overlay"></div>
                <div id="fcm-debug-modal">
                    <div class="fcm-debug-header">
                        <span class="fcm-debug-icon">⚠️</span>
                        <h3>Firebase Notification Debug</h3>
                        <button id="fcm-debug-close">&times;</button>
                    </div>
                    <div class="fcm-debug-body" id="fcm-debug-content">
                    </div>
                    <div class="fcm-debug-footer">
                        <button id="fcm-debug-retry" class="fcm-btn-primary">Retry Connection</button>
                        <button id="fcm-debug-copy" class="fcm-btn-secondary">Copy Log</button>
                    </div>
                </div>
            </div>
            
            <!-- Toast untuk error singkat -->
            <div id="fcm-error-toast" style="display:none;">
                <div class="fcm-toast-icon">❌</div>
                <div class="fcm-toast-content">
                    <strong id="fcm-toast-title">Error</strong>
                    <p id="fcm-toast-message">Message</p>
                </div>
                <button class="fcm-toast-close">&times;</button>
            </div>
            
            <!-- Floating debug button -->
            <div id="fcm-debug-fab" title="FCM Debug">
                🔔
                <span id="fcm-debug-badge" style="display:none;">0</span>
            </div>
        `;

        $('body').append(html);
        this.addStyles();
        this.bindDebugEvents();
    },

    // Add CSS styles
    addStyles: function () {
        if ($('#fcm-debug-styles').length) return;

        var css = `
            /* Debug Container */
            #fcm-debug-container {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 99999;
            }
            
            #fcm-debug-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
            }
            
            #fcm-debug-modal {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .fcm-debug-header {
                display: flex;
                align-items: center;
                padding: 15px 20px;
                background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
                color: #fff;
            }
            
            .fcm-debug-header.warning {
                background: linear-gradient(135deg, #ffa726, #fb8c00);
            }
            
            .fcm-debug-header.success {
                background: linear-gradient(135deg, #66bb6a, #43a047);
            }
            
            .fcm-debug-icon {
                font-size: 24px;
                margin-right: 10px;
            }
            
            .fcm-debug-header h3 {
                flex: 1;
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            #fcm-debug-close {
                background: none;
                border: none;
                color: #fff;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
            .fcm-debug-body {
                flex: 1;
                overflow-y: auto;
                padding: 15px 20px;
                font-size: 14px;
            }
            
            .fcm-debug-section {
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
            
            .fcm-debug-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .fcm-debug-section h4 {
                margin: 0 0 10px 0;
                font-size: 13px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .fcm-debug-item {
                display: flex;
                align-items: flex-start;
                margin-bottom: 8px;
                padding: 8px 10px;
                background: #f8f9fa;
                border-radius: 6px;
            }
            
            .fcm-debug-item.error {
                background: #ffebee;
                border-left: 3px solid #f44336;
            }
            
            .fcm-debug-item.warning {
                background: #fff3e0;
                border-left: 3px solid #ff9800;
            }
            
            .fcm-debug-item.success {
                background: #e8f5e9;
                border-left: 3px solid #4caf50;
            }
            
            .fcm-debug-item.info {
                background: #e3f2fd;
                border-left: 3px solid #2196f3;
            }
            
            .fcm-item-icon {
                margin-right: 10px;
                font-size: 16px;
            }
            
            .fcm-item-content {
                flex: 1;
            }
            
            .fcm-item-title {
                font-weight: 600;
                color: #333;
                margin-bottom: 2px;
            }
            
            .fcm-item-detail {
                font-size: 12px;
                color: #666;
                word-break: break-all;
            }
            
            .fcm-debug-footer {
                padding: 15px 20px;
                background: #f8f9fa;
                display: flex;
                gap: 10px;
            }
            
            .fcm-btn-primary {
                flex: 1;
                padding: 10px 15px;
                background: #007aff;
                color: #fff;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
            }
            
            .fcm-btn-primary:active {
                background: #0056b3;
            }
            
            .fcm-btn-secondary {
                flex: 1;
                padding: 10px 15px;
                background: #fff;
                color: #333;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
            }
            
            /* Error Toast */
            #fcm-error-toast {
                position: fixed;
                top: 20px;
                left: 20px;
                right: 20px;
                background: #333;
                color: #fff;
                padding: 15px;
                border-radius: 10px;
                display: flex;
                align-items: flex-start;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 99998;
                animation: slideDown 0.3s ease;
            }
            
            @keyframes slideDown {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            #fcm-error-toast.error {
                background: linear-gradient(135deg, #d32f2f, #c62828);
            }
            
            #fcm-error-toast.warning {
                background: linear-gradient(135deg, #f57c00, #ef6c00);
            }
            
            .fcm-toast-icon {
                font-size: 24px;
                margin-right: 12px;
            }
            
            .fcm-toast-content {
                flex: 1;
            }
            
            .fcm-toast-content strong {
                display: block;
                margin-bottom: 3px;
            }
            
            .fcm-toast-content p {
                margin: 0;
                font-size: 13px;
                opacity: 0.9;
            }
            
            .fcm-toast-close {
                background: none;
                border: none;
                color: #fff;
                font-size: 20px;
                cursor: pointer;
                opacity: 0.7;
            }
            
            /* Floating Action Button */
            #fcm-debug-fab {
                position: fixed;
                bottom: 80px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: #333;
                color: #fff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                cursor: pointer;
                z-index: 9999;
                transition: transform 0.2s;
            }
            
            #fcm-debug-fab:active {
                transform: scale(0.95);
            }
            
            #fcm-debug-fab.has-error {
                background: #f44336;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
                70% { box-shadow: 0 0 0 15px rgba(244, 67, 54, 0); }
                100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
            }
            
            #fcm-debug-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff3b30;
                color: #fff;
                font-size: 11px;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
            }
            
            /* Code block */
            .fcm-code {
                background: #263238;
                color: #aed581;
                padding: 10px;
                border-radius: 6px;
                font-family: monospace;
                font-size: 11px;
                overflow-x: auto;
                margin-top: 5px;
            }
        `;

        $('head').append('<style id="fcm-debug-styles">' + css + '</style>');
    },

    // Bind debug UI events
    bindDebugEvents: function () {
        var self = this;

        // Close modal
        $(document).on('click', '#fcm-debug-close, #fcm-debug-overlay', function () {
            self.hideModal();
        });

        // Retry button
        $(document).on('click', '#fcm-debug-retry', function () {
            self.hideModal();
            self.retryFirebaseConnection();
        });

        // Copy log button
        $(document).on('click', '#fcm-debug-copy', function () {
            self.copyDebugLog();
        });

        // FAB click
        $(document).on('click', '#fcm-debug-fab', function () {
            self.showDebugModal();
        });

        // Toast close
        $(document).on('click', '.fcm-toast-close', function () {
            $('#fcm-error-toast').fadeOut(300);
        });
    },

    // Check all Firebase requirements
    checkAll: function () {
        this.errors = [];
        this.warnings = [];

        this.log('Running Firebase checks...');

        // Check 1: Cordova
        if (typeof cordova === 'undefined') {
            this.addError('Cordova Not Available', 'Cordova framework tidak tersedia. Pastikan aplikasi berjalan di device/emulator.');
        } else {
            this.log('✓ Cordova available');
        }

        // Check 2: Firebase Plugin
        if (!this.isFirebaseAvailable()) {
            this.addError('Firebase Plugin Not Installed',
                'Plugin cordova-plugin-firebase-messaging tidak ditemukan.',
                'Jalankan: cordova plugin add cordova-plugin-firebase-messaging');
        } else {
            this.log('✓ Firebase plugin available');
        }

        // Check 3: Get Token
        this.checkFirebaseToken();

        // Check 4: Permission
        this.checkPermission();

        // Check 5: Network
        this.checkNetwork();

        // Update UI
        this.updateDebugBadge();
    },

    // Check if Firebase plugin is available
    isFirebaseAvailable: function () {
        return typeof cordova !== 'undefined' &&
            cordova.plugins &&
            cordova.plugins.firebase &&
            cordova.plugins.firebase.messaging;
    },

    // Check Firebase token
    checkFirebaseToken: function () {
        var self = this;

        if (!this.isFirebaseAvailable()) return;

        cordova.plugins.firebase.messaging.getToken()
            .then(function (token) {
                if (token) {
                    self.log('✓ FCM Token retrieved successfully');
                    self.log('Token preview: ' + token.substring(0, 40) + '...');
                } else {
                    self.addError('FCM Token Empty',
                        'Token berhasil di-retrieve tapi kosong.',
                        'Coba restart aplikasi atau clear data.');
                }
            })
            .catch(function (error) {
                var errorMsg = error.message || error.toString() || 'Unknown error';

                // Handle specific errors
                if (errorMsg.includes('Failed to retrieve Firebase Instance Id') ||
                    errorMsg.includes('MISSING_INSTANCEID_SERVICE')) {
                    self.addError('Firebase Instance ID Error',
                        'Gagal mengambil Firebase Instance ID. Error: ' + errorMsg,
                        self.getInstanceIdSolution());
                } else if (errorMsg.includes('AUTHENTICATION_FAILED')) {
                    self.addError('Firebase Authentication Failed',
                        'Autentikasi Firebase gagal. google-services.json mungkin tidak valid.',
                        'Pastikan google-services.json sesuai dengan package name aplikasi.');
                } else if (errorMsg.includes('SERVICE_NOT_AVAILABLE')) {
                    self.addError('Google Play Services Error',
                        'Google Play Services tidak tersedia atau outdated.',
                        'Update Google Play Services di device.');
                } else {
                    self.addError('FCM Token Error',
                        'Gagal mengambil FCM token: ' + errorMsg,
                        'Periksa koneksi internet dan konfigurasi Firebase.');
                }

                self.updateDebugBadge();

                // Show toast for immediate feedback
                self.showErrorToast('Firebase Error', errorMsg);
            });
    },

    // Get solution for Instance ID error
    getInstanceIdSolution: function () {
        return `Solusi untuk "Failed to retrieve Firebase Instance Id":

1. Pastikan google-services.json valid dan sesuai package name
2. Pastikan Google Play Services terinstall dan updated
3. Cek koneksi internet
4. Coba langkah berikut:
   - Uninstall aplikasi
   - Clear Google Play Services cache
   - Restart device
   - Install ulang aplikasi

5. Jika menggunakan emulator:
   - Gunakan emulator dengan Google APIs
   - Pastikan Google Play Services tersedia`;
    },

    // Check notification permission
    checkPermission: function () {
        var self = this;

        if (!this.isFirebaseAvailable()) return;

        cordova.plugins.firebase.messaging.requestPermission()
            .then(function () {
                self.log('✓ Notification permission granted');
            })
            .catch(function (error) {
                self.addWarning('Permission Denied',
                    'Izin notifikasi ditolak oleh user.',
                    'Aktifkan izin notifikasi di Settings > Apps > [App Name] > Notifications');
            });
    },

    // Check network connectivity
    checkNetwork: function () {
        var self = this;

        if (navigator.connection) {
            var networkState = navigator.connection.type;
            if (networkState === Connection.NONE) {
                this.addWarning('No Internet Connection',
                    'Device tidak terhubung ke internet.',
                    'FCM membutuhkan koneksi internet untuk menerima notifikasi.');
            } else {
                this.log('✓ Network connected: ' + networkState);
            }
        }

        // Test API connectivity
        if (typeof NotificationManager !== 'undefined') {
            $.ajax({
                url: NotificationManager.config.apiUrl + '/fcm/status/258',
                type: 'GET',
                timeout: 10000,
                success: function () {
                    self.log('✓ API server reachable');
                },
                error: function (xhr, status, error) {
                    if (status === 'timeout') {
                        self.addWarning('API Timeout',
                            'Server tidak merespons dalam waktu yang ditentukan.',
                            'Periksa koneksi internet atau server mungkin down.');
                    } else if (xhr.status === 0) {
                        self.addWarning('API Unreachable',
                            'Tidak dapat terhubung ke server API.',
                            'Periksa URL API dan koneksi internet.');
                    }
                }
            });
        }
    },

    // Add error to list
    addError: function (title, message, solution) {
        this.errors.push({
            type: 'error',
            title: title,
            message: message,
            solution: solution || null,
            timestamp: new Date().toISOString()
        });

        this.logError(title + ': ' + message);
        this.updateDebugBadge();
    },

    // Add warning to list
    addWarning: function (title, message, solution) {
        this.warnings.push({
            type: 'warning',
            title: title,
            message: message,
            solution: solution || null,
            timestamp: new Date().toISOString()
        });

        this.logWarning(title + ': ' + message);
        this.updateDebugBadge();
    },

    // Update debug badge count
    updateDebugBadge: function () {
        var totalIssues = this.errors.length + this.warnings.length;
        var badge = $('#fcm-debug-badge');
        var fab = $('#fcm-debug-fab');

        if (totalIssues > 0) {
            badge.text(totalIssues).show();
            if (this.errors.length > 0) {
                fab.addClass('has-error');
            }
        } else {
            badge.hide();
            fab.removeClass('has-error');
        }
    },

    // Show error toast
    showErrorToast: function (title, message, type) {
        type = type || 'error';

        $('#fcm-toast-title').text(title);
        $('#fcm-toast-message').text(message);
        $('#fcm-error-toast')
            .removeClass('error warning')
            .addClass(type)
            .fadeIn(300);

        // Auto hide after 5 seconds
        setTimeout(function () {
            $('#fcm-error-toast').fadeOut(300);
        }, 5000);
    },

    // Show debug modal
    showDebugModal: function () {
        var self = this;
        var content = '';

        // Errors section
        if (this.errors.length > 0) {
            content += '<div class="fcm-debug-section">';
            content += '<h4>❌ Errors (' + this.errors.length + ')</h4>';
            this.errors.forEach(function (err) {
                content += self.renderDebugItem(err);
            });
            content += '</div>';
        }

        // Warnings section
        if (this.warnings.length > 0) {
            content += '<div class="fcm-debug-section">';
            content += '<h4>⚠️ Warnings (' + this.warnings.length + ')</h4>';
            this.warnings.forEach(function (warn) {
                content += self.renderDebugItem(warn);
            });
            content += '</div>';
        }

        // Status section
        content += '<div class="fcm-debug-section">';
        content += '<h4>📊 Status</h4>';
        content += this.renderStatusItems();
        content += '</div>';

        // No issues
        if (this.errors.length === 0 && this.warnings.length === 0) {
            content = '<div class="fcm-debug-section">';
            content += '<div class="fcm-debug-item success">';
            content += '<span class="fcm-item-icon">✅</span>';
            content += '<div class="fcm-item-content">';
            content += '<div class="fcm-item-title">All Good!</div>';
            content += '<div class="fcm-item-detail">Firebase notification siap digunakan.</div>';
            content += '</div></div></div>';

            // Update header to success
            setTimeout(function () {
                $('.fcm-debug-header').addClass('success');
                $('.fcm-debug-icon').text('✅');
            }, 100);
        } else {
            // Update header based on severity
            setTimeout(function () {
                if (self.errors.length > 0) {
                    $('.fcm-debug-header').removeClass('warning success');
                    $('.fcm-debug-icon').text('❌');
                } else {
                    $('.fcm-debug-header').addClass('warning').removeClass('success');
                    $('.fcm-debug-icon').text('⚠️');
                }
            }, 100);
        }

        $('#fcm-debug-content').html(content);
        $('#fcm-debug-container').fadeIn(200);
    },

    // Render single debug item
    renderDebugItem: function (item) {
        var html = '<div class="fcm-debug-item ' + item.type + '">';
        html += '<span class="fcm-item-icon">' + (item.type === 'error' ? '❌' : '⚠️') + '</span>';
        html += '<div class="fcm-item-content">';
        html += '<div class="fcm-item-title">' + this.escapeHtml(item.title) + '</div>';
        html += '<div class="fcm-item-detail">' + this.escapeHtml(item.message) + '</div>';
        if (item.solution) {
            html += '<div class="fcm-code">' + this.escapeHtml(item.solution) + '</div>';
        }
        html += '</div></div>';
        return html;
    },

    // Render status items
    renderStatusItems: function () {
        var html = '';
        var items = [
            {
                title: 'FCM Token',
                value: localStorage.getItem('fcm_token') ? 'Tersimpan' : 'Belum ada',
                status: localStorage.getItem('fcm_token') ? 'success' : 'warning'
            },
            {
                title: 'Token Registered',
                value: localStorage.getItem('token_registered') || 'Belum',
                status: localStorage.getItem('token_registered') === 'true' ? 'success' : 'warning'
            },
            {
                title: 'User ID',
                value: localStorage.getItem('user_id') || 'Tidak ada',
                status: localStorage.getItem('user_id') ? 'success' : 'info'
            },
            {
                title: 'Firebase Plugin',
                value: this.isFirebaseAvailable() ? 'Tersedia' : 'Tidak ada',
                status: this.isFirebaseAvailable() ? 'success' : 'error'
            }
        ];

        items.forEach(function (item) {
            html += '<div class="fcm-debug-item ' + item.status + '">';
            html += '<span class="fcm-item-icon">' + (item.status === 'success' ? '✓' : item.status === 'error' ? '✗' : 'ℹ') + '</span>';
            html += '<div class="fcm-item-content">';
            html += '<div class="fcm-item-title">' + item.title + '</div>';
            html += '<div class="fcm-item-detail">' + item.value + '</div>';
            html += '</div></div>';
        });

        return html;
    },

    // Hide debug modal
    hideModal: function () {
        $('#fcm-debug-container').fadeOut(200);
    },

    // Retry Firebase connection
    retryFirebaseConnection: function () {
        var self = this;

        this.showErrorToast('Retrying...', 'Mencoba koneksi ulang ke Firebase', 'warning');

        // Clear errors
        this.errors = [];
        this.warnings = [];

        // Re-check everything
        setTimeout(function () {
            self.checkAll();

            // Try to get token again
            if (self.isFirebaseAvailable()) {
                cordova.plugins.firebase.messaging.getToken()
                    .then(function (token) {
                        if (token) {
                            self.showErrorToast('Success!', 'FCM Token berhasil didapat', 'success');

                            // Re-register to server
                            if (typeof NotificationManager !== 'undefined' && NotificationManager.userId) {
                                NotificationManager.registerTokenToServer(token);
                            }
                        }
                    })
                    .catch(function (error) {
                        // Error already handled in checkFirebaseToken
                    });
            }
        }, 500);
    },

    // Copy debug log to clipboard
    copyDebugLog: function () {
        var self = this;
        var log = 'FCM Debug Log - ' + new Date().toISOString() + '\n';
        log += '='.repeat(50) + '\n\n';

        log += 'DEVICE INFO:\n';
        if (typeof device !== 'undefined') {
            log += '- Platform: ' + device.platform + '\n';
            log += '- Version: ' + device.version + '\n';
            log += '- Model: ' + device.model + '\n';
        }
        log += '\n';

        log += 'STATUS:\n';
        log += '- FCM Token: ' + (localStorage.getItem('fcm_token') ? 'Yes' : 'No') + '\n';
        log += '- Token Registered: ' + (localStorage.getItem('token_registered') || 'No') + '\n';
        log += '- User ID: ' + (localStorage.getItem('user_id') || 'None') + '\n';
        log += '- Firebase Plugin: ' + (this.isFirebaseAvailable() ? 'Available' : 'Not Available') + '\n';
        log += '\n';

        if (this.errors.length > 0) {
            log += 'ERRORS:\n';
            this.errors.forEach(function (err, i) {
                log += (i + 1) + '. ' + err.title + '\n';
                log += '   ' + err.message + '\n';
                if (err.solution) {
                    log += '   Solution: ' + err.solution.substring(0, 100) + '...\n';
                }
            });
            log += '\n';
        }

        if (this.warnings.length > 0) {
            log += 'WARNINGS:\n';
            this.warnings.forEach(function (warn, i) {
                log += (i + 1) + '. ' + warn.title + '\n';
                log += '   ' + warn.message + '\n';
            });
        }

        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(log).then(function () {
                self.showErrorToast('Copied!', 'Debug log copied to clipboard', 'success');
            });
        } else {
            // Fallback
            var textarea = document.createElement('textarea');
            textarea.value = log;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showErrorToast('Copied!', 'Debug log copied to clipboard', 'success');
        }
    },

    // Escape HTML
    escapeHtml: function (text) {
        if (!text) return '';
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
    },

    // Logging helpers
    log: function (msg) {
        if (this.logToConsole) {
            console.log('[FCM Debug] ' + msg);
        }
    },

    logError: function (msg) {
        console.error('[FCM Debug] ERROR: ' + msg);
    },

    logWarning: function (msg) {
        console.warn('[FCM Debug] WARNING: ' + msg);
    },

    // Manual diagnostic
    runDiagnostic: function () {
        this.log('Running manual diagnostic...');
        this.checkAll();
        this.showDebugModal();
    }
};

// Auto-initialize when device is ready
document.addEventListener('deviceready', function () {
    FCMDebug.init();
}, false);

// Expose globally
window.FCMDebug = FCMDebug;