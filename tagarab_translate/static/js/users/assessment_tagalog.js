

function startSpeechRecognition() {
    // Initialize SpeechRecognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    const modal = document.getElementById('voiceModal');
    const timeoutMessage = document.getElementById('timeoutMessage');
    const retryButton = document.getElementById('retryButton');
    const modalMessage = modal.querySelector('#modalMessage');

    recognition.lang = 'tl-PH'; // Set the language for recognition
    recognition.start();

    let recognitionTimeout; // Timeout reference

    // Show modal and reset timeout/retry button visibility
    recognition.onstart = function () {
        console.log("Speech recognition started.");
        modal.style.display = 'flex'; // Show the modal
        modal.style.justifyContent = 'center'; // Center horizontally
        modal.style.alignItems = 'center'; // Center vertically
        modalMessage.textContent = "Please speak into the microphone..."; // Initial message
        timeoutMessage.style.display = 'none'; // Hide timeout message
        retryButton.style.display = 'none'; // Hide retry button
    };

    // Handle recognition result
    recognition.onresult = function (event) {
        clearTimeout(recognitionTimeout); // Clear timeout
        const speechResult = event.results[0][0].transcript.trim();
        console.log("Recognized text:", speechResult);

        let matched = false;

        // Match the result with available options
        document.querySelectorAll('.options input').forEach(input => {
            if (input.value.toLowerCase() === speechResult.toLowerCase()) {
                input.checked = true; // Check the matching input
                matched = true;
            }
        });

        if (matched) {
            closeModal(); // Close modal on success
        } else {
            console.log("No match found. Showing error message.");
            showRetryMessage(""); // Show retry for no match
        }
    };

    // Handle recognition errors
    recognition.onerror = function (event) {
        console.error("Recognition error:", event.error);
        clearTimeout(recognitionTimeout);
        showRetryMessage(""); // Show retry on error
    };

    // Handle recognition timeout
    recognitionTimeout = setTimeout(() => {
        console.warn("Speech recognition timed out.");
        recognition.stop(); // Stop recognition
        showRetryMessage(""); // Show retry on timeout
    }, 10000);

    // Function to handle error or retry message
    function showRetryMessage(errorText) {
        modalMessage.textContent = errorText; // Replace modal message with error
        timeoutMessage.style.display = 'block'; // Show timeout message
        retryButton.style.display = 'block'; // Show retry button
        console.log("Retry message and button displayed.");
    }
}


function retrySpeechRecognition() {
    console.log("Retrying speech recognition...");
    const modal = document.getElementById('voiceModal');
    const timeoutMessage = document.getElementById('timeoutMessage');
    const retryButton = document.getElementById('retryButton');
    const modalMessage = modal.querySelector('#modalMessage');

    // Reset modal content to the default state
    timeoutMessage.style.display = 'none'; // Hide timeout message
    retryButton.style.display = 'none'; // Hide retry button
    modalMessage.textContent = "Please speak into the microphone..."; // Reset initial message

    // Restart speech recognition
    startSpeechRecognition();
}




function closeModal() {
    const modal = document.getElementById('voiceModal');
    modal.style.display = 'none'; // Hide modal
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
  // Hide all questions except the current one
  questions.forEach((question, i) => {
      question.style.display = i === index ? 'block' : 'none';
  });

  // Back arrow: always visible but disabled on the first question
  const backArrow = document.querySelector('.fa-arrow-left');
  if (index === 0) {
      backArrow.style.opacity = '0.5'; // Gray out the arrow
      backArrow.style.pointerEvents = 'none'; // Disable click
  } else {
      backArrow.style.opacity = '1';
      backArrow.style.pointerEvents = 'auto'; // Enable click
  }

  // Forward arrow: behaves differently on the last question
  const nextArrow = document.querySelector('.fa-arrow-right');
  if (index === questions.length - 1) {
      nextArrow.style.color = 'green'; // Change color to green
      nextArrow.setAttribute('title', 'Submit'); // Add tooltip
      nextArrow.onclick = () => document.getElementById('assessmentForm').submit(); // Submit on click
  } else {
      nextArrow.style.color = 'black'; // Default color
      nextArrow.setAttribute('title', 'Next'); // Reset tooltip
      nextArrow.onclick = goToNextQuestion; // Navigate to the next question
  }

  // Hide the regular submit button for visual consistency
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
