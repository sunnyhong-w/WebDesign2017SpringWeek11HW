$(document).ready(()=>{
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyANUF6zYyrjYZpIXb27wHESDpw3HUw1-dE",
		authDomain: "webdesign2017springhw-week11.firebaseapp.com",
		databaseURL: "https://webdesign2017springhw-week11.firebaseio.com",
		projectId: "webdesign2017springhw-week11",
		storageBucket: "webdesign2017springhw-week11.appspot.com",
		messagingSenderId: "585281406899"
	};
	firebase.initializeApp(config);

	var dbRef = firebase.database().ref();

	//AUTH

	firebase.auth().onAuthStateChanged((user) => {
		if(user)
		{
			$(".login").fadeOut(500, 'swing', () => {
				$(".chatroom").fadeIn(500, 'swing');
			});
		}
	})

	//Login

	const loginAccount = $("#login-account");
	const loginPassword = $("#login-password");

	$(".btn-login").click(() => {
		const account = loginAccount.val();
		const password = loginPassword.val();

		const loginPromise = firebase.auth().signInWithEmailAndPassword(account, password);

		loginPromise.catch((e) => {
			if(e.code === "auth/user-not-found")
			{
				const createPromise = firebase.auth().createUserWithEmailAndPassword(account, password);
				createPromise.catch((e) => {
					$(".login-error").html("<p>Sorry,<br>" + e.message + "<br>Please check your input and try it again.</p>")
					$(".login-error").slideUp(250, 'swing');
					$(".login-error").slideDown(500, 'swing');
					console.log(e.message);
				})

				createPromise.then((e) => {
					$(".login-error").hide();
				})
			}
			else
			{
				$(".login-error").html("<p>Sorry,<br>" + e.message + "<br>Please check your input and try it again.</p>")
				$(".login-error").slideUp(250, 'swing');
				$(".login-error").slideDown(500, 'swing');
				console.log(e.message);
			}
		})

		loginPromise.then((e) => {
			$(".login-error").hide();
		})
	})

	//Web Start
	$(".login").fadeIn(1000, 'swing');
	firebase.auth().signOut();
})