var defaultOptions = {
  header: [],
  footer: [],
  selected: 0,
  selector: '> ',
  clearOnEnd: true,
  cursorOnEnd: true,
  returnIndex: false
};

function clear () {
  process.stdout.write('\033[2J'); // clear
  process.stdout.write('\033[0f'); // back to top
}

function cursor(show) {
  process.stdout.write(show ? '\x1B[?25h' : '\x1B[?25l');
}

/**
 * Split on each \n
 * @param {string|string[]} input
 * @return {Array}
 */
function split(input) {
  return (input || '').split('\n').join('\n').split('\n');
}

module.exports = function menu(items, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = Object.assign({}, defaultOptions, options);
  if (!Array.isArray(options.header)) {
    options.header = split(options.header);
  }
  if (!Array.isArray(options.footer)) {
    options.footer = split(options.footer);
  }

  var P = menu.Promise || Promise;

  var promise = new P(function (resolve) {
    var min, max, page, pages, pageLen;
    var index = Math.max(0, Math.min(items.length - 1, options.selected));
    var empty = (new Array(options.selector.length + 1)).join(' ');

    // catch keyboard
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', keypress);
    process.stdout.on('resize', display);

    display();

    function format(line) {
      line = line
        .replace(/\{\{page}}/g, page + 1)
        .replace(/\{\{pages}}/g, pages)
        .replace(/\{\{index}}/g, index + 1)
        .replace(/\{\{total}}/g, items.length)
        .replace(/\{\{value}}/g, items[index]);

      if (line.length > process.stdout.columns) {
        line = line.substr(0, process.stdout.columns - 3) + '...';
      } else {
        line = line + (new Array(process.stdout.columns - line.length + 1)).join(' ');
      }
      return line;
    }

    function header() {
      process.stdout.cursorTo(0, 0);
      options.header.forEach(function (line) {
        process.stdout.write(format(line) + '\n');
      });
    }

    function footer() {
      process.stdout.cursorTo(0, header.length + max - min + 2, 0);
      options.footer.forEach(function (line, index) {
        process.stdout.write((index ? '\n' : '') + format(line));
      });
    }

    function display() {
      pageLen = process.stdout.rows - options.header.length - options.footer.length;

      if (pageLen <= 0) {
        min = max = 0;
        return;
      }

      pages = Math.ceil(items.length / pageLen);
      page = Math.floor(index / pageLen);
      min = page * pageLen;
      max = Math.min(items.length, (page + 1) * pageLen) - 1;

      clear();
      cursor(false);

      header();

      for (var i = min; i <= max; i++) {
        process.stdout.write(format((i === index ? options.selector : empty) + items[i]));
        if (i < max) {
          process.stdout.write('\n');
        }
      }

      footer();
    }

    function send(value) {
      process.stdin.removeListener('data', keypress);
      process.stdout.removeListener('resize', display);
      if (options.clearOnEnd) {
        clear();
      }
      if (options.cursorOnEnd) {
        cursor(true);
      }
      if (options.returnIndex) {
        resolve(value ? index : -1);
      } else {
        resolve(value ? items[index] : undefined);
      }
    }

    function select(value) {
      // unselect previous item
      process.stdout.cursorTo(0, index - min + options.header.length);
      process.stdout.write(empty);

      // select new item
      index = value;
      header();
      process.stdout.cursorTo(0, index - min + options.header.length);
      process.stdout.write(options.selector);
      footer();
    }

    function keypress(key) {
      // up
      if (key === '\u001B\u005B\u0041' && index) {
        if (index > min) {
          select(index - 1);
        } else {
          index--;
          display();
        }
      }

      // down
      if (key === '\u001B\u005B\u0042' && index < items.length - 1) {
        if (index < max) {
          select(index + 1);
        } else {
          index++;
          display();
        }
      }

      // right
      if (key == '\u001B\u005B\u0043' && max < items.length - 1) {
        index = Math.min(index + pageLen, items.length - 1);
        display();
      }

      // left
      if (key == '\u001B\u005B\u0044' && min) {
        index -= pageLen;
        display();
      }

      // esc, esc, ctrl + c
      if (key === '\x1b' || key === '\x1b\x1b' || key === '\u0003') {
        send(false);
      }

      // return
      if (key === '\r') {
        send(true);
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
};