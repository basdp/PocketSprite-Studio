const { app, BrowserWindow, webFrame, dialog } = require('electron').remote
const modal = require('electron-modal');
const fs = require('fs');
const path = require('path');
const Mousetrap = require('mousetrap');
const ipc = require('electron').ipcRenderer;

$(document).ready(function () {const modal = require('electron-modal');

    window.win = require('electron').remote.getCurrentWindow();

    $(".close-button").on("click", function() {
        win.close();
    });
    $(".minimize-button").on("click", function() {
        win.minimize();
    });
    $(".maximize-button").on("click", function() {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    });

    $(".button.open-project").on("click", function () {
        openProject(dialog.showOpenDialog({
            properties: ['openDirectory'],
            buttonLabel: "Open Project",
            title: "Open Project"
        }));
    });

    $(".button.new-project").on("click", function () {
        newProject(dialog.showSaveDialog({
            buttonLabel: "Create Project",
            title: "Create Project",
            filters: [{ name: 'PocketSprite Studio Projects', extensions: [''] },] 
        }));
    });

    $(".button.save").on("click", function () {
        saveCurrentEditor();
    });

    $(".button.new-file").on("click", function () {
        newFile();
    });

    Mousetrap.bind(['command+s', 'ctrl+s'], function () {
        saveCurrentEditor();
        // return false to prevent default browser behavior
        // and stop event from bubbling
        return false;
    });

    ipc.on('createFile', (event, message) => createFile(message));

});

function newFile() {
    if (project.location == null) {
        dialog.showMessageBox({
            title: "Create file",
            message: "Please open or create a project before creating a file.",
            type: "info"
        });
        return;
    }
    let child = new BrowserWindow({ width: 400, height: 340, parent: window.win, modal: true, show: false, minimizable: false, maximizable: false, resizable: false })
    child.loadURL(path.join(__dirname, 'createfile.html'))
    child.setMenu(null);
    //child.webContents.openDevTools()
    window.newFileWin = child;
    //child.webContents.on('createFile', (event, message) => createFile(message));
    child.once('ready-to-show', () => {
        child.show()
    })
    // child.show();

}

function createFile(filename) {
    if (fs.existsSync(path.join(project.location, filename))) {
        dialog.showErrorBox("Could not create file", "Could not create file '" + filename + "'.\nFile already exists!");
    } else {
        fs.writeFile(path.join(project.location, filename), "", "utf8", function(err) {
            if (err) {
                dialog.showErrorBox("Could not create file", "Could not create file '" + filename + "'.\n" + err);
            } else {
                refreshFiles(true);
                newFileWin.webContents.send('close-createfile', filename);
            }
        });
    }
}

function saveCurrentEditor() {
    if ($(".editor iframe:visible").length > 0) {
        $(".editor iframe:visible")[0].contentWindow.save();
    }
}

var project = {
    location: null,
    files: []
}

function openProject(p) {
    if (!p) return;
    else p = p[0];
    
    project.location = p;
    closeEditors();
    refreshFiles(true);
}

function createBoilerplateFiles(p) {
    fs.writeFileSync(path.join(p, "main.c"), "void main() {\n\treturn 0;\n}\n", "utf8");
}

function newProject(p) {
    if (!p) return;

    if (fs.existsSync(p)) {
        // Do something
        dialog.showErrorBox("The path to '" + p + "' already exists! Try selecting an other path.");
    } else {
        fs.mkdirSync(p);
        createBoilerplateFiles(p);
        project.location = p;
        closeEditors();
        refreshFiles(true);
    }
}

function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out. The div never exists on the page.
    return $('<div/>').text(value).html();
}

function closeEditors() {
    $(".editor iframe").remove();
}

function iconForFile(file) {
    const ext = file.substr(file.lastIndexOf('.') + 1).toLowerCase();
    if (ext == "c" || ext == "h") {
        return "code";
    } else if (ext == "spr" || ext == "png") {
        return "image";
    } else if (ext == "map" || ext == "tmx") {
        return "gradient";
    } else if (ext == "sfx" || ext == "wav") {
        return "volume_up";
    } else if (ext == "mus" || ext == "mod" || ext == "s3m" || ext == "xm") {
        return "music_note";
    } else {
        return "insert_drive_file";
    }
}

function refreshFiles(checkFS) {
    function refresh() {
        const filesElem = $("#files");
        filesElem.empty();
        project.files.forEach(function (file) {
            var elem = $("<li><i class=\"material-icons\">" + iconForFile(file) + "</i> " + htmlEncode(file) + "</li>");
            elem.on("click", function(e) {
                $("#files li").removeClass("selected");
                $(this).addClass("selected");
                openFile($(this).attr("data-filename"));
            });
            elem.attr("data-filename", file);
            filesElem.append(elem);
        });
    }

    if (checkFS) {
        fs.readdir(project.location, function (err, items) {
            project.files = [];

            for (var i = 0; i < items.length; i++) {
                project.files.push(items[i]);
            }
            refresh();
        });
    } else {
        refresh();
    }    
}

function editorForFile(file) {
    const ext = file.substr(file.lastIndexOf('.') + 1).toLowerCase();
    if (ext == "c" || ext == "h") {
        return "editors/code.html";
    } else if (ext == "spr") {
        return "editors/sprite.html";
    } else if (ext == "map") {
        return "editors/map.html";
    } else if (ext == "sfx") {
        return "editors/sfx.html";
    } else if (ext == "mus") {
        return "editors/mus.html";
    } else {
        return "editors/unsupported.html";
    }
}

function openFile(filename) {
    console.log("Open " + filename);
    $(".editor iframe").hide();
    var editor = $(".editor iframe[data-filename='" + filename + "']");
    if (editor.length) {
        editor.show();
    } else {
        const path = require("path");
        editor = $("<iframe src=\"" + editorForFile(filename) + "#" + path.join(project.location, filename) + "\"></iframe>");
        editor.attr("data-filename", filename);
        $(".editor").append(editor);
    }
}