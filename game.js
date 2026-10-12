// # = wall, . = path, C = magic wand, G = enemy, E = castle exit.
// The existing crystal variable names are kept to preserve the collection rules.
// Each row has 11 squares. Change this map to design your own maze!
const originalMaze = [
  "###########",
  "#...#....C#",
  "#.#.#.###.#",
  "#.#...#...#",
  "#.###.#.#.#",
  "#...C...#.#",
  "#.#.###.#.#",
  "#G#...#G..#",
  "#.###.###.#",
  "#C.......E#",
  "###########"
];

// Each level uses the same movement rules, but a different map and goal.
const levels = [
  { name: "The Castle Corridors", seconds: 60, crystals: 3, map: originalMaze },
  { name: "The Forbidden Forest", seconds: 55, crystals: 4, map: [
    "###########",
    "#...C.....#",
    "#.###.###.#",
    "#...#C#G..#",
    "###.#.#.#.#",
    "#C..#...#.#",
    "#.#####.#.#",
    "#...G...#C#",
    "#.#.###.#.#",
    "#G#......E#",
    "###########"
  ] },
  { name: "The Chamber", seconds: 50, crystals: 5, map: [
    "###########",
    "#...#C....#",
    "#.#.#.###.#",
    "#C#...#G..#",
    "#.###.#.#.#",
    "#...C...#C#",
    "#.#.###.#.#",
    "#G#C..#G..#",
    "#.###.###.#",
    "#...G....E#",
    "###########"
  ] }
];
const POINTS_PER_COLLECTIBLE = 10;
// Story and learning are presentation only: maps, targets and timers stay unchanged.
const auditMissions = [
  { title: "Collect the Missing Audit Evidence", label: "Evidence", intro: "Find the missing records before dark magic hides them!", complete: "Audit Evidence Collected! You have gathered the evidence required for your magical audit.", lesson: "Audit evidence helps auditors support their conclusions." },
  { title: "Identify the Financial Risks", label: "Risks", intro: "Track down the risks hidden in the Forbidden Forest!", complete: "Financial Risks Identified! You have successfully discovered the risks hidden in the Forbidden Forest.", lesson: "Risk assessment helps auditors identify areas that require attention." },
  { title: "Complete the Final Audit", label: "Findings", intro: "Gather your final findings and restore the academy's records!", complete: "Final Audit Completed! You have restored the magical academy's financial records.", lesson: "Audit findings help auditors evaluate and report important issues." }
];
// Audit clues turn each existing wand into a small investigation, not a quiz.
const auditClues = [
  [
    { title: "Ollivanders receipt", story: "The academy paid 12 Galleons for training wands.", check: "Match the receipt date, amount and seller to the payment record.", lesson: "A receipt is evidence that supports a recorded purchase." },
    { title: "Gringotts bank statement", story: "The bank lists a 20-Galleon payment for school supplies.", check: "Compare the bank payment with the academy's cash ledger.", lesson: "Independent bank records help check whether recorded payments really happened." },
    { title: "Potions delivery note", story: "The storekeeper signed for 8 boxes of ingredients.", check: "Match the quantity delivered to the order and supplier invoice.", lesson: "Matching the order, delivery and invoice helps confirm a genuine purchase." }
  ],
  [
    { title: "Duplicate payment curse", story: "Two payments use the same invoice number.", check: "Flag both payments and check whether the supplier was paid twice.", lesson: "Duplicate payments may waste money; unique invoice checks reduce the risk." },
    { title: "Missing cash pouch", story: "The ledger says 15 Galleons, but the cash pouch contains only 11.", check: "Recount and compare receipts and payments before deciding what happened.", lesson: "A difference is a warning to investigate, not proof of theft." },
    { title: "Vanishing potion stock", story: "The stock record shows 10 bottles; only 7 are on the shelf.", check: "Compare a physical count with stock records and investigate the difference.", lesson: "Stock counts help detect recording errors, loss or missing items." },
    { title: "One-wizard approval spell", story: "The same wizard orders supplies, approves them and pays the bill.", check: "Recommend separate people to approve purchases and make payments.", lesson: "Separating duties makes mistakes or misuse easier to prevent and detect." }
  ],
  [
    { title: "Verify the purchase", story: "A wand invoice and delivery note show the same date and quantity.", check: "Record that the sampled purchase has matching supporting documents.", lesson: "Matching documents support a finding, but one sample does not prove every purchase is correct." },
    { title: "Reconcile the bank", story: "A bank fee appears on the statement but not in the ledger.", check: "Recommend recording the missing fee and checking the updated balance.", lesson: "Reconciliation explains differences between two records." },
    { title: "Report the control weakness", story: "The supplies clerk can still approve their own payments.", check: "Report the risk and recommend an independent approval step.", lesson: "A finding explains the problem, why it matters and what should improve." },
    { title: "Keep the audit trail", story: "A corrected potion entry has no note explaining the change.", check: "Keep the original record plus who changed it, when and why.", lesson: "An audit trail makes changes traceable and helps others review the work." },
    { title: "Prepare the final report", story: "Your evidence and risks are now documented.", check: "Summarise findings, recommend actions and ask the academy to follow up.", lesson: "An audit reports supported conclusions; the academy is responsible for correcting its records." }
  ]
];
function getAuditClue(x, y) {
  let index = 0;
  for (let row = 0; row < mazeMap.length; row++) {
    for (let column = 0; column < mazeMap[row].length; column++) {
      if (mazeMap[row][column] === "C") {
        if (column === x && row === y) return auditClues[levelIndex][index];
        index++;
      }
    }
  }
}
function renderAuditJournal() {
  const journal = document.getElementById("audit-journal");
  journal.innerHTML = "";
  document.getElementById("journal-count").textContent = collected.size + "/" + levels[levelIndex].crystals;
  collected.forEach(function (key) {
    const [x, y] = key.split(",").map(Number);
    const clue = getAuditClue(x, y);
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = clue.title;
    item.appendChild(title);
    const detail = document.createElement("p");
    detail.textContent = clue.story + " Auditor's action: " + clue.check;
    item.appendChild(detail);
    journal.appendChild(item);
  });
}
function showAuditClue(x, y) {
  const clue = getAuditClue(x, y);
  document.getElementById("clue-title").textContent = "📜 " + clue.title;
  document.getElementById("clue-action").textContent = clue.story + " " + clue.check;
  document.getElementById("clue-lesson").textContent = clue.lesson;
  renderAuditJournal();
  showAuditScroll(clue);
}
function renderAuditReport(won) {
  const report = document.getElementById("audit-report");
  report.hidden = !won;
  const list = document.getElementById("audit-report-list");
  list.innerHTML = "";
  if (!won) return;
  auditClues[levelIndex].forEach(function (clue) {
    const item = document.createElement("li");
    item.textContent = clue.title + " — " + clue.lesson;
    list.appendChild(item);
  });
  document.getElementById("report-summary").textContent = levelIndex === 2
    ? "Final recommendation: match purchase documents, reconcile cash and bank balances, separate approval duties, keep an audit trail, and follow up on reported risks. Your 12 clues support the magical audit."
    : "Case file saved. Bring these lessons with you to the next maze.";
}

let levelIndex = 0;
let mazeMap = levels[0].map;
let totalScore = 0;
let levelStartScore = 0; // Restart removes only this level's points.
let levelWon = false;


const maze = document.getElementById("maze");
const timerDisplay = document.getElementById("timer");
const crystalDisplay = document.getElementById("crystals");
const livesDisplay = document.getElementById("lives");
const feedback = document.getElementById("feedback");
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");
const musicButton = document.getElementById("music-button");
const characterScreen = document.getElementById("character-screen");
const houseCards = document.querySelectorAll("[data-house]");
const characterChoices = document.getElementById("character-choices");
let selectedHouse = "";
let selectedCharacter = "";
// Original cartoon portraits: different hair, skin, robe, accessory and initials.
// The same portrait builder is used in the cards, information panel and maze.
const charactersByHouse = {
  Gryffindor: [
    { name: "Harry", initials: "HP", hair: "#251f25", skin: "#e9b790", robe: "#9f3542", style: "glasses" },
    { name: "Hermione", initials: "HG", hair: "#75482f", skin: "#e9b78c", robe: "#ae6358", style: "curls" },
    { name: "Ron", initials: "RW", hair: "#dd6c2c", skin: "#f3c5a5", robe: "#833344", style: "freckles" },
    { name: "Ginny", initials: "GW", hair: "#a83c26", skin: "#f1c29a", robe: "#bb4e31", style: "long" }
  ],
  Slytherin: [
    { name: "Draco Malfoy", initials: "DM", hair: "#eadcab", skin: "#f0caaa", robe: "#316b59", style: "sleek" },
    { name: "Pansy Parkinson", initials: "PP", hair: "#191e2b", skin: "#ddb094", robe: "#517c65", style: "bob" },
    { name: "Blaise Zabini", initials: "BZ", hair: "#282125", skin: "#905c3e", robe: "#234f48", style: "short" },
    { name: "Theodore Nott", initials: "TN", hair: "#513e31", skin: "#d7b695", robe: "#426253", style: "sleek" }
  ],
  Ravenclaw: [
    { name: "Luna Lovegood", initials: "LL", hair: "#eee0a7", skin: "#f3d3b5", robe: "#5475b8", style: "star" },
    { name: "Cho Chang", initials: "CC", hair: "#252532", skin: "#d7ab85", robe: "#345780", style: "long" },
    { name: "Padma Patil", initials: "PP", hair: "#26202d", skin: "#ad784f", robe: "#536fa3", style: "bob" },
    { name: "Terry Boot", initials: "TB", hair: "#9f713f", skin: "#e6ba98", robe: "#2e4b7a", style: "short" }
  ],
  Hufflepuff: [
    { name: "Cedric Diggory", initials: "CD", hair: "#825b3f", skin: "#e3b896", robe: "#9c772f", style: "short" },
    { name: "Nymphadora Tonks", initials: "NT", hair: "#e45ba7", skin: "#f0c5a5", robe: "#b39345", style: "spiky" },
    { name: "Hannah Abbott", initials: "HA", hair: "#dec474", skin: "#f1c4a0", robe: "#997335", style: "long" },
    { name: "Susan Bones", initials: "SB", hair: "#a44d29", skin: "#edbf9e", robe: "#b18a39", style: "freckles" }
  ]
};
function getCharacter() {
  return charactersByHouse[selectedHouse]?.find(character => character.name === selectedCharacter);
}

// One small SVG sprite builder gives every character the same cute chibi style.
// The scarf palette always comes from the selected house, not from a PNG file.
const houseScarves = {
  Gryffindor: ["#812b40", "#e8bd58"],
  Slytherin: ["#23754f", "#dce5e0"],
  Ravenclaw: ["#315a9e", "#b7834f"],
  Hufflepuff: ["#ecc34f", "#26242e"]
};
let spriteNumber = 0; // Unique SVG pattern IDs prevent scarves sharing colours.
function createAvatar(character) {
  const portrait = document.createElement("span");
  portrait.className = "portrait chibi-portrait " + selectedHouse.toLowerCase();
  portrait.setAttribute("role", "img");
  portrait.setAttribute("aria-label", character.name + " chibi wizard, " + selectedHouse + " scarf");
  const [scarf, stripe] = houseScarves[selectedHouse];
  const patternId = "scarf-" + spriteNumber++;
  const longHair = ["long", "curls", "star", "bob"].includes(character.style);
  const hairBack = longHair ? '<path d="M23 39 Q14 9 48 7 Q81 9 74 49 L77 71 Q66 78 60 69 L34 69 Q23 78 19 68Z" fill="' + character.hair + '"/>' : '';
  const bangs = character.style === "spiky"
    ? "M24 29 L23 13 L34 18 L42 6 L52 16 L65 7 L68 20 L76 15 L74 35 L65 27 L55 32 L45 24 L35 33Z"
    : character.style === "sleek" ? "M23 31 Q22 6 48 8 Q74 8 74 32 Q58 20 36 23Z"
    : character.style === "short" ? "M23 29 Q23 7 48 8 Q73 8 74 29 Q48 20 23 29Z"
    : "M22 34 Q18 6 47 7 Q80 6 75 35 L65 25 L58 32 L48 23 L37 32 L29 26Z";
  const glasses = character.style === "glasses" ? '<g fill="none" stroke="#34273c" stroke-width="2"><circle cx="35" cy="39" r="9"/><circle cx="61" cy="39" r="9"/><path d="M44 39 H52"/></g><path d="M54 23 L50 28 L55 28 L52 33" fill="none" stroke="#c07566" stroke-width="1.5"/>' : '';
  const freckles = character.style === "freckles" ? '<g fill="#ae6746"><circle cx="29" cy="47" r="1"/><circle cx="33" cy="48" r="1"/><circle cx="63" cy="48" r="1"/><circle cx="67" cy="47" r="1"/></g>' : '';
  const star = character.style === "star" ? '<path d="M73 18 L75 23 L81 24 L76 28 L77 34 L72 31 L67 34 L68 28 L64 24 L70 23Z" fill="#f7d865" stroke="#9a6d36"/>' : '';
  portrait.innerHTML = '<svg class="chibi-sprite" viewBox="0 0 96 120" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'
    + '<defs><pattern id="' + patternId + '" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(25)"><rect width="12" height="12" fill="' + scarf + '"/><rect width="6" height="12" fill="' + stripe + '"/></pattern></defs>'
    + '<ellipse cx="48" cy="112" rx="27" ry="5" fill="#30263b22"/>'
    + '<path d="M30 70 Q48 59 66 70 L76 104 Q48 113 20 104Z" fill="#363044" stroke="#251f32" stroke-width="2"/>'
    + '<path d="M41 70 L48 85 L55 70" fill="#fff4db"/><path d="M48 74 L45 86 L48 90 L51 86Z" fill="' + scarf + '"/>'
    + '<path d="M36 105 V111 M59 105 V111" stroke="#342d3c" stroke-width="10" stroke-linecap="round"/>'
    + hairBack
    + '<ellipse cx="48" cy="36" rx="27" ry="29" fill="' + character.skin + '" stroke="#352338" stroke-width="1.5"/>'
    + '<path d="' + bangs + '" fill="' + character.hair + '" stroke="#302436" stroke-width="1"/>'
    + '<g fill="#302436"><ellipse cx="35" cy="40" rx="4" ry="6"/><ellipse cx="61" cy="40" rx="4" ry="6"/></g>'
    + '<g fill="white"><circle cx="36" cy="38" r="1.5"/><circle cx="62" cy="38" r="1.5"/></g>'
    + '<g fill="#e99391" opacity="0.55"><ellipse cx="29" cy="49" rx="5" ry="3"/><ellipse cx="67" cy="49" rx="5" ry="3"/></g>'
    + '<path d="M42 51 Q48 57 54 51" fill="none" stroke="#80514f" stroke-width="1.8" stroke-linecap="round"/>'
    + glasses + freckles + star
    + '<path d="M32 65 Q48 73 64 65 L64 74 Q48 81 32 74Z" fill="url(#' + patternId + ')" stroke="' + scarf + '"/>'
    + '<path d="M55 73 L65 72 L67 93 L57 95Z" fill="url(#' + patternId + ')" stroke="' + scarf + '"/>'
    + '<circle cx="28" cy="83" r="5" fill="' + character.skin + '"/><circle cx="69" cy="82" r="5" fill="' + character.skin + '"/>'
    + '<path d="M70 83 L82 61" stroke="#805433" stroke-width="3" stroke-linecap="round"/><path d="M81 54 L83 59 L88 61 L83 63 L81 68 L79 63 L74 61 L79 59Z" fill="#f5d578"/>'
    + '</svg>';
  return portrait;
}

// Matching 2D enemy sprite. The G tile still has exactly the same collision rule.
function createEnemyAvatar() {
  const enemy = document.createElement("span");
  enemy.className = "enemy-avatar chibi-enemy";
  enemy.setAttribute("role", "img");
  enemy.setAttribute("aria-label", "Dark wizard — threat to the audit");
  enemy.innerHTML = '<svg viewBox="0 0 96 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="48" cy="111" rx="25" ry="5" fill="#161d2222"/><path d="M30 68 Q48 58 66 68 L78 106 Q48 115 18 106Z" fill="#244337" stroke="#172d25" stroke-width="2"/><ellipse cx="48" cy="36" rx="27" ry="29" fill="#d3dec1" stroke="#42564a" stroke-width="2"/><ellipse cx="35" cy="39" rx="4" ry="6" fill="#a3444c"/><ellipse cx="61" cy="39" rx="4" ry="6" fill="#a3444c"/><circle cx="36" cy="37" r="1.5" fill="white"/><circle cx="62" cy="37" r="1.5" fill="white"/><path d="M44 47 L43 51 M51 47 L52 51 M40 58 Q48 54 56 58" stroke="#677568" fill="none" stroke-width="2" stroke-linecap="round"/><path d="M30 108 V112 M65 108 V112" stroke="#183228" stroke-width="10" stroke-linecap="round"/></svg>';
  return enemy;
}

// The castle replaces only the exit artwork; the existing E tile still controls winning.
function createCastleAvatar() {
  const castle = document.createElement("span");
  castle.className = "castle-avatar";
  castle.setAttribute("role", "img");
  castle.setAttribute("aria-label", "Hogwarts castle exit");
  const fallback = document.createElement("span");
  fallback.className = "castle-fallback";
  fallback.textContent = "🏰";
  castle.appendChild(fallback);
  const image = document.createElement("img");
  image.alt = "";
  image.hidden = true;
  image.draggable = false;
  image.addEventListener("load", function () { fallback.hidden = true; image.hidden = false; renderMaze3D(); });
  image.addEventListener("error", function () { fallback.hidden = false; image.hidden = true; });
  castle.appendChild(image);
  image.src = "images/characters/castle.png";
  return castle;
}

// Character selection: rebuild the list using only the selected house.
function showCharacters() {
  selectedCharacter = "";
  characterChoices.innerHTML = "";
  document.getElementById("start-button").hidden = true;
  document.getElementById("character-summary").textContent = "Choose a character to enter the maze.";
  charactersByHouse[selectedHouse].forEach(function (character) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "choice";
    card.dataset.character = character.name;
    card.setAttribute("aria-pressed", "false");
    card.appendChild(createAvatar(character));
    const label = document.createElement("span");
    label.className = "character-name";
    label.textContent = character.name;
    card.appendChild(label);
    card.addEventListener("click", function () {
      selectedCharacter = character.name;
      characterChoices.querySelectorAll("button").forEach(function (other) {
        other.classList.toggle("selected", other === card);
        other.setAttribute("aria-pressed", other === card);
      });
      document.getElementById("character-summary").textContent = character.name + " selected.";
      document.getElementById("start-button").hidden = false;
    });
    characterChoices.appendChild(card);
  });
}

// House selection: remember the choice and highlight only its card.
houseCards.forEach(function (card) {
  card.addEventListener("click", function () {
    startMusicOnInteraction({ target: card });
    selectedHouse = card.dataset.house;
    selectedCharacter = ""; // Changing house invalidates the previous character.
    houseCards.forEach(function (houseCard) {
      const selected = houseCard === card;
      houseCard.classList.toggle("selected", selected);
      houseCard.setAttribute("aria-pressed", selected);
    });
    document.getElementById("house-summary").textContent = selectedHouse + " selected.";
    document.getElementById("continue-button").hidden = false;
  });
});
document.getElementById("continue-button").addEventListener("click", function () {
  if (!selectedHouse) return;
  startScreen.hidden = true;
  characterScreen.hidden = false;
  document.getElementById("chosen-house").textContent = "House: " + selectedHouse;
  showCharacters();
  characterChoices.querySelector("button").focus();
});

document.getElementById("back-button").addEventListener("click", function () {
  characterScreen.hidden = true;
  startScreen.hidden = false;
  document.getElementById("continue-button").focus();
});
let player = { x: 1, y: 1 };
let collected = new Set();
let lives = 3;
let timeLeft = 60;
let playing = false;
let timer;
let deadline;

// Build pictures once per level/character, then move the SAME player portrait.
// Recreating images on every step used to flash the fallback while images loaded.
let renderedMap = null;
let renderedCharacter = "";
let renderedHouse = "";
let mazeCells = [];
let playerPortrait;
function drawMaze() {
  if (renderedMap !== mazeMap || renderedCharacter !== selectedCharacter || renderedHouse !== selectedHouse) {
    maze.innerHTML = "";
    mazeCells = [];
    playerPortrait = createAvatar(getCharacter());
    for (let y = 0; y < mazeMap.length; y++) {
      for (let x = 0; x < mazeMap[y].length; x++) {
        const cell = document.createElement("div");
        const tile = mazeMap[y][x];
        cell.className = "cell";
        if (tile === "#") cell.classList.add("wall");
        let crystalIcon = null;
        if (tile === "C") {
          crystalIcon = document.createElement("span");
          crystalIcon.textContent = "🪄";
          cell.appendChild(crystalIcon);
        }
        if (tile === "G") cell.appendChild(createEnemyAvatar());
        if (tile === "E") {
          cell.appendChild(createCastleAvatar());
          cell.classList.add("exit");
        }
        maze.appendChild(cell);
        mazeCells.push({ cell, tile, x, y, crystalIcon });
      }
    }
    renderedMap = mazeMap;
    renderedCharacter = selectedCharacter;
    renderedHouse = selectedHouse;
  }

  // Change only tile highlights and crystal visibility, keeping image nodes intact.
  mazeCells.forEach(function ({ cell, tile, x, y, crystalIcon }) {
    cell.classList.remove("player", "crystal-pop");
    // Remove old +10 labels without touching any portraits.
    cell.querySelectorAll(".points-popup").forEach(popup => popup.remove());
    if (crystalIcon) {
      crystalIcon.hidden = collected.has(x + "," + y);
      cell.classList.toggle("crystal", !crystalIcon.hidden);
    }
    if (tile === "E") cell.classList.toggle("unlocked", collected.size === levels[levelIndex].crystals);
  });
  const playerCell = mazeCells[player.y * mazeMap[0].length + player.x].cell;
  playerCell.classList.add("player");
  if (playerPortrait.parentNode !== playerCell) playerCell.appendChild(playerPortrait);
  document.getElementById("total-score").textContent = totalScore;
  document.getElementById("crystal-target").textContent = levels[levelIndex].crystals;
  crystalDisplay.textContent = collected.size;
  livesDisplay.textContent = lives;
  renderAuditJournal();
  renderMaze3D();
}

// Game start: require both choices, then reset the existing maze and timer.
// Restart keeps the character, house and current level; points from earlier levels stay.
function startGame() {
  if (!getCharacter()) return;
  stopTouchMovement();
  clearAuditScroll();
  clearCertificate();
  floatingPoints = null;
  document.getElementById("maze-3d").classList.remove("collect", "hurt");
  clearInterval(timer);
  player = { x: 1, y: 1 };
  collected = new Set();
  lives = 3;
  mazeMap = levels[levelIndex].map;
  timeLeft = levels[levelIndex].seconds;
  totalScore = levelStartScore;
  levelWon = false;
  playing = true;
  deadline = Date.now() + timeLeft * 1000;
  timerDisplay.textContent = timeLeft;
  document.getElementById("clue-title").textContent = "📜 Your next clue awaits";
  document.getElementById("clue-action").textContent = "Each wand reveals a record, a risk or an audit finding. Collect it and keep moving.";
  document.getElementById("clue-lesson").textContent = "Open your Audit Journal any time to review the clues.";
  const mission = auditMissions[levelIndex];
  document.getElementById("mission-title").textContent = mission.title;
  document.getElementById("mission-story").textContent = mission.intro;
  document.getElementById("collection-label").textContent = mission.label;
  feedback.textContent = "Collect all " + levels[levelIndex].crystals + " wands of " + mission.label.toLowerCase() + ".";
  maze.classList.remove("collect", "hurt");
  startScreen.hidden = true;
  characterScreen.hidden = true;
  const identity = document.getElementById("player-identity");
  identity.className = "identity " + selectedHouse.toLowerCase();
  identity.textContent = "";
  identity.appendChild(createAvatar(getCharacter()));
  identity.appendChild(document.createTextNode(selectedCharacter + " · " + selectedHouse));
  document.getElementById("level-indicator").textContent = "Level " + (levelIndex + 1) + " — " + levels[levelIndex].name;
  maze.classList.toggle("forest", levelIndex === 1);
  maze.classList.toggle("chamber", levelIndex === 2);
  endScreen.hidden = true;
  gameScreen.hidden = false;
  drawMaze();
  // A deadline keeps the timer accurate even if the browser pauses callbacks.
  timer = setInterval(updateTimer, 200);
}

function updateTimer() {
  timeLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  timerDisplay.textContent = timeLeft;
  if (timeLeft === 0) finishGame(false, "Time ran out! The castle awaits your next attempt.");
}

function finishGame(won, reason) {
  stopTouchMovement();
  playing = false;
  clearInterval(timer);
  gameScreen.hidden = true;
  endScreen.hidden = false;
  levelWon = won;
  const finalVictory = won && levelIndex === levels.length - 1;
  document.getElementById("end-icon").textContent = won ? "🏆" : "🌙";
  document.getElementById("end-title").textContent = finalVictory ? "Final Victory" : won ? "Level Complete!" : "Game Over";
  document.getElementById("end-message").textContent = won ? auditMissions[levelIndex].complete : reason;
  const learning = document.getElementById("audit-learning");
  learning.hidden = !won;
  learning.textContent = won ? "📜 " + auditMissions[levelIndex].lesson : "";
  document.getElementById("end-victory").hidden = !finalVictory;
  document.getElementById("end-score").textContent = "Level Score: " + (totalScore - levelStartScore) + " · Total Score: " + totalScore;
  const nextButton = document.getElementById("next-level-button");
  nextButton.hidden = !won || finalVictory;
  document.getElementById("play-again-button").hidden = finalVictory;
  (finalVictory ? document.getElementById("new-game-button") : won ? nextButton : document.getElementById("play-again-button")).focus();
  renderAuditReport(won);
  clearAuditScroll();
  showAuditorRank(finalVictory || !won);
  if (finalVictory) showCertificate();
  else clearCertificate();
  if (won) playTone(660, 0.6);
}

function flash(effect) {
  maze.classList.remove("collect", "hurt");
  void maze.offsetWidth; // Restart the CSS animation on repeated events.
  maze.classList.add(effect);
  const canvas = document.getElementById("maze-3d");
  canvas.classList.remove("collect", "hurt");
  void canvas.offsetWidth;
  canvas.classList.add(effect);
}

// Move only onto paths. Spirits cost one life and return you to the start.
function movePlayer(dx, dy) {
  if (!playing) return;
  updateTimer();
  if (!playing) return;
  const x = player.x + dx;
  const y = player.y + dy;
  const tile = mazeMap[y]?.[x];
  if (!tile || tile === "#") return;
  if (tile === "G") {
    lives--;
    player = { x: 1, y: 1 };
    feedback.textContent = "A dark wizard disrupted your audit! You lost a life and returned to the entrance.";
    flash("hurt");
    playTone(130, 0.3);
    drawMaze();
    if (lives === 0) finishGame(false, "You lost all 3 lives. Try a different path!");
    return;
  }
  player = { x, y };
  const key = x + "," + y;
  let justCollected = false;
  if (tile === "C" && !collected.has(key)) {
    collected.add(key);
    totalScore += POINTS_PER_COLLECTIBLE;
    justCollected = true;
    feedback.textContent = collected.size === levels[levelIndex].crystals ? "All " + auditMissions[levelIndex].label.toLowerCase() + " found! Head to the castle." : auditMissions[levelIndex].label + " collected! +10 points. Keep exploring.";
    flash("collect");
    playTone(880, 0.25);
  }
  drawMaze();
  if (justCollected) {
    const popup = document.createElement("span");
    popup.className = "points-popup";
    popup.textContent = "+10";
    const playerCell = maze.children[y * mazeMap[0].length + x];
    playerCell.appendChild(popup);
    playerCell.classList.add("crystal-pop");
    showPoints3D(x, y);
    showAuditClue(x, y);
  }
  if (tile === "E") {
    if (collected.size === levels[levelIndex].crystals) finishGame(true, "You collected every magic wand in " + levels[levelIndex].name + "!");
    else feedback.textContent = "The castle is sealed. Collect all " + levels[levelIndex].crystals + " magic wands first!";
  }
}

const directions = {
  ArrowUp: [0, -1], w: [0, -1],
  ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0]
};
document.addEventListener("keydown", function (event) {
  const direction = directions[event.key] || directions[event.key.toLowerCase()];
  if (playing && direction) {
    event.preventDefault();
    movePlayer(direction[0], direction[1]);
  }
});
document.getElementById("start-button").addEventListener("click", function () {
  levelIndex = 0;
  totalScore = 0;
  levelStartScore = 0;
  startGame();
});

// Only a completed level unlocks the next one. There are exactly three levels.
document.getElementById("next-level-button").addEventListener("click", function () {
  if (!levelWon || levelIndex >= levels.length - 1) return;
  levelStartScore = totalScore;
  levelIndex++;
  startGame();
});

// A new game clears choices and progress, and stops the current timer.
function startNewGame() {
  stopTouchMovement();
  clearAuditScroll();
  clearCertificate();
  document.getElementById("auditor-rank").hidden = true;
  playing = false;
  clearInterval(timer);
  levelIndex = 0;
  levelWon = false;
  totalScore = 0;
  levelStartScore = 0;
  lives = 3;
  collected = new Set();
  player = { x: 1, y: 1 };
  mazeMap = levels[0].map;
  timeLeft = 60;
  selectedHouse = "";
  selectedCharacter = "";
  houseCards.forEach(function (card) {
    card.classList.remove("selected");
    card.setAttribute("aria-pressed", "false");
  });
  characterChoices.innerHTML = "";
  document.getElementById("continue-button").hidden = true;
  document.getElementById("start-button").hidden = true;
  document.getElementById("house-summary").textContent = "Choose a house to continue.";
  timerDisplay.textContent = 60;
  crystalDisplay.textContent = 0;
  livesDisplay.textContent = 3;
  document.getElementById("crystal-target").textContent = 3;
  document.getElementById("collection-label").textContent = "Evidence";
  document.getElementById("total-score").textContent = 0;
  document.getElementById("level-indicator").textContent = "Level 1 — " + levels[0].name;
  gameScreen.hidden = true;
  endScreen.hidden = true;
  characterScreen.hidden = true;
  startScreen.hidden = false;
  houseCards[0].focus();
}
document.getElementById("new-game-button").addEventListener("click", startNewGame);
document.getElementById("restart-button").addEventListener("click", startGame);
document.getElementById("play-again-button").addEventListener("click", startGame);

// Music defaults to ON and starts on the first house-selection click.
// Do not treat an autoplay permission error as a missing music file.
const backgroundTrack = new Audio("audio/HP OST – Harry's Wondrous World.mp3");
backgroundTrack.loop = true;
backgroundTrack.volume = 0.15;
backgroundTrack.preload = "auto";
let localMusicFailed = false;
let audioContext;
let musicEnabled = true; // The player's preference: Off must stay Off.
let musicOn = false; // Whether audio has actually started.
let musicStarting = false;
let musicTimer;
let noteIndex = 0;
const notes = [261.63, 311.13, 392, 523.25, 392, 311.13];
const musicStatus = document.getElementById("music-status");
function updateMusicButton() {
  musicButton.textContent = musicEnabled ? "Music: On (Turn Off)" : "Music: Off (Turn On)";
  musicButton.setAttribute("aria-pressed", musicEnabled);
}
function playTone(frequency, duration) {
  if (!musicEnabled || !musicOn || !audioContext || audioContext.state !== "running") return;
  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();
  const now = audioContext.currentTime;
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  volume.gain.setValueAtTime(0, now);
  volume.gain.linearRampToValueAtTime(0.045, now + 0.04);
  volume.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(volume);
  volume.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}
function startOriginalMusic() {
  clearInterval(musicTimer);
  playTone(notes[0], 0.8);
  musicTimer = setInterval(function () {
    playTone(notes[noteIndex % notes.length], 0.8);
    noteIndex++;
  }, 900);
}
function stopBackgroundMusic() {
  clearInterval(musicTimer);
  backgroundTrack.pause();
}
async function startBackgroundMusic() {
  if (!localMusicFailed) {
    try {
      await backgroundTrack.play();
      return;
    } catch (error) {
      if (error.name === "NotAllowedError" || error.name === "AbortError") throw error;
      localMusicFailed = true;
      backgroundTrack.pause();
    }
  }
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  await audioContext.resume();
  if (audioContext.state !== "running") throw new DOMException("Interaction needed", "NotAllowedError");
  if (!musicEnabled) return;
  musicOn = true;
  startOriginalMusic();
}
async function tryStartMusic(fromInteraction = false) {
  if (!musicEnabled || musicOn) return;
  if (musicStarting) {
    // A first gesture can unlock a resume request already waiting on autoplay.
    if (fromInteraction && audioContext) audioContext.resume().catch(() => {});
    // Retry the MP3 inside the gesture if its initial autoplay request is pending.
    if (fromInteraction && !localMusicFailed) {
      backgroundTrack.play().then(function () {
        if (!musicEnabled) { backgroundTrack.pause(); return; }
        musicOn = true;
        musicStatus.textContent = "Background music is playing softly.";
      }).catch(() => {});
    }
    return;
  }
  musicStarting = true;
  try {
    // Resume Web Audio inside the gesture too, so collection effects are ready.
    if (fromInteraction) {
      if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
      // Start the MP3 immediately; effects can unlock in parallel.
      audioContext.resume().catch(() => {});
    }
    await startBackgroundMusic();
    if (!musicEnabled) {
      stopBackgroundMusic();
      musicOn = false;
      if (audioContext) await audioContext.suspend();
      return;
    }
    musicOn = true;
    musicStatus.textContent = localMusicFailed ? "Original magical music is playing." : "Background music is playing softly.";
  } catch (error) {
    musicOn = false;
    if (!musicEnabled) return;
    musicStatus.textContent = error.name === "NotAllowedError" || error.name === "AbortError"
      ? "Music is On — click a house to start it."
      : "Audio could not start. Use the music button to retry.";
  } finally {
    musicStarting = false;
    updateMusicButton();
  }
}
backgroundTrack.addEventListener("error", function () {
  localMusicFailed = true;
  backgroundTrack.pause();
  if (musicEnabled && !musicStarting) {
    musicOn = false;
    tryStartMusic();
  }
});
musicButton.addEventListener("click", async function () {
  musicEnabled = !musicEnabled;
  updateMusicButton();
  if (!musicEnabled) {
    musicOn = false;
    stopBackgroundMusic();
    musicStatus.textContent = "Music is Off.";
    if (audioContext) await audioContext.suspend();
  } else {
    await tryStartMusic(true);
  }
});
function startMusicOnInteraction(event) {
  if (event.target === musicButton || musicButton.contains(event.target)) return;
  if (musicEnabled && !musicOn) tryStartMusic(true);
  else if (musicEnabled && !audioContext) {
    // Music might already be autoplaying; unlock the separate sound effects.
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume().catch(() => {});
  }
}
updateMusicButton();
// No page-load autoplay or unrelated key/click starts; house selection starts music.

// 3D-style isometric presentation only. The original grid still owns every rule.
// Canvas draws diamonds and raised stone blocks without any external libraries.
const mazeCanvas = document.getElementById("maze-3d");
const scene = mazeCanvas.getContext("2d");
const viewButton = document.getElementById("view-button");
let view3D = false;
let floatingPoints = null;
let sceneFrame = null;
function updateView() {
  maze.hidden = view3D;
  mazeCanvas.hidden = !view3D;
  document.getElementById("camera-help").hidden = !view3D;
  viewButton.textContent = view3D ? "View: 3D" : "View: 2D";
  viewButton.setAttribute("aria-pressed", view3D);
  renderMaze3D();
}
viewButton.addEventListener("click", function () {
  if (!scene) return;
  view3D = !view3D;
  updateView();
});
updateView();

// Project the same x/y grid into an angled camera view.
function projectTile(x, y) {
  return { x: 360 + (x - y) * 27, y: 76 + (x + y) * 15 };
}
function paintShape(points, colour) {
  scene.beginPath();
  scene.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(point => scene.lineTo(point[0], point[1]));
  scene.closePath();
  scene.fillStyle = colour;
  scene.fill();
}
function paintBlock(x, y, height, colours) {
  paintShape([[x-27,y],[x,y+15],[x,y+15-height],[x-27,y-height]], colours[1]);
  paintShape([[x,y+15],[x+27,y],[x+27,y-height],[x,y+15-height]], colours[2]);
  paintShape([[x,y-15-height],[x+27,y-height],[x,y+15-height],[x-27,y-height]], colours[0]);
}
function drawPortraitToken(portrait, x, y, colour, initials) {
  // A robe silhouette and portrait head create an easy-to-read character figure.
  scene.fillStyle = "#0006";
  scene.beginPath();
  scene.ellipse(x, y+4, 17, 6, 0, 0, Math.PI*2);
  scene.fill();
  paintShape([[x,y-27],[x+13,y+1],[x-13,y+1]], colour);
  const image = portrait?.querySelector("img");
  const headY = y-24;
  scene.save();
  scene.beginPath();
  scene.arc(x, headY, 15, 0, Math.PI*2);
  scene.clip();
  scene.fillStyle = "#d7b793";
  scene.fillRect(x-15, headY-15, 30, 30);
  if (image && !image.hidden && image.complete && image.naturalWidth) {
    // Take the upper part of the portrait so faces stay visible in small tokens.
    const side = Math.min(image.naturalWidth, image.naturalHeight) * 0.72;
    scene.drawImage(image, (image.naturalWidth-side)/2, image.naturalHeight*0.06, side, side, x-15, headY-15, 30, 30);
  } else {
    scene.fillStyle = "#3b273b";
    scene.font = "bold 11px Arial";
    scene.textAlign = "center";
    scene.fillText(initials, x, headY+4);
  }
  scene.restore();
  scene.beginPath();
  scene.arc(x, headY, 15, 0, Math.PI*2);
  scene.strokeStyle = colour;
  scene.lineWidth = 2;
  scene.stroke();
}
function renderMaze3D() {
  if (!scene || !renderedMap || !view3D) return;
  scene.clearRect(0, 0, 720, 480);
  const sky = scene.createLinearGradient(0, 0, 0, 480);
  sky.addColorStop(0, "#25213e");
  sky.addColorStop(1, "#080d1b");
  scene.fillStyle = sky;
  scene.fillRect(0, 0, 720, 480);
  scene.fillStyle = "#eddbb0";
  scene.font = "12px Georgia";
  scene.textAlign = "center";
  scene.fillText(levels[levelIndex].name.toUpperCase(), 360, 30);
  // Ground plinth beneath the entire maze.
  paintShape([[360,56],[671,229],[360,435],[49,229]], "#090c16");
  const palettes = [
    ["#82738e", "#41384e", "#584866"],
    ["#65856f", "#293f36", "#3b5747"],
    ["#826484", "#382d42", "#55415e"]
  ];
  // Paint from back to front so blocks overlap naturally.
  for (let depth = 0; depth <= 20; depth++) {
    mazeCells.filter(tile => tile.x+tile.y === depth).forEach(function (entry) {
      const { x, y, tile, cell } = entry;
      const p = projectTile(x, y);
      const floorColour = (x+y)%2 ? "#30283d" : "#393047";
      paintBlock(p.x, p.y, 5, [floorColour,"#171521","#242030"]);
      if (tile === "#") {
        // Lower front walls keep the player and routes visible.
        const height = (x === 10 || y === 10) ? 10 : 22;
        paintBlock(p.x, p.y-5, height, palettes[levelIndex]);
        if ((x === 0 || y === 0) && (x+y)%3 === 0) {
          scene.fillStyle = "#ffe4a0";
          scene.shadowColor = "#ffd270";
          scene.shadowBlur = 14;
          scene.beginPath();
          scene.arc(p.x, p.y-height-12, 3, 0, Math.PI*2);
          scene.fill();
          scene.shadowBlur = 0;
        }
      }
      if (tile === "C" && !collected.has(x+","+y)) {
        scene.font = "26px Arial";
        scene.fillText("🪄", p.x, p.y-8);
      }
      if (tile === "G") drawPortraitToken(cell.querySelector(".enemy-avatar"), p.x, p.y, "#80be97", "V");
      if (tile === "E") {
        const castleImage = cell.querySelector(".castle-avatar")?.querySelector("img");
        const unlocked = collected.size === levels[levelIndex].crystals;
        scene.shadowColor = unlocked ? "#ffe5a1" : "transparent";
        scene.shadowBlur = unlocked ? 18 : 0;
        if (castleImage && !castleImage.hidden && castleImage.complete && castleImage.naturalWidth) {
          scene.drawImage(castleImage, p.x-25, p.y-48, 50, 50);
        } else {
          scene.font = "32px Arial";
          scene.fillText("🏰", p.x, p.y);
        }
        scene.shadowBlur = 0;
      }
      if (player.x === x && player.y === y) {
        const colours = { Gryffindor: "#e17f6c", Slytherin: "#75c6a0", Ravenclaw: "#8cb8f2", Hufflepuff: "#f0cd71" };
        drawPortraitToken(playerPortrait, p.x, p.y, colours[selectedHouse], getCharacter().initials);
      }
    });
  }
  if (floatingPoints) {
    const elapsed = Date.now()-floatingPoints.started;
    if (elapsed < 900 && playing) {
      const p = projectTile(floatingPoints.x, floatingPoints.y);
      scene.globalAlpha = 1-elapsed/900;
      scene.fillStyle = "#ffec98";
      scene.font = "bold 18px Arial";
      scene.fillText("+10", p.x, p.y-45-elapsed/35);
      scene.globalAlpha = 1;
      if (!sceneFrame) sceneFrame = requestAnimationFrame(function () { sceneFrame = null; renderMaze3D(); });
    } else floatingPoints = null;
  }
}
function showPoints3D(x, y) {
  floatingPoints = { x, y, started: Date.now() };
  renderMaze3D();
}

// A transient parchment uses the same clue object as the journal: no new findings.
let auditScrollTimer;
function showAuditScroll(clue) {
  clearTimeout(auditScrollTimer);
  const scroll = document.getElementById("audit-scroll");
  document.getElementById("scroll-title").textContent = clue.title;
  document.getElementById("scroll-description").textContent = clue.story + " " + clue.lesson;
  scroll.hidden = false;
  auditScrollTimer = setTimeout(function () { scroll.hidden = true; }, 4500);
}
function clearAuditScroll() {
  clearTimeout(auditScrollTimer);
  document.getElementById("audit-scroll").hidden = true;
}

// Read the actual C tiles and score-per-collectible rule, rather than hardcoding 120.
function countLevelFindings(level) {
  return level.map.reduce((total, row) => total + Array.from(row).filter(tile => tile === "C").length, 0);
}
function maximumAvailableScore() {
  return levels.reduce((total, level) => total + countLevelFindings(level), 0) * POINTS_PER_COLLECTIBLE;
}
function getAuditorRank(score, maximum = maximumAvailableScore()) {
  const percent = maximum > 0 ? Math.max(0, Math.min(100, score / maximum * 100)) : 0;
  if (percent >= 90) return { name: "Master Magical Auditor", stars: "★★★", percent, message: "Outstanding! Your magical audit shines with mastery." };
  if (percent >= 70) return { name: "Skilled Auditor", stars: "★★☆", percent, message: "Great work! Your growing audit skills deserve recognition." };
  return { name: "Apprentice Auditor", stars: "★☆☆", percent, message: "Well done exploring! Keep practising to strengthen your audit skills." };
}
function showAuditorRank(visible) {
  document.getElementById("auditor-rank").hidden = !visible;
  if (!visible) return;
  const rank = getAuditorRank(totalScore);
  document.getElementById("rank-stars").textContent = rank.stars;
  document.getElementById("rank-name").textContent = rank.name;
  document.getElementById("rank-performance").textContent = totalScore + " / " + maximumAvailableScore() + " points · " + rank.percent.toFixed(1) + "%";
  document.getElementById("rank-message").textContent = rank.message;
}

// Store one final result, shared by the on-screen certificate and its PNG download.
let certificateData = null;
function clearCertificate() {
  certificateData = null;
  document.getElementById("certificate-section").hidden = true;
  document.getElementById("certificate-download-status").textContent = "";
}
function showCertificate() {
  if (!levelWon || levelIndex !== levels.length - 1) return;
  const previousFindings = levels.slice(0, levelIndex).reduce((sum, level) => sum + countLevelFindings(level), 0);
  certificateData = {
    character: selectedCharacter,
    house: selectedHouse,
    score: totalScore,
    maximum: maximumAvailableScore(),
    findings: previousFindings + collected.size,
    availableFindings: levels.reduce((sum, level) => sum + countLevelFindings(level), 0),
    rank: getAuditorRank(totalScore),
    status: "AUDIT COMPLETED"
  };
  document.getElementById("certificate-character").textContent = certificateData.character;
  document.getElementById("certificate-house").textContent = certificateData.house;
  document.getElementById("certificate-score").textContent = certificateData.score + " / " + certificateData.maximum;
  document.getElementById("certificate-findings").textContent = certificateData.findings + " / " + certificateData.availableFindings;
  document.getElementById("certificate-rank").textContent = certificateData.rank.stars + " " + certificateData.rank.name;
  document.getElementById("certificate-section").hidden = false;
}

// Draw text and decorative shapes ourselves, so no image library or network is needed.
// The large canvas makes the downloaded certificate crisp even on a small screen.
function drawCertificate(canvas, data) {
  canvas.width = 1600;
  canvas.height = 1100;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable in this browser.");
  const parchment = context.createLinearGradient(0, 0, 1600, 1100);
  parchment.addColorStop(0, "#fcf0d0");
  parchment.addColorStop(0.5, "#ebd3a0");
  parchment.addColorStop(1, "#f7e8c4");
  context.fillStyle = parchment;
  context.fillRect(0, 0, 1600, 1100);
  // Subtle paper flecks, not an external texture image.
  context.fillStyle = "#a1783820";
  for (let i = 0; i < 300; i++) context.fillRect((i * 137) % 1600, (i * 83) % 1100, 2, 2);
  context.strokeStyle = "#a78033";
  context.lineWidth = 8;
  context.strokeRect(38, 38, 1524, 1024);
  context.lineWidth = 2;
  context.strokeRect(56, 56, 1488, 988);
  context.strokeStyle = "#792c40";
  context.lineWidth = 3;
  context.strokeRect(70, 70, 1460, 960);
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Shrink long names if necessary; every field stays inside the parchment border.
  function text(value, y, size, colour = "#493342", bold = false) {
    context.font = (bold ? "bold " : "") + size + "px Georgia, serif";
    while (context.measureText(value).width > 1390 && size > 20) {
      size--;
      context.font = (bold ? "bold " : "") + size + "px Georgia, serif";
    }
    context.fillStyle = colour;
    context.fillText(value, 800, y);
  }
  // Draw stars as shapes so PNGs never depend on a font having star symbols.
  function star(x, y, radius, colour, filled = true) {
    context.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      const length = i % 2 ? radius * 0.42 : radius;
      const pointX = x + Math.cos(angle) * length;
      const pointY = y + Math.sin(angle) * length;
      if (i === 0) context.moveTo(pointX, pointY); else context.lineTo(pointX, pointY);
    }
    context.closePath();
    context.fillStyle = colour;
    context.strokeStyle = colour;
    context.lineWidth = 2;
    if (filled) context.fill(); else context.stroke();
  }
  text("MAGICAL ACADEMY · THE AUDIT QUEST", 116, 24, "#746030", true);
  text("Certificate of Magical Auditing", 200, 64, "#792c40", true);
  context.strokeStyle = "#af8a3a";
  context.beginPath();
  context.moveTo(310, 254);
  context.lineTo(1290, 254);
  context.stroke();
  text("This certifies the successful magical audit of", 308, 30);
  text(data.character, 386, 62, "#792c40", true);
  text("House: " + data.house, 457, 37, "#2f654c", true);
  text("Final score: " + data.score + " / " + data.maximum + " points", 540, 33);
  text("Audit findings collected: " + data.findings + " / " + data.availableFindings, 598, 33);
  text(data.rank.name, 679, 42, "#792c40", true);
  const filledStars = data.rank.stars.split("★").length - 1;
  for (let i = 0; i < 3; i++) star(744 + i * 56, 739, 20, "#926c20", i < filledStars);

  // Decorative gold seal with a star and readable status.
  const gold = context.createRadialGradient(785, 858, 5, 800, 874, 70);
  gold.addColorStop(0, "#fff1a6");
  gold.addColorStop(0.7, "#d4ae48");
  gold.addColorStop(1, "#997025");
  context.fillStyle = gold;
  context.beginPath();
  for (let i = 0; i < 48; i++) {
    const angle = i * Math.PI / 24;
    const radius = i % 2 ? 63 : 72;
    const x = 800 + Math.cos(angle) * radius;
    const y = 871 + Math.sin(angle) * radius;
    if (i === 0) context.moveTo(x, y); else context.lineTo(x, y);
  }
  context.closePath();
  context.fill();
  star(800, 851, 24, "#72511a");
  text("VERIFIED", 901, 17, "#72511a", true);
  text(data.status, 987, 36, "#2f654c", true);
  return canvas;
}
function downloadCertificate() {
  // No certificate on Game Over, an earlier level, or after Start New Game.
  if (!certificateData || !levelWon || levelIndex !== levels.length - 1) return;
  try {
    const canvas = drawCertificate(document.createElement("canvas"), certificateData);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "Magical-Audit-Certificate-" + certificateData.character.replace(/[^a-z0-9]+/gi, "-") + ".png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    document.getElementById("certificate-download-status").textContent = "Your PNG certificate download has been requested.";
  } catch (error) {
    document.getElementById("certificate-download-status").textContent = "Could not create the PNG. Please try another browser.";
  }
}
document.getElementById("download-certificate").addEventListener("click", downloadCertificate);

// Phone controls reuse movePlayer, so walls, audit clues and enemies work identically.
const touchDirections = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
let touchMoveTimer = null;
let activeTouchButton = null;
function stopTouchMovement() {
  clearInterval(touchMoveTimer);
  touchMoveTimer = null;
  if (activeTouchButton) activeTouchButton.classList.remove("pressed");
  activeTouchButton = null;
}
document.querySelectorAll("[data-move]").forEach(function (button) {
  const [dx, dy] = touchDirections[button.dataset.move];
  button.addEventListener("pointerdown", function (event) {
    if (!playing || event.isPrimary === false || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    stopTouchMovement();
    activeTouchButton = button;
    button.classList.add("pressed");
    if (button.setPointerCapture) button.setPointerCapture(event.pointerId);
    movePlayer(dx, dy);
    if (!playing) { stopTouchMovement(); return; }
    // Hold an arrow for continuous movement; releasing it stops immediately.
    touchMoveTimer = setInterval(function () {
      if (!playing) { stopTouchMovement(); return; }
      movePlayer(dx, dy);
    }, 170);
  });
  button.addEventListener("pointerup", stopTouchMovement);
  button.addEventListener("pointercancel", stopTouchMovement);
  button.addEventListener("lostpointercapture", stopTouchMovement);
  // Enter/Space can activate an on-screen arrow too, without duplicating touch taps.
  button.addEventListener("click", function (event) {
    if (event.detail === 0 && !event.pointerType) movePlayer(dx, dy);
  });
});
document.addEventListener("pointerup", stopTouchMovement);
window.addEventListener("blur", stopTouchMovement);
document.addEventListener("visibilitychange", function () {
  if (document.hidden) stopTouchMovement();
});
