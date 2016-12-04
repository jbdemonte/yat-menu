var defaultOptions = {
  header: [],
  selected: 0,
  selector: '> ',
  clearOnEnd: true,
  cursorOnEnd: true
};

function clear () {
  process.stdout.write('\033[2J'); // clear
  process.stdout.write('\033[0f'); // back to top
}

function cursor(show) {
  process.stdout.write(show ? '\x1B[?25h' : '\x1B[?25l');
}

function menu(items, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = Object.assign({}, defaultOptions, options);
  if (!Array.isArray(options.header)) {
    options.header = (options.header || '').split(/\n/);
  }

  var P = menu.Promise || Promise;

  var promise = new P(function (resolve) {
    var selected = Math.max(0, Math.min(items.length - 1, options.selected));
    var empty = (new Array(options.selector.length + 1)).join(' ');

    clear();
    cursor(false);

    // display header
    options.header.forEach(function (line) {
      process.stdout.write(line + '\n');
    });

    // display items
    items.forEach(function (item, index) {
      process.stdout.write(index === selected ? options.selector : empty);
      process.stdout.write(item);
      process.stdout.write('\n');
    });

    // catch keyboard
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', keypress);

    function send(value) {
      process.stdin.removeListener('data', keypress);
      if (options.clearOnEnd) {
        clear();
      }
      if (options.cursorOnEnd) {
        cursor(true);
      }
      resolve(value);
    }

    function select(value) {
      // unselect previous item
      process.stdout.cursorTo(0, selected + options.header.length);
      process.stdout.write(empty);
      selected = value;
      // select new item
      process.stdout.cursorTo(0, selected + options.header.length);
      process.stdout.write(options.selector);
    }

    function keypress(key) {
      // up
      if (key === '\u001B\u005B\u0041' && selected) {
        select(selected - 1);
      }

      // down
      if (key === '\u001B\u005B\u0042' && selected < items.length - 1) {
        select(selected + 1);
      }

      // esc, esc, ctrl + c
      if (key === '\x1b' || key === '\x1b\x1b' || key === '\u0003') {
        send();
      }

      // return
      if (key === '\r') {
        send(items[selected]);
      }
    }

  });

  if (callback) {
    promise
      .then(function (result) {
        callback(undefined, result);
      })
      .catch(function (err) {
        callback(err);
      });

  } else {
    return promise;
  }
}

module.exports = menu;