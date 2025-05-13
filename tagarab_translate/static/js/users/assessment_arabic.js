function normalizeArabicText(text) {

    return text
        .replace(/[\u064B-\u065F]/g, '') 
        .replace(/أ|إ|آ/g, 'ا') 
        .replace(/ة/g, 'ه') 
        .replace(/ئ|ي/g, 'ى') 
        .replace(/ؤ/g, 'و'); 
}

function getSimilarity(a, b) {

    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
    }
    const distance = dp[m][n];
    return 1 - distance / Math.max(m, n);
}
function startSpeechRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    const modal = document.getElementById('voiceModal');
    const timeoutMessage = document.getElementById('timeoutMessage');
    const retryButton = document.getElementById('retryButton');
    const modalMessage = modal.querySelector('#modalMessage');
    const confirmButton = document.getElementById('confirmButton'); 

    recognition.lang = 'ar';
    recognition.start();

    let recognitionTimeout;

    recognition.onstart = function () {
        console.log("Speech recognition started.");
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modalMessage.textContent = "Please speak into the microphone...";
        timeoutMessage.style.display = 'none';
        retryButton.style.display = 'none';
        confirmButton.style.display = 'none'; 
    };

    recognition.onresult = function (event) {
        clearTimeout(recognitionTimeout);
        const speechResult = normalizeArabicText(event.results[0][0].transcript.trim());
        console.log("Recognized text:", speechResult);

        let matched = false;
        let bestMatch = { similarity: 0, input: null };

 
        document.querySelectorAll('.options input').forEach(input => {
            const optionText = normalizeArabicText(input.value);
            const similarity = getSimilarity(speechResult, optionText);

            if (similarity > bestMatch.similarity) {
                bestMatch = { similarity, input };
            }

            if (similarity >= 0.8) { 
                input.checked = true;
                matched = true;
            }
        });

        if (matched) {
            console.log("Match found:", bestMatch.input?.value);
            closeModal();
        } else {
            console.log("No exact match. Closest match:", bestMatch.input?.value);
            if (bestMatch.similarity > 0.6) {
                modalMessage.textContent = `Did you mean: "${bestMatch.input?.value}"?`;
                confirmButton.style.display = 'block'; 
                confirmButton.onclick = () => {
                    
                    bestMatch.input.checked = true;
                    closeModal();
                };
            } else {
                showRetryMessage("No match found. Please try again.");
            }
        }
    };

    recognition.onerror = function (event) {
        console.error("Recognition error:", event.error);
        clearTimeout(recognitionTimeout);
        showRetryMessage("An error occurred. Please try again.");
    };

    recognitionTimeout = setTimeout(() => {
        console.warn("Speech recognition timed out.");
        recognition.stop();
        showRetryMessage("Recognition timed out. Please try again.");
    }, 10000);

    function showRetryMessage(errorText) {
        modalMessage.textContent = errorText;
        timeoutMessage.style.display = 'block';
        retryButton.style.display = 'block';
        confirmButton.style.display = 'none'; 
        console.log("Retry message displayed.");
    }
}





function retrySpeechRecognition() {
    console.log("Retrying speech recognition...");
    const modal = document.getElementById('voiceModal');
    const timeoutMessage = document.getElementById('timeoutMessage');
    const retryButton = document.getElementById('retryButton');
    const modalMessage = modal.querySelector('#modalMessage');

    timeoutMessage.style.display = 'none';
    retryButton.style.display = 'none';
    modalMessage.textContent = "Please speak into the microphone...";

    startSpeechRecognition();
}

function closeModal() {
    const modal = document.getElementById('voiceModal');
    modal.style.display = 'none';
    console.log('Modal closed.');
}

document.addEventListener("DOMContentLoaded", () => {
  renderQuestion();
});



let actionUrl = '';
let isLogout = false;

function confirmNavigation(event) {
    event.preventDefault();
    actionUrl = event.currentTarget.getAttribute('data-url'); 
    document.getElementById('modalMessage').innerText = 'Are you sure you want to go to ' + actionUrl + '?';
    document.getElementById('confirmationModal').style.display = 'flex';
}

function confirmLogout(event) {
    event.preventDefault();
    isLogout = true; 
    document.getElementById('modalMessage').innerText = 'Are you sure you want to log out?';
    document.getElementById('confirmationModal').style.display = 'flex';
}

document.getElementById('confirmButton').onclick = function() {
    closeConfirmationModal();
    if (isLogout) {
        document.getElementById('logoutForm').submit();
    } else {
        window.location.href = actionUrl; 
    }
}

function closeConfirmationModal() {
    document.getElementById('confirmationModal').style.display = 'none';
    isLogout = false; 
}


let currentQuestionIndex = 0; 
const questions = document.querySelectorAll('.question');
const submitButton = document.getElementById('submitButton'); 

function showQuestion(index) {

questions.forEach((question, i) => {
    question.style.display = i === index ? 'block' : 'none';
});


const backArrow = document.querySelector('.fa-arrow-left');
if (index === 0) {
    backArrow.style.opacity = '0.5'; 
    backArrow.style.pointerEvents = 'none'; 
} else {
    backArrow.style.opacity = '1';
    backArrow.style.pointerEvents = 'auto'; 
}


const nextArrow = document.querySelector('.fa-arrow-right');
if (index === questions.length - 1) {
    nextArrow.style.color = 'green'; 
    nextArrow.setAttribute('title', 'Submit'); 
    nextArrow.onclick = () => document.getElementById('assessmentForm').submit();
} else {
    nextArrow.style.color = 'black'; 
    nextArrow.setAttribute('title', 'Next'); 
    nextArrow.onclick = goToNextQuestion; 
}


submitButton.style.display = 'none';
}


function goToNextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      showQuestion(currentQuestionIndex);
  }
}


function goToPreviousQuestion() {
  if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      showQuestion(currentQuestionIndex);
  }
}


document.addEventListener('DOMContentLoaded', () => showQuestion(currentQuestionIndex));
