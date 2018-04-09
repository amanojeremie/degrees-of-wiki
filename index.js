const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
var ROOT, DESTINATION, DEPTH_LIMIT, ATTEMPT_LIMIT;

if(process.argv.length < 4 || process.argv.length > 5) {
	console.log('Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' root dest depth_limit=3');
	return;
} 
if(/^https:\/\/en.wikipedia.org\/wiki\//.test(process.argv[2])) {
	ROOT = process.argv[2];
	console.log('Starting from ' + ROOT);
}
else {
	console.log('Invalid start URL');
	return;
}

if(/^https:\/\/en.wikipedia.org\/wiki\//.test(process.argv[3])) {
	DESTINATION = process.argv[3];
	console.log('Looking for ' + DESTINATION)
}
else {
	console.log('Invalid dest URL');
	return;
}

DEPTH_LIMIT = Number(process.argv[4]) || 3;
ATTEMPT_LIMIT = 10;

var visited = 0;
function visit(url, hasVisited, depth, path, attempt) {
	if(depth > DEPTH_LIMIT) {
		//console.log('Giving up at ' + url);
		return;
	}
	if(hasVisited.includes(url)) {
		return;
	}
	if(attempt >= ATTEMPT_LIMIT) {
		console.error('Couldn\'t connect to ' + url + ' with error: ' + error);
	}
	hasVisited.push(url);
	path = path + url;
	request.get(url, (error, response, html) => {
		if(!error) {
			visited++;
			if(visited % 100 == 0) {
				console.log('Visited ' + visited + ' at depth ' + depth);
			}
			let $ = cheerio.load(html);
			$('#bodyContent a').each(function(i, elem) {
				let href = $(this).attr('href');
				if('https://en.wikipedia.org' + href == DESTINATION) {
					console.log('Destination found, with path: ' + path + ' -> ' + 'https://en.wikipedia.org' + href);
				}
				if(/^\/wiki\/(?!(Wikipedia|Category|Help|Template|Template_talk|File|Special):)/.test(href)) {
					visit('https://en.wikipedia.org' + href.split('#')[0], hasVisited, depth + 1, path + ' -> ', 1);
				}
			});
		}
		else {
			visit(url, hasVisited, depth, path, attempt + 1);
		}
	});
}


visit(ROOT, [], 0, '', 1);