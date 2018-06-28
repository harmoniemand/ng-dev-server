'use strict';

var fs = require("fs");
var ncp = require("ncp").ncp;
const { spawn } = require('child_process');
var term = require('terminal-kit').terminal;

var config = JSON.parse(fs.readFileSync("hosting.json"));

var processes = [];
var output = [];

console.clear();

const space = 7;

Object.keys(config.projects).forEach(appname => {
    const app = config.projects[appname];

    // console.log("----");
    // console.log('app: ', appname);
    // console.log('port: ' + app.port);
    // console.log('start ' + appname);

    var parameters = ['/c', 'ng', 'serve', appname, '--port=' + app.port];

    var childprocess = {
        id: processes.length,
        command: parameters,a
        child: spawn('cmd', parameters),
        output: [],
        errors: 0
    };

    term.moveTo(1, space * childprocess.id + 1, 'Process: %d', childprocess.id);
    term.moveTo(1, space * childprocess.id + 2, 'App: %s', appname);
    term.moveTo(1, space * childprocess.id + 3, 'Port: %d', app.port);

    childprocess.child.stdout.on('data', data => {
        var str = data.toString().replace(/(\r\n\t|\n|\r\t)/gm,"");

        childprocess.output.push(str.substr(0, 100));

        childprocess.output.slice(childprocess.length - 5).forEach(row => {
            term.moveTo(30, space * childprocess.id + 1, '> %s', row);
        });
    });

    childprocess.child.stderr.on('data', data => {
        childprocess.errors++;
        childprocess.output.push(data);
    });

    childprocess.child.on('close', code => {
        childprocess.output.push(`child process exited with code ${code}`);
    });

    processes.push(childprocess);

});

process.on('SIGINT', () => {
    processes.forEach(p => { p.child.kill('SIGINT'); })
    console.clear();
    console.log('Received SIGINT. Press Control-D to exit.');
});

