'use strict';
const fs = require('fs');
const path = require('path');
const url = require('url');

const { snakeCase } = require('snake-case')
const yaml = require('yaml');
const fetch = require('node-fetch');

const converter = require('./lib/index.js');

var argv = require('yargs')
    .usage('widdershins [options] {input-file|url} [[-o] output markdown]')
    .demand(1)
    .string('includes')
    .boolean('discovery')
    .alias('d', 'discovery')
    .describe('discovery', 'Include schema.org WebAPI discovery data.')
    .string('environment')
    .alias('e', 'environment')
    .describe('environment', 'File to load config options from.')
    .alias('i', 'includes')
    .describe('includes', 'List of files to put in the `include` header of the output Markdown.')
    .boolean('lang')
    .alias('l', 'lang')
    .describe('lang', 'Generate the list of languages for code samples based on the languages used in the source file\'s `x-code-samples` examples.')
    .string('outfile')
    .alias('o', 'outfile')
    .describe('outfile', 'File to write the output markdown to. If left blank, Widdershins sends the output to stdout.')
    .string('user_templates')
    .alias('u', 'user_templates')
    .describe('user_templates', 'Directory to load override templates from.')
    .help('h')
    .alias('h', 'Show help.')
    .version()
    .argv;

var options = {};

async function doit(s) {
    var api = {};
    try {
        api = yaml.parse(s, { merge: true });
    }
    catch (ex) {
        console.error('Failed to parse YAML/JSON, falling back to API Blueprint');
        console.error(ex.message);
        api = s;
    }

    try {
        let output = await converter.convert(api, options);
        let outfile = argv.outfile || argv._[1];

        Object.entries(output).forEach(([tag, entries]) => {
            const tagFolderName = snakeCase(tag, { delimiter: '-' }).toLowerCase()
            const folder = path.join(outfile, tagFolderName)
            try {
                const exists = fs.existsSync(folder)
                if (!exists) {
                    fs.mkdirSync(folder, { recursive: true })
                }
            } catch (e) {
                fs.mkdirSync(folder)
            }
            Object.entries(entries).forEach(([key, content]) => {
                const file = snakeCase(key, { delimiter: '-' })
                const p = path.join(folder, file + '.md')
                fs.writeFileSync(p, content, 'utf-8')
            })
        })
    }
    catch (err) {
        console.warn(err);
    }
}

options.codeSamples = !argv.code;
options.user_templates = argv.user_templates;
options.discovery = argv.discovery;
options.tocSummary = argv.summary;

if (argv.includes) options.includes = argv.includes.split(',');

if (argv.environment) {
    var e = fs.readFileSync(path.resolve(argv.environment), 'utf8');
    var env = {};
    try {
        env = yaml.parse(e);
    }
    catch (ex) {
        console.error(ex.message);
    }
    options = Object.assign({}, options, env);
}

var input = argv._[0];
options.source = input;
var up = url.parse(input);
if (up.protocol && up.protocol.startsWith('http')) {
    fetch(input)
        .then(function (res) {
            return res.text();
        }).then(function (body) {
            doit(body);
        }).catch(function (err) {
            console.error(err.message);
        });
}
else {
    let s = fs.readFileSync(input, 'utf8');
    doit(s);
}

