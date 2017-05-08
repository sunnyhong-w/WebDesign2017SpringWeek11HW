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

	var messageField = $("#messageInput");
	var nameField = $("#nameInput");
	var messageList = $("#example-message");

	messageField.keypress((e) => {
		if(e.keyCode == 13)
		{
			var username = nameField.val();
			var message = messageField.val();

			dbRef.child("chat").push({ name: username, text: message });
			messageField.val('');
		}
	})

	dbRef.child("chat").limitToLast(10).on('child_added', (snapshot) => {
		var data = snapshot.val();
		var username = data.name || "anonymous";
		var message = data.text;

		var messageElement = $("<li>");
		var nameElement = $("<strong class='example-chat-username'></strong>");

		nameElement.text(username);
		messageElement.text(message).prepend(nameElement);

		messageList.append(messageElement);
		messageList[0].scrollTop = messageList[0].scrollHeight;
	})
})