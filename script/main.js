$(document).ready(()=>{
	var photoURL;

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
	var storageRef =  firebase.storage().ref();

	function datecalc(time) {
		const dt = new Date(time);
		return dt.getHours() + ":" + dt.getMinutes() + " at " + dt.getFullYear() + "." + (dt.getMonth() + 1) + "." + dt.getDate();
	}

	function namecheck(user) {
		if(!user.displayName)
		{
			$(".whitemark").show();
			$(".chatroom").css("filter", "blur(2px)");
		}
		else
		{
			$(".whitemark").fadeOut(200);
			$(".chatroom").css("filter", "");
		}
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
			$("#info-name")[0].parentElement.MaterialTextfield.change(user.displayName || "");
			$("#info-name-out").text(user.displayName || "Anonymous");
			$("#info-img").attr("src", user.photoURL || "image/unknow.svg");

			namecheck(user);

			dbRef.child("user").child(firebase.auth().currentUser.uid).once('value').then((snapshot) => {
				var data = snapshot.val()

				$("#info-occupation")[0].parentElement.MaterialTextfield.change(data.occupation || "");
				$("#info-age")[0].parentElement.MaterialTextfield.change(data.age || 0);
				$("#info-descriptions")[0].parentElement.MaterialTextfield.change(data.descriptions || "");

				$("#info-occupation-out").text(data.occupation || "<No occupation>");
				$("#info-age-out").text(data.age || 0);
				$("#info-descriptions-out").text(data.descriptions || "<No descriptions>");
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
				$(".chatroom-overflow").stop();
				$(".chatroom-overflow").animate({ scrollTop: $(".chat-template").length * 62}, 1000); //hack scroll pos
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
					dbRef.child("user").child(user.uid).set({
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

	$(".btn-edit").click(() => {
		$(".info").slideUp(200, () => {
			$(".edit").slideDown(200);
			$(".info-imgupload").css("display", "flex");
		});
	})

	$(".btn-clear").click(() => {
		$(".edit").slideUp(200, () => {
			$(".info").slideDown(200, ()=> {
				var user = firebase.auth().currentUser;
				$("#info-img").attr("src", user.photoURL || "image/unknow.svg");
				$("#info-name")[0].parentElement.MaterialTextfield.change($("#info-name-out").text());
				$("#info-occupation")[0].parentElement.MaterialTextfield.change($("#info-occupation-out").text());
				$("#info-age")[0].parentElement.MaterialTextfield.change($("#info-age-out").text());
				$("#info-descriptions")[0].parentElement.MaterialTextfield.change($("#info-descriptions-out").text());
			});
		});
	})

	$(".btn-done").click(() => {
		$(".edit").slideUp(200, () => {
			$(".info").slideDown(200);
		});

		const displayName = $("#info-name").val();
		const occupation = $("#info-occupation").val();
		const age = $("#info-age").val();
		const descriptions = $("#info-descriptions").val();

		dbRef.child("user").child(firebase.auth().currentUser.uid).update({occupation, age, descriptions}).then(() => {
			$("#info-occupation-out").text(occupation);
			$("#info-age-out").text(age);
			$("#info-descriptions-out").text(descriptions);
		});

		firebase.auth().currentUser.updateProfile({displayName, photoURL}).then(() => {
			var user = firebase.auth().currentUser;
			namecheck(user);
			$("#info-name-out").text(user.displayName);
			$("#info-img").attr("src", user.photoURL || "image/unknow.svg");
		});
	})

	$(".btn-logout").click(() => {
		firebase.auth().signOut();
		location.reload();
	})
	

	//Chat

	const chatinput = $("#chat-text")
	chatinput.keypress((e) => {
		if(e.keyCode == 13 && chatinput.val() != "")
		{
			const name = $("#info-name").val();
			var timg = $("#info-img").attr("src");
			const image = timg != "image/unknow.svg" ? timg : "";

			var obj = {};
			obj.user = {
				name, image
			}
			obj.time = Date.now();
			obj.message = chatinput.val();

			dbRef.child("chat").push(obj);
			chatinput[0].parentElement.MaterialTextfield.change('');
		}
	})

	$("#login-account").keypress((e) => {
		if(e.keyCode == 13)
		{
			$(".btn-login").trigger("click");
		}
	})

	$("#login-password").keypress((e) => {
		if(e.keyCode == 13)
		{
			$(".btn-login").trigger("click");
		}
	})

	//File
	$("#info-file").change((e) => {
		e.stopPropagation();
		e.preventDefault();

		var file = e.target.files[0];

		var metadata = {
			'contentType': file.type
		}

		storageRef.child("images/" + file.name).put(file, metadata).then((snapshot) => {
			photoURL = snapshot.metadata.downloadURLs[0];
			$("#info-img").attr("src", photoURL || "image/unknow.svg");
		}).catch((e) => {
			console.log(e);
		})
	});

	$(".info-imgupload").click(() => {
		$("#info-file").trigger('click');
	})

	//Web Start
	$(".login").fadeIn(1000, 'swing');
	//firebase.auth().signOut();
})