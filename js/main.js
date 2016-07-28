/***
Copyright: Akshay Goel
http://akshaygoel.net
 */

/*
	Instaniating Variables
 */
var userType_ = "none";
var userId = null;
var userRef = null;
var sessionRef = null;

var lineHeight = 0;
var activeLine_top = parseInt($('.ace_active-line').css('top'), 10);
var plusLineClickTop = 0;
var commentMap = {};

$(document).keyup(function(event) {
	moveActiveLinePlus();
});

/*
Events to occur when the document is loaded.
 */
$(document).ready(function() {
	$("#nameInput").keyup(function(event){
	    if(event.keyCode == 13){
	        initSessionVars();
	        $("#goButton").click();
	        $('#main').remove();
	        $('body').css("font-family", "Lato");
	        $('#session-container').css("display","block");
	    }
	});

	/*
		Plus Icon Events
	 */
	$('.fa-plus-square').hover(
		function() { //Mouse Enters
			changePlusSize(this, '1.5em');
		},
		function() { //Mouse Leaves
			changePlusSize(this, '1em');
		}
	);

	$('.fa-plus-square').popover({
		html: true,
		content: function() {
		          return $("#plus-popover-content").html();
		        },
		title: function() {
		          return $("#plus-popover-title").html();
		        }
	});

})

/*
 	Occurs when the document is clicked anywhere. Include specefic event.target
 	actions in the switch statement. May include functions to modularize code.
 */
$(document).click(function(event) {
	if ($('#main')[0]) {		
		/*In User Info Screen*/
		switch(event.target) {

			case $('#goButton')[0]:
				initSessionVars();
				$('#main').remove();
				$('body').css("font-family", "Lato");
				$('#session-container').css("display","block");
				$('#session-container').css("visibility","visible");
				break;

			case $("#userType > .btn")[0]:
			case $("#userType > .btn")[1]:
				$(event.target).addClass("active").siblings().removeClass("active");
				document.getElementById('nameInput').focus();
				document.getElementById('goButton').style.display = "inline-block";
				userType_ = $(event.target).text();
				break;

			case $("#nameInput")[0]:
				break;

			default: 
				$("#userType > .btn").removeClass("active");
				document.getElementById('goButton').style.display = "none";
				break;
		}
	}
	/*In Coding Screen*/
	else {
		var currentLine;
		switch(event.target) {
			case $('#plusSymbol')[0]:
				var plusMargin = (lineHeight - parseInt($(event.target).height())) / 2;
				plusLineClickTop = parseInt($(event.target).css('top')) - lineHeight - plusMargin + 'px';
				$(event.target).popover('toggle');
				$(event.target).popover('show');
				break;

			case $(".ace_content")[0]:
				moveActiveLinePlus();
				break;

			case $('#sendComment')[0]:
				sendComment(event.target);
				$(event.target).parent().parent().parent().popover('hide');
				break;

			case $('#close')[0]:
				$(event.target).parent().parent().popover('hide');

			default:
				break;
		}
	}	
})

$(document).mousemove(function(event) {
	if (!$('#main')[0]) {
		$('#plusSymbol').css('display', 'block');
		activeLine_top = getActiveLineTop();
		var plusMargin = (lineHeight - parseInt($('#plusSymbol').height())) / 2;

		if (event.pageY > lineHeight) {
			$('#plusSymbol').css('top', Math.floor(((event.pageY - lineHeight)/lineHeight))*lineHeight + lineHeight + plusMargin + 'px');
		}

		if (mouseOverActiveLine()) {
			$('#activeLine-plus').css('display', 'none');
		}
		else {
			moveActiveLinePlus();
		}

		function mouseOverActiveLine() {
			if ((event.pageY > activeLine_top + lineHeight) &&
				(event.pageY < activeLine_top + lineHeight + lineHeight)) {
					return true;
			}
		}
	}
	
})


/*
	Helper Functions
 */

function getActiveLineTop() {
	return parseInt($('.ace_active-line').css('top'), 10);
}

function changePlusSize(thisPlus, newSize) {
	$(thisPlus).css('font-size', newSize);
	var marginAround =(lineHeight - $(thisPlus).height())/2;
	activeLine_top = getActiveLineTop();
	$(thisPlus).css('top', lineHeight + activeLine_top + marginAround );
}

function moveActiveLinePlus() {
	activeLine_top = getActiveLineTop();
	var plusMargin = (lineHeight - parseInt($('#activeLine-plus').height())) / 2;
	$('#activeLine-plus').css('top', activeLine_top + plusMargin + lineHeight);
	$('#activeLine-plus').css('display', 'block');
}

function sendComment(event, top) {
	var body = event.parentElement.children[0].value;
	sessionRef.child('comments').push({'lineTop':plusLineClickTop, 'body':body});
	commentMap[plusLineClickTop] = true;
	console.log('sent');
	console.log(sessionRef.child('comments').toString());
}

function addCommentToLine(line) {
	console.log(line);
	$('#session-container').append(' <i class="fa fa-comments" id="comment-' + line + '"></i> ');
	$("#comment-" + line).css('top', parseInt(line) + lineHeight + 'px');
}

function initSessionVars() {
	
	/*Give Values to the global variables*/
	lineHeight = parseInt($('.ace_line_group').height());

	/*Set code editor css dynamically using variables*/
	$('.ace_scroller').css('top', lineHeight);
	$('.ace_gutter').css('top', lineHeight);
}


/*
	STUDENT functions
 */

/*
	Interviewer Functions
 */


/*
	Function to start firebase setup. It happens when user clicks go button
 */
function init() {
  var firepadRef = setUpFirepad();

  // Create ACE
  var editor = ace.edit("firepad-container");
  editor.setTheme("ace/theme/github");
  var session = editor.getSession();
  session.setUseWrapMode(true);
  session.setUseWorker(false);
  session.setMode("ace/mode/java");

  // Create Firepad.
  var firepad = Firepad.fromACE(firepadRef, editor, {
    defaultText: 'function go() {\n  var message = "Hello, world.";\n  console.log(message);\n}'
  });

  userId = getUserId();
  var displayName = $('#nameInput').val();
  var firepadUserList = FirepadUserList.fromDiv(firepadRef.child('users'),
      document.getElementById('userlist'), userId, displayName);

  afterFirepad(firepadRef, editor, firepad);


  //Partially Works.
  firepadRef.child("users").on("value", function(snapshot) {
      if (snapshot.numChildren() == 1) {
        firepadRef.onDisconnect().remove();
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

function afterFirepad(ref, ace, firepad) {

	/*Add Interviewer specefic things here*/
	if (userType_ == "Interviewer") {
		ace.getSession().setUseWorker(true);
	}
	sessionRef = ref;
	userRef = ref.child(userId);
	console.log(userRef.toString());


	sessionRef.child('comments').on('child_added', function(childSnapshot, prevChildKey) {
		addCommentToLine(childSnapshot.val().lineTop);	  
	});
}

