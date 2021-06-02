PAGES.load();
FORMS.load();
TABS.load();

function signOut() {
    firebase.auth().signOut();
}

firebase.auth().onAuthStateChanged(user => {
    const authenticated = !!user;

    if (authenticated) {
        console.log(`User current signed in as ${user.email}.`);
    } else {
        console.log('User is currently signed out.');
        PAGES.setPage('sign-in');
    }

    document.querySelectorAll('[auth], [no-auth]').forEach(element => {
        element.setAttribute('authenticated', authenticated);
    });
});

FORMS.register('sign-in', async data => {
    try {
        const credential = await firebase.auth().signInWithEmailAndPassword(data.email, data.password);
        const user = credential.user;
        console.log(user);
        PAGES.setPage('home');
        return true;
    } catch (error) {
        FORMS.display('sign-in', error.message, 'error');
        return false;
    }
});