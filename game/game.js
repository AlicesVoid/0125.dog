
const puppeteer = require('puppeteer');
//finds the next page from a given page
async function get_page(url="https://vsbattles.fandom.com/wiki/Category:Characters") {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const next_button = await page.$('.category-page__pagination-next');
    let link;
    if (next_button === null) {
      link = "https://vsbattles.fandom.com/wiki/Category:Characters";
    } else {
      link = await page.evaluate((button) => button.getAttribute('href'), next_button);
    }
    await browser.close();
    return link;
  }     


//creates the full list of pages from the vsBW
async function make_page_list() {
    let page_list = ["https://vsbattles.fandom.com/wiki/Category:Characters"];
    let current_page = page_list[0];

    do {
        current_page = await get_page(current_page);
        console.log("next page is " + current_page)
        page_list.push(current_page);

    } while (current_page != "https://vsbattles.fandom.com/wiki/Category:Characters") 

    return page_list;
}

///////////////////////////////////////////// DISPLAY FUNCTIONS /////////////////////////////////////

//changes the src of an left image in HTML
function changeLeftImageSrc(newSrc) {
    const textBox = document.getElementById("box weird");
    console.log(textBox);
    const image = document.getElementById("Left Image");
    console.log(image);
    image.src = newSrc;
}

//changes the src of a right image in HTML
function changeRightImageSrc(newSrc) {
    const textBox = document.getElementById("box weird");
    console.log(textBox);
    const image = document.getElementById("Right Image");
    console.log(image);
    image.src = newSrc;
}

//displays text piece by piece.
function typeWriter(string, div) {
    var i = 0;
    var speed = 50; // in milliseconds
    function type() {
      if (i < string.length) {
        div.innerHTML += string.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
    setTimeout(function() {}, 500);
  }

///////////////////////////////////////////// TEXT FUNCTIONS //////////////////////////////////////

//Writes 5 Blank Lines
function writeBlank() {
    const lines = [
        '',
        '',
        '',
        '',
        ''
    ];
    const textBox = document.getElementById("box whimsy");
    let elements = textBox.getElementsByTagName("p");
    for (let i = 0; i < elements.length; i++) {
        const line = lines[i];
        const element = elements[i];
        element.textContent = line;
      }
}

//Writes the Introduction
function writeIntro() {
    const lines = [
        "Welcome to vsBattles Casino:",
        "- I will show you Two Characters",
        "- Select the Stronger Character",
        "------- Tier: #-@ -> Strength ------",
        "- press START GAME! to start."
    ];
    return lines;
}

//Writes the Prompt for a Question
function writeQuestion(Opponent1 = "funny", Opponent2 = "silly") {
    const lines = [
        Opponent1 + " versus " + Opponent2,
        "    who would win?",
        "    X.x | " + Opponent1,
        "    0.O | " + Opponent2,
    ];
    return lines;
}

//changes the Text in Box Whimsy
function writeToWhimsy(lines) {
    const textBox = document.getElementById("box whimsy");
    let elements = textBox.getElementsByTagName("p");
    for (let i = 0; i < elements.length; i++) {
      const line = lines[i];
      const element = elements[i];
      element.textContent = '';
      setTimeout(() => {
        typeWriter(line, element);
      }, i * 1700); // change the delay time between lines by adjusting this value (in milliseconds)
    }
}              

// SENDS OPPONENTS TO Box Whimsy
function changeWhimsyOpponents() {
    writeToWhimsy(writeQuestion());
}

/////////////////////////////// FINAL //////////////////////////////

// Ties it altogether :D 
function gameLoader() {
    
    //Assert Buttons & Text 
    const Bstart = document.getElementById("Bstart");
    const Bx = document.getElementById("Bxx");
    const Bo = document.getElementById("Boo");
    const info = document.getElementById("infosheet");
    const box1 = document.getElementById("box weird");
    const box2 = document.getElementById("box whimsy");
    gameRun    = true;

    //generates the list of characters once
    opps_list = make_page_list();
    console.log(opps_list[1])

    //Runs Rounds of the Game
    function gameStreak() {

        //loads the game
        Bstart.textContent = 'RESET GAME...';
    }
    
    //Start Introduction
    if(info.style.display != 'block') {
        writeBlank();
        info.style.display='block';
        changeRightImageSrc("https://qph.cf2.quoracdn.net/main-qimg-6dad7e9134fa6a48c58620c4fe41cfc4-lq")
        changeLeftImageSrc("https://static.wikia.nocookie.net/vsbattles/images/a/a7/Tiering_System_Render.png/revision/latest/scale-to-width-down/350?cb=20190401174910")
        writeToWhimsy(writeIntro());
        Bstart.addEventListener('click',function(){event.preventDefault();gameStreak();});
        Bstart.textContent = 'START GAME!';

    }

    

    //Bstart.addEventListener("click", gameStreak());
    //Bstart.addEventListener("click", )
}
