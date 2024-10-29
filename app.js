let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let selectedDifficulty = 'easy';
let selectedCategory = '';
let userAnswers = [];

// Fetch categories from the Open Trivia Database
async function fetchCategories() {
    try {
        const response = await fetch('https://opentdb.com/api_category.php');
        const data = await response.json();
        const categorySelect = document.getElementById("category");

        categorySelect.innerHTML = ''; // Clear existing options
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        placeholderOption.innerText = "Select Category";
        categorySelect.appendChild(placeholderOption);

        data.trivia_categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.innerText = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// Fetch questions based on selected difficulty and category
async function fetchQuestions() {
    if (!selectedCategory) return; // Don't fetch if no category is selected

    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=10&difficulty=${selectedDifficulty}&category=${selectedCategory}&type=multiple`);
        const data = await response.json();

        questions = data.results.map((q) => ({
            question: q.question,
            correct_answer: q.correct_answer,
            incorrect_answers: q.incorrect_answers,
        }));

        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        document.getElementById("total-questions").innerText = questions.length;
        displayQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}

// Display the current question
function displayQuestion() {
    const questionText = document.getElementById("question-text");
    const scoreDisplay = document.getElementById("score");
    const timeDisplay = document.getElementById("time");
    const choicesContainer = document.getElementById("choices");
    const resultsContainer = document.getElementById("results-container");
    const navigation = document.querySelector(".navigation");
    const currentQuestionDisplay = document.getElementById("current-question");

    resultsContainer.style.display = "none";
    timeDisplay.style.color = 'black';

    if (currentQuestionIndex < questions.length) {
        questionText.innerHTML = questions[currentQuestionIndex].question;
        scoreDisplay.innerText = score;
        currentQuestionDisplay.innerText = currentQuestionIndex + 1;

        const choices = [...questions[currentQuestionIndex].incorrect_answers, questions[currentQuestionIndex].correct_answer];
        const shuffledChoices = choices.sort(() => Math.random() - 0.5);
        choicesContainer.innerHTML = "";
        shuffledChoices.forEach(choice => {
            const button = document.createElement("button");
            button.innerText = choice;
            button.onclick = () => checkAnswer(choice);
            choicesContainer.appendChild(button);
        });

        startTimer();

        // Show navigation buttons only if category is selected
        navigation.style.display = selectedCategory ? "block" : "none";
    } else {
        clearInterval(timerInterval);
        showResults();
    }
}

// Check the user's answer
function checkAnswer(selectedAnswer) {
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

// Show results at the end
function showResults() {
    const questionText = document.getElementById("question-text");
    const choicesContainer = document.getElementById("choices");
    const scoreDisplay = document.getElementById("score");
    const resultsContainer = document.getElementById("results-container");
    const resultDetails = document.getElementById("result-details");
    const navigation = document.querySelector(".navigation");

    questionText.innerText = `Quiz finished! Your score: ${score}/${questions.length}`;
    choicesContainer.innerHTML = "";
    navigation.style.display = "none";

    resultDetails.innerHTML = "";
    userAnswers.forEach(answer => {
        const resultText = document.createElement('div');
        resultText.classList.add('result-item');

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

    resultsContainer.style.display = "block";
}

// Timer function
function startTimer() {
    let timeLeft = 30;
    const timeDisplay = document.getElementById("time");
    timeDisplay.innerText = timeLeft;
    timeDisplay.style.color = 'black';

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timeDisplay.innerText = timeLeft;

            if (timeLeft <= 5) {
                timeDisplay.style.color = 'red';
            }
        } else {
            clearInterval(timerInterval);
            currentQuestionIndex++;
            displayQuestion();
        }
    }, 1000);
}

// Event listeners
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
    fetchQuestions();
});

document.getElementById("category").addEventListener("change", (event) => {
    selectedCategory = event.target.value;
    fetchQuestions();
});

document.getElementById("retry-button").addEventListener("click", () => {
    fetchQuestions();
});

// Start fetching categories on page load
fetchCategories();
