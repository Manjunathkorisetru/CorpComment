const textareaEl = document.querySelector(".form__textarea");
const counterEl = document.querySelector(".counter");
const formEl = document.querySelector(".form");
const feedbackListEl = document.querySelector(".feedbacks");
const submitBtnEl = document.querySelector(".submit-btn");
const spinnerEl = document.querySelector(".spinner");
const MAX_CHARS = textareaEl.getAttribute("maxlength");
const hashtagListEl = document.querySelector(".hashtags");
const BASE_API_URL = "https://bytegrad.com/course-assets/js/1/api";

const renderFeedbackItem = (feedbackItem) => {
  const feedbackItemHTML = `
      <li class="feedback">
          <button class="upvote">
              <i class="fa-solid fa-caret-up upvote__icon"></i>
              <span class="upvote__count">${feedbackItem.upvoteCount}</span>
          </button>
          <section class="feedback__badge">
              <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
          </section>
          <div class="feedback__content">
              <p class="feedback__company">${feedbackItem.company}</p>
              <p class="feedback__text">${feedbackItem.text}</p>
          </div>
          <p class="feedback__date">${
            feedbackItem.daysAgo === 0 ? "NEW" : `${feedbackItem.daysAgo}d`
          }</p>
      </li>
  `;

  // insert new feedback item in list
  feedbackListEl.insertAdjacentHTML("beforeend", feedbackItemHTML);
};

textareaEl.addEventListener("input", (e) => {
  const target = e.target;
  const currentLength = target.value.length;
  const remaining = MAX_CHARS - currentLength;
  counterEl.textContent = remaining;
});

const showVisualIndicator = (text) => {
  formEl.classList.add(text);
  setTimeout(() => {
    formEl.classList.remove(text);
  }, 2000);
};

formEl.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = textareaEl.value;

  if (text.includes("#") && text.length >= 5) {
    showVisualIndicator("form--valid");
  } else {
    showVisualIndicator("form--invalid");
    return;
  }
  const hashtag = text.split(" ").find((word) => word.includes("#"));
  const company = hashtag.substring(1);
  const badgeLetter = company.substring(0, 1).toUpperCase();
  const upvoteCount = 0;
  const daysAgo = 0;
  const feedbackItem = {
    upvoteCount: upvoteCount,
    company: company,
    badgeLetter: badgeLetter,
    daysAgo: daysAgo,
    text: text,
  };

  renderFeedbackItem(feedbackItem);

  fetch(`${BASE_API_URL}/feedbacks`, {
    method: "POST",
    body: JSON.stringify(feedbackItem),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        console.log("Something went wrong");
        return;
      }

      console.log("Successfully submitted");
    })
    .catch((error) => console.log(error));

  textareaEl.value = "";
  submitBtnEl.blur();
  counterEl.textContent = MAX_CHARS;
});

feedbackListEl.addEventListener("click", (event) => {
  {
    const clickedEl = event.target;
    const upvoteIntention = clickedEl.className.includes("upvote");

    if (upvoteIntention) {
      const upvoteBtnEl = clickedEl.closest(".upvote");

      upvoteBtnEl.disabled = true;

      const upvoteCountEl = upvoteBtnEl.querySelector(".upvote__count");

      let upvoteCount = +upvoteCountEl.textContent;

      upvoteCountEl.textContent = ++upvoteCount;
    } else {
      clickedEl.closest(".feedback").classList.toggle("feedback--expand");
    }
  }
});

hashtagListEl.addEventListener("click", (event) => {
  const clickedEl = event.target;

  if (clickedEl.className === "hashtags") return;

  const companyNameFromHashtag = clickedEl.textContent
    .substring(1)
    .toLowerCase()
    .trim();

  feedbackListEl.childNodes.forEach((childNode) => {
    if (childNode.nodeType === 3) return;
    const companyNameFromFeedbackItem = childNode
      .querySelector(".feedback__company")
      .textContent.toLowerCase()
      .trim();

    if (companyNameFromHashtag !== companyNameFromFeedbackItem) {
      childNode.remove();
    }
  });
});

fetch(`${BASE_API_URL}/feedbacks`)
  .then((response) => response.json())
  .then((data) => {
    spinnerEl.remove();
    data.feedbacks.forEach((feedbackItem) => renderFeedbackItem(feedbackItem));
  })
  .catch((error) => {
    feedbackListEl.textContent = `Failed to fetch feedback items. Error message: ${error.message}`;
  });
