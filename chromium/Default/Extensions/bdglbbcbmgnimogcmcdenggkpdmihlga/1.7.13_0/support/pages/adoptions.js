var names = document.getElementsByClassName('plugin-name');
for (var i = names.length; i--;) {
	names[i].innerHTML = p180.name;
}

function select_handler(e) {
	if (e.target.href) {
		var current = e.target.parentNode;
		var other = current.parentNode.getElementsByClassName('bold')[0];
		other.className = '';
		other.innerHTML =  '<a href="#">' + other.textContent.slice(0,-1) + '</a>';
		current.innerHTML = current.textContent + 'd';
		current.className = 'bold';
		if (current.id == 'enable')
			stored.support = "true";
		else
			stored.support = "false";
	}
}

var bg = chrome.extension.getBackgroundPage();
var stored = bg.localStorage;
var select = document.getElementById('options');
select.onclick = select_handler;

if (stored.support == 'false') {
	var enable = document.getElementById('enable');
	enable.className = '';
	enable.innerHTML = '<a href="#">Enable</a>';

	var disable = document.getElementById('disable');
	disable.className = 'bold';
	disable.innerHTML = 'Disabled';
}

document.body.style.visibility = "visible";