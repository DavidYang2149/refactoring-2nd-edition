## chapter 6. 기본적인 리팩터링

### 6.1 함수 추출하기

- 방법: 코드 조각을 찾아 무슨일을 하는지 파악한 다음, 독립된 함수로 추출하기
- 코드를 언데 독립된 함수로 묶어야 하는가?
  - 함수하나가 화면을 넘어가면 안됨
  - 재사용성을 기준
  - 두번 이상 사용된 코드
  - ‘목적과 구현을 분리’하는 방식
- 예시: 
```js
// As-Is
const onRemove = useCallback(async () => {
    const ensure = window.confirm('레시피를 삭제하시겠습니까?');
    if (isEmpty(ensure)) {
      return;
    }

    setLoading(true);
    await dispatch(removeFile());
    await dispatch(removeRecipe());
    await dispatch(updateRecipes());
    history.push('/');
}, [dispatch]);

// To-Be
const onRemove = useCallback(async () => {
    const ensure = window.confirm('레시피를 삭제하시겠습니까?');
    if (isEmpty(ensure)) {
      return;
    }

    setLoading(true);

    // This is Check Point
    async function reduxRecipeTasks() {
      await dispatch(removeFile());
      await dispatch(removeRecipe());
      await dispatch(updateRecipes());
    }

    await reduxRecipeTasks();

    history.push('/');
  }, [dispatch]);
```

### 6.2 함수 인라인하기

- 방법: 함수 본문이 이름만큼 명확한 경우, 함수를 제거
- 예시: 
```js
// As-Is
export async function postFile(
  { uploadURL, file }: { uploadURL: string, file: string },
): Promise<string> {
  const response = await axios.post<string>(uploadURL, file, {
    // do Something
  });

  return isMatch(response.status)(200) ? cleanUpQueryString(uploadURL) : '';
}

// To-Be
export async function postFile(
  { uploadURL, file }: { uploadURL: string, file: string },
): Promise<string> {
  const response = await axios.post<string>(uploadURL, file, {
    // do Something
  });

  // This is Check Point
  return (response.status === 200) ? cleanUpQueryString(uploadURL) : '';
}
```

### 6.3 변수 추출하기

- 방법: 표현식이 너무 복잡해서 이해하기 어려운 경우, 변수를 활용하면 표현식을 쪼개 관리하기 더 쉽게 만들 수 있음
- 예시: ??? 

### 6.4 변수 인라인하기

- 방법: 변수 추출하기의 반대

### 6.5 함수 선언 바꾸기

- 방법: 함수 이름 바꾸기
- 예시: 
```js
// As-Is
export async function postFile(
  { preSignedUrl, file }: { preSignedUrl: string, file: string },
): Promise<string> {
  const response = await axios.post<string>(uploadURL, file, {
    // do Something
  });

  return isMatch(response.status)(200) ? removeURLQueryString(preSignedUrl) : '';
}

// To-Be
export async function postFile(
  { uploadURL, file }: { uploadURL: string, file: string },
): Promise<string> {
  const response = await axios.post<string>(uploadURL, file, {
    // do Something
  });

  // This is Check Point: removeURLQueryString → cleanUpQueryString
  return (response.status === 200) ? cleanUpQueryString(uploadURL) : '';
}
```

### 6.6 변수 캡슐화하기

- 방법: 변수를 캡슐화 하는 방법(넓은 범위를 통제하기 위해)
- 이슈: 객체 지향적 방법, 함수형에서는 불변 데이터로 인해 캡슐화 해야할 이유가 적음(불변성의 장점)

### 6.7 변수 이름 바꾸기

- 방법: 좋은 변수 이름으로 바꾸기
- 대중적인(모호한) 변수명은 피함

### 6.8 매개변수 객체 만들기

- 방법: 매개변수가 여러개인 경우 객체로 변경함
- 예시: 흠…

### 6.9 여러 함수를 클래스로 묶기

- 방법: 여러 함수를 하나의 클래스로 묶음
- 객체지향에서 사용하는 방법

### 6.10 여러 함수를 변환 함수로 묶기

- 방법: 
    1. 변환 함수를 사용
    2. 클래스로 묶기(원본 데이터가 코드 안에서 갱신될 경우)
- 예시:
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

### 6.11 단계 쪼개기

- 방법: 단계를  쪼개는 기법
- 예시: 
```js
  // TODO
```
