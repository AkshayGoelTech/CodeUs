
var userType_ = "none";

$(document).ready(function() {
	$("#nameInput").keyup(function(event){
	    if(event.keyCode == 13){
	        $("#goButton").click();
	        $('#main').remove();
	        $('body').css("font-family", "Lato");
	        $('#session-container').css("display","block");
	    }
	});
})

$(document).click(function() {

	if ($('#main')[0]) {
		switch(event.target) {

			case $('#goButton')[0]:
				$('#main').remove();
				$('body').css("font-family", "Lato");
				$('#session-container').css("display","block");
				break;

			case $("#userType > .btn")[0]:
			case $("#userType > .btn")[1]:
				$(event.target).addClass("active").siblings().removeClass("active");
				document.getElementById('nameInput').focus();
				document.getElementById('goButton').style.display = "inline-block";
				userType_ = $(event.target).text();
				console.log(userType_);
				break;

			case $("#nameInput")[0]:
				break;

			default: 
				$("#userType > .btn").removeClass("active");
				document.getElementById('goButton').style.display = "none";
				break;
		}
	}
	else {

	}
	
});

function init() {
  var firepadRef = setUpFirepad();

  // Create ACE
  var editor = ace.edit("firepad-container");
  editor.setTheme("ace/theme/textmate");
  var session = editor.getSession();
  session.setUseWrapMode(true);
  session.setUseWorker(false);
  session.setMode("ace/mode/javascript");

  //var userId = Math.floor(Math.random() * 9999999999).toString();

  // Create Firepad.
  var firepad = Firepad.fromACE(firepadRef, editor, {
    defaultText: '// JavaScript Editing with Firepad!\nfunction go() {\n  var message = "Hello, world.";\n  console.log(message);\n}'
  });

  var userId = afterFirepad(firepadRef);
  var displayName = $('#nameInput').val();
  var firepadUserList = FirepadUserList.fromDiv(firepadRef.child('users'),
      document.getElementById('userlist'), userId, displayName);

  //Partially Works.
  firepadRef.child("users").on("value", function(snapshot) {
      if (snapshot.numChildren() == 1) {
        firepadRef.onDisconnect().remove();
      }
  });

  firepad.on('ready', function() {
    if (firepad.isHistoryEmpty()) {
      firepad.setText('Check out the user list to the left!');
    }
  });

}

// Helper to get hash from end of URL or generate a random one.
function setUpFirepad() {
  var ref = new Firebase('https://real-time-interview-project.firebaseio.com/');
  var hash = window.location.hash.replace(/#/g, '');
  if (hash) {
    ref = ref.child(hash);
  } else {
    ref = ref.push(); // generate unique location.
    window.location = window.location + '#' + ref.key(); // add it as a hash to the URL.
  }

  if (typeof console !== 'undefined')
    console.log('Firebase data: ', ref.toString());
  return ref;
}

function afterFirepad(ref) {

  var  userId = getUserId();
  ref = ref.child('users').child(userId);
  console.log(ref.toString());

  return userId;
}

