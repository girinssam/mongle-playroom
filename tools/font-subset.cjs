// 글꼴 서브셋 만들기·확인: index.html·voice-list.csv에 쓰인 글자만 남긴 Jua·Gowun Dodum woff2를 fonts/에 만들고,
// 빠진 글자가 없는지 확인해요. 자세한 사용법은 CLAUDE.md '글꼴'.
//   준비: 저장소 밖 임시 폴더에서 npm i subset-font fontkit
//   확인만:   (임시 폴더에서) node <저장소>/tools/font-subset.cjs <저장소> --check
//   다시 만들기: (임시 폴더에서) node <저장소>/tools/font-subset.cjs <저장소> <Jua-Regular.ttf> <GowunDodum-Regular.ttf>
//     원본 글꼴(저장소에 넣지 않음): https://github.com/google/fonts/raw/main/ofl/jua/Jua-Regular.ttf
//                                   https://github.com/google/fonts/raw/main/ofl/gowundodum/GowunDodum-Regular.ttf
const fs = require('fs'), path = require('path');
const { createRequire } = require('module');
const need = createRequire(path.join(process.cwd(), 'x.js')); // 임시 폴더의 node_modules에서 찾아요

const [repo, a, b] = process.argv.slice(2);
if (!repo || !a) { console.log('사용법: node font-subset.cjs <저장소> --check  또는  node font-subset.cjs <저장소> <Jua-Regular.ttf> <GowunDodum-Regular.ttf>'); process.exit(1); }
const FONTS = [['Jua', 'jua.woff2'], ['Gowun Dodum', 'gowun-dodum.woff2']];

// 사이트에서 쓰는 글자 + 영문·숫자·기호(키보드 글자 전체)
function siteChars() {
  let text = '';
  for (let c = 0x20; c < 0x7f; c++) text += String.fromCharCode(c);
  for (const f of ['index.html', 'voice-list.csv']) text += fs.readFileSync(path.join(repo, f), 'utf8');
  return [...new Set([...text])].filter(ch => ch.codePointAt(0) >= 0x20);
}

// 원본 글꼴에 아예 없는 글자(이모지, 일부 기호 등)는 서브셋을 만들 때 fonts/not-in-font.json에 적어 둬요.
// 확인할 때 이 글자는 '원본에도 없음'(기기 글꼴로 보임)으로, 나머지 빠진 글자는 '서브셋을 다시 만들어야 함'으로 알려 줘요.
const NOT_IN_FONT = path.join(repo, 'fonts', 'not-in-font.json');

function check() {
  const fontkit = need('fontkit'), chars = siteChars();
  const notIn = fs.existsSync(NOT_IN_FONT) ? JSON.parse(fs.readFileSync(NOT_IN_FONT, 'utf8')) : {};
  let bad = 0;
  for (const [name, file] of FONTS) {
    const font = fontkit.openSync(path.join(repo, 'fonts', file)), skip = new Set([...(notIn[name] || '')]);
    const missing = chars.filter(ch => !font.hasGlyphForCodePoint(ch.codePointAt(0)));
    const redo = missing.filter(ch => !skip.has(ch)), other = missing.filter(ch => skip.has(ch));
    console.log(name + ' (' + file + '): 글자 ' + font.characterSet.length + '개');
    if (redo.length) { bad += redo.length; console.log('  빠진 글자 ' + redo.length + '개 → 서브셋을 다시 만들어 주세요: ' + redo.join(' ')); }
    else console.log('  빠진 글자 없음');
    if (other.length) console.log('  (참고) 원본 글꼴에도 없어 기기 글꼴로 보이는 글자 ' + other.length + '개: ' + other.join(''));
  }
  if (bad) process.exitCode = 1;
}

if (a === '--check') check();
else {
  const subsetFont = need('subset-font'), fontkit = need('fontkit'), chars = siteChars().join(''), notIn = {};
  console.log('글자 수:', [...chars].length);
  (async () => {
    fs.mkdirSync(path.join(repo, 'fonts'), { recursive: true });
    for (const [src, [name, out]] of [[a, FONTS[0]], [b, FONTS[1]]]) {
      const orig = fontkit.openSync(src);
      notIn[name] = [...chars].filter(ch => !orig.hasGlyphForCodePoint(ch.codePointAt(0))).join('');
      const buf = await subsetFont(fs.readFileSync(src), chars, { targetFormat: 'woff2' });
      fs.writeFileSync(path.join(repo, 'fonts', out), buf);
      console.log(out, Math.round(buf.length / 1024) + 'KB');
    }
    fs.writeFileSync(NOT_IN_FONT, JSON.stringify(notIn, null, 1) + '\n');
    check();
  })();
}
