// js/menu.js

class Menu {
    constructor() {
        this.language = 'en';
        this.backgroundImage = ''; // URL for background image
        this.isGameStarted = false;
    }

    render() {
        const menu = document.createElement('div');
        menu.className = 'main-menu';

        // Background image support
        if (this.backgroundImage) {
            menu.style.backgroundImage = `url(${this.backgroundImage})`;
        }

        // Language toggle button
        const langToggle = document.createElement('button');
        langToggle.innerText = this.language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés';
        langToggle.onclick = () => this.toggleLanguage();
        menu.appendChild(langToggle);

        // Start Game button
        const startButton = document.createElement('button');
        startButton.innerText = 'Start Game';
        startButton.disabled = this.isGameStarted;
        startButton.onclick = () => showIntro(startGame);
        menu.appendChild(startButton);

        document.body.appendChild(menu);
    }

    toggleLanguage() {
        this.language = this.language === 'en' ? 'es' : 'en';
        this.render(); // Re-render the menu with new language
    }
    
// Example of usage:
const mainMenu = new Menu();
const mainMenu = new Menu();
mainMenu.backgroundImage = 'https://raw.githubusercontent.com/piraligame/pirali/main/assets/images/ui/menu-background.jpg';
mainMenu.render();
