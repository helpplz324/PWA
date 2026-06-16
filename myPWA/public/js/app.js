if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('serviceworker.js')
      .then(reg => console.log('Service Worker registered:', reg))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}

let lessonData = {};
let lessonsLoaded = false;

async function loadLessons() {
  try {
    // Load both lessons.json and nesa_terms.json in parallel
    const [lessonsResponse, nesaResponse] = await Promise.all([
      fetch('lessons.json'),
      fetch('nesa_terms.json')
    ]);
    
    if (!lessonsResponse.ok) {
      throw new Error(`Failed to load lessons.json: ${lessonsResponse.status}`);
    }
    if (!nesaResponse.ok) {
      throw new Error(`Failed to load nesa_terms.json: ${nesaResponse.status}`);
    }
    
    const lessons = await lessonsResponse.json();
    const nesaTerms = await nesaResponse.json();
    
    // Merge NESA terms into lesson data
    lessonData = { ...lessons, ...nesaTerms };
    
    lessonsLoaded = true;
    console.log('Lessons and NESA terms loaded successfully');
  } catch (error) {
    console.error('Failed to load lessons:', error);
    lessonsLoaded = false;
    showLessonsErrorDialog();
  }
}

function showLessonsErrorDialog() {
  const errorContainer = document.getElementById('lessonsErrorContainer');
  if (errorContainer) {
    errorContainer.style.display = 'block';
  } else {
    alert('Error: Unable to load lesson content. Please refresh the page or contact support.');
  }
}

let currentLesson = null;
let lessonStartTime = null;
let timerInterval = null;

function showScreen(screenId, path = "") {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.style.display = "none";
  });
  document.getElementById(screenId).style.display = "block";
  if (path) location.hash = path;
}

function startTimer() {
  lessonStartTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - lessonStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById("timerDisplay").textContent = 
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 100);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startLesson() {
  if (!lessonsLoaded || !Object.keys(lessonData).length) {
    alert("Lessons are still loading. Please wait a moment and try again.");
    return;
  }

  const topic = document.getElementById("topicSelect").value;
  const difficulty = document.getElementById("difficultySelect").value;

  if (!topic || !difficulty) {
    alert("Please select both a topic and difficulty level.");
    return;
  }

  const lessonText = lessonData[topic][difficulty];
  
  currentLesson = {
    topic,
    difficulty,
    text: lessonText,
    startTime: null
  };

  const topicLabel = document.getElementById("topicSelect").options[document.getElementById("topicSelect").selectedIndex].text;
  const difficultyLabel = document.getElementById("difficultySelect").options[document.getElementById("difficultySelect").selectedIndex].text;
  
  document.getElementById("lessonTopic").textContent = topicLabel;
  document.getElementById("lessonDifficulty").textContent = difficultyLabel;
  document.getElementById("lessonText").textContent = lessonText;
  document.getElementById("typingInput").value = "";
  document.getElementById("timerDisplay").textContent = "00:00";

  stopTimer();

  showScreen("lessonScreen", "#/Lesson");
  
  setTimeout(() => {
    startTimer();
    document.getElementById("typingInput").focus();
  }, 100);
}

function submitLesson() {
  stopTimer();
  
  const userText = document.getElementById("typingInput").value;
  const originalText = currentLesson.text;
  
  let correctChars = 0;
  const maxLength = Math.max(userText.length, originalText.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (userText[i] === originalText[i]) {
      correctChars++;
    }
  }
  
  const accuracy = Math.round((correctChars / originalText.length) * 100);
  
  const elapsedSeconds = Math.floor((Date.now() - lessonStartTime) / 1000);
  const minutes = elapsedSeconds / 60;
  
  const wordCount = userText.trim().split(/\s+/).length;
  const wpm = minutes > 0 ? Math.round(wordCount / minutes) : 0;
  
  document.getElementById("completionMessage").textContent = 
    `You completed the ${currentLesson.topic} lesson at Level ${currentLesson.difficulty}.`;
  document.getElementById("wpmDisplay").textContent = wpm;
  document.getElementById("accuracyDisplay").textContent = accuracy + "%";
  
  showScreen("resultsScreen", "#/Results");
}

function quitLesson() {
  stopTimer();
  if (confirm("Are you sure you want to quit? Your progress will not be saved.")) {
    showScreen("homeScreen", "#/");
  }
}

function goHome() {
  stopTimer();
  document.getElementById("topicSelect").value = "";
  document.getElementById("difficultySelect").value = "";
  showScreen("homeScreen", "#/");
}

function tryAgain() {
  goHome();
}

window.addEventListener('DOMContentLoaded', () => {
  // Loads json file
  loadLessons();

  // Home screen buttons
  document.getElementById("startLessonBtn").addEventListener("click", startLesson);

  // Lesson screen buttons
  document.getElementById("submitLessonBtn").addEventListener("click", submitLesson);
  document.getElementById("quitLessonBtn").addEventListener("click", quitLesson);

  // Results screen buttons
  document.getElementById("tryAgainBtn").addEventListener("click", tryAgain);
  document.getElementById("homeBtn").addEventListener("click", goHome);

  // Logo click to go home
  document.getElementById("homeLogo").addEventListener("click", () => goHome());

  // Handle hash-based routing
  const hash = location.hash;
  if (hash === "#/Lesson") {
    showScreen("lessonScreen");
  } else if (hash === "#/Results") {
    showScreen("resultsScreen");
  } else {
    showScreen("homeScreen");
  }

  // Handle back button navigation
  window.addEventListener("hashchange", () => {
    const hash = location.hash;
    if (hash === "#/Lesson") {
      showScreen("lessonScreen");
    } else if (hash === "#/Results") {
      showScreen("resultsScreen");
    } else {
      showScreen("homeScreen");
    }
  });
});
