// Firebase Konfiguration - EXAKT nach deinem neuen Foto übertragen
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

// Initialisierung (Compatibility Mode für einfache HTML Seiten)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// --- LOGIN FUNKTION ---
function login() {
    const name = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorDisplay = document.getElementById('auth-error');

    if (!name || !pass) {
        errorDisplay.innerText = "Bitte Name und Passwort eingeben!";
        return;
    }

    errorDisplay.innerText = "Verbindung zum Hangar...";

    // VORSICHT: Wenn du in Unity z.B. "@game.de" nutzt, ändere das hier!
    const email = name.trim().toLowerCase() + "@test.de"; 

    auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            console.log("Login erfolgreich!");
            errorDisplay.innerText = "";
        })
        .catch((error) => {
            console.error("Firebase Fehler:", error.code);
            if (error.code === "auth/user-not-found") {
                errorDisplay.innerText = "Pilot unbekannt! Check die Email-Endung im Script (@test.de).";
            } else if (error.code === "auth/wrong-password") {
                errorDisplay.innerText = "Falsches Passwort!";
            } else {
                errorDisplay.innerText = "Fehler: " + error.message;
            }
        });
}

function logout() {
    auth.signOut();
}

// --- STATUS-ÜBERWACHUNG ---
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

// --- DATEN LADEN ---
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
