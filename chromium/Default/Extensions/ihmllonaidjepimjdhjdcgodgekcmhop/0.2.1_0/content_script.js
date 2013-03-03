$(function(){

    var lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    var editable = null;
    $("input, textarea").mousedown(function(){
        // Capture the editable element
        editable = $(this);
    });

    chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
            if (request.insertLoremIpsum === true) {
                type = editable.attr("type");
                name = editable.attr("name");
                if (type == "email" || name.indexOf("email") != -1) {
                    editable.val("email@example.com");
                }
                else if (type == "url" || name.indexOf("url") != -1 || name.indexOf("website") != -1) {
                    editable.val("http://www.example.com");
                }
                else if (type == "number") {
                    var max = editable.attr("max") ? editable.attr("max") : 100;
                    var min = editable.attr("min") ? editable.attr("min") : 0;
                    var randomNumber = Math.random() * (max - min) + min;
                    editable.val(Math.floor(randomNumber));
                }
                else {
                    var maxlength = editable.attr("maxlength")
                    if (maxlength) {
                        lorem = lorem.substring(0, maxlength)
                    }
                    editable.val(lorem);
                }

                sendResponse({"insertedLoremIpsum": true});
            }
            else {
                sendResponse({"insertedLoremIpsum": false});
            }
        }
    );
});