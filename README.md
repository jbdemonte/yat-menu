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

* `header` - string[]|string - Header to display - if is a string, will be split on \n - default `[]`
* `selected` - boolean - Initial selected index - default `0`
* `selector` - boolean - String to preset the selected item with - default `> `
* `clearOnEnd` - boolean - Clear screen on end - default `true`
* `cursorOnEnd` - boolean - Display cursor on end - default `true`

Keyboard usage:

* `UP` / `DOWN` arrow: choose an item
* `ESC` / `CTRL + C`: exit returning `undefined`
* `RETURN`: exit returning the selected item


## Promise

By default, this library use the default node Promise library, but it is possible to force the use of any other library.

i.e.
```js
var menu = require('yat-menu');
menu.Promise = require('bluebird');
```

## Example of use

```js
menu(['Item 1', 'Item 2', 'Item 3'], {header: 'Choose:'})
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
