// KORRIGIERTE FIREBASE KONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyA0Et1D50vP8KnaRC1nyNN5dN0OGqpqq7c",
    authDomain: "lpmzt-5c267.firebaseapp.com",
    databaseURL: "https://lpmzt-5c267-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "lpmzt-5c267",
    storageBucket: "lpmzt-5c267.firebasestorage.app",
    messagingSenderId: "378438452791",
    appId: "1:378438452791:web:33bec3f294a63aa41361b2",
    measurementId: "G-M2QSLJ32X1"
};

// Start
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

function login() {
    const name = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorDisplay = document.getElementById('auth-error');

    if (!name || !pass) {
        errorDisplay.innerText = "Name und Passwort fehlen!";
        return;
    }

    // ACHTUNG: Nutze hier die gleiche Endung wie in Unity!
    const email = name.trim().toLowerCase() + "@test.de"; 

    auth.signInWithEmailAndPassword(email, pass)
        .catch((error) => {
            console.error("Login Fehler:", error.code);
            errorDisplay.innerText = "Login fehlgeschlagen. Daten prüfen!";
        });
}

function logout() { auth.signOut(); }

// Überwachung Login-Status
auth.onAuthStateChanged(user => {
    const loginUI = document.getElementById('auth-section');
    const leaderUI = document.getElementById('leaderboard-section');

    if (user) {
        loginUI.style.display = 'none';
        leaderUI.style.display = 'block';
        loadUserData(user.uid);
        loadLeaderboard();
    } else {
        loginUI.style.display = 'block';
        leaderUI.style.display = 'none';
    }
});

function loadUserData(uid) {
    db.ref('users/' + uid).once('value').then(snap => {
        const data = snap.val();
        if (data) {
            document.getElementById('welcome-name').innerText = data.username || "Pilot";
            document.getElementById('my-score').innerText = data.highscore || 0;
        }
    });
}

function loadLeaderboard() {
    const tbody = document.querySelector('#leaderboard-table tbody');
    db.ref('users').orderByChild('highscore').limitToLast(10).on('value', (snapshot) => {
        tbody.innerHTML = "";
        let players = [];
        snapshot.forEach(child => {
            let p = child.val();
            if (p.username) players.push(p);
        });

        players.reverse().forEach((p, i) => {
            let row = `<tr>
                <td class="${i === 0 ? 'gold' : ''}">${i + 1}</td>
                <td>${p.username}</td>
                <td>${p.highscore || 0}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    });
}