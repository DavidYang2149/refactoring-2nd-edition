// As-Is
function parseHTag(md) {
  md = md.replace(/[#]{6}(.+)/g, '<h6>$1</h6>');
  md = md.replace(/[#]{5}(.+)/g, '<h5>$1</h5>');
  md = md.replace(/[#]{4}(.+)/g, '<h4>$1</h4>');
  md = md.replace(/[#]{3}(.+)/g, '<h3>$1</h3>');
  md = md.replace(/[#]{2}(.+)/g, '<h2>$1</h2>');
  md = md.replace(/[#]{1}(.+)/g, '<h1>$1</h1>');
  return md;
}

function parseBlockquoteTag(md) {
  md = md.replace(/^>(.+)/gm, '<blockquote>$1</blockquote>');
  return md;
}

// TODO parseMarkdown 함수를 여러 함수묶기로 리팩토링 해보세요.
function parseMarkdown(md) {
  md = parsePTag(md);
  md = parseHTag(md);
  md = parseBlockquoteTag(md);
  return md;
}


let rawMode = true;
mdElement = document.getElementById('markdown');
outputEl = document.getElementById('output-html');
parse = function () {
  outputEl[rawMode ? "innerText" : "innerHTML"] = parseMarkdown(mdElement.innerText);
};

parse();
mdElement.addEventListener('keyup', parse, false);

//Raw mode trigger button
(function () {
  let trigger = document.getElementById('raw-switch');
  status = trigger.getElementsByTagName('span')[0];
  updateStatus = function () {
    status.innerText = rawMode ? 'On' : 'Off';
  };

  updateStatus();
  trigger.addEventListener('click', function (e) {
    e.preventDefault();
    rawMode = rawMode ? false : true;
    updateStatus();
    parse();
  }, false);
}());
