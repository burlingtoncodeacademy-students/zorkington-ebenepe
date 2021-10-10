const { DH_UNABLE_TO_CHECK_GENERATOR } = require("constants");
const readline = require("readline");
const readlineInterface = readline.createInterface(
  process.stdin,
  process.stdout
);

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}

start();

async function start() {
  // initialize variables to allow later code to run
  let answer = "";
  let currentRoom = "outside";
  // waterIndex tracks achievements for puzzle to complete game
  let waterIndex = "";

  // lookup table for movement
  let lookup = {
    outside: ["foyer"],
    foyer: ["outside", "east foyer", "west foyer"],
    "east foyer": ["foyer", "east well room"],
    "east well room": ["east foyer"],
    "west foyer": ["foyer", "west well room"],
    "west well room": ["west foyer"],
  };

  // user inventory
  let inventory = [];

  // class for rooms
  class Room {
    constructor(
      name,
      description,
      items,
      locked = false,
      key = "",
      correctResponse = "",
      incorrectResponse = ""
    ) {
      (this.name = name),
        (this.description = description),
        (this.items = items),
        // whether a room is locked, what the password is, and responses if correct or incorrect password entered
        (this.locked = locked),
        (this.key = key),
        (this.correctResponse = correctResponse),
        (this.incorrectResponse = incorrectResponse);
    }
    // method to read / examine room
    read() {
      console.log(this.description);
    }
    // method to move between rooms
    changeRoom(newRoom) {
      if (!lookup[currentRoom].includes(newRoom)) {
        console.log(`you can\'t enter ${newRoom} from ${currentRoom}... `);
      } else {
        console.log(`You entered ${newRoom}`);
        currentRoom = newRoom;
        objectTable[newRoom].read();
      }
    }
    // method to take items / add to inventory
    take(item) {
      if (this.items.includes(item) && objectTable[item].takeable === true) {
        // remove it from the room's inventory
        let index = this.items.indexOf(item);
        this.items.splice(index, 1);
        // put it in the user's inventory
        inventory.push(item);
        console.log(`you took the ${item}. `);
      } else {
        console.log(`You can't take ${item}... `);
      }
    }
    // method to drop items
    drop(item) {
      // if user's inventory includes item, remove it from there
      if (inventory.includes(item)) {
        // add it to this.items
        this.items.push(item);
        let index = inventory.indexOf(item);
        inventory.splice(index, 1);
        console.log(`you dropped the ${item}. `);
      } else {
        console.log(`You don't have ${item} in your inventory... `);
      }
    }
  }

  // class for objects
  class Obj {
    constructor(name, description, takeable) {
      this.name = name;
      this.description = description;
      this.takeable = takeable;
    }
    // method to examine / read object
    read() {
      if (objectTable[currentRoom].items.includes(this.name)) {
        console.log(this.description);
      } else {
        console.log(`you don't see ${this.name} anywhere`);
      }
    }
  }

  // CODE FOR CREATING 'WATER' CHILD CLASS THAT CAN BE DRUNK
  class Water extends Obj {
    constructor(name, description, takeable, index, result) {
      super(name, description, takeable),
        (this.index = index),
        (this.result = result);
    }
    // method to drink. if successful, adds to waterIndex. If waterIndex reaches "AAA", user wins the game
    drink() {
      if (objectTable[currentRoom].items.includes(this.name)) {
        console.log(this.result);
        waterIndex += this.index;
      } else {
        console.log("You don't see any water to drink... ");
      }
    }
  }

  // create objects, assign parameters & properties
  let sign = new Obj(
    "sign",
    "The sign says\nAnswer this devilishly difficult riddle to enter the dungeon:\nWhat do you call three holes in the ground?",
    false
  );

  let signWest = new Obj(
    "west sign",
    "The sign says\nThe answer to this question is the password to enter the WEST WELL ROOM:\nHow's it goin?",
    false
  );

  let signEast = new Obj(
    "east sign",
    "The sign says\nThe answer to this question is the password to enter the EAST WELL ROOM:\nWhat do you tell someone who is sick of paying their water bill?",
    false
  );

  let rock = new Obj(
    "rock",
    "A very cool looking rock that you could add to your collection at home",
    true
  );

  let well = new Obj(
    "well",
    "A surprisingly well-built stone well.",
    false
  );

  let water = new Water(
    "blue water",
    "Some unnaturally-blue, sickly water. Just this sight of it chills you to the bone. Is that Gatorade? You know you want to drink it",
    false,
    "C",
    "Congratulations, you drank the gross-looking blue water. Are you proud of yourself?"
  );

  let waterBlack = new Water(
    "black water",
    "Some pitch black, swirling, evil-looking water. You stare into it and it seems to stare back. You know you want to drink it",
    false,
    "B",
    "Congratulations, you drank the gross-looking black water. Are you proud of yourself?"
  );

  let waterGreen = new Water(
    "green water",
    "Some putrid, stinky, dark green water. It is bubbling as if something is living beneath the surface. You know you want to drink it",
    false,
    "A",
    "Congratulations, you drank the gross-looking green water. Are you proud of yourself?"
  );

  let cabbage = new Obj(
    "cabbage",
    "An old smelly cabbage. Might still be ok to eat, but you don't know how to eat... ",
    true
  );

  let foyerSign = new Obj(
    "foyer sign",
    "The water is green! The water is black! The water is blue! They who drink of the waters in the wrong order may die a horrible death!"
  );

  let frisbee = new Obj(
    "frisbee",
    "A cool frisbee. Who brought a frisbee here? Sadly you don't know how to throw it... ",
    true
  );

  // create Room instances
  let outside = new Room(
    "Outside",
    `OUTSIDE:
  You are standing in front of The Labyrinth of the Three Wells at 666 Forbidden Dungeon Street between Eternal Damnation Gorge Road and Death Avenue. There is a door to the FOYER here. A surly dungeon guard stands blocking the door so that you cannot pass. On the door is a handwritten SIGN.`,
    ["sign"]
  );

  let foyer = new Room(
    "Foyer",
    `FIRST WELL ROOM:
  You are in a very dank, dark, smelly room with a large stone WELL in the center of it. It is surprisingly well-built. The WELL is full to the brim with swirling, BLUE WATER. You feel repulsed, yet strangely tempted to drink the BLUE WATER. You also notice a cool looking ROCK on the ground. There is also a sign labeled FOYER SIGN. There are doors to the east and west labeled EAST FOYER and WEST FOYER`,
    ["well", "blue water", "rock", "foyer sign"],
    true,
    "well well well",
    "HAHA. correct. you may enter.",
    "Wrong!!! Go read the sign and come back when you know the answer."
  );

  let leftOne = new Room(
    "West Foyer",
    `WEST FOYER:
  This room is really dark and smells like old CABBAGE. It is completely empty, as far as you can tell, aside from a dim lamp hanging above a door labeled WEST WELL ROOM, guarded by a trollish-looking fellow with an eye patch on his left eye. There is a sign labeled WEST SIGN. `,
    ["cabbage", "west sign"]
  );

  let leftTwo = new Room(
    "West Well Room",
    `WEST WELL ROOM:
  You get it by now. There's a gross WELL with gross BLACK WATER. I already know you're going to drink it so just get it over with. There's a door behind you leading back to the WEST FOYER`,
    ["well", "black water"],
    true,
    "well",
    "Well done! You may pass.",
    "Wrong!!! You'd have done well to stay home today."
  );

  let rightOne = new Room(
    "East Foyer",
    `EAST FOYER:
  This room is fairly dark but actually smells quite nice... like Febreeze or something. There is a dim lamp hanging above a door labeled EAST WELL ROOM, guarded by a trollish-looking fellow with an eye patch on his right eye. For some reason there's a FRISBEE on the ground. There is a sign labeled EAST SIGN. `,
    ["frisbee", "east sign"]
  );

  let rightTwo = new Room(
    "East Well Room",
    `EAST WELL ROOM
  A room with another WELL with some GREEN WATER in it. This labyrinth is really living up to its name. You start to feel unwell. Man, you really need to get out of this dad pun hellscape. There's a door back to the EAST FOYER behind you.`,
    ["well", "green water"],
    true,
    "get well soon",
    "Correct!! I wish you well in your quest.",
    "Wrong!!! you should have left well enough alone."
  );

  // lookup table for objects and rooms
  let objectTable = {
    outside: outside,
    foyer: foyer,
    rock: rock,
    sign: sign,
    "west sign": signWest,
    "east sign": signEast,
    well: well,
    'blue water': water,
    'black water': waterBlack,
    'green water': waterGreen,
    "foyer sign": foyerSign,
    "east foyer": rightOne,
    "west foyer": leftOne,
    "east well room": rightTwo,
    "west well room": leftTwo,
    frisbee: frisbee,
    cabbage: cabbage,
  };

  // separate table for water objects to avoid a bug when other objects try to call the 'drink' method
  let waterTable = {
    "blue water": water,
    "black water": waterBlack,
    "green water": waterGreen,
  };

  // introductory text / instructions
  console.log(
    '\n\nTHE LABYRINTH OF THE THREE WELLS\nInstructions:\n-To move between rooms, type "enter" or "move" and the name of the room you wish to move to, IE "enter foyer".\n-Descriptions of rooms will generally place interactive objects or rooms that you can move to in UPPERCASE. To target an object please use the full name (typed in upper or lower case) as stated in the room descriptions.\n-You may also "read," "look", "examine", "take", "drop", and in some cases "drink" (or "guzzle", "imbibe", and "chug") various objects.\n-To see your inventory, type "i" or "inventory".\n-Type "quit" or "exit" at any time to end the game.\n\n'
  );

  // read first room when game starts
  objectTable[currentRoom].read();

  // while loop to continually prompt user for input
  while (true) {
    // Code checking if game winning puzzle has been solved (user drank three "water" objects)
    if (waterIndex === "ABC") {
      console.log(
        "you hear a voice from deep within the labyrinth.. CONGRATULATIONS HERO. YOU DRANK OF THE WATERS IN THE CORRECT ORDER."
      )
      process.exit();
    } else if (waterIndex.length === 3 && waterIndex !== "ABC") {
      console.log(
        "you hear a voice from deep within the labyrinth.. YOU DRANK OF THE WATERS IN THE WRONG ORDER... NOW YOU ARE POISONED... \nYou feel a little sick to your stomach but you'll probably be fine, honestly."
      )
      process.exit();
    }

    // prompt user for action
    answer = await ask(">_");

    // convert answer to lowercase
    answer = answer.toLowerCase();
    // regex code to remove non-alphanumeric characters from a string - helps sanitize user input
    answer = answer.replace(/[^\w\s]/g, "");

    // separate action words from directions / identifiers
    // split answer input into one word command and multiple word values
    let answerArr = answer.split(" ");
    let command = answerArr.splice(0, 1).join("");
    let value = answerArr.join(" ");

    // creating arrays to allow multiple types of action words triggering one method, ie "slurp" triggers drink() method
    let moveWords = ["enter", "move", "walk"];
    let takeWords = ["take", "grab"];
    let readWords = ["read", "examine", "look"];
    let dropWords = ["drop", "leave"];
    let drinkWords = ["drink", "slurp", "imbibe", "guzzle", "chug"];

    // check answer to determine action to be taken (see if an index number exists in arrays of allowable action words)

    // if statement to check inventory
    if (command === "i" || command === "inventory") {
      console.log("current inventory: " + inventory.join(", "));
      // allow user to exit
    } else if (command === "quit" || command === "exit") {
      process.exit();
    }
    // if command is not recognized
    else if (objectTable[value] == undefined) {
      console.log(`Sorry, you can't ${command} ${value}`);
      // if move command is entered
    } else if (moveWords.indexOf(command) !== -1) {
      // checking for locked room
      if (objectTable[value].locked === true) {
        // making sure move is possible
        if (!lookup[currentRoom].includes(value)) {
          console.log(`you can\'t enter ${value} from ${currentRoom}... `);
        } else {
          // test user for correct password, display appropriate answer
          let correct = objectTable[value].key;
          let password = await ask('the guard says: "what is the password?" ');
          // convert answer to lowercase
          password = password.toLowerCase();
          // regex code to remove non-alphanumeric characters from a string
          password = password.replace(/[^\w\s]/g, "");

          if (password === correct) {
            // log correct response, unlock room, send user into new room
            console.log(
              'the guard says: "' + objectTable[value].correctResponse + '"'
            );
            objectTable[value].locked = false;
            objectTable[currentRoom].changeRoom(value);
          } else {
            // log incorrect response
            console.log(
              'the guard says: "' + objectTable[value].incorrectResponse + '"'
            );
          }
        }
      } else {
        // change room if not locked
        objectTable[currentRoom].changeRoom(value);
      }

      // if read is entered
    } else if (readWords.indexOf(command) !== -1) {
      objectTable[value].read();

      // if take is entered
    } else if (takeWords.indexOf(command) !== -1) {
      objectTable[currentRoom].take(value);

      // if drop is entered
    } else if (dropWords.indexOf(command) !== -1) {
      objectTable[currentRoom].drop(value);

      // if drink is entered. Right side of && accounts for drinking things that can't be drunk
    } else if (
      drinkWords.indexOf(command) !== -1 &&
      waterTable[value] !== undefined
    ) {
      waterTable[value].drink();
    } else if (waterTable[value] === undefined) {
      console.log("You can't drink that");
    }
  }
}
