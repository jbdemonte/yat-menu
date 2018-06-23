# Yet Another Terminal Menu

A lightweight terminal menu which both provides node classic and promise usage without any dependency.

## Installation

```bash
npm install --save yat-menu
```

## Usage


```js
var menu = require('yat-menu');
menu(items, [options], [callback])
```

* `items` - string[] - Items to display
* `options` - object - Options to use
* `callback` - function - if not set, a promise will be returned

Available options:

* `clearOnEnd` - boolean - Clear screen on end - default `true`
* `cursorOnEnd` - boolean - Display cursor on end - default `true`
* `footer` - string[]|string - Footer to display - if is a string, will be split on \n - default `[]`
* `fullInverse` - boolean - If true, complete selected line video will be inversed
* `header` - string[]|string - Header to display - if is a string, will be split on \n - default `[]`
* `inverse` - boolean - If true, selected item video will be inversed
* `loop` - boolean - if true, down on last entry go back to the first one, and top on first one go to the last one - default `true`
* `returnIndex` - boolean - If true, returned value will be the selected index or -1 on exit - default `false`
* `searchTimeout` - integer - Duration before reseting the search, disable search by setting `0` - default `1000`
* `selected` - integer - Initial selected index - default `0`
* `selector` - boolean - String to preset the selected item with - default `> `
* `prefix` - string - String to preset the not selected item with - default empty

Keyboard usage:

* `UP` / `DOWN` arrow: choose an item
* `LEFT` / `RIGHT` arrow: choose an item on next page (when list is bigger than console)
* `ESC` / `CTRL + C`: exit returning `undefined`
* `RETURN`: exit returning the selected item

## Header / Footer templating

Header & footer are always refreshed, and these values are usable:

*  `{{index}}` Current index (from 1 to items length)
*  `{{total}}` Items length
*  `{{page}}` Page Index (from 1 to ...)
*  `{{pages}}` Total page length
*  `{{search}}` Searched pattern
*  `{{value}}` Current value

## Promise

By default, this library use the default node Promise library, but it is possible to force the use of any other library.

i.e.
```js
var menu = require('yat-menu');
menu.Promise = require('bluebird');
```

## Example of use

```js
menu(['Item 1', 'Item 2', 'Item 3'], {header: 'Choose:', footer: 'selection: {{value}} ({{index}}/{{total}})'})
  .then(function (item) {
    if (item) {
        console.log('Selected: ', item);
    } else {
        console.log('No item selected');
    }
    process.exit(0);
  })
  .catch(function (err) {
    console.log(err);
    process.exit(0);
  });
```

## Example of use with colors and video inversion

Foreground color code available on [this page](http://invisible-island.net/xterm/ctlseqs/ctlseqs.html)  
You also can use dedicated modules to play with color ([color](https://www.npmjs.com/package/color), [chalk](https://www.npmjs.com/package/chalk),...)

```js
var original = '\x1b[39m';  // Set foreground color to default
var red = '\x1b[31m';       // Set foreground color to Red
var blue = '\x1b[34m';      // Set foreground color to Blue

var options = {
  header: 'Choose:',
  prefix: blue,
  selector: red + '> ',
  fullInverse: true,
  footer: 'selection: ' + red + '{{value}}' + original + ' ({{index}}/{{total}})'
};

menu(['Item 1', 'Item 2', 'Item 3'], options)
  .then(function (item) {
    if (item) {
      console.log('Selected: ', item);
    } else {
      console.log('No item selected');
    }
    process.exit(0);
  })
  .catch(function (err) {
    console.log(err);
    process.exit(0);
  });
```