import requests
import random
import re
from bs4 import BeautifulSoup

################################ PARSING METHODS BELOW HERE #################################

# Remove Newlines Tabs (Redundancy Works Sometimes)
def remove_newlines_tabs(s):
    s = s.replace('\\n', '')
    s = s.replace('\\t', '')
    s = s.replace('\\xa0', '')
    s = s.replace('\n', '')
    s = s.replace('\t', '')
    s = s.replace('\xa0', '')
    s = s.replace("\n", '')
    s = s.replace("\n", '')
    s = s.replace("\xa0", '')
    return s

# Gets the Next Page from a vsBW link
def get_page(url="https://vsbattles.fandom.com/wiki/Category:Characters"):
    page = requests.get(url)

    soup = BeautifulSoup(page.content, "html.parser")
    next_button = soup.find("a", class_="category-page__pagination-next")

    if next_button is None:
        link = "<https://vsbattles.fandom.com/wiki/Category:Characters>"
    else:
        link = next_button["href"]
        
    return link

# Slow Method to get the N-th Page
def get_n_pages(n):
    if n == 1:
        return get_page
    else:
        return lambda: get_page(get_n_pages(n-1)())

# SLOWEST but DYNAMIC-EST
def make_page_list():
    page_list = [get_page()]
    current_page = page_list[0]

    while current_page != "<https://vsbattles.fandom.com/wiki/Category:Characters>":
        next_page = get_page(current_page)
        page_list.append(next_page)
        current_page = next_page

    return page_list

# Gets info from a Character's URL
def get_character_info(url):
    page = requests.get("https://vsbattles.fandom.com/" + url)
    soup = BeautifulSoup(page.content, "html.parser")

    # Extract the character's full name
    name = soup.find("h1", class_="page-header__title").text
    nickname = remove_newlines_tabs(name)
    print(nickname)
    
    # Extract the character's image link
    image_link = soup.find("a", class_="image")["href"]

    # Find the tier section and extract the tier
    tier_section = soup.find("div", class_="mw-parser-output")
    tier = None
    for p in tier_section.find_all("p"):
        a = p.find("a", title="Tiering System")
        if a is not None:
            tier = p.text
            break

    # Return the character's full name, image link, and tier as a list
    return [nickname, image_link, tier]

# Gets a Random Character from a Page
def get_random_character(url):
	page = requests.get(url)
	soup = BeautifulSoup(page.content, "html.parser")
	
	# find the main list of characters
	character_list = soup.find("div", class_="category-page__members-wrapper")
	
	# find all the character links in the list
	character_links = character_list.find_all("a")
	
	# choose a random character link from the list
	random_link = random.choice(character_links)
	
	# extract the href value of the link
	character_url = random_link.get("href")
	
	return character_url

################################ GAME MECHANICS BELOW HERE ###################################

# Extracts a list of Tiers from a String
def extract_tiers(string):
    pattern = r"(High |Low )?([0-9]|1[0-1])-[ABC]"
    matches = re.finditer(pattern, string)
    tiers = []
    for match in matches:
        tiers.append(match.group())
    return tiers

# Separates Tiers into their Three Core Components
def separate_tiers(string):
    pattern = r"^(High |Low )?([0-9]|1[0-1])-(A|B|C)$"
    match = re.match(pattern, string)
    if match:
        word = match.group(1).strip() if match.group(1) else ""
        letter = match.group(3)
        number = int(match.group(2))
        return [word, letter, number]
    else:
        return None

# Compares Two Tiers
def compare_tiers(tier1, tier2):
    first = separate_tiers(tier1)
    second = separate_tiers(tier2)
    
    if(first[-1] < second[-1]):
        return 1
    elif(first[-1] == second[-1]):
        if(first[1] < second[1]):
            return 1
        elif(first[1] == second[1]):
            if(first[0] == "High" and second[0==("Low" or '')]):
                return 1
            elif(first[0] == "Low" and second[0] == ''):
                return -1
            elif(first[0] == '' and second[0] == "Low"):
                return 1
            else: 
                return 0
    return -1
            
    return None
    
# Determines the Greatest Tier in a String
def get_greatest_tier(string):
    tiers = extract_tiers(string)
    greatest_tier = "11-C"
    for tier in tiers:
        if compare_tiers(tier, greatest_tier) == 1:
            greatest_tier = tier
    print("greatest tier is: " + greatest_tier)
    return greatest_tier

# Method to Create Opponents from a Given Character List
def makeOpponents(characters_list):
    # Picks Two Random Characters
    opponents_list = [random.choice(characters_list), random.choice(characters_list)]
    first_opp      = get_character_info(get_random_character(opponents_list[0]))
    second_opp     = get_character_info(get_random_character(opponents_list[-1]))
    opponents = [first_opp, second_opp]
    return opponents

# Method to Test which of Two Opponents is Stronger
def testTiers(first_opp, second_opp):
    # Figures out The Strongest Each Opponent Can Be
    first_tier  = get_greatest_tier(first_opp[ -1])
    second_tier = get_greatest_tier(second_opp[-1])
    print(first_tier, second_tier)
    
    # Determines Who is Stronger
    strongest = ["Equal Strength", "Tie"]
    if(compare_tiers(first_tier, second_tier) == 1):
        strongest[0] = first_opp[0] + " is stronger than " + second_opp[0]
        strongest[1] = first_tier + " is more powerful than " + second_tier
    elif(compare_tiers(first_opp[-1], second_opp[-1]) == -1):
        strongest[0] = second_opp[0] + " is stronger than "  + first_opp[0]
        strongest[1] = second_tier + " is more powerful than " + first_tier
    
    return strongest

# Method that Runs the Game when you Guess
def hunterGame(guess, first_opp, second_opp):
    # Figures out The Strongest Each Opponent Can Be
    first_tier  = get_greatest_tier(first_opp[ -1])
    second_tier = get_greatest_tier(second_opp[-1])
    print(first_tier, second_tier)
    strongest = ["Equal Strength", "Tie", "No Guess"]
    answer    = compare_tiers(first_tier, second_tier)
    # Evaluate Game
    if guess == answer:
        strongest[-1] = "CORRECT!"
    else:
        strongest[-1] = "WRONG..."
        
    # Determines Who is Stronger
    if(answer == 1):
        strongest[0] = first_opp[0] + " is stronger than " + second_opp[0]
        strongest[1] = first_tier + " is more powerful than " + second_tier
    elif(answer == -1):
        strongest[0] = second_opp[0] + " is stronger than "  + first_opp[0]
        strongest[1] = second_tier + " is more powerful than " + first_tier
    
    return strongest
    
# When Code is Loaded, Character List is Produced
def makeCharacterList(): 
    characters_list = make_page_list()   
    return characters_list

def makeOpponents():
    opponents = makeOpponents()  #[Opp1/Opp2][OppData]
    return opponents
