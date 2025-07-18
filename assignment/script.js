document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const REWARD_AMOUNT = 100; // Configurable reward value
    const AD_COOLDOWN_SECONDS = 10; // Cooldown in seconds

    // --- DOM Elements ---
    const coinBalanceEl = document.getElementById('coin-balance');
    const rewardAdBtn = document.getElementById('reward-ad-btn');
    const characterEl = document.getElementById('character');

    const adModal = document.getElementById('ad-modal');
    const adTimerEl = document.getElementById('ad-timer');

    const messageModal = document.getElementById('message-modal');
    const messageTitleEl = document.getElementById('message-title');
    const messageTextEl = document.getElementById('message-text');
    const messageCloseBtn = document.getElementById('message-close-btn');

    // --- Game State ---
    let coinBalance = 0;
    let isAdPlaying = false;
    let cooldownInterval = null;
    let cooldownEndTime = 0;

    // --- Mock Ad Network (Simulates a third-party ad provider) ---
    const mockAdNetwork = {
        /**
         * Simulates requesting and showing an interstitial ad.
         * @returns {Promise<Object>} Resolves on successful ad view, rejects on failure.
         */
        showInterstitialAd: () => {
            console.log("Requesting ad from network...");
            return new Promise((resolve, reject) => {
                // Simulate network latency
                setTimeout(() => {
                    // 80% chance of success, 20% chance of failure
                    const isAdAvailable = Math.random() < 0.8; 

                    if (isAdAvailable) {
                        console.log("Ad available, showing now.");
                        resolve({ status: 'success' });
                    } else {
                        console.error("Ad not available from network.");
                        reject({ reason: 'No ad inventory available.' });
                    }
                }, 1500); // 1.5 second simulated load time
            });
        }
    };

    // --- Functions ---

    /** Updates the coin balance in the UI */
    const updateCoinBalance = () => {
        coinBalanceEl.textContent = coinBalance;
    };

    /** Shows a message modal (for success or error) */
    const showMessage = (title, text, isError = false) => {
        messageTitleEl.textContent = title;
        messageTextEl.textContent = text;
        messageTitleEl.style.color = isError ? '#e94560' : '#4caf50';
        messageModal.style.display = 'flex';
    };

    /** Handles the main ad reward button click */
    const handleRewardAdClick = async () => {
        if (isAdPlaying || Date.now() < cooldownEndTime) {
            console.log("Ad request blocked: ad already playing or in cooldown.");
            return;
        }

        isAdPlaying = true;
        rewardAdBtn.disabled = true;
        rewardAdBtn.querySelector('span:last-child').textContent = 'Loading Ad...';

        try {
            await mockAdNetwork.showInterstitialAd();
            
            // Ad loaded successfully, now show it
            adModal.style.display = 'flex';
            
            // Simulate the ad view duration (e.g., 5 seconds)
            let adTimeLeft = 5;
            adTimerEl.textContent = `Ad closes in ${adTimeLeft}s`;
            const adViewInterval = setInterval(() => {
                adTimeLeft--;
                adTimerEl.textContent = `Ad closes in ${adTimeLeft}s`;
                if (adTimeLeft <= 0) {
                    clearInterval(adViewInterval);
                    adModal.style.display = 'none';
                    grantReward();
                }
            }, 1000);

        } catch (error) {
            // Ad failed to load
            console.error("Ad failed to load:", error.reason);
            showMessage("Ad Not Available", "Sorry, an ad could not be loaded. Please try again later.", true);
            resetAdButton();
        }
    };

    /** Grants the reward to the player */
    const grantReward = () => {
        coinBalance += REWARD_AMOUNT;
        updateCoinBalance();
        console.log(`Reward granted: ${REWARD_AMOUNT} coins. New balance: ${coinBalance}`);
        showMessage("Reward Granted!", `You have received ${REWARD_AMOUNT} coins.`);
        startCooldown();
        isAdPlaying = false;
    };

    /** Resets the ad button to its default state */
    const resetAdButton = () => {
        isAdPlaying = false;
        rewardAdBtn.disabled = false;
        rewardAdBtn.querySelector('span:last-child').textContent = `Watch Ad for ${REWARD_AMOUNT} Coins`;
    };

    /** Starts the cooldown timer */
    const startCooldown = () => {
        cooldownEndTime = Date.now() + AD_COOLDOWN_SECONDS * 1000;
        rewardAdBtn.disabled = true;
        
        cooldownInterval = setInterval(() => {
            const now = Date.now();
            const timeLeft = Math.ceil((cooldownEndTime - now) / 1000);
            
            if (timeLeft > 0) {
                rewardAdBtn.querySelector('span:last-child').textContent = `Next ad in ${timeLeft}s`;
            } else {
                clearInterval(cooldownInterval);
                resetAdButton();
            }
        }, 1000);
    };
    
    /** Handles clicking the character */
    const handleCharacterClick = () => {
        coinBalance += 1;
        updateCoinBalance();
        // Add a simple click effect
        characterEl.style.transform = 'scale(0.9)';
        setTimeout(() => characterEl.style.transform = 'scale(1)', 100);
    };

    // --- Event Listeners ---
    rewardAdBtn.addEventListener('click', handleRewardAdClick);
    characterEl.addEventListener('click', handleCharacterClick);
    messageCloseBtn.addEventListener('click', () => {
        messageModal.style.display = 'none';
    });

    // --- Initial Setup ---
    updateCoinBalance();
});