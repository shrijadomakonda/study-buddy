const form = document.querySelector('#studyForm');
const topicInput = document.querySelector('#topic');
const notesInput = document.querySelector('#notes');
const results = document.querySelector('#results');
const resultTitle = document.querySelector('#resultTitle');
const explanationBody = document.querySelector('#explanationBody');
const quizQuestions = document.querySelector('#quizQuestions');
const quizFeedback = document.querySelector('#quizFeedback');
const noteCallout = document.querySelector('#noteCallout');

const escapeHtml = (value) => value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const sentencesFrom = (text) => text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
const cleanTopic = (value) => value.trim().replace(/[.!?]+$/, '');

function makeGuide(topic, notes) {
  const safeTopic = escapeHtml(topic);
  const sentences = sentencesFrom(notes);
  const note = sentences.slice(0, 2).join(' ');
  const summary = sentences.slice(0, 3).join(' ');
  const pieces = [
    `<h3>Let’s start with ${safeTopic}.</h3>`,
    `<p>Think of this as building a little map: first get the main idea, then notice how the parts connect, and finally try explaining it in your own words.</p>`,
    `<p class="simple-summary"><b>The big idea:</b> ${safeTopic} is the concept you’re exploring. A good first step is to ask: what is it, how does it work, and where might I see it in real life?</p>`,
    `<p><b>Try this:</b> Explain ${safeTopic} in one sentence without looking at your notes. If you get stuck, find the one word or step that feels fuzzy and focus there first.</p>`
  ];
  if (summary) pieces.splice(2, 0, `<p><b>From your notes:</b> ${escapeHtml(summary)}</p>`);
  explanationBody.innerHTML = pieces.join('');
  noteCallout.hidden = !note;
  noteCallout.textContent = note ? `A detail to remember: ${note}` : '';
}

function buildQuestions(topic, notes) {
  const safeTopic = escapeHtml(topic);
  const lines = sentencesFrom(notes).filter(s => s.length > 20);
  const questions = [
    { prompt: `When you’re learning about ${safeTopic}, what’s the best first move?`, options: ['Memorize every detail right away', 'Find the main idea and how the parts connect', 'Skip the basics and jump to the hardest question'], correct: 1 },
    { prompt: 'If one part still feels confusing, what can you do?', options: ['Find the specific word or step that feels fuzzy', 'Give up on the whole topic', 'Read faster and hope it makes sense'], correct: 0 },
    { prompt: lines.length ? `According to your notes, which statement is mentioned?` : `Which question can help you understand ${safeTopic} better?`, options: lines.length ? [lines[0], 'The topic has no useful details to remember', 'The notes say to avoid asking questions'].map(escapeHtml) : [`How does ${safeTopic} work?`, 'How can I avoid thinking about it?', 'Why should I memorize without understanding?'], correct: 0 }
  ];
  quizQuestions.innerHTML = questions.map((q, qi) => `<div class="question"><h4>${qi + 1}. ${q.prompt}</h4><div class="answers">${q.options.map((option, oi) => `<label class="answer"><input type="radio" name="q${qi}" value="${oi}"><span>${option}</span></label>`).join('')}</div></div>`).join('');
  quizQuestions.dataset.key = questions.map(q => q.correct).join(',');
  quizFeedback.textContent = 'Take your time ✨';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const topic = cleanTopic(topicInput.value);
  if (!topic) { topicInput.focus(); return; }
  const notes = notesInput.value.trim();
  resultTitle.textContent = `Let’s make ${topic} click.`;
  makeGuide(topic, notes);
  buildQuestions(topic, notes);
  results.hidden = false;
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelectorAll('.example').forEach(button => button.addEventListener('click', () => {
  topicInput.value = button.dataset.topic;
  topicInput.focus();
}));

document.querySelector('#checkAnswers').addEventListener('click', () => {
  const key = quizQuestions.dataset.key.split(',').map(Number);
  let answered = 0, score = 0;
  quizQuestions.querySelectorAll('.question').forEach((question, index) => {
    question.querySelectorAll('.answer').forEach((label, optionIndex) => {
      label.classList.remove('correct', 'incorrect');
      const input = label.querySelector('input');
      if (optionIndex === key[index]) label.classList.add('correct');
      if (input.checked) { answered++; if (optionIndex === key[index]) score++; else label.classList.add('incorrect'); }
    });
  });
  if (answered < key.length) {
    quizFeedback.textContent = `You answered ${answered} of ${key.length}. Choose one for each to check your answers.`;
  } else {
    quizFeedback.textContent = score === key.length ? `All ${score} right — look at you! ✨` : `${score} of ${key.length} right. Green shows the answer; every try helps.`;
  }
});

document.querySelector('#startOver').addEventListener('click', () => {
  results.hidden = true;
  form.reset();
  topicInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.querySelector('#howButton').addEventListener('click', () => { document.querySelector('#howPanel').hidden = false; });
document.querySelector('#closeHow').addEventListener('click', () => { document.querySelector('#howPanel').hidden = true; });
