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

	function datecalc(time) {
		const dt = new Date(time);
		return dt.getHours() + ":" + dt.getMinutes() + " at " + dt.getFullYear() + "." + (dt.getMonth() + 1) + "." + dt.getDate();
	}

	//AUTH

	firebase.auth().onAuthStateChanged((user) => {
		if(user)
		{
			$(".login").fadeOut(250, 'swing', () => {
				$(".main").fadeIn(250, 'swing');
			});

			//Set User Data

			var user = user.providerData[0];
			$("#info-name").text(user.displayName || "Anonymous");
			$("#info-img").attr("src", user.photoURL || "image/unknow.svg");

			dbRef.child("user").child(firebase.auth().currentUser.uid).once('value').then((snapshot) => {
				var data;
				for(key in snapshot.val()) //只會發生一次
					data = snapshot.val()[key];

				$("#info-occupation").text(data.occupation || "<No occupation>");
				$("#info-age").text(data.age || 0);
				$("#info-descriptions").text(data.descriptions || "<No descriptions>");
			});

			//Chat History
			const chatTemplate = $(".chat-template");

			dbRef.child("chat").limitToLast(20).on('child_added', (snapshot) => {
				var data = snapshot.val();
				var user = data.user;
				var message = data.message;
				var time = data.time;

				var obj = chatTemplate.clone();

				$(obj).find(".chat-userimg").attr("src", user.image || "image/unknow.svg");
				$(obj).find(".chat-username").text(user.name || "Anonymous");
				$(obj).find(".chat-time").text(datecalc(time));
				$(obj).find(".chat-data").text(message || "(Null)");

				$(obj).appendTo(".chatroom-overflow > div");
				$(obj).removeClass("template");
				$(".chatroom-overflow").animate({ scrollTop: $(".chatroom-overflow").height() }, 1000);
			})
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

				createPromise.then((user) => {
					dbRef.child("user").child(user.uid).push({
						"occupation": "",
						"age": 0,
						"descriptions" : ""
					});

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

	//Chat

	const chatinput = $("#chat-text")
	$("#chat-text").keypress((e) => {
		if(e.keyCode == 13 && chatinput.val() != "")
		{
			var obj = {};
			obj.user = {
				name : "testname"
			}
			obj.time = Date.now();
			obj.message = chatinput.val();

			dbRef.child("chat").push(obj);
			chatinput.val('');
		}
	})

	//Web Start
	$(".login").fadeIn(1000, 'swing');
	//firebase.auth().signOut();
})