const main = document.querySelector("#main"),
  game = document.querySelector("#game"),
  question = document.querySelector("#question");
choices = document.querySelectorAll(".choice-text");

const progressText = document.querySelector("#progressText"),
  scoreText = document.querySelector("#score"),
  progressBarView = document.querySelector("#progressBarView"),
  loader = document.querySelector("#loader"),
  playBtn = document.getElementById("playBtn");

let curQuestion = {},
  acceptAnswers = true,
  score = 0;
questionCounter = 0;
availableQuestions = [];

let quesitonsTest = [];
const bonusPoints = 10;
const maxNumOfQuestions = 3;

const username = document.querySelector("#username"),
  saveScoreBtn = document.getElementById("saveScoreBtn"),
  finalScore = document.querySelector("#finalScore"),
  mostRecentScore = localStorage.getItem("mostScore");

const highScoresList = document.querySelector("#highScoresList");
const highScoresDiv = document.querySelector("#highScores");
finalScore.innerText = mostRecentScore;

const selectType = document.getElementById("option");

function getData() {
  let webPath = selectType.value;
  fetch(
    `https://quiz-b65c3-default-rtdb.europe-west1.firebasedatabase.app/${webPath}.json`
  )
    .then((res) => {
      return res.json();
    })
    .then((loadedQuestions) => {
      quesitonsTest = loadedQuestions;
      console.log(quesitonsTest);
      startGame();
    })
    .catch((err) => {
      console.error(err);
    });
}

getData();

function startGame() {
  loader.classList.add("hidden");
  game.classList.remove("hidden");
  questionCounter = 0;
  score = 0;
  scoreText.innerText = score;
  availableQuestions = [...quesitonsTest];
  getNewQuestion();
}

function getNewQuestion() {
  if (availableQuestions.length === 0 || questionCounter >= maxNumOfQuestions) {
    localStorage.setItem("mostScore", score);
    finalScore.innerText = score;
    return (window.location.hash = "endPage");
  }
  questionCounter++;
  progressText.innerText = `${questionCounter}/${maxNumOfQuestions}`;
  progressBarView.style.width = `${
    (questionCounter / maxNumOfQuestions) * 100
  }%`;
  const newQuestIndex = Math.floor(Math.random() * availableQuestions.length);
  curQuestion = availableQuestions[newQuestIndex];
  question.innerHTML = curQuestion.question;

  choices.forEach((elem) => {
    const numQuestion = elem.dataset["num"];
    elem.innerText = curQuestion["choice" + numQuestion];
  });

  availableQuestions.splice(newQuestIndex, 1);
  acceptAnswers = true;
}

choices.forEach((choice) => {
  choice.addEventListener("click", (e) => {
    if (!acceptAnswers) return;

    acceptAnswers = false;
    const selectChoice = e.target;
    const selectedAnswer = selectChoice.dataset["num"];
    let classToApply;
    if (selectedAnswer == curQuestion.answer) {
      classToApply = "correct";
      document.getElementById("correct-sound").play();
      incrementScore(bonusPoints);
      localStorage.setItem("mostScore", score);
    } else {
      classToApply = "incorrect";
      document.getElementById("incorrect-sound").play();
      localStorage.setItem("mostScore", score);
    }
    selectChoice.parentElement.classList.add(classToApply);
    setTimeout(() => {
      selectChoice.parentElement.classList.remove(classToApply);
      getNewQuestion();
    }, 3000);
  });
});

function incrementScore(num) {
  score += num;
  scoreText.innerText = score;
}

const app = {
  pages: [],
  show: new Event("show"),
  init: function () {
    app.pages = document.querySelectorAll(".container");
    document.querySelectorAll("[data-target]").forEach((link) => {
      link.addEventListener("click", app.nav);
    });
    history.replaceState({}, "gamePage", "#gamePage");
    window.addEventListener("hashchange", app.poppin);
  },
  nav: function (e) {
    e.preventDefault();
    let currentPage = e.target.getAttribute("data-target");
    document.querySelector(".active").classList.remove("active");
    document.getElementById(currentPage).classList.add("active");
    history.pushState({}, currentPage, `#${currentPage}`);
    document.getElementById(currentPage).dispatchEvent(app.show);
  },
  poppin: function (e) {
    let hash = location.hash.replace("#", "");
    document.querySelector(".active").classList.remove("active");
    document.getElementById(hash).classList.add("active");
    document.getElementById(hash).dispatchEvent(app.show);
  },
};

username.addEventListener("input", () => {
  saveScoreBtn.disabled = !username.value;
});

const postData = async (url, data) => {
  let res = await fetch(url, {
    method: "POST",
    body: data,
  });

  return await res.text();
};

saveHighScore = (e) => {
  e.preventDefault();

  if (localStorage.getItem("mostScore") && username.value) {
    const score = {
      score: finalScore.innerText,
      name: username.value,
      date: new Date().toJSON(),
    };
    username.value = "";
    postData(
      "https://quiz-b65c3-default-rtdb.europe-west1.firebasedatabase.app/leaders.json",
      JSON.stringify(score)
    );
    return scorePageBtn.click();
  }
};



let resultDask = () => {
  fetch(
    "https://quiz-b65c3-default-rtdb.europe-west1.firebasedatabase.app/leaders.json"
  )
    .then((res) => {
      return res.json();
    })
    .then((loadedQuestions) => {
      if (loadedQuestions) {
        let highScores = Object.values(loadedQuestions);
        highScoresList.innerHTML = highScores
          .map((score) => {
            return `<li class="high-score date-score"> ${new Date(score.date).toLocaleDateString()} ${new Date(score.date).toLocaleTimeString()} </li>
            <li class="high-score"> Игрок:${score.name} заработал ${score.score} очков. </li>`;
          })
          .join("");
        loader.classList.add("hidden");
        highScoresDiv.classList.remove("hidden");
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

document.addEventListener("DOMContentLoaded", app.init);
document.addEventListener("hashchange", startGame);
saveScoreBtn.addEventListener("click", saveHighScore);
selectType.addEventListener("change", getData);
playBtn.addEventListener("click", startGame);

const scorePageBtn = document.querySelector('[data-target="scorePage"]');
scorePageBtn.addEventListener("click", resultDask);
const gamePageBtn = document.querySelectorAll('[data-target="gamePage"]');
gamePageBtn.forEach((btn) => {
  btn.addEventListener("click", startGame);
});
