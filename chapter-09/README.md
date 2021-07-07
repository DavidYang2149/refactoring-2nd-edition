## chapter 9. 데이터 조직화

### 9.1 변수 쪼개기 (330 페이지)

- 역할이 둘 이상인 변수가 있다면 쪼개야 한다(예외는 없다)
- 역할 하나당 변수 하나
- 변수명에 적합한 이름짓기가 필요

- 예시1:
```js
// As-Is
function distanceTravelled (scenario, time) {
  let result;
  let acc = scenario.primaryForce / scenario.mass;
  
  let primaryTime = Math.min(time, scenario.delay);
  result = 0.5 * acc * primaryTime * primaryTime;
  
  let secondaryTime = time - scenario.delay;
  if (secondaryTime > 0) {
    let primaryVelocity = acc * scenario.delay;
    acc = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass;
    result += primaryVelocity * secondaryTime + 0.5 * acc * secondaryTime * secondaryTime;
  }

  return result;
}

// To-be
function distanceTravelled (scenario, time) {
  let result;
  const primaryAcceleration = scenario.primaryForce / scenario.mass;
  
  let primaryTime = Math.min(time, scenario.delay);
  result = 0.5 * primaryAcceleration * primaryTime * primaryTime;
  
  let secondaryTime = time - scenario.delay;
  if (secondaryTime > 0) {
    let primaryVelocity = primaryAcceleration * scenario.delay;
    const secondaryAcceleration = (scenario.primaryForce + scenario.secondaryForce) / scenario.mass;
    result += primaryVelocity * secondaryTime + 0.5 * secondaryAcceleration * secondaryTime * secondaryTime;
  }

  return result;
}

```

- 예시2:
```js
// As-Is
function discount (inputValue, quantity) {
  if (inputValue > 50) inputValue = inputValue - 2;
  if (quantity > 100) inputValue = inputValue - 1;
  return inputValue;
}

// To-be
function discount (originalInputValue, quantity) {
  let inputValue = originalInputValue;
  if (inputValue > 50) inputValue = inputValue - 2;
  if (quantity > 100) inputValue = inputValue - 1;
  return inputValue;
}

function discount (inputValue, quantity) {
  let result = inputValue;
  if (inputValue > 50) result = result - 2;
  if (quantity > 100) result = result - 1;
  return result;
}
```

### 9.2 필드 이름 바꾸기

- 레코드(필드)의 이름을 더 깊게 이해해야할 때 이름을 변경할 수 있음

- 예시:
```js
// As-Is
const organization = { name: 'ice cream love', contry: 'koera' };

// As-Is
class organization {
  constructor(data) {
    this._name = data.name;
    this._country = data.contry;
  }

  get name() { return this._name; }
  set name(aString) { this._name = aString; }
  get country() { return this._country; }
  set country(aCountryCode) { this._country = aCountryCode; }
}

// To-be
class organization {
  constructor(data) {
    this._title = (data.title !== undefined) ? data.title : data.name;
    this._country = data.contry;
  }

  get name() { return this._title; }
  set name(aString) { this._title = aString; }
  get country() { return this._country; }
  set country(aCountryCode) { this._country = aCountryCode; }
}
```

### 9.3 파생 변수를 질의 함수로 바꾸기 (341)



### 9.4 참조를 값으로 바꾸기



### 9.5 값을 참조로 바꾸기



### 9.6 매직 리터럴 바꾸기


