### 6.10 여러 함수를 변환 함수로 묶기

```js
// As-Is
function parsePTag(md) {
  md = md.replace(/^\s*(\n)?(.+)/gm, function (m) {
    return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
  });
  return md;
}

function parseHTag(md) {
  md = md.replace(/[\#]{6}(.+)/g, '<h6>$1</h6>');
  md = md.replace(/[\#]{5}(.+)/g, '<h5>$1</h5>');
  md = md.replace(/[\#]{4}(.+)/g, '<h4>$1</h4>');
  md = md.replace(/[\#]{3}(.+)/g, '<h3>$1</h3>');
  md = md.replace(/[\#]{2}(.+)/g, '<h2>$1</h2>');
  md = md.replace(/[\#]{1}(.+)/g, '<h1>$1</h1>');
  return md;
}

function parseBlockquoteTag(md) {
  md = md.replace(/^\>(.+)/gm, '<blockquote>$1</blockquote>');
  return md;
}

function parseMarkdown(md) {
  md = parsePTag(md);
  md = parseHTag(md);
  md = parseBlockquoteTag(md);
  return md;
}

// To-Be
function enrichParser(original) {
  const result = { md: original };
  result.parsePTag = parsePTag(result);
  result.parseHTag = parseHTag(result.parsePTag);
  result.done = parseBlockquoteTag(result.parseHTag);
  return result;
}

function parseMarkdown(md) {
  const result = enrichParser(md);
  return result.done;
}
```
