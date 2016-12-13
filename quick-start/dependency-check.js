#!/usr/bin/env node
var os = require('os');
var spawn = require('child_process').spawnSync;
var platform = os.platform();

var cmd = 'npm';

var args = [
  '-g',
  'list',
  '--depth=0',
  'typings'
];

if (platform === 'win32' || platform === 'win64') {
  cmd += '.cmd';
}

let resp = spawn(cmd, args, {
  env: process.env
});
if (resp.status > 0) {
  console.log('\n\n################################################');
  console.log('               MISSING PREREQS               \n')
  console.log('You are missing the global package "typings"!!\n');
  console.log('To install this package run:');
  console.log('\tnpm install -g typings');
  console.log('################################################\n\n');
  process.exit(1);
}


