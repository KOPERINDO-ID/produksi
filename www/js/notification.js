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
        apiUrl: (typeof BASE_API !== 'undefined') ? BASE_API : 'https://tasindo-service-staging.digiseminar.id/api',
        maxNotifications: 50,
        toastDuration: 5000,
        retryDelay: 30000,
        debugMode: true
    },

    /**
     * Initialize Notification Manager
     * @param {string|number} userId - User ID untuk registrasi token
     * @param {boolean} forceRefresh - Force refresh token dan fetch notifikasi
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

        // Load local notifications
        this.loadNotifications();

        // Bind UI events
        this.bindEvents();

        // Initialize Firebase
        this.initFirebaseMessaging();

        // Initialize Audio
        this.initAudio();

        // PERBAIKAN: Fetch notifikasi dari server saat init
        if (forceRefresh) {
            var self = this;
            setTimeout(function () {
                self.fetchNotificationsFromServer();
            }, 2000);
        }

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

            if (callback) callback();
        });
    },

    /**
     * Initialize Firebase Cloud Messaging
     * ANDROID ONLY - iOS tidak didukung
     */
    initFirebaseMessaging: function () {
        var self = this;

        // Check platform - hanya Android yang didukung
        if (typeof device !== 'undefined' && device.platform !== 'Android') {
            this.log('Skipping Firebase Messaging - Only Android is supported');
            this.log('Current platform: ' + device.platform);
            return;
        }

        // Check if plugin is available
        if (!this.isFirebaseAvailable()) {
            this.logError('Firebase Messaging plugin not available');
            this.logError('Make sure cordova-plugin-firebase-messaging is installed');
            return;
        }

        this.log('Initializing Firebase Messaging for Android...');

        // Get token immediately
        this.getFirebaseToken();

        // Listen for token refresh
        cordova.plugins.firebase.messaging.onTokenRefresh(function (token) {
            self.log('FCM Token refreshed');
            self.handleNewToken(token);
        }, function (error) {
            self.logError('Error on token refresh: ' + JSON.stringify(error));
        });

        // Listen for foreground messages
        cordova.plugins.firebase.messaging.onMessage(function (payload) {
            self.log('=== FOREGROUND MESSAGE RECEIVED ===');
            self.log('Full Payload: ' + JSON.stringify(payload, null, 2));
            self.handleFirebaseMessage(payload, false);
        }, function (error) {
            self.logError('Error receiving foreground message: ' + JSON.stringify(error));
        });

        // Listen for background message taps
        cordova.plugins.firebase.messaging.onBackgroundMessage(function (payload) {
            self.log('=== BACKGROUND MESSAGE TAPPED ===');
            self.log('Full Payload: ' + JSON.stringify(payload, null, 2));
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
     * PERBAIKAN: Setelah register berhasil, fetch notifikasi dari server
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

                // PERBAIKAN: Fetch notifikasi dari server setelah register berhasil
                // Ini untuk memastikan notifikasi yang sudah ada di database ditampilkan
                setTimeout(function () {
                    self.fetchNotificationsFromServer();
                }, 1000);

                // PERBAIKAN: Jika server mengirim info unread notifications, tampilkan
                if (response.unread_notifications_sent && response.unread_notifications_sent.sent > 0) {
                    self.log('Server sent ' + response.unread_notifications_sent.sent + ' unread notifications via push');
                }
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
     * BARU: Fetch notifikasi dari server database
     * Dipanggil saat login untuk mengambil notifikasi yang sudah ada
     */
    fetchNotificationsFromServer: function () {
        var self = this;

        if (!this.userId) {
            this.logError('Cannot fetch notifications: No user ID');
            return;
        }

        this.log('Fetching notifications from server...');

        $.ajax({
            url: this.config.apiUrl + '/notifications',
            type: 'GET',
            data: {
                user_id: this.userId,
                page: 1
            },
            headers: this.getAuthHeaders(),
            timeout: 15000,
            success: function (response) {
                self.log('Notifications fetched: ' + JSON.stringify(response));

                if (response.success && response.data && response.data.data) {
                    var serverNotifications = response.data.data;

                    // Merge dengan notifikasi lokal
                    self.mergeServerNotifications(serverNotifications);

                    // Update unread count
                    self.fetchUnreadCount();

                    // Tampilkan toast jika ada notifikasi baru yang belum dibaca
                    var unreadFromServer = serverNotifications.filter(function (n) {
                        return !n.is_read || n.is_read === 0 || n.is_read === '0';
                    });

                    if (unreadFromServer.length > 0) {
                        self.log('Found ' + unreadFromServer.length + ' unread notifications from server');

                        // Tampilkan toast untuk notifikasi terbaru
                        var latestUnread = unreadFromServer[0];
                        self.showToast(latestUnread.title, latestUnread.message);

                        // Play sound
                        self.playNotificationSound();
                    }
                }
            },
            error: function (xhr, status, error) {
                self.logError('Failed to fetch notifications: ' + error);
            }
        });
    },

    /**
     * BARU: Merge notifikasi dari server dengan notifikasi lokal
     */
    mergeServerNotifications: function (serverNotifications) {
        var self = this;

        if (!serverNotifications || !serverNotifications.length) {
            return;
        }

        // Convert server notifications ke format lokal
        serverNotifications.forEach(function (serverNotif) {
            var existingIndex = self.notifications.findIndex(function (n) {
                return n.serverId === serverNotif.id;
            });

            var localNotif = {
                id: serverNotif.id + '_server',
                serverId: serverNotif.id,
                title: serverNotif.title,
                body: serverNotif.message,
                type: serverNotif.type || 'general',
                data: serverNotif.data ? (typeof serverNotif.data === 'string' ? JSON.parse(serverNotif.data) : serverNotif.data) : {},
                timestamp: serverNotif.dt_record || serverNotif.created_at,
                isRead: serverNotif.is_read == 1 || serverNotif.is_read === true,
                fromServer: true
            };

            if (existingIndex === -1) {
                // Tambah notifikasi baru
                self.notifications.unshift(localNotif);
            } else {
                // Update notifikasi yang sudah ada
                self.notifications[existingIndex] = localNotif;
            }
        });

        // Sort by timestamp (newest first)
        this.notifications.sort(function (a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        // Limit jumlah notifikasi
        if (this.notifications.length > this.config.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.config.maxNotifications);
        }

        // Save dan render
        this.saveNotifications();
        this.updateUnreadCount();
        this.renderNotifications();
    },

    /**
     * BARU: Fetch unread count dari server
     */
    fetchUnreadCount: function () {
        var self = this;

        if (!this.userId) {
            return;
        }

        $.ajax({
            url: this.config.apiUrl + '/notifications/unread-count',
            type: 'GET',
            data: {
                user_id: this.userId
            },
            headers: this.getAuthHeaders(),
            timeout: 10000,
            success: function (response) {
                if (response.success && typeof response.count !== 'undefined') {
                    self.unreadCount = parseInt(response.count);
                    self.updateBadge();
                    self.log('Unread count from server: ' + self.unreadCount);
                }
            },
            error: function (xhr, status, error) {
                self.logError('Failed to fetch unread count: ' + error);
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
     * Initialize Audio Context
     */
    initAudio: function () {
        var self = this;

        try {
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                this.log('AudioContext initialized');
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
        request.open('GET', 'audio/notification.mp3', true);
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
     * Play Notification Sound
     * ANDROID: Gunakan plugin native untuk suara yang lebih reliable
     */
    playNotificationSound: function () {
        var self = this;

        if (!this.audioEnabled) {
            this.log('Audio disabled');
            return;
        }

        this.log('Attempting to play notification sound...');

        // ANDROID: Coba gunakan NativeAudio plugin jika ada
        if (typeof window.plugins !== 'undefined' && window.plugins.NativeAudio) {
            try {
                window.plugins.NativeAudio.play('notification', function () {
                    self.log('Sound played via NativeAudio');
                }, function (error) {
                    self.logError('NativeAudio failed: ' + error);
                    self.playFallbackSound();
                });
                return;
            } catch (e) {
                this.logError('NativeAudio error: ' + e.message);
            }
        }

        // Fallback ke metode lain
        this.playFallbackSound();
    },

    /**
     * Fallback sound methods
     */
    playFallbackSound: function () {
        var self = this;

        // Try Media plugin (Cordova)
        if (typeof Media !== 'undefined') {
            try {
                var soundPath = '/android_asset/www/audio/notification.mp3';
                var media = new Media(soundPath,
                    function () {
                        self.log('Sound played via Media plugin');
                    },
                    function (err) {
                        self.logError('Media plugin failed: ' + err.code);
                        self.playHtmlAudio();
                    }
                );
                media.play();
                this.vibrateDevice();
                return;
            } catch (e) {
                this.logError('Media plugin error: ' + e.message);
            }
        }

        // Fallback ke HTML5 Audio
        this.playHtmlAudio();
    },

    /**
     * HTML5 Audio fallback
     */
    playHtmlAudio: function () {
        var self = this;

        // Try Web Audio API first
        if (this.audioContext && this.audioBuffer) {
            try {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }

                var source = this.audioContext.createBufferSource();
                source.buffer = this.audioBuffer;

                var gainNode = this.audioContext.createGain();
                gainNode.gain.value = 0.7;

                source.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                source.start(0);
                this.log('Sound played via Web Audio API');
                this.vibrateDevice();
                return;
            } catch (e) {
                this.logError('Web Audio API failed: ' + e.message);
            }
        }

        // Final fallback: HTML5 Audio
        try {
            var audio = new Audio('audio/notification.mp3');
            audio.volume = 0.7;
            audio.play().then(function () {
                self.log('Sound played via HTML5 Audio');
            }).catch(function (e) {
                self.logError('HTML5 Audio failed: ' + e.message);
            });
        } catch (e) {
            this.logError('All audio methods failed: ' + e.message);
        }

        // Always vibrate sebagai fallback
        this.vibrateDevice();
    },

    /**
     * Vibrate device
     */
    vibrateDevice: function () {
        try {
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
                this.log('Device vibrated');
            }
        } catch (e) {
            this.logError('Vibration failed: ' + e.message);
        }
    },

    /**
     * Handle Firebase message
     * ANDROID ONLY - iOS tidak didukung
     */
    handleFirebaseMessage: function (payload, wasTapped) {
        this.log('=== handleFirebaseMessage ===');
        this.log('wasTapped: ' + wasTapped);
        this.log('=== FULL PAYLOAD DEBUG ===');
        this.log(JSON.stringify(payload, null, 2));

        // Extract notification data dari berbagai format payload Android
        var title = '';
        var body = '';
        var data = {};

        // ANDROID FORMAT PRIORITY - Check semua kemungkinan field

        // 1. Check payload.data first (PRIORITAS untuk Android!)
        if (payload.data) {
            this.log('Processing payload.data...');
            data = payload.data;

            // Check berbagai kemungkinan field untuk title
            if (payload.data.title) {
                title = payload.data.title;
                this.log('Title from data.title: ' + title);
            }

            // Check berbagai kemungkinan field untuk body/message
            if (payload.data.message) {
                body = payload.data.message;
                this.log('Body from data.message: ' + body);
            } else if (payload.data.body) {
                body = payload.data.body;
                this.log('Body from data.body: ' + body);
            } else if (payload.data.text) {
                body = payload.data.text;
                this.log('Body from data.text: ' + body);
            }
        }

        // 2. Check payload.notification (untuk notifikasi dengan notification payload)
        if (payload.notification) {
            this.log('Processing payload.notification...');

            if (!title && payload.notification.title) {
                title = payload.notification.title;
                this.log('Title from notification.title: ' + title);
            }

            if (!body && payload.notification.body) {
                body = payload.notification.body;
                this.log('Body from notification.body: ' + body);
            }
        }

        // 3. Check payload langsung (fallback)
        if (!title && payload.title) {
            title = payload.title;
            this.log('Title from payload.title: ' + title);
        }
        if (!body && payload.body) {
            body = payload.body;
            this.log('Body from payload.body: ' + body);
        }
        if (!body && payload.message) {
            body = payload.message;
            this.log('Body from payload.message: ' + body);
        }

        // 4. Check gcm format (Android legacy)
        if (payload.gcm && payload.gcm.notification) {
            this.log('Processing payload.gcm.notification...');

            if (!title && payload.gcm.notification.title) {
                title = payload.gcm.notification.title;
                this.log('Title from gcm.notification.title: ' + title);
            }
            if (!body && payload.gcm.notification.body) {
                body = payload.gcm.notification.body;
                this.log('Body from gcm.notification.body: ' + body);
            }
        }

        // Log hasil extract
        this.log('=== EXTRACTION RESULT ===');
        this.log('Final title: ' + (title || 'EMPTY'));
        this.log('Final body: ' + (body || 'EMPTY'));
        this.log('Final data: ' + JSON.stringify(data));
        this.log('========================');

        // Default title jika masih kosong
        if (!title || title === '') {
            title = 'Notifikasi Baru';
            this.log('Using default title');
        }

        // Default body jika masih kosong - HANYA jika benar-benar kosong
        if (!body || body === '') {
            body = 'Anda memiliki notifikasi baru';
            this.log('Using default body - THIS SHOULD NOT HAPPEN!');
            this.logError('WARNING: Body is empty! Check server payload!');
        }

        // Cek apakah ini adalah notifikasi type 'unread_summary'
        if (data.type === 'unread_summary') {
            this.log('Received unread summary notification');
            // Fetch notifikasi dari server untuk mendapatkan list lengkap
            this.fetchNotificationsFromServer();
            return; // Skip adding to local list untuk unread_summary
        }

        // Buat notifikasi object
        var notification = {
            id: 'push_' + Date.now(),
            title: title,
            body: body,
            type: data.type || 'general',
            data: data,
            timestamp: new Date().toISOString(),
            isRead: wasTapped,
            fromPush: true
        };

        this.log('=== FINAL NOTIFICATION OBJECT ===');
        this.log(JSON.stringify(notification, null, 2));
        this.log('=================================');

        // Simpan notifikasi
        this.addNotification(notification);

        // Jika foreground (tidak di-tap), tampilkan toast dan play sound
        if (!wasTapped) {
            this.log('App in foreground - showing toast and playing sound');
            this.showToast(title, body);
            this.playNotificationSound();
        } else {
            this.log('App opened from notification tap');
        }

        // Handle berdasarkan type
        this.handleNotificationType(data);

        // Fetch notifikasi terbaru dari server untuk sinkronisasi
        var self = this;
        setTimeout(function () {
            self.fetchNotificationsFromServer();
        }, 2000);
    },

    /**
     * Add notification ke list
     */
    addNotification: function (notification) {
        // Cek duplikasi
        var isDuplicate = this.notifications.some(function (n) {
            return n.title === notification.title &&
                n.body === notification.body &&
                Math.abs(new Date(n.timestamp) - new Date(notification.timestamp)) < 5000;
        });

        if (isDuplicate) {
            this.log('Duplicate notification, skipping');
            return;
        }

        // Tambah ke awal array
        this.notifications.unshift(notification);

        // Limit jumlah notifikasi
        if (this.notifications.length > this.config.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.config.maxNotifications);
        }

        // Save dan update UI
        this.saveNotifications();
        this.updateUnreadCount();
        this.renderNotifications();
    },

    /**
     * Load notifications dari localStorage
     */
    loadNotifications: function () {
        try {
            var saved = localStorage.getItem('notifications_' + this.userId);
            if (saved) {
                this.notifications = JSON.parse(saved);
                this.log('Loaded ' + this.notifications.length + ' notifications from localStorage');
            }
        } catch (e) {
            this.logError('Error loading notifications: ' + e.message);
            this.notifications = [];
        }

        this.updateUnreadCount();
        this.renderNotifications();
    },

    /**
     * Save notifications ke localStorage
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

        this.updateBadge();
    },

    /**
     * Update badge UI
     */
    updateBadge: function () {
        var badge = document.getElementById('notifBadge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    },

    /**
     * Render notifications ke panel
     */
    renderNotifications: function () {
        var list = document.getElementById('notifList');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = '<li class="empty-notification"><p>Tidak ada notifikasi</p></li>';
            return;
        }

        var self = this;
        var html = '';

        this.notifications.forEach(function (notif, index) {
            var unreadClass = notif.isRead ? '' : 'unread';
            // Truncate body untuk preview (max 80 karakter)
            var truncatedBody = notif.body && notif.body.length > 80
                ? notif.body.substring(0, 80) + '...'
                : (notif.body || '');

            html += '<li class="notification-item ' + unreadClass + '" data-index="' + index + '">' +
                '<div class="notif-title">' + self.escapeHtml(notif.title) + '</div>' +
                '<div class="notif-body">' + self.escapeHtml(truncatedBody) + '</div>' +
                '<div class="notif-time">' + self.getTimeAgo(notif.timestamp) + '</div>' +
                '</li>';
        });

        list.innerHTML = html;

        // Bind click events - klik untuk menampilkan detail
        var items = list.querySelectorAll('.notification-item');
        items.forEach(function (item) {
            item.addEventListener('click', function () {
                var panel = document.getElementById('notifPanel');
                var index = parseInt(this.getAttribute('data-index'));

                panel.style.display = 'none';
                self.showNotificationDetail(index);
            });
        });
    },

    /**
     * Show notification detail popup
     */
    showNotificationDetail: function (index) {
        var self = this;
        if (!this.notifications[index]) return;

        var notif = this.notifications[index];

        // Format data tambahan jika ada
        var dataHtml = '';
        if (notif.data && Object.keys(notif.data).length > 0) {
            dataHtml = '<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #2d3a4f;">';
            dataHtml += '<div style="font-size: 12px; color: #999; margin-bottom: 8px;">Informasi Tambahan:</div>';

            for (var key in notif.data) {
                if (notif.data.hasOwnProperty(key) && key !== 'type') {
                    var label = key.replace(/_/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase() });
                    dataHtml += '<div style="margin-bottom: 5px; font-size: 12px;">';
                    dataHtml += '<span style="color: #999;">' + self.escapeHtml(label) + ':</span> ';
                    dataHtml += '<span style="color: #fff;">' + self.escapeHtml(String(notif.data[key])) + '</span>';
                    dataHtml += '</div>';
                }
            }
            dataHtml += '</div>';
        }

        // Buat popup dengan Framework7
        var popup = app.popup.create({
            content: '<div class="popup notif-detail-popup">' +
                '<div class="page">' +
                '<div class="navbar">' +
                '<div class="navbar-bg"></div>' +
                '<div class="navbar-inner">' +
                '<div class="title">Detail Notifikasi</div>' +
                '<div class="right">' +
                '<a class="link popup-close"><i class="f7-icons">multiply_circle</i></a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="page-content" style="background: #1a1a2e;">' +
                '<div class="block" style="margin-top: 0; padding: 20px;">' +
                '<div style="background: #0f0f1e; border-radius: 12px; padding: 20px; border-left: 4px solid #ff6b35;">' +
                '<div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">' +
                '<h3 style="margin: 0; color: #fff; font-size: 18px; font-weight: 600;">' + self.escapeHtml(notif.title) + '</h3>' +
                (notif.isRead ? '' : '<span style="background: #ff6b35; color: white; font-size: 10px; padding: 4px 8px; border-radius: 4px;">BARU</span>') +
                '</div>' +
                '<div style="color: #ff6b35; font-size: 12px; margin-bottom: 15px;">' +
                '<i class="f7-icons" style="font-size: 12px; vertical-align: middle;">clock</i> ' +
                self.getTimeAgo(notif.timestamp) +
                '</div>' +
                '<div style="color: #e0e0e0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">' +
                self.escapeHtml(notif.body) +
                '</div>' +
                dataHtml +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>',
            on: {
                opened: function () {
                    self.log('Notification detail popup opened');
                },
                closed: function () {
                    // Mark as read saat popup ditutup
                    self.markAsRead(index);
                }
            }
        });

        popup.open();
    },

    /**
     * Mark notification as read
     */
    markAsRead: function (index) {
        if (this.notifications[index]) {
            var notif = this.notifications[index];

            // Skip jika sudah dibaca
            if (notif.isRead) {
                return;
            }

            notif.isRead = true;

            // Jika notifikasi dari server, update ke server juga
            if (notif.serverId) {
                this.markAsReadOnServer(notif.serverId);
            }

            this.saveNotifications();
            this.updateUnreadCount();
            this.renderNotifications();
        }
    },

    /**
     * Mark as read on server
     */
    markAsReadOnServer: function (notificationId) {
        var self = this;

        $.ajax({
            url: this.config.apiUrl + '/notifications/' + notificationId + '/read',
            type: 'POST',
            data: {
                user_id: this.userId
            },
            headers: this.getAuthHeaders(),
            timeout: 10000,
            success: function (response) {
                self.log('Notification marked as read on server');
            },
            error: function (xhr, status, error) {
                self.logError('Failed to mark as read on server: ' + error);
            }
        });
    },

    /**
     * Mark all as read
     */
    markAllAsRead: function () {
        var self = this;

        this.notifications.forEach(function (notif) {
            notif.isRead = true;
        });

        // Update ke server
        $.ajax({
            url: this.config.apiUrl + '/notifications/read-all',
            type: 'POST',
            data: {
                user_id: this.userId
            },
            headers: this.getAuthHeaders(),
            timeout: 10000,
            success: function (response) {
                self.log('All notifications marked as read on server');
            },
            error: function (xhr, status, error) {
                self.logError('Failed to mark all as read: ' + error);
            }
        });

        this.saveNotifications();
        this.updateUnreadCount();
        this.renderNotifications();
    },


    markAllAsDelete: function () {
        var self = this;

        this.notifications.forEach(function (notif) {
            notif.isRead = true;
        });

        // Update ke server
        $.ajax({
            url: this.config.apiUrl + '/notifications/delete-all-read',
            type: 'POST',
            data: {
                user_id: this.userId
            },
            headers: this.getAuthHeaders(),
            timeout: 10000,
            success: function (response) {
                self.log('All notifications deleted on server');
            },
            error: function (xhr, status, error) {
                self.logError('Failed to mark all as deleted: ' + error);
            }
        });

        this.saveNotifications();
        this.updateUnreadCount();
        this.renderNotifications();

    },

    /**
     * Show toast notification
     */
    showToast: function (title, body) {
        var toast = document.getElementById('toastNotif');
        var toastTitle = document.getElementById('toastTitle');
        var toastBody = document.getElementById('toastBody');

        if (toast && toastTitle && toastBody) {
            toastTitle.textContent = title;
            toastBody.textContent = body;
            toast.style.display = 'block';

            var self = this;
            setTimeout(function () {
                toast.style.display = 'none';
            }, this.config.toastDuration);
        }
    },

    /**
     * Handle notification type specific actions
     */
    handleNotificationType: function (data) {
        var type = data.type || 'general';
        var invoiceId = data.invoice_id;

        this.log('Handling notification type: ' + type);

        switch (type) {
            case 'new_order':
            case 'production_order':
                // Refresh data produksi
                if (typeof getDataProduksi === 'function') {
                    getDataProduksi();
                }
                if (typeof chooseDataProduksiCabangRedirect === 'function') {
                    chooseDataProduksiCabangRedirect('pusat');
                }
                this.showToast('Order Baru', 'Data produksi telah diperbarui');
                break;

            case 'unread_summary':
                // Ini adalah summary, fetch notifikasi lengkap dari server
                this.fetchNotificationsFromServer();
                break;

            case 'payment':
                if (invoiceId) {
                    this.showToast('Pembayaran', 'Ada update pembayaran untuk ' + invoiceId);
                }
                break;

            case 'test':
            case 'diagnostic_test':
                this.showToast('Test', 'Notifikasi test berhasil diterima!');
                break;

            default:
                this.log('Unknown notification type: ' + type);
                if (typeof getDataProduksi === 'function') {
                    getDataProduksi();
                }
        }
    },

    /**
     * Bind UI event handlers
     */
    bindEvents: function () {
        var self = this;

        this.log('Binding events...');

        // Toggle notification panel
        var notifIcon = document.getElementById('notifIcon');
        if (notifIcon) {
            notifIcon.addEventListener('click', function (e) {
                e.stopPropagation();
                self.togglePanel();
            });
            this.log('Bound notifIcon click');
        }

        // Close panel button
        var closeBtn = document.getElementById('closePanel');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                self.closePanel();
            });
            this.log('Bound closePanel click');
        }

        // Mark all as read button
        var markAllBtn = document.getElementById('markAllRead');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', function () {
                self.markAllAsRead();
            });
            this.log('Bound markAllRead click');
        }

        // Clear all button
        var clearAllBtn = document.getElementById('clearAllNotif');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', function () {
                self.clearAll();
            });
            this.log('Bound clearAllNotif click');
        }

        // Close toast on click
        var toast = document.getElementById('toastNotif');
        if (toast) {
            toast.addEventListener('click', function () {
                toast.style.display = 'none';
            });
            this.log('Bound toast click');
        }

        // Close panel on outside click
        document.addEventListener('click', function (e) {
            var panel = document.getElementById('notifPanel');
            var icon = document.getElementById('notifIcon');

            if (panel && icon) {
                if (!panel.contains(e.target) && !icon.contains(e.target)) {
                    panel.style.display = 'none';
                }
            }
        });

        this.log('Events bound successfully');
    },

    /**
     * Toggle notification panel
     */
    togglePanel: function () {
        var panel = document.getElementById('notifPanel');
        if (panel) {
            if (panel.style.display === 'none' || panel.style.display === '') {
                panel.style.display = 'block';
                // Refresh notifikasi dari server saat buka panel
                this.fetchNotificationsFromServer();
                this.log('Panel opened');
            } else {
                panel.style.display = 'none';
                this.log('Panel closed');
            }
        }
    },

    /**
     * Close notification panel
     */
    closePanel: function () {
        var panel = document.getElementById('notifPanel');
        if (panel) {
            panel.style.display = 'none';
        }
    },

    /**
     * Clear all notifications
     */
    clearAll: function () {
        if (confirm('Hapus semua notifikasi?')) {
            this.notifications = [];
            this.markAllAsDelete();
            this.log('All notifications cleared');
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
    },

    // ==================== Debug/Test Functions ====================

    /**
     * Test notification (untuk debugging)
     */
    testNotification: function () {
        this.log('=== TEST NOTIFICATION ===');

        var testPayload = {
            title: 'Test Notifikasi',
            body: 'Ini adalah test notifikasi pada ' + new Date().toLocaleTimeString(),
            data: {
                type: 'test',
                timestamp: Date.now()
            }
        };

        this.handleFirebaseMessage(testPayload, false);
    },

    /**
     * Debug info
     */
    debugInfo: function () {
        console.log('=== NotificationManager Debug Info ===');
        console.log('isInitialized:', this.isInitialized);
        console.log('userId:', this.userId);
        console.log('fcmToken:', this.fcmToken ? this.fcmToken.substring(0, 30) + '...' : null);
        console.log('notifications count:', this.notifications.length);
        console.log('unreadCount:', this.unreadCount);
        console.log('Firebase available:', this.isFirebaseAvailable());
        console.log('config:', this.config);
        console.log('localStorage fcm_token:', localStorage.getItem('fcm_token'));
        console.log('localStorage token_registered:', localStorage.getItem('token_registered'));
        console.log('======================================');
    },

    /**
     * Manual refresh - panggil untuk force fetch dari server
     */
    refresh: function () {
        this.log('Manual refresh triggered');
        this.fetchNotificationsFromServer();
        this.fetchUnreadCount();
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}