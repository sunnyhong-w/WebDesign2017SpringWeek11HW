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

	var dbRef = firebase.database().ref().child('object');

	dbRef.on('value', (snap) => {
		$("#title").html(snap.val());
		console.log(snap.val());
	})
})