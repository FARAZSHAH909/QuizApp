let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let selectedDifficulty = 'easy'; // Default difficulty
let selectedCategory = ''; // Default category (will be populated)
let userAnswers = [];

// Fetch categories from the Open Trivia Database
async function fetchCategories() {
    try {
        const response = await fetch('https://opentdb.com/api_category.php');
        const data = await response.json();
        const categorySelect = document.getElementById("category");

        // Clear existing options
        categorySelect.innerHTML = '';

        // Populate categories
        data.trivia_categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.innerText = category.name;
            categorySelect.appendChild(option);
        });

        // Set the default category to the first one
        selectedCategory = data.trivia_categories[0].id;
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// Fetch questions from the Open Trivia Database
async function fetchQuestions() {
    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=10&difficulty=${selectedDifficulty}&category=${selectedCategory}&type=multiple`);
        const data = await response.json();
        
        questions = data.results.map((q) => ({
            question: q.question,
            correct_answer: q.correct_answer,
            incorrect_answers: q.incorrect_answers,
        }));
        
        currentQuestionIndex = 0; // Reset question index
        score = 0; // Reset score
        userAnswers = []; // Reset user answers
        document.getElementById("total-questions").innerText = questions.length; // Set total questions
        displayQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}

// Function to display the current question
function displayQuestion() {
    const questionText = document.getElementById("question-text");
    const scoreDisplay = document.getElementById("score");
    const timeDisplay = document.getElementById("time");
    const choicesContainer = document.getElementById("choices");
    const resultsContainer = document.getElementById("results-container");
    const navigation = document.querySelector(".navigation");
    const currentQuestionDisplay = document.getElementById("current-question");

    // Hide results container if it's visible
    resultsContainer.style.display = "none";
    timeDisplay.style.color = 'black'; // Reset color

    if (currentQuestionIndex < questions.length) {
        questionText.innerHTML = questions[currentQuestionIndex].question;
        scoreDisplay.innerText = score;
        currentQuestionDisplay.innerText = currentQuestionIndex + 1; // Update current question

        // Display answer choices
        const choices = [...questions[currentQuestionIndex].incorrect_answers, questions[currentQuestionIndex].correct_answer];
        const shuffledChoices = choices.sort(() => Math.random() - 0.5); // Shuffle choices
        choicesContainer.innerHTML = ""; // Clear previous choices
        shuffledChoices.forEach(choice => {
            const button = document.createElement("button");
            button.innerText = choice;
            button.onclick = () => checkAnswer(choice);
            choicesContainer.appendChild(button);
        });

        startTimer(); // Start timer for the question
    } else {
        clearInterval(timerInterval);
        showResults();
    }
}

// Function to check the user's answer
function checkAnswer(selectedAnswer) {
    // Store user's answer
    userAnswers.push({
        question: questions[currentQuestionIndex].question,
        correct_answer: questions[currentQuestionIndex].correct_answer,
        selected_answer: selectedAnswer,
        all_answers: [...questions[currentQuestionIndex].incorrect_answers, questions[currentQuestionIndex].correct_answer]
    });

    if (selectedAnswer === questions[currentQuestionIndex].correct_answer) {
        score++;
    }
    currentQuestionIndex++;
    displayQuestion();
}

function showCorrectAnswer() {
    const correctAnswer = questions[currentQuestionIndex].correct_answer;
    const choicesButtons = document.querySelectorAll('#choices button');

    // Highlight the correct answer
    choicesButtons.forEach(button => {
        if (button.innerText === correctAnswer) {
            button.style.backgroundColor = 'green'; // Highlight correct answer in green
            button.style.color = 'white'; // Change text color to white for visibility
        }
    });
}

// Add event listener for the show answer icon
document.getElementById("show-answer").onclick = () => showCorrectAnswer();

// Function to show the results at the end
function showResults() {
    const questionText = document.getElementById("question-text");
    const choicesContainer = document.getElementById("choices");
    const scoreDisplay = document.getElementById("score");
    const resultsContainer = document.getElementById("results-container");
    const resultDetails = document.getElementById("result-details");
    const navigation = document.querySelector(".navigation");

    questionText.innerText = `Quiz finished! Your score: ${score}/${questions.length}`;
    choicesContainer.innerHTML = ""; // Clear choices

    // Hide navigation buttons
    navigation.style.display = "none";

    // Display detailed results
    resultDetails.innerHTML = ""; // Clear previous results
    userAnswers.forEach(answer => {
        const resultText = document.createElement('div');
        resultText.classList.add('result-item'); // Add a class for styling
        
        const allAnswers = answer.all_answers.map(opt => {
            const isCorrect = opt === answer.correct_answer;
            const isSelected = opt === answer.selected_answer;
            const icon = isCorrect ? '<i class="fas fa-check-circle" style="color: green;"></i>' : 
                         (isSelected ? '<i class="fas fa-times-circle" style="color: red;"></i>' : '');
            return `${icon} ${opt}`;
        }).join('<br>');

        resultText.innerHTML = `
            <strong>Question:</strong> ${answer.question}<br>
            <strong>Options:</strong><br>${allAnswers}<br>
            <strong>Correct Answer:</strong> <span style="color:green; font-weight: bold;">${answer.correct_answer}</span>
            <hr/>
        `;
        resultDetails.appendChild(resultText);
    });

    resultsContainer.style.display = "block"; // Show results container
}

// Timer function
function startTimer() {
    let timeLeft = 30; // Fixed time for each question
    const timeDisplay = document.getElementById("time");
    timeDisplay.innerText = timeLeft;
    timeDisplay.style.color = 'black'; // Reset color

    clearInterval(timerInterval); // Clear any existing timer

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timeDisplay.innerText = timeLeft;

            // Change the color to red when there are 5 seconds left
            if (timeLeft <= 5) {
                timeDisplay.style.color = 'red';
            }
        } else {
            clearInterval(timerInterval);
            currentQuestionIndex++; // Move to the next question when time runs out
            displayQuestion(); // Display the next question
        }
    }, 1000);
}

// Event listeners for buttons and difficulty/category selection
document.getElementById("next-button").addEventListener("click", () => {
    currentQuestionIndex++;
    displayQuestion();
});

document.getElementById("prev-button").addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
});

document.getElementById("difficulty").addEventListener("change", (event) => {
    selectedDifficulty = event.target.value;
    fetchQuestions(); // Fetch new questions based on difficulty
});

document.getElementById("category").addEventListener("change", (event) => {
    selectedCategory = event.target.value;
    fetchQuestions(); // Fetch new questions based on category
});

// Retry quiz button
document.getElementById("retry-button").addEventListener("click", () => {
    fetchQuestions(); // Restart the quiz
});



// Start fetching categories on page load
fetchCategories();
