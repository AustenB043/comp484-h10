$(function() { // Ensures our code runs after the DOM is ready
  // Initialize and render starting state
  checkAndUpdatePetInfoInHtml();

  // Use a single generic handler for all action buttons
  $(document).on('click', '.action-button', onActionButtonClick);

  // DevTools JS demo bindings
  $('#btn-start-timer').on('click', startDemoTimer);
  $('#btn-stop-timer').on('click', stopDemoTimer);
  $('#btn-run-sample').on('click', runSampleFunction);
  $('#btn-throw-error').on('click', throwUncaughtError);
  $('#btn-throw-caught-error').on('click', throwCaughtError);
  $('#btn-reject-promise').on('click', rejectUnhandledPromise);

  // DevTools DOM demo bindings
  $('#btn-add-item').on('click', onAddListItem);
  $('#btn-update-attr').on('click', onUpdateAttribute);
  $('#btn-remove-item').on('click', onRemoveLastItem);
  $('#btn-replace-html').on('click', onReplaceInnerHtml);
})

// pet_info holds your pet's basic stats
// Required keys: name, weight, happiness. We also add energy to support the new "Sleep" action.
var pet_info = {
  name: "Pico",
  weight: 5,
  happiness: 5,
  energy: 5
};

function onActionButtonClick() {
  // Read per-button deltas from HTML5 data-* attributes via jQuery .data().
  // NOTE: .data() is one of the two unique jQuery methods we are showcasing.
  // It maps data-happiness, data-weight, data-energy attributes into JS values we can read:
  //   <button data-happiness="2" data-weight="-1" ...>
  // Then in JS: $(this).data('happiness') === 2
  var deltaHappiness = Number($(this).data('happiness')) || 0;
  var deltaWeight = Number($(this).data('weight')) || 0;
  var deltaEnergy = Number($(this).data('energy')) || 0;
  var action = String($(this).data('action') || '').toLowerCase();

  // Apply deltas to our pet's stats
  pet_info.happiness += deltaHappiness;
  pet_info.weight += deltaWeight;
  pet_info.energy = (pet_info.energy || 0) + deltaEnergy;

  // Update pet image based on action and manage sleep overlay
  setPetImageForAction(action);

  // Prevent stats from going below zero
  checkAndUpdatePetInfoInHtml();

  // Visual comment from the pet after each action (no alerts/console)
  showPetComment(action);

  // Brief animation on the pet image to give feedback
  animatePet(action);

  // Highlight the active button and remove highlight from its siblings.
  // NOTE: .siblings() is our second unique jQuery method showcased.
  // It selects elements at the same level (same parent) as the clicked button,
  // allowing us to remove the 'active' class from the other buttons in the group.
  $(this).addClass('active').siblings('button').removeClass('active');
  
  // Play corresponding sound effect
  playActionSound(action);
}

function checkAndUpdatePetInfoInHtml() {
  clampPetStatsToMinimumZero();
  updatePetInfoInHtml();
}

function clampPetStatsToMinimumZero() {
  if (pet_info.weight < 0) pet_info.weight = 0;
  if (pet_info.happiness < 0) pet_info.happiness = 0;
  if ((pet_info.energy || 0) < 0) pet_info.energy = 0;
}

// Updates the HTML with the current values in pet_info
function updatePetInfoInHtml() {
  $('.name').text(pet_info.name);
  $('.weight').text(pet_info.weight);
  $('.happiness').text(pet_info.happiness);
  $('.energy').text(pet_info.energy);
}

function showPetComment(action) {
  var msg = '';
  switch (action) {
    case 'treat':
      msg = "Yum! That treat was delicious!";
      break;
    case 'play':
      msg = "That was fun! Let's play again soon!";
      break;
    case 'exercise':
      msg = "Pant pant... I'm getting stronger!";
      break;
    case 'sleep':
      msg = "Zzz... I feel well rested!";
      break;
    default:
      msg = "I'm feeling great!";
  }
  var $comment = $('.pet-comment');
  // Simple fade in/out to show feedback without alerts/console
  $comment.stop(true, true).text(msg).fadeIn(150).delay(900).fadeOut(300);
}

function animatePet(action) {
  var $img = $('.pet-image');
  var className = 'pulse';
  if (action === 'exercise') className = 'shake';
  if (action === 'sleep') className = 'doze';
  // Add the class for a moment, then remove it so it can re-run next time
  $img.addClass(className);
  setTimeout(function() {
    $img.removeClass(className);
  }, 600);
}

function playActionSound(action) {
  // Pause and reset any playing sounds before starting a new one
  var sounds = [
    document.getElementById('sound-eat'),
    document.getElementById('sound-bark'),
    document.getElementById('sound-walk')
  ];
  for (var i = 0; i < sounds.length; i++) {
    if (sounds[i]) {
      try {
        sounds[i].pause();
        sounds[i].currentTime = 0;
      } catch (e) {}
    }
  }
  var toPlay = null;
  if (action === 'treat') toPlay = document.getElementById('sound-eat');
  if (action === 'play') toPlay = document.getElementById('sound-bark');
  if (action === 'exercise') toPlay = document.getElementById('sound-walk');
  // No sound for sleep by design
  if (toPlay) {
    try {
      toPlay.play();
    } catch (e) {
      // Ignore autoplay/permission errors; user interaction should generally allow playback
    }
  }
}

function setPetImageForAction(action) {
  var map = {
    treat: "images/Dog Eating.png",
    play: "images/Dog Playing.png",
    exercise: "images/Dog Exercising.png",
    sleep: "images/Dog Sleeping.png"
  };
  var imgSrc = map[action] || map.play;
  $('.pet-image').attr('src', imgSrc);
  if (action === 'sleep') {
    $('.overlay-zzz').show();
  } else {
    $('.overlay-zzz').hide();
  }
}

// ===============================
// DevTools JavaScript Demo Logic
// ===============================

var demoTimerId = null;
var demoTick = 0;

function startDemoTimer() {
  if (demoTimerId !== null) return;
  logJsDemo("Timer started");
  demoTimerId = setInterval(tickTimer, 1000);
}

function stopDemoTimer() {
  if (demoTimerId === null) return;
  clearInterval(demoTimerId);
  demoTimerId = null;
  logJsDemo("Timer stopped");
}

function tickTimer() {
  demoTick += 1;
  // Call stack demo: tickTimer -> doWorkA -> doWorkB
  doWorkA(demoTick);
}

function doWorkA(counter) {
  // Set a conditional breakpoint here in DevTools: break when counter % 5 === 0
  doWorkB(counter * 2);
}

function doWorkB(value) {
  var computed = value + Math.floor(Math.random() * 10);
  if (computed % 7 === 0) {
    // Occasional branch for step-in/over practice
    logJsDemo("Lucky seven hit: " + computed);
  } else {
    logJsDemo("Tick value: " + computed);
  }
}

function runSampleFunction() {
  var payload = { user: "Pico", energy: pet_info.energy, at: Date.now() };
  // Place a regular breakpoint here to inspect 'payload' and scope values
  var result = sampleTransform(payload);
  logJsDemo("Sample result: " + JSON.stringify(result));
}

function sampleTransform(obj) {
  // Demonstrate stepping into/out of functions
  var copy = {
    name: obj.user,
    snapshotEnergy: Number(obj.energy || 0),
    isoTime: new Date(obj.at).toISOString()
  };
  // You may also use the 'debugger' statement when needed during the demo:
  // debugger;
  return copy;
}

function throwUncaughtError() {
  // Uncaught error to show "Pause on exceptions"
  // eslint-disable-next-line no-undef
  notDefinedFunctionCall();
}

function throwCaughtError() {
  try {
    JSON.parse("{ bad json");
  } catch (e) {
    logJsDemo("Caught error: " + e.message);
  }
}

function rejectUnhandledPromise() {
  // Unhandled Promise rejection to show "Pause on exceptions"
  Promise.reject(new Error("Demo unhandled rejection at " + new Date().toLocaleTimeString()));
}

function logJsDemo(message) {
  var $out = $('#js-demo-output');
  var time = new Date().toLocaleTimeString();
  var line = "[" + time + "] " + message;
  var existing = $out.text();
  $out.text(existing ? existing + "\n" + line : line);
}

// ===============================
// DevTools DOM Demo Logic
// ===============================

function onAddListItem() {
  var $list = $('#demo-list');
  var nextId = ($list.children().length + 1);
  var $li = $('<li/>')
    .addClass('demo-item')
    .attr('data-id', String(nextId))
    .text('Item #' + nextId);
  // DOM Subtree Modification breakpoint can pause here
  $list.append($li);
}

function onUpdateAttribute() {
  var $target = $('#dom-target');
  var newStatus = 'updated-' + Date.now();
  // DOM Attribute Modification breakpoint can pause here
  $target.attr('data-status', newStatus);
  $target.find('.dom-target-value').text('(data-status="' + newStatus + '")');
}

function onRemoveLastItem() {
  var $list = $('#demo-list');
  var $last = $list.children().last();
  if ($last.length) {
    // DOM Node Removal breakpoint can pause here
    $last.remove();
  }
}

function onReplaceInnerHtml() {
  var $list = $('#demo-list');
  // Large innerHTML replacement for subtree modification demo
  $list.html(
    '<li class="demo-item" data-id="1a">Replaced A</li>' +
    '<li class="demo-item" data-id="2a">Replaced B</li>' +
    '<li class="demo-item" data-id="3a">Replaced C</li>'
  );
}