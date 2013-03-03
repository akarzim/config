
var bgPage = chrome.extension.getBackgroundPage();

//window.onload = GenerateReport;

function byId(id) { return document.getElementById(id); }

window.addEventListener("DOMContentLoaded", function() {
    byId('delete404s').onclick  = Delete404s;
    byId('deleteEmpty').onclick = DeleteEmptyFolders;
    byId('deleteDuplicates').onclick = DeleteDuplicates;
    byId('deleteDuplicates').onclick = DeleteDuplicates;
}, false);

window.addEventListener("click", function(e) {
    if (e.target.parentNode.classList.contains('deleteColumn')) {
        var id = e.target.parentNode.parentNode.id;
        var type = id.slice(0,1);
        if (type == 'b') {
            DeleteBookmark(id.slice(1));
        } else if (type == 'd') { 
            DeleteDuplicate(e.target.dataset.url, id.slice(1));
        }
    }
        
}, false);

function GenerateReport() {
    var tr = null;
    var td = null;
    var a = null;
    var txt = null;
    var tbl = document.getElementById("results");
    var entries;

    document.getElementById("scanDate").innerHTML = bgPage.GetPrettyDate(bgPage.options.LastScan);

    for (var key in bgPage.results) {
        entries = bgPage.results[key];
        entries.sort(function (a, b) {
            if (a.bookmark.path + a.bookmark.title.toUpperCase() < b.bookmark.path + b.bookmark.title.toUpperCase()) {
                return -1;
            }
            if (a.bookmark.path + a.bookmark.title.toUpperCase() > b.bookmark.path + b.bookmark.title.toUpperCase()) {
                return 1;
            }
            return 0;
        });

        for (var i = 0; i < entries.length; i++) {
            var style = (key == 404) ? "not_found" : "other";

            document.write("<tr id='b" + entries[i].bookmark.id + "'>");
            document.write("<td class='deleteColumn'><img src='x.gif' class='deleteButton' title='Delete bookmark'/></td>");
            document.write("<td>" + key + "</td>");
            document.write("<td class='" + style + "'>" + entries[i].statusText + "</td>");
            document.write("<td><a href='" + entries[i].bookmark.url + "' target='_blank'>" + strip(entries[i].bookmark.path + entries[i].bookmark.title) + "</a></td>");
            document.write("</tr>");
        }
    }

    if (bgPage.problemCount > 0) {
        document.getElementById("problemCount").innerHTML = bgPage.problemCount;
        document.getElementById("problemArea").style.display = "";
    }
}

function GenerateDuplicateReport() {
    var urls = [];

    for (var key in bgPage.bookmarkUrls) {
        urls.push(key);
    }

    urls.sort();

    for (var u = 0; u < urls.length; u++) {
        var url = urls[u];

        if (bgPage.bookmarkUrls[url].length > 1) {
            document.write("<tr>");
            document.write("<td></td><td colspan='2' style='font-weight:bold;'>");

            document.write("<a href='" + url + "' target='_blank'>" + url + "</a>");
            document.write("</td>");
            document.write("</tr>");

            bgPage.bookmarkUrls[url].sort(function (a, b) {
                var aTitle = a.path + a.title.toLowerCase();
                var bTitle = b.path + b.title.toLowerCase();

                if (aTitle < bTitle) {
                    return -1;
                }
                if (aTitle > bTitle) {
                    return 1;
                }
                return 0;
            });

            for (var i = 0; i < bgPage.bookmarkUrls[url].length; i++) {
                document.write("<tr id='d" + bgPage.bookmarkUrls[url][i].id + "'>");
                document.write("<td class='deleteColumn'><img src='x.gif' class='deleteButton' data-url='"+ url +"' title='Delete bookmark'/></td>");
                document.write("<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
                document.write(bgPage.bookmarkUrls[url][i].path + " " + strip(bgPage.bookmarkUrls[url][i].title));
                document.write("</td>");
                document.write("</tr>");
            }
        }
    }

    if (bgPage.duplicateCount > 0) {
        document.getElementById("duplicateCount").innerHTML = bgPage.duplicateCount;
        document.getElementById("duplicateArea").style.display = "";
    }
}

// just text plz :B . performs much faster than .replace
function strip(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;

    var tmp2 = tmp.textContent || tmp.innerText;
    return clean(tmp2);
}

function clean(html) {
    html = html.replace("&", "&amp;");
    html = html.replace("<", "&lt;");
    html = html.replace(">", "&gt;");
    html = html.replace('"', "&quot;");
    html = html.replace("'", "&#39;");

    return html;
}


// deletes all 404s
function Delete404s() {
    var notFounds = bgPage.results[404];
    var id = "";

    if (notFounds == undefined || notFounds.length == 0) {
        FlashDone();
        return;
    }

    for (var i = notFounds.length - 1; i >= 0; i--) {
        id = bgPage.results[404][i].bookmark.id;

        chrome.bookmarks.remove(id);
        document.getElementById("b" + id).style.display = "none";
    }

    document.getElementById("delete404s").setAttribute("disabled", true);
    FlashDone();
}

// deletes a bad bookmark
function DeleteBookmark(id) {
    chrome.bookmarks.remove(id);
    document.getElementById("b" + id).style.display = "none";
}

// deletes all duplicates
function DeleteDuplicates() {
    var id = -1;

    for (var url in bgPage.bookmarkUrls) {
        if (bgPage.bookmarkUrls[url].length > 1) {
            // remove duplicate bookmarks from Chrome and UI
            for (var i = bgPage.bookmarkUrls[url].length - 1; i > 0; i--) {
                id = bgPage.bookmarkUrls[url][i].id;
                chrome.bookmarks.remove(id);
                document.getElementById("d" + id).style.display = "none";
            }
            // remove duplicate bookmarks from array
            bgPage.bookmarkUrls[url].length = 1;
        }
    }
    bgPage.duplicateCount = 0;

    document.getElementById("deleteDuplicates").setAttribute("disabled", true);
    FlashDone();
}

// deletes a duplicate
function DeleteDuplicate(url, id) {
    var index = -1;

    chrome.bookmarks.remove(id);
    document.getElementById("d" + id).style.display = "none";

    // find the index within the array..
    for (var i = 0; i < bgPage.bookmarkUrls[url].length; i++) {
        if (id == bgPage.bookmarkUrls[url][i].id) {
            index = i;
            break;
        }
    }

    if (index != -1) {
        // if they choose delete all later, we want to make sure the array is up to date!
        bgPage.bookmarkUrls[url].splice(index, 1);
    }
}

// deleted all empty folders
function DeleteEmptyFolders() {
    chrome.bookmarks.getTree(function (bookmarks) {
        DeleteEmptyChildren(bookmarks[0]);
        FlashDone();
    });
}

// deletes empty children of node recursively
// returns true if node itself becomes empty in the process
// NOTE: we could just call remove() for every folder according to the API
function DeleteEmptyChildren(node) {
    var empty_children = [];
    var children_length = node.children.length;
    for (var i = 0; i < children_length; i++)
        if (node.children[i].url == null) 
            if (DeleteEmptyChildren(node.children[i])) 
                empty_children.push(node.children[i]);
    for (var i = 0; i < empty_children.length; i++)
        chrome.bookmarks.remove(empty_children[i].id);
    return (children_length - empty_children.length == 0);
}

function FlashDone() {
    var done = document.getElementById("done");
    done.style.display = "block";
    setTimeout(function () {
        done.style.opacity = 1;
    }, 1);
    setTimeout(function () {
        done.style.opacity = 0;
        setTimeout(function () {
            done.style.display = "none";
        }, 150);
    }, 500);
}
