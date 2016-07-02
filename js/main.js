/***
Copyright: Akshay Goel
http://akshaygoel.net
 */

/*
	Instaniating Variables
 */
var userType_ = "none";
var lineHeight = 0;

/*
Events to occur when the document is loaded.
 */
$(document).ready(function() {
	$("#nameInput").keyup(function(event){
	    if(event.keyCode == 13){
	        $("#goButton").click();
	        $('#main').remove();
	        $('body').css("font-family", "Lato");
	        $('#session-container').css("display","block");
	    }
	});

	/*Give Values to the global variables*/
	lineHeight = parseInt($('.ace_line_group').height());

	/*Set code editor css dynamically using variables*/
	$('.ace_scroller').css('top', lineHeight);
	$('.ace_gutter').css('top', lineHeight);

	/*
		Plus Icon Events
	 */
	$('.fa-plus-square').hover(
		function() { //Mouse Enters
		$(this).css('font-size', '1.5em');
		var marginAround =(lineHeight - $(this).height())/2;
		var activeLine_top = parseInt($('.ace_active-line').css('top'), 10);
		$(this).css('top', lineHeight + activeLine_top + marginAround );
		},
		function() { //Mouse Leaves
			$(this).css('font-size', '1em');
			var marginAround =(lineHeight - $(this).height())/2;
			var activeLine_top = parseInt($('.ace_active-line').css('top'), 10);
			$(this).css('top', lineHeight + activeLine_top + marginAround );
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
		switch(event.target) {
			case $(".ace_content")[0]:
				var activeLine_top = parseInt($('.ace_active-line').css('top'), 10);
				var plusMargin = (lineHeight - parseInt($('#activeLine-plus').height())) / 2;
				$('#activeLine-plus').css('top', activeLine_top + plusMargin + lineHeight);
				$('#activeLine-plus').css('display', 'block');
				break;
		}
	}	
})

$(document).mousemove(function(event) {
	$('#plusSymbol').css('display', 'block');
	var activeLine_top = parseInt($('.ace_active-line').css('top'), 10);
	var plusMargin = (lineHeight - parseInt($('#plusSymbol').height())) / 2;

	if (event.pageY > lineHeight) {
		$('#plusSymbol').css('top', Math.floor(((event.pageY - lineHeight)/lineHeight))*lineHeight + lineHeight + plusMargin + 'px');
	}

	if (mouseOverActiveLine()) {
		$('#plusSymbol').css('display', 'none');
	}

	function mouseOverActiveLine() {
		if ((event.pageY > activeLine_top + lineHeight) &&
			(event.pageY < activeLine_top + lineHeight + lineHeight)) {
				return true;
			}
	}
})

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

  var userId = getUserId();
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
}

