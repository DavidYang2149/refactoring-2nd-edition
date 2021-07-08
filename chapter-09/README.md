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

### 9.3 파생 변수를 질의 함수로 바꾸기 (338)

```js
// As-Is
get production() { return this._production; }
applyAdjustment(anAdjustment) {
  this._adjustment.push(anAdjustmemt);
  this._production += anAdjustment.amount;
}

// To-Be
get production() { return this._adjustments.reduce((sum, a) => sum + a.amount, 0); }
applyAdjustment(anAdjustment) {
  this._adjustment.push(anAdjustmemt);
}
```

### 9.4 참조를 값으로 바꾸기

객체(데이터 구조)를 다른 객체(데이터 구조)에 중첩하면 내부 객체를 참조 혹은 값으로 취급할 수 있다.

```js
// As-Is
class Product {
  applyDiscount(arg) { this._price.amount -= arg; }
}

// To-Be
class Product {
  applyDiscount(arg) {
    this._price = new Money(this._price.amount - arg, this._price.currency);
  }
}
```

### 9.5 값을 참조로 바꾸기

하나의 값을 여러 곳에서 사용한다면 참조로 바꾼다.

```js
// As-Is
let customer = new Customer(customerData);

// To-Be
let customer = customerRepository.get(customerData.id);
```

### 9.6 매직 리터럴 바꾸기

일반적인 리터럴 값에 의미가 있는 경우 변수명을 지어 의미를 쉽게 이해하도록 돕기.

```js
// As-Is
function potentialEnergy(mass, height) {
  return mass * 9.81 * height;
}

// To-Be
const STANDART_GRAVITY = 9.81;
function potentialEnergy(mass, height) {
  return mass * STANDART_GRAVITY * height;
}

```
