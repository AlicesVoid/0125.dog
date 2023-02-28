
//removes \n \t \ax0 from a string
function removeNewlinesTabs(s) {
  s = s.replace(/\\\\n|\\\\t|\\\\xa0|\\n|\\t|\\xa0/g, '');
  return s;
}

//finds the next page from a given page
async function get_page(url="https://vsbattles.fandom.com/wiki/Category:Characters") {
  const response = await fetch(url);
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const next_button = doc.querySelector(".category-page__pagination-next");
  let link;
  if (next_button === null) {
    link = "<https://vsbattles.fandom.com/wiki/Category:Characters>";
  } else {
    link = next_button.getAttribute("href");
  }
  return link;
}

//creates the full list of pages from the vsBW
async function make_page_list() {
  let page_list = ["https://vsbattles.fandom.com/wiki/Category:Characters"];
  let current_page = page_list[0];

  while (current_page !== "https://vsbattles.fandom.com/wiki/Category:Characters") {
    current_page = await get_page(current_page);
    page_list.push(current_page);
  }

  return page_list;
}

//gets a random character's wiki from a given page
async function get_random_character(url) {
const response = await fetch(url);
const html = await response.text();
const parser = new DOMParser();
const doc = parser.parseFromString(html, "text/html");
const character_list = doc.querySelector(".category-page__members-wrapper");
const character_links = character_list.querySelectorAll("a");
const random_link = character_links[Math.floor(Math.random() * character_links.length)];
const character_url = random_link.getAttribute("href");
return character_url;
}

//gets the information from a character's wiki URL
async function get_character_info(url) {
const response = await fetch("https://vsbattles.fandom.com/" + url);
const html = await response.text();
const parser = new DOMParser();
const doc = parser.parseFromString(html, "text/html");
const name = doc.querySelector(".page-header__title").textContent;
const nickname = remove_newlines_tabs(name);
const image_link = doc.querySelector(".image").getAttribute("href");
const tier_section = doc.querySelector(".mw-parser-output");
let tier = null;
for (const p of tier_section.querySelectorAll("p")) {
  const a = p.querySelector("a[title='Tiering System']");
  if (a !== null) {
    tier = p.textContent;
    break;
  }
}
return [nickname, image_link, tier];
}

///////////////////////////////////////////////// GAME MECHANIC FUNCTIONS /////////////////////

//extracts the Tier strings from an string
function extract_tiers(string) {
const pattern = /(High |Low )?([0-9]|1[0-1])-[ABC]/g;
const matches = string.match(pattern);
const tiers = matches ? [...matches] : [];
return tiers;
}

//separates a Tier string into three separate parts 
function separate_tiers(string) {
const pattern = /^(High |Low )?([0-9]|1[0-1])-(A|B|C)$/;
const match = string.match(pattern);
if (match !== null) {
  const word = match[1]?.trim() ?? '';
  const letter = match[3];
  const number = parseInt(match[2]);
  return [word, letter, number];
} else {
  return null;
}
}

//evaluates which of two tiers is greater (t1, t2) -> (1,-1)
function compare_tiers(tier1, tier2) {
const first = separate_tiers(tier1);
const second = separate_tiers(tier2);

if (first[2] < second[2]) {
  return 1;
} else if (first[2] === second[2]) {
  if (first[1] < second[1]) {
    return 1;
  } else if (first[1] === second[1]) {
    if ((first[0] === "High" && second[0] === "") || (first[0] === "" && second[0] === "Low")) {
      return 1;
    } else if ((first[0] === "Low" && second[0] === "") || (first[0] === "" && second[0] === "High")) {
      return -1;
    } else {
      return 0;
    }
  } else {
    return -1;
  }
} else {
  return -1;
}
}

//gets the greatest tier in a string of tiers.
function get_greatest_tier(string) {
const tiers = extract_tiers(string);
let greatest_tier = "11-C";
for (const tier of tiers) {
  if (compare_tiers(tier, greatest_tier) === 1) {
    greatest_tier = tier;
  }
}
console.log(`greatest tier is: ${greatest_tier}`);
return greatest_tier;
}

///////////////////////////////////////////// FUNCTIONAL MECHANICS ////////////////////////////////

//generates two opponents from a pre-determined character list.
async function makeOpponents(charactersList) {
// Pick two random characters from the list
const firstOpponent = charactersList[Math.floor(Math.random() * charactersList.length)];
const secondOpponent = charactersList[Math.floor(Math.random() * charactersList.length)];

// Retrieve the information for each character
const firstOpponentInfo = await get_character_info(get_random_character(firstOpponent));
const secondOpponentInfo = await get_character_info(get_random_character(secondOpponent));

// Return an array containing the information for both opponents
return [firstOpponentInfo, secondOpponentInfo];
}

//you pick a guess (1 or -1) and insert two characters
async function hunterGame(guess, firstOpp, secondOpp) {
// Determines the greatest tier for each opponent
const firstTier = get_greatest_tier(firstOpp[-1]);
const secondTier = get_greatest_tier(secondOpp[-1]);

// Determines which opponent is stronger and the result of the game
let strongest = ["Equal Strength", "Tie", "No Guess"];
const answer = compare_tiers(firstTier, secondTier);
if (guess === answer) {
  strongest[-1] = "CORRECT!";
} else {
  strongest[-1] = "WRONG...";
}
if (answer === 1) {
  strongest[0] = `${firstOpp[0]} is stronger than ${secondOpp[0]}`;
  strongest[1] = `${firstTier} is more powerful than ${secondTier}`;
} else if (answer === -1) {
  strongest[0] = `${secondOpp[0]} is stronger than ${firstOpp[0]}`;
  strongest[1] = `${secondTier} is more powerful than ${firstTier}`;
}

// Returns the result as an array
return strongest;
}

///////////////////////////////////////////// DISPLAY FUNCTIONS /////////////////////////////////////

//changes the src of an left image in HTML
function changeLeftImageSrc(newSrc) {
const image = document.querySelector('.Left Image');
image.setAttribute('src', newSrc);
}

//changes the src of an left image in HTML
function changeRightImageSrc(newSrc) {
const image = document.querySelector('.Right Image');
image.setAttribute('src', newSrc);
}

//changes the Text in a Text Box (weirder box)
function changeWhimsyOpponents(Opponent1 = "funny", Opponent2 = "silly") {
  const textBox = document.getElementById("box whimsy");
  const lines = [
      Opponent1 + " versus " + Opponent2,
      "    who would win?",
      "    X.x | " + Opponent1,
      "    0.O | " + Opponent2,
  ];
  let elements = textBox.getElementsByTagName("p");
  for(let i = 0; i < elements.length; i++) {
      elements[i].textContent = lines[i];
  }
}


