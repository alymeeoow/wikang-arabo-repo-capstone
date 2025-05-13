



document
    .getElementById("sourceLang")
    .addEventListener("change", updateTargetLang);
document
    .getElementById("targetLang")
    .addEventListener("change", updateSourceLang);

function updateTargetLang() {
    const sourceLang = document.getElementById("sourceLang").value;
    const targetLang = document.getElementById("targetLang");
    if (sourceLang === "tl") {
        targetLang.value = "ar";
    } else if (sourceLang === "ar") {
        targetLang.value = "tl";
    }
}

function updateSourceLang() {
    const targetLang = document.getElementById("targetLang").value;
    const sourceLang = document.getElementById("sourceLang");
    if (targetLang === "tl") {
        sourceLang.value = "ar";
    } else if (targetLang === "ar") {
        sourceLang.value = "tl";
    }
}

const synonymDictionary = {}; 

async function translateText(saveToHistory = true) {
    const inputText = document.getElementById("inputText").value.trim();

    let sourceLang, targetLang, introPhrase, introVoiceLang, translationVoiceLang;
    if (translationMode === 'tl-ar') {
        sourceLang = 'tl';  
        targetLang = 'ar';  
        introPhrase = "Ang pagsasalin para sa salitang ito ay";  
        introVoiceLang = "Filipino Female";  
        translationVoiceLang = "Arabic Male";  
    } else if (translationMode === 'ar-tl') {
        sourceLang = 'ar';  
        targetLang = 'tl'; 
        introPhrase = "الترجمة لهذه الكلمة هي"; 
        introVoiceLang = "Arabic Male";  
        translationVoiceLang = "Filipino Female"; 
    }

    if (!inputText) {
        document.getElementById("outputText").value = "Please enter text to translate.";
        return;
    }

    try {
       
        const translatedText = await fetchTranslation(inputText, sourceLang, targetLang);
        const alternatives = await fetchEnglishAlternatives(inputText, sourceLang);

     
        document.getElementById("outputText").value = translatedText;
        document.getElementById("outputText2").value = alternatives.length > 0 
            ? alternatives.join("\n") 
            : "No English alternatives available";

    
        if (saveToHistory) {
            await saveTranslationToHistory(inputText, translatedText, sourceLang, targetLang);
        }


        speakIntroAndTranslation(introPhrase, introVoiceLang, translatedText, translationVoiceLang);

    } catch (error) {
        console.error("Translation error:", error);
        document.getElementById("outputText").value = "Translation failed, please try again.";
    }
}

document.getElementById("inputText").addEventListener("input", autoDetectLanguage);

function autoDetectLanguage() {
    const inputText = document.getElementById("inputText").value.trim();
    const arabicPattern = /[\u0600-\u06FF]/; 
    const tagalogPattern = /^[a-zA-ZñÑ\s]+$/; 
    const sourceLangElement = document.getElementById("sourceLang");
    const targetLangElement = document.getElementById("targetLang");
    const translationModeElement = document.getElementById("translationMode");

    if (arabicPattern.test(inputText)) {
       
        translationMode = 'ar-tl';
        sourceLangElement.value = 'ar';
        targetLangElement.value = 'tl';

       
        translationModeElement.value = 'ar-tl';

        console.log("Mode changed to Arabic to Tagalog");
    } else if (tagalogPattern.test(inputText)) {
       
        translationMode = 'tl-ar';
        sourceLangElement.value = 'tl';
        targetLangElement.value = 'ar';

      
        translationModeElement.value = 'tl-ar';

        console.log("Mode changed to Tagalog to Arabic");
    } else {
        console.log("Unable to detect language. Keeping current mode.");
    }
}




function getCSRFToken() {
    const name = "csrftoken";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split("=");
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return "";
}

async function fetchTranslation(text, sourceLang, targetLang) {
    const apiUrl = "/api_translate/";

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(), 
        },
        body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: "text"
        }),
    });

    if (!response.ok) {
        throw new Error("Backend API request failed with status: " + response.status);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText || "No translation available";
}

async function fetchEnglishAlternatives(text, sourceLang) {
    const apiUrl = "/api_translate/";

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(), 
        },
        body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: "en", 
            format: "text"
        }),
    });

    if (!response.ok) {
        throw new Error("Backend API request failed with status: " + response.status);
    }

    const data = await response.json();
    const englishTranslation = data.data.translations[0].translatedText;

    return [englishTranslation]; 
}


function getCSRFToken() {
    const name = "csrftoken";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split("=");
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return "";
}



function getLocalSynonyms(word, sourceLang) {
    if (sourceLang === 'tl' && synonymDictionary[word]) {
        return synonymDictionary[word];
    }
    return [];
}





function addToHistory(input, output, sampleConversation) {
    const historyContainer = document.getElementById("history");
    const historyItem = document.createElement("div");
    historyItem.classList.add("history-item");

    const currentDate = new Date().toLocaleDateString();

    historyItem.innerHTML = `
    <div class="date">${currentDate}</div>
    <div class="input">${input}</div>
    `;

    historyItem.setAttribute("data-input", input);
    historyItem.setAttribute("data-output", output);
    historyItem.setAttribute("data-conversation", sampleConversation);

    historyItem.addEventListener("click", fillTextboxesFromHistory);

    historyContainer.prepend(historyItem);
}

function fillTextboxesFromHistory(event) {
    const input = event.currentTarget.getAttribute("data-input");
    const output = event.currentTarget.getAttribute("data-output");
    const conversation = event.currentTarget.getAttribute("data-conversation");

    document.getElementById("inputText").value = input;
    document.getElementById("outputText").value = output;
    document.getElementById("outputText2").value = conversation;
}

function syncVolume(controlId, counterpartId) {
    const volumeValue = document.getElementById(controlId).value;
    document.getElementById(counterpartId).value = volumeValue;
    console.log("Volume:", volumeValue); 
  }
  

  function speakText(textAreaId, langSelectId, volumeControlId) {
    const text = document.getElementById(textAreaId).value.trim();
    const lang = document.getElementById(langSelectId).value;
    const volume = parseFloat(document.getElementById(volumeControlId).value) || 1.0; 
  
    if (!text) {
      console.error('No text provided for speech synthesis.');
      return;
    }
  
    let voiceLang = null;
  

    if (lang === "tl") {
      voiceLang = "Filipino Female";
    } else if (lang === "ar") {
      voiceLang = "Arabic Male";
    }
  
    if (voiceLang) {
      
      responsiveVoice.speak(text, voiceLang, { volume: volume });
  
      console.log("Speaking with volume:", volume);  
    } else {
      console.error(`Unsupported language: ${lang}`);
      alert(`Unsupported language: ${lang}`);
    }
  }

  function startSpeechRecognitionModal() {
  
    const modal = document.getElementById("speakModal");
    modal.querySelector('.modal-body').innerHTML = `<p>Please speak into the microphone...</p>`;
    modal.style.display = "block";

    startSpeechRecognition();  
}

let recognitionTimeout; // Timeout for speech recognition
let processingTimeout; // Timeout for processing final input
let finalTranscript = ""; // Store the final recognized transcript

function startSpeechRecognition() {
    resetSpeechRecognition(); // Ensure any previous recognition is aborted

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error("Speech recognition not supported in this browser.");
        return;
    }

    recognition = new SpeechRecognition();
    const selectedSourceLang = document.getElementById("sourceLang").value;
    recognition.lang = selectedSourceLang;

    recognition.continuous = true; // Allow continuous speech recognition
    recognition.interimResults = false; // Use only final results

    // Start the recognition
    recognition.start();

    // Reset the timeout for waiting after speech recognition ends
    resetRecognitionTimeout();

    recognition.onresult = function (event) {
        // Clear the processing timeout to wait for new input
        clearTimeout(processingTimeout);

        // Capture all transcripts
        for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalTranscript += " " + event.results[i][0].transcript.trim();
            }
        }
        console.log("Recognized text so far:", finalTranscript);

        // Restart the 3-second processing delay
        processingTimeout = setTimeout(() => {
            recognition.stop(); // Stop listening after a pause
            processRecognizedText(finalTranscript.trim(), selectedSourceLang);
        }, 3000); // 3-second delay to process input after the last word
    };

    recognition.onerror = function (event) {
        console.error("Speech recognition error:", event.error);
        showTryAgainMessage();
        resetSpeechRecognition();
    };

    recognition.onend = function () {
        console.log("Speech recognition ended.");
        clearTimeout(recognitionTimeout);
        if (!finalTranscript || finalTranscript.length === 0) {
            showTryAgainMessage();
        }
    };
}

// Reset the timeout to ensure recognition continues until stopped manually
function resetRecognitionTimeout() {
    clearTimeout(recognitionTimeout);
    recognitionTimeout = setTimeout(() => {
        console.warn("Speech recognition timed out. Please try again.");
        recognition.stop();
        showTryAgainMessage();
    }, 15000); // Set timeout to 15 seconds
}

// Process the final recognized text after the 3-second wait
function processRecognizedText(transcript, sourceLang) {
    if (transcript && transcript.length > 0) {
        console.log("Final processed transcript:", transcript);
        document.getElementById("inputText").value = transcript;
        translateText(); // Call the translation function
        closeSpeakModal(); // Close the modal
    } else {
        console.log("No final transcript to process.");
        showTryAgainMessage();
    }
}



function analyzeTranscript(transcript, sourceLang) {
    if (sourceLang === "tl") { 
      
        if (/[\u0600-\u06FF]/.test(transcript)) {
          
            return convertArabicToTagalog(transcript); 
        }
    } else if (sourceLang === "ar") { 
        
        if (/^[A-Za-z]+$/.test(transcript)) {
            return convertTagalogToArabic(transcript); 
        }
    }
    
    return transcript; 
}


function convertArabicToTagalog(arabicText) {
   
    return arabicText; 
}

function convertTagalogToArabic(tagalogText) {
   
    return tagalogText;
}


function showTryAgainMessage() {
    const modal = document.getElementById("speakModal");
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `<p style="color:red;">We didn't get that. Please click below to try again.</p>
                           <button onclick="retrySpeechRecognition()">Try Again</button>`;
}

function retrySpeechRecognition() {
    // Reset the modal content back to the original state
    const modal = document.getElementById("speakModal");
    modal.querySelector('.modal-body').innerHTML = `<p>Please speak into the microphone...</p>`;
    
    // Start speech recognition again
    startSpeechRecognition();
}

function closeSpeakModal() {
    const modal = document.getElementById("speakModal");
    modal.style.display = "none";
    resetSpeechRecognition(); 
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("visible");
}

function showLoginModal() {
    window.location.href = "login.html";
}

function setVolume() {
    const volume = parseFloat(document.getElementById("volumeSlider").value);
    const utterance = new SpeechSynthesisUtterance();
    utterance.volume = volume;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}





function listVoices() {
    const voices = speechSynthesis.getVoices();
    voices.forEach((voice) => {
        console.log(`Name: ${voice.name}, Lang: ${voice.lang}`);
    });
}


window.speechSynthesis.onvoiceschanged = listVoices;


function detectLanguageAndTranslate() {
    const inputText = document.getElementById("inputText").value.trim();
    
   
    const detectedLang = franc(inputText);
    
    let sourceLang, targetLang;
    
 
    if (detectedLang === 'tl') { 
        sourceLang = 'tl';
        targetLang = 'ar'; 
    } else if (detectedLang === 'ar') { 
        sourceLang = 'ar';
        targetLang = 'tl'; 
    } else {
        alert("Unable to detect language. Please enter Tagalog or Arabic text.");
        return;
    }
    
    
    document.getElementById("sourceLang").value = sourceLang;
    document.getElementById("targetLang").value = targetLang;

   
    translateText();
}


async function suggestWordsFromAPI(inputWord, langCode) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/${langCode}/${inputWord}`;
    
    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                return data.map(entry => entry.word); 
            }
        }
        return null;
    } catch (error) {
        console.error("Error fetching suggestions from the dictionary API:", error);
        return null;
    }
}




let translationMode = 'tl-ar';

function updateMode() {
    resetSpeechRecognition(); 

    const modeSelect = document.getElementById('translationMode').value;
    translationMode = modeSelect;


    if (translationMode === 'tl-ar') {
        document.getElementById('sourceLang').value = 'tl';
        document.getElementById('targetLang').value = 'ar';
    } else if (translationMode === 'ar-tl') {
        document.getElementById('sourceLang').value = 'ar';
        document.getElementById('targetLang').value = 'tl';
    }

 
    const modal = document.getElementById("speakModal");
    modal.querySelector('.modal-body').innerHTML = `<p>Please speak into the microphone...</p>`;
}

document.addEventListener('DOMContentLoaded', () => {
    updateMode();
});

function speakIntroAndTranslation(introPhrase, introVoiceLang, translatedText, translationVoiceLang) {
   
    setTimeout(() => {
        responsiveVoice.speak(introPhrase, introVoiceLang, {
            volume: 1.0,
            onend: function() {
             
                setTimeout(() => {
                    responsiveVoice.speak(translatedText, translationVoiceLang, {
                        volume: 1.0
                    });
                }, 1000); 
            }
        });
    }, 1000);  
}


let recognition; 


function resetSpeechRecognition() {
    if (recognition) {
        recognition.abort();  
    }
    clearTimeout(recognitionTimeout);  
}


async function sendTranslationRequest() {
    const sourceText = document.getElementById('sourceText').value;
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;

    const response = await fetch("{% url 'translate' %}", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify({
            source_text: sourceText,
            source_language: sourceLang,
            target_language: targetLang
        })
    });

    if (response.ok) {
        const data = await response.json();
        document.getElementById('translatedText').innerText = data.translatedText;
    } else {
        console.error('Error in translation:', response.statusText);
    }
}


async function fetchTranslationWithDisambiguation(text, sourceLang, targetLang) {
    const ambiguousWords = {
        "tl": {
            "baka": ["maybe", "cow"]
        }
    };

    if (sourceLang in ambiguousWords) {
        const words = text.split(" ");
        const disambiguatedText = words
            .map(word => {
                if (ambiguousWords[sourceLang][word]) {
               
                    return `${word} (context: ${ambiguousWords[sourceLang][word].join(" or ")})`;
                }
                return word;
            })
            .join(" ");

        text = disambiguatedText;
    }

    return await fetchTranslation(text, sourceLang, targetLang);
}





