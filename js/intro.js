// intro.js

// Character introductions
class Character {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }
}

const simona = new Character('Simona', 'A brave warrior from the north.');
const batoni = new Character('Batoni', 'A cunning rogue with a mysterious past.');

// Cutscene Sequencing
class Cutscene {
    constructor(characters) {
        this.characters = characters;
        this.sequence = [];
        this.currentStep = 0;
    }

    addStep(step) {
        this.sequence.push(step);
    }

    start() {
        if (this.sequence.length > 0) {
            this.playStep();
        } else {
            console.log('No steps in cutscene sequence.');
        }
    }

    playStep() {
        if (this.currentStep < this.sequence.length) {
            console.log(this.sequence[this.currentStep]);
            this.currentStep++;
            setTimeout(() => this.playStep(), 2000); // auto-progress every 2 seconds
        } else {
            console.log('Cutscene ended.');
        }
    }
}

// Example usage
const cutscene = new Cutscene([simona, batoni]);
cutscene.addStep(`Introduction of ${simona.name}: ${simona.description}`);
cutscene.addStep(`Introduction of ${batoni.name}: ${batoni.description}`);
cutscene.start();
