// Game Configuration Constants

const gameConfig = {
    settings: {
        difficulty: 'normal',
        maxPlayers: 4,
        tutorialEnabled: true,
    },
    uiConfig: {
        theme: 'dark',
        showFPS: true,
        resolution: {
            width: 1920,
            height: 1080,
        },
    },
    firebaseFlags: {
        analytics: true,
        firestore: true,
        authentication: true,
    }
};

export default gameConfig;