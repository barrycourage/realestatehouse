class WhatsAppChat {
    constructor() {
        this.currentUser = null;
        this.allUsers = [];
        this.groups = [];
        this.channels = [];
        this.currentChatUser = null;
        this.currentGroup = null;
        this.currentChannel = null;
        this.messages = {};
        this.unreadMessages = {};
        this.currentTab = 'chats';
        this.isOnline = true;
        this.init();
    }

    init() {
        this.loadAllData();
        this.checkExistingUser();
        this.setupEventListeners();
        this.startUserStatusUpdater();
        this.setupNotificationPermission();
        this.setupVisibilityChange();
    }

    loadAllData() {
        const savedUsers = localStorage.getItem('whatsapp_all_users');
        if (savedUsers) {
            this.allUsers = JSON.parse(savedUsers);
        }
        
        const savedMessages = localStorage.getItem('whatsapp_messages');
        if (savedMessages) {
            this.messages = JSON.parse(savedMessages);
        }

        const savedGroups = localStorage.getItem('whatsapp_groups');
        if (savedGroups) {
            this.groups = JSON.parse(savedGroups);
        }

        const savedChannels = localStorage.getItem('whatsapp_channels');
        if (savedChannels) {
            this.channels = JSON.parse(savedChannels);
        }

        const savedUnread = localStorage.getItem('whatsapp_unread');
        if (savedUnread) {
            this.unreadMessages = JSON.parse(savedUnread);
        }
    }

    saveAllData() {
        localStorage.setItem('whatsapp_all_users', JSON.stringify(this.allUsers));
        localStorage.setItem('whatsapp_messages', JSON.stringify(this.messages));
        localStorage.setItem('whatsapp_groups', JSON.stringify(this.groups));
        localStorage.setItem('whatsapp_channels', JSON.stringify(this.channels));
        localStorage.setItem('whatsapp_unread', JSON.stringify(this.unreadMessages));
    }

    setupNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    setupVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            this.isOnline = !document.hidden;
            if (this.currentUser) {
                this.updateUserStatus(this.currentUser.phone, this.isOnline ? 'online' : 'offline');
            }
        });
    }

    checkExistingUser() {
        const savedUser = localStorage.getItem('whatsapp_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUserStatus(this.currentUser.phone, 'online');
            this.showChatListScreen();
        } else {
            this.showLoginScreen();
        }
    }

    updateUserStatus(phone, status) {
        const userIndex = this.allUsers.findIndex(user => user.phone === phone);
        if (userIndex !== -1) {
            this.allUsers[userIndex].status = status;
            this.allUsers[userIndex].lastSeen = new Date().toISOString();
            this.saveAllData();
        }
    }

    startUserStatusUpdater() {
        setInterval(() => {
            if (this.currentUser && this.isOnline) {
                this.updateUserStatus(this.currentUser.phone, 'online');
                this.refreshCurrentView();
            }
        }, 30000);
    }

    setupEventListeners() {
        // Login screen
        const phoneInput = document.getElementById('phone-number');
        const passwordInput = document.getElementById('password');
        const nextBtn = document.getElementById('next-btn');
        
        phoneInput.addEventListener('input', () => {
            this.validateLoginForm();
        });

        passwordInput.addEventListener('input', () => {
            this.validateLoginForm();
        });

        nextBtn.addEventListener('click', () => {
            this.handlePhoneSubmit();
        });

        // Verification screen
        const backBtn = document.getElementById('back-btn');
        const verificationCode = document.getElementById('verification-code');
        const resendLink = document.getElementById('resend-link');

        backBtn.addEventListener('click', () => {
            this.showLoginScreen();
        });

        verificationCode.addEventListener('input', () => {
            if (verificationCode.value.length === 6) {
                this.handleVerificationSubmit();
            }
        });

        resendLink.addEventListener('click', () => {
            this.resendCode();
        });

        // Profile screen
        const profilePhoto = document.getElementById('profile-photo');
        const photoInput = document.getElementById('photo-input');
        const userName = document.getElementById('user-name');
        const setupPassword = document.getElementById('setup-password');
        const confirmPassword = document.getElementById('confirm-password');
        const doneBtn = document.getElementById('done-btn');

        profilePhoto.addEventListener('click', () => {
            photoInput.click();
        });

        photoInput.addEventListener('change', (e) => {
            this.handlePhotoUpload(e, 'profile-photo');
        });

        userName.addEventListener('input', () => {
            this.validateProfileForm();
        });

        setupPassword.addEventListener('input', () => {
            this.validateProfileForm();
        });

        confirmPassword.addEventListener('input', () => {
            this.validateProfileForm();
        });

        doneBtn.addEventListener('click', () => {
            this.handleProfileSubmit();
        });

        // Chat list screen
        const searchBtn = document.getElementById('search-btn');
        const searchContainer = document.getElementById('search-container');
        const searchInput = document.getElementById('search-input');
        const menuBtn = document.getElementById('menu-btn');
        const floatingMenu = document.getElementById('floating-menu');
        const logoutBtn = document.getElementById('logout-btn');
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const createGroupBtn = document.getElementById('create-group-btn');
        const createChannelBtn = document.getElementById('create-channel-btn');

        searchBtn.addEventListener('click', () => {
            searchContainer.classList.toggle('active');
            if (searchContainer.classList.contains('active')) {
                searchInput.focus();
            }
        });

        searchInput.addEventListener('input', () => {
            this.handleSearch();
        });

        menuBtn.addEventListener('click', () => {
            floatingMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!menuBtn.contains(e.target) && !floatingMenu.contains(e.target)) {
                floatingMenu.classList.remove('active');
            }
        });

        logoutBtn.addEventListener('click', () => {
            this.logout();
        });

        editProfileBtn.addEventListener('click', () => {
            this.showEditProfileModal();
        });

        createGroupBtn.addEventListener('click', () => {
            this.showGroupModal();
        });

        createChannelBtn.addEventListener('click', () => {
            this.showChannelModal();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Chat screen
        const backToListBtn = document.getElementById('back-to-list');
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        const attachmentBtn = document.getElementById('attachment-btn');
        const fileInput = document.getElementById('file-input');

        backToListBtn.addEventListener('click', () => {
            this.showChatListScreen();
        });

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        messageInput.addEventListener('input', () => {
            this.handleTyping();
        });

        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        attachmentBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });

        // Modal event listeners
        this.setupModalEventListeners();
    }

    setupModalEventListeners() {
        // Group modal
        const groupModal = document.getElementById('group-modal');
        const closeGroupModal = document.getElementById('close-group-modal');
        const groupPhoto = document.getElementById('group-photo');
        const groupPhotoInput = document.getElementById('group-photo-input');
        const groupName = document.getElementById('group-name');
        const createGroupBtnModal = document.getElementById('create-group-btn-modal');

        closeGroupModal.addEventListener('click', () => {
            groupModal.classList.remove('active');
        });

        groupPhoto.addEventListener('click', () => {
            groupPhotoInput.click();
        });

        groupPhotoInput.addEventListener('change', (e) => {
            this.handlePhotoUpload(e, 'group-photo');
        });

        groupName.addEventListener('input', () => {
            createGroupBtnModal.disabled = groupName.value.trim().length === 0;
        });

        createGroupBtnModal.addEventListener('click', () => {
            this.createGroup();
        });

        // Channel modal
        const channelModal = document.getElementById('channel-modal');
        const closeChannelModal = document.getElementById('close-channel-modal');
        const channelPhoto = document.getElementById('channel-photo');
        const channelPhotoInput = document.getElementById('channel-photo-input');
        const channelName = document.getElementById('channel-name');
        const createChannelBtnModal = document.getElementById('create-channel-btn-modal');

        closeChannelModal.addEventListener('click', () => {
            channelModal.classList.remove('active');
        });

        channelPhoto.addEventListener('click', () => {
            channelPhotoInput.click();
        });

        channelPhotoInput.addEventListener('change', (e) => {
            this.handlePhotoUpload(e, 'channel-photo');
        });

        channelName.addEventListener('input', () => {
            createChannelBtnModal.disabled = channelName.value.trim().length === 0;
        });

        createChannelBtnModal.addEventListener('click', () => {
            this.createChannel();
        });

        // Edit profile modal
        const editProfileModal = document.getElementById('edit-profile-modal');
        const closeEditProfileModal = document.getElementById('close-edit-profile-modal');
        const editPhoto = document.getElementById('edit-photo');
        const editPhotoInput = document.getElementById('edit-photo-input');
        const editName = document.getElementById('edit-name');
        const saveProfileBtn = document.getElementById('save-profile-btn');

        closeEditProfileModal.addEventListener('click', () => {
            editProfileModal.classList.remove('active');
        });

        editPhoto.addEventListener('click', () => {
            editPhotoInput.click();
        });

        editPhotoInput.addEventListener('change', (e) => {
            this.handlePhotoUpload(e, 'edit-photo');
        });

        editName.addEventListener('input', () => {
            saveProfileBtn.disabled = editName.value.trim().length === 0;
        });

        saveProfileBtn.addEventListener('click', () => {
            this.saveProfile();
        });

        // Close modals when clicking outside
        [groupModal, channelModal, editProfileModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    validateLoginForm() {
        const phoneInput = document.getElementById('phone-number');
        const passwordInput = document.getElementById('password');
        const nextBtn = document.getElementById('next-btn');
        
        const phoneValid = phoneInput.value.length >= 10;
        const existingUser = this.allUsers.find(user => 
            user.phone === document.getElementById('country-code').value + phoneInput.value
        );
        
        if (existingUser && passwordInput.value.length === 0) {
            nextBtn.disabled = true;
        } else if (existingUser && passwordInput.value.length > 0) {
            nextBtn.disabled = false;
        } else if (!existingUser && phoneValid) {
            nextBtn.disabled = false;
        } else {
            nextBtn.disabled = true;
        }
    }

    validateProfileForm() {
        const userName = document.getElementById('user-name');
        const setupPassword = document.getElementById('setup-password');
        const confirmPassword = document.getElementById('confirm-password');
        const doneBtn = document.getElementById('done-btn');
        
        const nameValid = userName.value.trim().length > 0;
        const passwordValid = setupPassword.value.length >= 6;
        const passwordsMatch = setupPassword.value === confirmPassword.value;
        
        doneBtn.disabled = !(nameValid && passwordValid && passwordsMatch);
    }

    showLoginScreen() {
        this.hideAllScreens();
        document.getElementById('login-screen').classList.add('active');
    }

    showVerificationScreen() {
        this.hideAllScreens();
        document.getElementById('verification-screen').classList.add('active');
        
        const countryCode = document.getElementById('country-code').value;
        const phoneNumber = document.getElementById('phone-number').value;
        const fullNumber = countryCode + phoneNumber;
        
        document.getElementById('verification-text').textContent = 
            `We have sent an SMS with an activation code to ${fullNumber}`;
    }

    showProfileScreen() {
        this.hideAllScreens();
        document.getElementById('profile-screen').classList.add('active');
    }

    showChatListScreen() {
        this.hideAllScreens();
        document.getElementById('chat-list-screen').classList.add('active');
        
        if (this.currentUser) {
            document.getElementById('current-user-name').textContent = this.currentUser.name;
            
            const currentUserAvatar = document.getElementById('current-user-avatar');
            if (this.currentUser.photo) {
                currentUserAvatar.innerHTML = `<img src="${this.currentUser.photo}" alt="Profile">`;
            }
        }
        
        this.refreshCurrentView();
    }

    showChatScreen(user, isGroup = false, isChannel = false) {
        this.hideAllScreens();
        document.getElementById('chat-screen').classList.add('active');
        
        if (isGroup) {
            this.currentGroup = user;
            this.currentChatUser = null;
            this.currentChannel = null;
        } else if (isChannel) {
            this.currentChannel = user;
            this.currentChatUser = null;
            this.currentGroup = null;
        } else {
            this.currentChatUser = user;
            this.currentGroup = null;
            this.currentChannel = null;
        }
        
        document.getElementById('chat-user-name').textContent = user.name;
        document.getElementById('chat-user-status').textContent = 
            isGroup ? `${user.members.length} members` : 
            isChannel ? `${user.subscribers.length} subscribers` : 
            user.status || 'offline';
        
        const chatUserAvatar = document.getElementById('chat-user-avatar');
        if (user.photo) {
            chatUserAvatar.innerHTML = `<img src="${user.photo}" alt="Profile">`;
        } else {
            chatUserAvatar.innerHTML = `<svg viewBox="0 0 24 24" width="32" height="32">
                <path fill="#8696a0" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 13.5C14.8 13.8 14.3 14 14 14H10C9.7 14 9.2 13.8 9 13.5L3 7V9C3 10.1 3.9 11 5 11V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V11C20.1 11 21 10.1 21 9Z"/>
            </svg>`;
        }
        
        this.loadChatMessages(user.id || user.phone);
        this.markAsRead(user.id || user.phone);
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        this.refreshCurrentView();
    }

    refreshCurrentView() {
        switch (this.currentTab) {
            case 'chats':
                this.refreshChatList();
                break;
            case 'groups':
                this.refreshGroupList();
                break;
            case 'channels':
                this.refreshChannelList();
                break;
        }
    }

    refreshChatList() {
        const chatList = document.getElementById('chat-list');
        const otherUsers = this.allUsers.filter(user => user.phone !== this.currentUser.phone);
        
        if (otherUsers.length === 0) {
            chatList.innerHTML = '<div class="no-chats"><p>No contacts yet. Other users will appear here when they join.</p></div>';
            return;
        }
        
        chatList.innerHTML = '';
        
        otherUsers.forEach(user => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.onclick = () => this.showChatScreen(user);
            
            const timeSinceLastSeen = this.getTimeSinceLastSeen(user.lastSeen);
            const statusText = user.status === 'online' ? 'online' : `last seen ${timeSinceLastSeen}`;
            
            const lastMessage = this.getLastMessage(user.phone);
            const unreadCount = this.unreadMessages[user.phone] || 0;
            
            chatItem.innerHTML = `
                <div class="chat-item-avatar">
                    ${user.photo ? `<img src="${user.photo}" alt="Profile">` : `
                        <svg viewBox="0 0 24 24" width="32" height="32">
                            <path fill="#8696a0" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 13.5C14.8 13.8 14.3 14 14 14H10C9.7 14 9.2 13.8 9 13.5L3 7V9C3 10.1 3.9 11 5 11V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V11C20.1 11 21 10.1 21 9Z"/>
                        </svg>
                    `}
                    <div class="status-indicator ${user.status === 'online' ? 'online' : 'offline'}"></div>
                </div>
                <div class="chat-item-info">
                    <div class="chat-item-name">${user.name}</div>
                    <div class="chat-item-phone">${user.phone}</div>
                    <div class="chat-item-status">${statusText}</div>
                    ${lastMessage ? `<div class="chat-item-last-message">${lastMessage}</div>` : ''}
                </div>
                ${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
            `;
            
            chatList.appendChild(chatItem);
        });
    }

    refreshGroupList() {
        const chatList = document.getElementById('chat-list');
        
        if (this.groups.length === 0) {
            chatList.innerHTML = '<div class="no-chats"><p>No groups yet. Create a group to get started.</p></div>';
            return;
        }
        
        chatList.innerHTML = '';
        
        this.groups.forEach(group => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.onclick = () => this.showChatScreen(group, true);
            
            const lastMessage = this.getLastMessage(group.id);
            const unreadCount = this.unreadMessages[group.id] || 0;
            
            chatItem.innerHTML = `
                <div class="chat-item-avatar">
                    ${group.photo ? `<img src="${group.photo}" alt="Group">` : `
                        <span style="font-size: 24px;">👥</span>
                    `}
                </div>
                <div class="chat-item-info">
                    <div class="chat-item-name">${group.name}</div>
                    <div class="chat-item-phone">${group.members.length} members</div>
                    ${lastMessage ? `<div class="chat-item-last-message">${lastMessage}</div>` : ''}
                </div>
                ${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
            `;
            
            chatList.appendChild(chatItem);
        });
    }

    refreshChannelList() {
        const chatList = document.getElementById('chat-list');
        
        if (this.channels.length === 0) {
            chatList.innerHTML = '<div class="no-chats"><p>No channels yet. Create a channel to get started.</p></div>';
            return;
        }
        
        chatList.innerHTML = '';
        
        this.channels.forEach(channel => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.onclick = () => this.showChatScreen(channel, false, true);
            
            const lastMessage = this.getLastMessage(channel.id);
            const unreadCount = this.unreadMessages[channel.id] || 0;
            
            chatItem.innerHTML = `
                <div class="chat-item-avatar">
                    ${channel.photo ? `<img src="${channel.photo}" alt="Channel">` : `
                        <span style="font-size: 24px;">📺</span>
                    `}
                </div>
                <div class="chat-item-info">
                    <div class="chat-item-name">${channel.name}</div>
                    <div class="chat-item-phone">${channel.subscribers.length} subscribers</div>
                    ${lastMessage ? `<div class="chat-item-last-message">${lastMessage}</div>` : ''}
                </div>
                ${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
            `;
            
            chatList.appendChild(chatItem);
        });
    }

    getLastMessage(chatId) {
        const chatKey = this.getChatKey(this.currentUser.phone, chatId);
        const chatMessages = this.messages[chatKey] || [];
        if (chatMessages.length === 0) return null;
        
        const lastMsg = chatMessages[chatMessages.length - 1];
        if (lastMsg.type === 'media') {
            return lastMsg.mediaType === 'image' ? '📷 Photo' : '🎥 Video';
        }
        return lastMsg.text.length > 30 ? lastMsg.text.substring(0, 30) + '...' : lastMsg.text;
    }

    getTimeSinceLastSeen(lastSeenISO) {
        if (!lastSeenISO) return 'recently';
        
        const lastSeen = new Date(lastSeenISO);
        const now = new Date();
        const diffMs = now - lastSeen;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    }

    handlePhoneSubmit() {
        const countryCode = document.getElementById('country-code').value;
        const phoneNumber = document.getElementById('phone-number').value;
        const password = document.getElementById('password').value;
        const fullPhone = countryCode + phoneNumber;
        
        if (phoneNumber.length >= 10) {
            const existingUser = this.allUsers.find(user => user.phone === fullPhone);
            
            if (existingUser) {
                // Login existing user
                if (password === existingUser.password) {
                    this.currentUser = existingUser;
                    this.updateUserStatus(this.currentUser.phone, 'online');
                    localStorage.setItem('whatsapp_current_user', JSON.stringify(this.currentUser));
                    this.showChatListScreen();
                } else {
                    alert('Incorrect password!');
                }
            } else {
                // New user registration
                this.showVerificationScreen();
            }
        }
    }

    handleVerificationSubmit() {
        const code = document.getElementById('verification-code').value;
        
        if (code.length === 6) {
            setTimeout(() => {
                this.showProfileScreen();
            }, 1000);
        }
    }

    resendCode() {
        this.showNotification('Verification code resent!', null, 'System');
    }

    handlePhotoUpload(event, targetId) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const targetElement = document.getElementById(targetId);
                targetElement.innerHTML = `<img src="${e.target.result}" alt="Photo">`;
            };
            reader.readAsDataURL(file);
        }
    }

    handleProfileSubmit() {
        const name = document.getElementById('user-name').value.trim();
        const password = document.getElementById('setup-password').value;
        const countryCode = document.getElementById('country-code').value;
        const phoneNumber = document.getElementById('phone-number').value;
        const photoElement = document.querySelector('#profile-photo img');
        
        if (name && password.length >= 6) {
            this.currentUser = {
                name: name,
                phone: countryCode + phoneNumber,
                password: password,
                photo: photoElement ? photoElement.src : null,
                loginTime: new Date().toISOString(),
                status: 'online',
                lastSeen: new Date().toISOString()
            };
            
            // Add to all users list
            const existingUserIndex = this.allUsers.findIndex(user => user.phone === this.currentUser.phone);
            if (existingUserIndex !== -1) {
                this.allUsers[existingUserIndex] = this.currentUser;
            } else {
                this.allUsers.push(this.currentUser);
            }
            
            // Save data
            localStorage.setItem('whatsapp_current_user', JSON.stringify(this.currentUser));
            this.saveAllData();
            
            this.showChatListScreen();
        }
    }

    handleSearch() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const chatItems = document.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const name = item.querySelector('.chat-item-name').textContent.toLowerCase();
            const phone = item.querySelector('.chat-item-phone').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || phone.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    showGroupModal() {
        const modal = document.getElementById('group-modal');
        modal.classList.add('active');
        this.populateParticipantsList('participants-list');
        document.getElementById('floating-menu').classList.remove('active');
    }

    showChannelModal() {
        const modal = document.getElementById('channel-modal');
        modal.classList.add('active');
        document.getElementById('floating-menu').classList.remove('active');
    }

    showEditProfileModal() {
        const modal = document.getElementById('edit-profile-modal');
        const editName = document.getElementById('edit-name');
        const editPhoto = document.getElementById('edit-photo');
        
        editName.value = this.currentUser.name;
        if (this.currentUser.photo) {
            editPhoto.innerHTML = `<img src="${this.currentUser.photo}" alt="Profile">`;
        }
        
        modal.classList.add('active');
        document.getElementById('floating-menu').classList.remove('active');
    }

    populateParticipantsList(containerId) {
        const container = document.getElementById(containerId);
        const otherUsers = this.allUsers.filter(user => user.phone !== this.currentUser.phone);
        
        let html = '<h4>Select participants:</h4>';
        
        otherUsers.forEach(user => {
            html += `
                <div class="participant-item" onclick="this.querySelector('input').click()">
                    <input type="checkbox" class="participant-checkbox" value="${user.phone}">
                    <div class="participant-avatar">
                        ${user.photo ? `<img src="${user.photo}" alt="Profile">` : `
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path fill="#8696a0" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 13.5C14.8 13.8 14.3 14 14 14H10C9.7 14 9.2 13.8 9 13.5L3 7V9C3 10.1 3.9 11 5 11V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V11C20.1 11 21 10.1 21 9Z"/>
                            </svg>
                        `}
                    </div>
                    <div class="participant-info">
                        <div class="participant-name">${user.name}</div>
                        <div class="participant-phone">${user.phone}</div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    createGroup() {
        const groupName = document.getElementById('group-name').value.trim();
        const groupPhotoElement = document.querySelector('#group-photo img');
        const selectedParticipants = Array.from(document.querySelectorAll('.participant-checkbox:checked'))
            .map(checkbox => checkbox.value);
        
        if (groupName && selectedParticipants.length > 0) {
            const group = {
                id: 'group_' + Date.now(),
                name: groupName,
                photo: groupPhotoElement ? groupPhotoElement.src : null,
                admin: this.currentUser.phone,
                members: [this.currentUser.phone, ...selectedParticipants],
                createdAt: new Date().toISOString()
            };
            
            this.groups.push(group);
            this.saveAllData();
            
            document.getElementById('group-modal').classList.remove('active');
            document.getElementById('group-name').value = '';
            document.getElementById('group-photo').innerHTML = '<span>📷</span>';
            
            this.switchTab('groups');
        }
    }

    createChannel() {
        const channelName = document.getElementById('channel-name').value.trim();
        const channelDescription = document.getElementById('channel-description').value.trim();
        const channelPhotoElement = document.querySelector('#channel-photo img');
        const isPublic = document.getElementById('channel-public').checked;
        
        if (channelName) {
            const channel = {
                id: 'channel_' + Date.now(),
                name: channelName,
                description: channelDescription,
                photo: channelPhotoElement ? channelPhotoElement.src : null,
                admin: this.currentUser.phone,
                subscribers: [this.currentUser.phone],
                isPublic: isPublic,
                createdAt: new Date().toISOString()
            };
            
            this.channels.push(channel);
            this.saveAllData();
            
            document.getElementById('channel-modal').classList.remove('active');
            document.getElementById('channel-name').value = '';
            document.getElementById('channel-description').value = '';
            document.getElementById('channel-photo').innerHTML = '<span>📺</span>';
            document.getElementById('channel-public').checked = false;
            
            this.switchTab('channels');
        }
    }

    saveProfile() {
        const newName = document.getElementById('edit-name').value.trim();
        const newPhotoElement = document.querySelector('#edit-photo img');
        
        if (newName) {
            this.currentUser.name = newName;
            if (newPhotoElement) {
                this.currentUser.photo = newPhotoElement.src;
            }
            
            // Update in all users list
            const userIndex = this.allUsers.findIndex(user => user.phone === this.currentUser.phone);
            if (userIndex !== -1) {
                this.allUsers[userIndex] = this.currentUser;
            }
            
            localStorage.setItem('whatsapp_current_user', JSON.stringify(this.currentUser));
            this.saveAllData();
            
            document.getElementById('edit-profile-modal').classList.remove('active');
            this.showChatListScreen();
        }
    }

    loadChatMessages(chatId) {
        const chatKey = this.getChatKey(this.currentUser.phone, chatId);
        const chatMessages = this.messages[chatKey] || [];
        
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = '';
        
        if (chatMessages.length === 0) {
            messagesContainer.innerHTML = '<div class="welcome-message"><p>Start your conversation!</p></div>';
            return;
        }
        
        chatMessages.forEach(message => {
            this.displayMessage(message);
        });
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    getChatKey(phone1, phone2) {
        return [phone1, phone2].sort().join('_');
    }

    handleTyping() {
        // Simulate typing indicator (in a real app, this would be sent to other users)
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            // Stop typing indicator
        }, 1000);
    }

    handleFileUpload(event) {
        const files = event.target.files;
        
        for (let file of files) {
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.sendMediaMessage(e.target.result, file.type.startsWith('image/') ? 'image' : 'video');
                };
                reader.readAsDataURL(file);
            }
        }
        
        event.target.value = '';
    }

    sendMessage() {
        const messageInput = document.getElementById('message-input');
        const messageText = messageInput.value.trim();
        
        if (messageText && (this.currentChatUser || this.currentGroup || this.currentChannel)) {
            const receiverId = this.currentChatUser ? this.currentChatUser.phone : 
                             this.currentGroup ? this.currentGroup.id : 
                             this.currentChannel.id;
            
            const message = {
                id: Date.now(),
                text: messageText,
                type: 'text',
                sender: this.currentUser.phone,
                receiver: receiverId,
                timestamp: new Date().toISOString()
            };
            
            this.saveMessage(message);
            this.displayMessage(message);
            
            messageInput.value = '';
            
            const messagesContainer = document.getElementById('chat-messages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Simulate notification for offline users
            this.simulateNotification(message);
        }
    }

    sendMediaMessage(mediaData, mediaType) {
        if (this.currentChatUser || this.currentGroup || this.currentChannel) {
            const receiverId = this.currentChatUser ? this.currentChatUser.phone : 
                             this.currentGroup ? this.currentGroup.id : 
                             this.currentChannel.id;
            
            const message = {
                id: Date.now(),
                type: 'media',
                mediaType: mediaType,
                mediaData: mediaData,
                sender: this.currentUser.phone,
                receiver: receiverId,
                timestamp: new Date().toISOString()
            };
            
            this.saveMessage(message);
            this.displayMessage(message);
            
            const messagesContainer = document.getElementById('chat-messages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            this.simulateNotification(message);
        }
    }

    saveMessage(message) {
        const chatKey = this.getChatKey(this.currentUser.phone, message.receiver);
        if (!this.messages[chatKey]) {
            this.messages[chatKey] = [];
        }
        this.messages[chatKey].push(message);
        this.saveAllData();
    }

    displayMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        
        // Remove welcome message if it exists
        const welcomeMessage = messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === this.currentUser.phone ? 'sent' : 'received'}`;
        
        const time = new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let messageContent = '';
        if (message.type === 'media') {
            const mediaTag = message.mediaType === 'image' ? 'img' : 'video';
            const controls = message.mediaType === 'video' ? 'controls' : '';
            messageContent = `<div class="message-media"><${mediaTag} src="${message.mediaData}" ${controls}></${mediaTag}></div>`;
        } else {
            messageContent = `<div class="message-content">${message.text}</div>`;
        }
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${messageContent}
                <div class="message-time">${time}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
    }

    simulateNotification(message) {
        // Simulate receiving notification when user comes back online
        setTimeout(() => {
            if (message.receiver !== this.currentUser.phone) {
                const sender = this.allUsers.find(user => user.phone === message.sender);
                if (sender) {
                    this.incrementUnreadCount(message.sender);
                    
                    if (document.hidden) {
                        this.showNotification(
                            message.type === 'media' ? 
                                (message.mediaType === 'image' ? '📷 Photo' : '🎥 Video') : 
                                message.text,
                            sender.photo,
                            sender.name
                        );
                    }
                }
            }
        }, Math.random() * 5000 + 1000); // Random delay 1-6 seconds
    }

    incrementUnreadCount(senderId) {
        if (!this.unreadMessages[senderId]) {
            this.unreadMessages[senderId] = 0;
        }
        this.unreadMessages[senderId]++;
        this.saveAllData();
        this.refreshCurrentView();
    }

    markAsRead(chatId) {
        if (this.unreadMessages[chatId]) {
            delete this.unreadMessages[chatId];
            this.saveAllData();
            this.refreshCurrentView();
        }
    }

    showNotification(message, avatar, senderName) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${senderName}`, {
                body: message,
                icon: avatar || '/default-avatar.png'
            });
        }
        
        // Show in-app notification
        const notification = document.getElementById('notification');
        const notificationAvatar = notification.querySelector('.notification-avatar');
        const notificationName = notification.querySelector('.notification-name');
        const notificationMessage = notification.querySelector('.notification-message');
        
        if (avatar) {
            notificationAvatar.innerHTML = `<img src="${avatar}" alt="Avatar">`;
        } else {
            notificationAvatar.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="#8696a0" d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 13.5C14.8 13.8 14.3 14 14 14H10C9.7 14 9.2 13.8 9 13.5L3 7V9C3 10.1 3.9 11 5 11V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V11C20.1 11 21 10.1 21 9Z"/>
            </svg>`;
        }
        
        notificationName.textContent = senderName;
        notificationMessage.textContent = message;
        
        notification.classList.add('active');
        
        setTimeout(() => {
            notification.classList.remove('active');
        }, 4000);
        
        notification.onclick = () => {
            notification.classList.remove('active');
            // Navigate to chat if needed
        };
    }

    logout() {
        if (confirm('Are you sure you want to log out?')) {
            // Update user status to offline
            if (this.currentUser) {
                this.updateUserStatus(this.currentUser.phone, 'offline');
            }
            
            localStorage.removeItem('whatsapp_current_user');
            this.currentUser = null;
            this.currentChatUser = null;
            this.currentGroup = null;
            this.currentChannel = null;
            this.showLoginScreen();
            
            // Reset form fields
            document.getElementById('phone-number').value = '';
            document.getElementById('password').value = '';
            document.getElementById('verification-code').value = '';
            document.getElementById('user-name').value = '';
            document.getElementById('setup-password').value = '';
            document.getElementById('confirm-password').value = '';
            document.getElementById('message-input').value = '';
            document.getElementById('floating-menu').classList.remove('active');
            document.getElementById('search-container').classList.remove('active');
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new WhatsAppChat();
});
// === Global Chat JavaScript ===

// Replace with your backend URL (must be public!)
const API_BASE_URL = 'https://YOUR_BACKEND_URL/api';
const SOCKET_URL = 'https://YOUR_BACKEND_URL';

let socket = null;
let currentUser = null;
let currentChat = null;
let chats = [];
let messages = [];
let typingTimeout = null;

// App starts here
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
});

async function checkAuthState() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
        currentUser = JSON.parse(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        showMainApp();
        initializeSocket();
    } else {
        showAuthScreen();
    }
}

function showAuthScreen() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userName2').textContent = currentUser.name;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    loadChats();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (socket) socket.disconnect();
    currentUser = null;
    currentChat = null;
    showAuthScreen();
}

function initializeSocket() {
    socket = io(SOCKET_URL, {
        auth: {
            token: localStorage.getItem('token')
        }
    });

    socket.on('connect', () => console.log('✅ Connected to Socket.IO'));
    socket.on('disconnect', () => console.log('❌ Disconnected'));

    socket.on('new_message', (message) => {
        if (currentChat && message.chat === currentChat._id) {
            addMessageToUI(message);
            scrollToBottom();
        }
        updateChatInList(message);
    });

    socket.on('user_typing', (data) => {
        if (currentChat && data.chatId === currentChat._id && data.userId !== currentUser.id) {
            showTypingIndicator(data.isTyping);
        }
    });
}

async function loadChats() {
    try {
        const response = await axios.get(`${API_BASE_URL}/chats`);
        chats = response.data;
        renderChatsList();
    } catch (error) {
        console.error('⚠️ Failed to load chats:', error);
    }
}

function renderChatsList() {
    const chatsList = document.getElementById('chatsList');
    chatsList.innerHTML = chats.map(chat => {
        const other = chat.participants.find(p => p.user._id !== currentUser.id)?.user;
        const chatName = chat.type === 'private' ? other?.name : chat.name;
        return `
            <div class="chat-item" onclick="selectChat('${chat._id}')">
                <div class="avatar">${chatName?.charAt(0).toUpperCase() || 'C'}</div>
                <div class="chat-info">
                    <div class="chat-name">${chatName}</div>
                </div>
            </div>`;
    }).join('');
}

async function selectChat(chatId) {
    currentChat = chats.find(c => c._id === chatId);
    const other = currentChat.participants.find(p => p.user._id !== currentUser.id)?.user;
    document.getElementById('chatName').textContent = other.name;
    document.getElementById('chatAvatar').textContent = other.name.charAt(0).toUpperCase();
    document.getElementById('noChatSelected').style.display = 'none';
    document.getElementById('chatContainer').classList.remove('hidden');
    renderChatsList();
    socket.emit('join_chat', chatId);
    await loadMessages(chatId);
}

async function loadMessages(chatId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/messages/chat/${chatId}`);
        messages = response.data.messages;
        renderMessages();
        scrollToBottom();
    } catch (error) {
        console.error('⚠️ Failed to load messages:', error);
    }
}

function renderMessages() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = messages.map(message => {
        const isOwn = message.sender._id === currentUser.id;
        return `
            <div class="message ${isOwn ? 'own' : ''}">
                <div class="message-bubble">
                    <div>${message.content.text}</div>
                </div>
            </div>`;
    }).join('');
}

function addMessageToUI(message) {
    messages.push(message);
    const container = document.getElementById('messagesContainer');
    const isOwn = message.sender._id === currentUser.id;
    container.insertAdjacentHTML('beforeend', `
        <div class="message ${isOwn ? 'own' : ''}">
            <div class="message-bubble">
                <div>${message.content.text}</div>
            </div>
        </div>`);
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !currentChat) return;

    socket.emit('send_message', {
        chatId: currentChat._id,
        type: 'text',
        content: { text: text }
    });

    input.value = '';
}

function handleTyping() {
    if (!currentChat) return;
    socket.emit('typing_start', currentChat._id);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('typing_stop', currentChat._id);
    }, 1000);
}

function showTypingIndicator(isTyping) {
    const indicator = document.getElementById('typingIndicator');
    indicator.classList.toggle('hidden', !isTyping);
}

function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
}

function updateChatInList(message) {
    const chatIndex = chats.findIndex(c => c._id === message.chat);
    if (chatIndex !== -1) {
        chats[chatIndex].lastMessage = message;
        chats[chatIndex].lastActivity = message.createdAt;
        renderChatsList();
    }
                }
const firebaseConfig = {
  apiKey: "AIzaSyB3U7Vp-HzFxROhnTCu_EoqLv1bOiFhPNI",
  authDomain: "tattoochat-demo.firebaseapp.com",
  projectId: "tattoochat-demo",
  storageBucket: "tattoochat-demo.appspot.com",
  messagingSenderId: "302937531249",
  appId: "1:302937531249:web:3b9f960fea8495315d1b53",
  measurementId: "G-0T2ZNRH6NL"
};

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // Save user profile to Firestore
  function saveProfile(event) {
    event.preventDefault();
    const name = document.getElementById("display-name").value;
    const phone = document.getElementById("phone-number").value;
    
    db.collection("users").doc(phone).set({
      name: name,
      phone: phone,
      online: true,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      alert("Profile saved. You’re now visible to others!");
      loadContacts();
    });
  }

  // Load contacts (other users)
  function loadContacts() {
    db.collection("users").onSnapshot(snapshot => {
      const contactsList = document.getElementById("contacts-list");
      contactsList.innerHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        const contact = document.createElement("div");
        contact.classList.add("contact-item");
        contact.innerHTML = `<strong>${data.name}</strong><br><small>${data.phone}</small>`;
        contactsList.appendChild(contact);
      });
    });
  }
const firebaseConfig = {
  apiKey: "AIzaSyB3U7Vp-HzFxROhnTCu_EoqLv1bOiFhPNI",
  authDomain: "tattoochat-demo.firebaseapp.com",
  projectId: "tattoochat-demo",
  storageBucket: "tattoochat-demo.appspot.com",
  messagingSenderId: "302937531249",
  appId: "1:302937531249:web:3b9f960fea8495315d1b53"
};
