var NotificationManager = {
    // State
    notifications: [],
    unreadCount: 0,
    fcmToken: null,
    userId: null,
    isInitialized: false,
    retryCount: 0,
    maxRetries: 3,
    audioContext: null,
    audioBuffer: null,
    audioEnabled: true,

    // Configuration - SESUAIKAN DENGAN SERVER ANDA
    config: {
        apiUrl: (typeof BASE_API !== 'undefined') ? BASE_API : 'https://tasindo-sale-webservice.digiseminar.id/api',
        maxNotifications: 50,
        toastDuration: 4000,
        retryDelay: 30000,
        debugMode: true
    },

    /**
     * Initialize Notification Manager
     * @param {string|number} userId - User ID untuk registrasi token
     */
    init: function (userId, forceRefresh) {
        forceRefresh = forceRefresh || false;

        if (this.isInitialized && this.userId === userId && !forceRefresh) {
            this.log('Already initialized for user: ' + userId);

            var existingToken = localStorage.getItem('fcm_token');
            if (existingToken) {
                this.registerTokenToServer(existingToken);
            }
            return;
        }

        if (this.userId !== userId || forceRefresh) {
            this.log('Resetting state for new initialization');
            this.isInitialized = false;
            this.fcmToken = null;
            this.retryCount = 0;
        }

        this.log('Initializing Notification Manager for user: ' + userId);
        this.userId = userId;

        if (typeof BASE_API !== 'undefined') {
            this.config.apiUrl = BASE_API;
            this.log('API URL updated to: ' + BASE_API);
        }

        this.loadNotifications();

        this.bindEvents();

        this.initFirebaseMessaging();

        this.initAudio();

        this.isInitialized = true;
    },

    /**
     * Cleanup - call this on logout
     */
    cleanup: function (callback) {
        var self = this;

        this.log('Cleaning up Notification Manager');

        // Unregister token from server
        this.unregisterToken(function () {
            // Reset state
            self.userId = null;
            self.fcmToken = null;
            self.isInitialized = false;
            self.retryCount = 0;

            // Clear local notifications (optional)
            // self.notifications = [];
            // self.saveNotifications();

            if (callback) callback();
        });
    },

    /**
     * Initialize Firebase Cloud Messaging
     */
    initFirebaseMessaging: function () {
        var self = this;

        // Check if plugin is available
        if (!this.isFirebaseAvailable()) {
            this.logError('Firebase Messaging plugin not available');
            this.logError('Make sure cordova-plugin-firebase-messaging is installed');
            return;
        }

        this.log('Initializing Firebase Messaging...');

        // Request permission (required for iOS, good practice for Android)
        cordova.plugins.firebase.messaging.requestPermission({
            forceShow: true // Show notification even when app is in foreground
        }).then(function () {
            self.log('Notification permission granted');
            self.getFirebaseToken();
        }).catch(function (error) {
            self.logError('Notification permission denied: ' + JSON.stringify(error));
        });

        // Listen for token refresh
        cordova.plugins.firebase.messaging.onTokenRefresh(function (token) {
            self.log('FCM Token refreshed');
            self.handleNewToken(token);
        }, function (error) {
            self.logError('Error on token refresh: ' + JSON.stringify(error));
        });

        // Listen for foreground messages
        cordova.plugins.firebase.messaging.onMessage(function (payload) {
            self.log('Foreground message received: ' + JSON.stringify(payload));
            self.handleFirebaseMessage(payload, false);
        }, function (error) {
            self.logError('Error receiving foreground message: ' + JSON.stringify(error));
        });

        // Listen for background message taps
        cordova.plugins.firebase.messaging.onBackgroundMessage(function (payload) {
            self.log('Background message tapped: ' + JSON.stringify(payload));
            self.handleFirebaseMessage(payload, true);
        }, function (error) {
            self.logError('Error receiving background message: ' + JSON.stringify(error));
        });
    },

    /**
     * Check if Firebase plugin is available
     */
    isFirebaseAvailable: function () {
        return typeof cordova !== 'undefined' &&
            cordova.plugins &&
            cordova.plugins.firebase &&
            cordova.plugins.firebase.messaging;
    },

    /**
     * Get Firebase Token
     */
    getFirebaseToken: function () {
        var self = this;

        if (!this.isFirebaseAvailable()) {
            this.logError('Firebase not available');
            return;
        }

        cordova.plugins.firebase.messaging.getToken().then(function (token) {
            self.log('FCM Token received: ' + token.substring(0, 30) + '...');
            self.handleNewToken(token);
        }).catch(function (error) {
            self.logError('Error getting FCM token: ' + JSON.stringify(error));

            // Retry after delay
            if (self.retryCount < self.maxRetries) {
                self.retryCount++;
                self.log('Retrying getToken in ' + (self.config.retryDelay / 1000) + ' seconds...');
                setTimeout(function () {
                    self.getFirebaseToken();
                }, self.config.retryDelay);
            }
        });
    },

    /**
     * Handle new FCM token
     */
    handleNewToken: function (token) {
        if (!token) {
            this.logError('Received empty token');
            return;
        }

        this.fcmToken = token;
        localStorage.setItem('fcm_token', token);

        // Register to server if user is logged in
        if (this.userId) {
            this.registerTokenToServer(token);
        }
    },

    /**
     * Register FCM Token to Server
     */
    registerTokenToServer: function (token) {
        var self = this;

        if (!this.userId) {
            this.logError('Cannot register token: No user ID');
            return;
        }

        if (!token) {
            this.logError('Cannot register token: No token');
            return;
        }

        this.log('Registering token to server...');

        $.ajax({
            url: this.config.apiUrl + '/fcm/register',
            type: 'POST',
            data: {
                user_id: this.userId,
                fcm_token: token,
            },
            headers: this.getAuthHeaders(),
            timeout: 10000,
            success: function (response) {
                self.log('Token registered successfully: ' + JSON.stringify(response));
                self.retryCount = 0;

                localStorage.setItem('token_registered', 'true');
                localStorage.setItem('token_registered_at', new Date().toISOString());
                localStorage.setItem('token_registered_user', self.userId);
            },
            error: function (xhr, status, error) {
                self.logError('Failed to register token: ' + error);
                self.logError('Response: ' + xhr.responseText);

                if (status === 'timeout' || status === 'error') {
                    if (self.retryCount < self.maxRetries) {
                        self.retryCount++;
                        self.log('Retrying registration in ' + (self.config.retryDelay / 1000) + ' seconds...');
                        setTimeout(function () {
                            self.registerTokenToServer(token);
                        }, self.config.retryDelay);
                    }
                }
            }
        });
    },

    /**
     * Unregister token from server (called on logout)
     */
    unregisterToken: function (callback) {
        var self = this;
        var token = this.fcmToken || localStorage.getItem('fcm_token');

        if (!token || !this.userId) {
            this.log('No token or user to unregister');
            if (callback) callback();
            return;
        }

        this.log('Unregistering token from server...');

        $.ajax({
            url: this.config.apiUrl + '/fcm/unregister',
            type: 'POST',
            data: {
                user_id: this.userId,
                fcm_token: token
            },
            headers: this.getAuthHeaders(),
            timeout: 15000,
            success: function (response) {
                self.log('Token unregistered successfully');
                self.clearLocalTokenData();
                if (callback) callback();
            },
            error: function (xhr, status, error) {
                self.logError('Failed to unregister token: ' + error);
                // Clear local data anyway
                self.clearLocalTokenData();
                if (callback) callback();
            }
        });
    },

    /**
     * Clear local token data
     */
    clearLocalTokenData: function () {
        localStorage.removeItem('fcm_token');
        localStorage.removeItem('token_registered');
        localStorage.removeItem('token_registered_at');
        localStorage.removeItem('token_registered_user');
    },

    /**
     * Force refresh FCM token - panggil setelah login
     */
    forceRefreshToken: function () {
        var self = this;

        if (!this.isFirebaseAvailable()) {
            this.logError('Firebase not available for refresh');
            return;
        }

        this.log('Force refreshing FCM token...');

        cordova.plugins.firebase.messaging.deleteToken().then(function () {
            self.log('Old token deleted, getting new one...');
            return cordova.plugins.firebase.messaging.getToken();
        }).then(function (newToken) {
            self.log('New token received: ' + newToken.substring(0, 30) + '...');
            self.handleNewToken(newToken);
        }).catch(function (error) {
            self.logError('Error refreshing token: ' + JSON.stringify(error));
            self.getFirebaseToken();
        });
    },

    /**
     * Get auth headers for API calls
     */
    getAuthHeaders: function () {
        var token = localStorage.getItem('auth_token');
        if (token) {
            return { 'Authorization': 'Bearer ' + token };
        }
        return {};
    },

    /**
     * Initialize Audio Context (panggil di init setelah initFirebaseMessaging)
     */
    initAudio: function () {
        var self = this;

        try {
            // Buat AudioContext
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                this.log('AudioContext initialized');

                // Preload audio file
                this.preloadSound();
            } else {
                this.log('AudioContext not supported');
            }
        } catch (e) {
            this.logError('Failed to init AudioContext: ' + e.message);
        }
    },

    /**
     * Preload sound file
     */
    preloadSound: function () {
        var self = this;

        if (!this.audioContext) return;

        var request = new XMLHttpRequest();
        request.open('GET', 'audio/test-sound.mp3', true);
        request.responseType = 'arraybuffer';

        request.onload = function () {
            self.audioContext.decodeAudioData(
                request.response,
                function (buffer) {
                    self.audioBuffer = buffer;
                    self.log('Audio preloaded successfully');
                },
                function (error) {
                    self.logError('Error decoding audio: ' + error);
                }
            );
        };

        request.onerror = function () {
            self.logError('Error loading audio file');
        };

        request.send();
    },

    /**
     * Play Notification Sound - VERSI DIPERBAIKI
     */
    playNotificationSound: function () {
        var self = this;

        if (!this.audioEnabled) {
            this.log('Audio disabled');
            return;
        }

        this.log('Attempting to play notification sound...');

        if (this.audioContext && this.audioBuffer) {
            try {
                // Resume AudioContext jika suspended (karena autoplay policy)
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }

                var source = this.audioContext.createBufferSource();
                source.buffer = this.audioBuffer;

                // Add gain node untuk volume control
                var gainNode = this.audioContext.createGain();
                gainNode.gain.value = 0.7;

                source.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                source.start(0);
                this.log('Sound played via Web Audio API');
                return;
            } catch (e) {
                this.logError('Web Audio API failed: ' + e.message);
            }
        }
    },

    /**
     * Vibrate device as fallback
     */
    vibrateDevice: function () {
        try {
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
                this.log('Device vibrated as fallback');
            }
        } catch (e) {
            this.logError('Vibration failed: ' + e.message);
        }
    },

    /**
     * Enable/Disable audio
     */
    setAudioEnabled: function (enabled) {
        this.audioEnabled = enabled;
        this.log('Audio ' + (enabled ? 'enabled' : 'disabled'));
    },

    /**
     * Test sound (untuk debugging)
     */
    testSound: function () {
        this.log('Testing notification sound...');
        this.playNotificationSound();
    },


    /**
     * Handle Firebase message
     */
    handleFirebaseMessage: function (payload, wasTapped) {
        this.log('Handling message, wasTapped: ' + wasTapped);

        // Extract notification data
        var title = payload.title ||
            (payload.notification && payload.notification.title) ||
            'Notifikasi';
        var body = payload.body ||
            (payload.notification && payload.notification.body) ||
            '';
        var data = payload.data || {};

        // Parse data jika string
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = {};
            }
        }

        // Add notification to list
        var notification = this.addNotification(title, body, data);

        // TAMBAHAN: Play sound untuk foreground notification
        if (!wasTapped) {
            this.playNotificationSound();
        }

        // If user tapped notification (from background)
        if (wasTapped) {
            // Mark as read and handle action
            var self = this;
            setTimeout(function () {
                self.markAsRead(notification.id);
                self.handleNotificationClick(notification);
            }, 300);
        }
    },

    /**
     * Add notification to list
     */
    addNotification: function (title, body, data) {
        var notification = {
            id: Date.now(),
            title: title,
            body: body,
            data: data,
            timestamp: new Date().toISOString(),
            isRead: false
        };

        // Add to beginning of array
        this.notifications.unshift(notification);

        // Limit notifications
        if (this.notifications.length > this.config.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.config.maxNotifications);
        }

        this.saveNotifications();
        this.updateUnreadCount();
        this.renderNotifications();

        // Show toast
        this.showToast(title, body);

        // Vibrate
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }

        return notification;
    },

    /**
     * Load notifications from localStorage
     */
    loadNotifications: function () {
        try {
            var stored = localStorage.getItem('notifications_' + this.userId);
            if (stored) {
                this.notifications = JSON.parse(stored);
            }
        } catch (e) {
            this.logError('Error loading notifications: ' + e.message);
            this.notifications = [];
        }
        this.updateUnreadCount();
        this.renderNotifications();
    },

    /**
     * Save notifications to localStorage
     */
    saveNotifications: function () {
        try {
            localStorage.setItem('notifications_' + this.userId, JSON.stringify(this.notifications));
        } catch (e) {
            this.logError('Error saving notifications: ' + e.message);
        }
    },

    /**
     * Update unread count
     */
    updateUnreadCount: function () {
        this.unreadCount = this.notifications.filter(function (n) {
            return !n.isRead;
        }).length;

        var badge = $('#notifBadge');
        if (badge.length) {
            badge.text(this.unreadCount);
            if (this.unreadCount > 0) {
                badge.removeClass('hidden').show();
            } else {
                badge.addClass('hidden').hide();
            }
        }

        // Update app badge
        this.setBadgeNumber(this.unreadCount);
    },

    /**
     * Set app badge number
     */
    setBadgeNumber: function (number) {
        if (this.isFirebaseAvailable()) {
            cordova.plugins.firebase.messaging.setBadge(number).then(function () {
                // Success
            }).catch(function (error) {
                // Ignore badge errors
            });
        }
    },

    /**
     * Render notifications in UI
     */
    renderNotifications: function () {
        var list = $('#notifList');
        if (!list.length) return;

        list.empty();

        if (this.notifications.length === 0) {
            list.append(
                '<li class="empty-notification">' +
                '   <p>Belum ada notifikasi</p>' +
                '</li>'
            );
            return;
        }

        var self = this;
        $.each(this.notifications, function (index, notif) {
            var itemClass = 'notification-item';
            if (!notif.isRead) {
                itemClass += ' unread';
            }

            var timeAgo = self.getTimeAgo(notif.timestamp);

            var itemHtml =
                '<li class="' + itemClass + '" data-id="' + notif.id + '">' +
                '   <div class="notif-title">' + self.escapeHtml(notif.title) + '</div>' +
                '   <div class="notif-body">' + self.escapeHtml(notif.body) + '</div>' +
                '   <div class="notif-time">' + timeAgo + '</div>' +
                '</li>';

            var item = $(itemHtml);

            item.on('click', function () {
                self.markAsRead(notif.id);
                self.handleNotificationClick(notif);
            });

            list.append(item);
        });
    },

    /**
     * Mark notification as read
     */
    markAsRead: function (notifId) {
        var notification = this.notifications.find(function (n) {
            return n.id === notifId;
        });

        if (notification && !notification.isRead) {
            notification.isRead = true;
            this.saveNotifications();
            this.updateUnreadCount();
            this.renderNotifications();
        }
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: function () {
        var hasUnread = false;
        this.notifications.forEach(function (n) {
            if (!n.isRead) {
                n.isRead = true;
                hasUnread = true;
            }
        });

        if (hasUnread) {
            this.saveNotifications();
            this.updateUnreadCount();
            this.renderNotifications();
        }
    },

    /**
     * Handle notification click - customize based on your app's navigation
     */
    handleNotificationClick: function (notification) {
        this.log('Notification clicked: ' + JSON.stringify(notification.data));

        this.closePanel();

        if (!notification.data || !notification.data.type) {
            return;
        }

        var type = notification.data.type;
        var invoiceId = notification.data.invoice_id;

        // Gunakan Framework7 router, bukan window.location.href
        switch (type) {
            case 'new_order':
            case 'new_order_multiple':
            case 'production_order':
                // Refresh data produksi
                if (typeof getDataProduksi === 'function') {
                    getDataProduksi();
                }
                if (typeof getDataProduksiCabangPusatSpk === 'function') {
                    getDataProduksiCabangPusatSpk();
                }
                // Tampilkan toast info
                this.showToast('Order Baru', 'Data produksi telah diperbarui');
                break;

            case 'payment':
                // Handle payment notification
                if (invoiceId && typeof app !== 'undefined') {
                    // Jika ada halaman detail pembayaran
                    // app.views.main.router.navigate('/payment-detail/' + invoiceId);
                    this.showToast('Pembayaran', 'Ada update pembayaran untuk ' + invoiceId);
                }
                break;

            case 'test':
            case 'diagnostic_test':
                this.showToast('Test', 'Notifikasi test berhasil diterima!');
                break;

            default:
                this.log('Unknown notification type: ' + type);
                // Refresh data sebagai fallback
                if (typeof getDataProduksi === 'function') {
                    getDataProduksi();
                }
        }
    },

    /**
     * Show toast notification
     */
    showToast: function (title, body) {
        var toast = $('#toastNotif');
        if (!toast.length) return;

        $('#toastTitle').text(title);
        $('#toastBody').text(body);

        toast.fadeIn(300);

        setTimeout(function () {
            toast.fadeOut(300);
        }, this.config.toastDuration);
    },

    /**
     * Bind UI event handlers
     */
    bindEvents: function () {
        var self = this;

        // Toggle notification panel
        $(document).off('click', '#notifIcon').on('click', '#notifIcon', function (e) {
            e.stopPropagation();
            self.togglePanel();
        });

        // Close panel button
        $(document).off('click', '#closePanel').on('click', '#closePanel', function () {
            self.closePanel();
        });

        // Close panel on outside click
        $(document).off('click.notifPanel').on('click.notifPanel', function (e) {
            if (!$(e.target).closest('#notifIcon, #notifPanel').length) {
                self.closePanel();
            }
        });

        // Close toast on click
        $(document).off('click', '#toastNotif').on('click', '#toastNotif', function () {
            $(this).fadeOut(300);
        });

        // Mark all as read button
        $(document).off('click', '#markAllRead').on('click', '#markAllRead', function () {
            self.markAllAsRead();
        });

        // Clear all button
        $(document).off('click', '#clearAllNotif').on('click', '#clearAllNotif', function () {
            self.clearAll();
        });
    },

    /**
     * Toggle notification panel
     */
    togglePanel: function () {
        var panel = $('#notifPanel');
        if (panel.is(':visible')) {
            this.closePanel();
        } else {
            panel.fadeIn(200);
        }
    },

    /**
     * Close notification panel
     */
    closePanel: function () {
        $('#notifPanel').fadeOut(200);
    },

    /**
     * Clear all notifications
     */
    clearAll: function () {
        if (confirm('Hapus semua notifikasi?')) {
            this.notifications = [];
            this.saveNotifications();
            this.updateUnreadCount();
            this.renderNotifications();
        }
    },

    /**
     * Subscribe to FCM topic
     */
    subscribeToTopic: function (topic) {
        var self = this;
        if (!this.isFirebaseAvailable()) return;

        cordova.plugins.firebase.messaging.subscribe(topic).then(function () {
            self.log('Subscribed to topic: ' + topic);
        }).catch(function (error) {
            self.logError('Error subscribing to topic: ' + JSON.stringify(error));
        });
    },

    /**
     * Unsubscribe from FCM topic
     */
    unsubscribeFromTopic: function (topic) {
        var self = this;
        if (!this.isFirebaseAvailable()) return;

        cordova.plugins.firebase.messaging.unsubscribe(topic).then(function () {
            self.log('Unsubscribed from topic: ' + topic);
        }).catch(function (error) {
            self.logError('Error unsubscribing from topic: ' + JSON.stringify(error));
        });
    },

    // ==================== Helper Functions ====================

    /**
     * Get relative time string
     */
    getTimeAgo: function (timestamp) {
        var now = new Date();
        var time = new Date(timestamp);
        var diff = Math.floor((now - time) / 1000);

        if (diff < 60) {
            return 'Baru saja';
        } else if (diff < 3600) {
            var minutes = Math.floor(diff / 60);
            return minutes + ' menit yang lalu';
        } else if (diff < 86400) {
            var hours = Math.floor(diff / 3600);
            return hours + ' jam yang lalu';
        } else if (diff < 604800) {
            var days = Math.floor(diff / 86400);
            return days + ' hari yang lalu';
        } else {
            return time.toLocaleDateString('id-ID');
        }
    },

    /**
     * Escape HTML for security
     */
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

    /**
     * Log helper
     */
    log: function (message) {
        if (this.config.debugMode) {
            console.log('[NotificationManager] ' + message);
        }
    },

    /**
     * Error log helper
     */
    logError: function (message) {
        console.error('[NotificationManager] ERROR: ' + message);
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}