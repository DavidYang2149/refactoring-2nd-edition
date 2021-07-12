## chapter 11. API 리팩터링

### 11.1 질의 함수와 변경 함수 분리하기

- **겉보기 부수효과**가 없이 값을 반환해주는 함수를 추구해야 함
- 방법: '질의 함수(읽기 함수)는 모두 부수효과가 없어야 한다'는 규칙을 따르는 것

```js
// As-Is
function alertForMiscreant(people) {
  for (const p of people) {
    if (p === '조커') {
      setOffAlarms();
      return '조커';
    }
    if (p === '사루만') {
      setOffAlarms();
      return '사루만';
    }
  }
  return '';
}

const found = alertForMiscreant(people);


// To-Be
// 1. 기능을 분리하기 위해 새로운 함수를 생성함
function findMiscreant(people) {
  for (const p of people) {
    if (p === '조커') {
      return '조커';
    }
    if (p === '사루만') {
      return '사루만';
    }
  }
  return '';
}

// 2. 기존 함수의 역할만 남기고 리턴값은 삭제
function alertForMiscreant(people) {
  for (const p of people) {
    if (p === '조커') {
      setOffAlarms();
      return;
    }
    if (p === '사루만') {
      setOffAlarms();
      return;
    }
  }
  return;
}

// 3. 함수를 두개로 나누어 줌
const found = findMiscreant(people);
alertForMiscreant(people);
```

### 11.2 함수 매개변수화하기

- 두 함수의 로직이 아주 비슷하고 **리터럴 값만 다른 경우**, 다른 값만 매개변수로 받아 처리하는 함수를 만들면 중복을 제거할 수 있음

```js
// As-Is
function tenPercentRaise(aPerson) {
  aPerson.salary = aPerson.salary.multiply(1.1);
}

function fivePercentRaise(aPerson) {
  aPerson.salary = aPerson.salary.multiply(1.05);
}

// To-Be
function raise(aPerson, factor) {
  aPerson.salary = aPerson.salary.multiply(1 + factor);
}
```

### 11.3 플래그 인수 제거하기

- **플래그 인수**란 호출되는 함수가 실행할 로직을 호출하는 쪽에서 선택하기 위해 전달하는 인수

```js
// As-Is
function deliveryDate(anOrder, isRush) {
  if (isRush) {
    let deliveryTime;
    if(['MA', 'CT'].includes(anOrder.deliveryState)) deliveryTime = 1;
    else if(['NY', 'NH'].includes(anOrder.deliveryState)) deliveryTime = 2;
    else deliveryTime = 3;
    return anOirder.placeOn.plusDays(1 + deliveryTime);
  } else {
    let deliveryTime;
    if(['MA', 'CT', 'NY'].includes(anOrder.deliveryState)) deliveryTime = 2;
    else if(['ME', 'NH'].includes(anOrder.deliveryState)) deliveryTime = 3;
    else deliveryTime = 4;
    return anOirder.placeOn.plusDays(2 + deliveryTime);
  }
}

aShipment.deliveryDate = deliveryDate(anOrder, true);
aShipment.deliveryDate = deliveryDate(anOrder, false);

// To-Be
function deliveryDate(anOrder, isRush) {
  if (isRush) return rushDeliveryDate(anOrder);
  else return regularDeliveryDate(anOrder);
}

function rushDeliveryDate(anOrder) {
  let deliveryTime;
  if(['MA', 'CT'].includes(anOrder.deliveryState)) deliveryTime = 1;
  else if(['NY', 'NH'].includes(anOrder.deliveryState)) deliveryTime = 2;
  else deliveryTime = 3;
  return anOirder.placeOn.plusDays(1 + deliveryTime);
}

function regularDeliveryDate(anOrder) {
  let deliveryTime;
  if(['MA', 'CT', 'NY'].includes(anOrder.deliveryState)) deliveryTime = 2;
  else if(['ME', 'NH'].includes(anOrder.deliveryState)) deliveryTime = 3;
  else deliveryTime = 4;
  return anOirder.placeOn.plusDays(2 + deliveryTime);
}

aShipment.deliveryDate = rushDeliveryDate(anOrder);
aShipment.deliveryDate = regularDeliveryDate(anOrder);
```

### 11.4 객체 통째로 넘기기

- 하나의 레코드에서 값 두어 개를 가져와 인수로 넘기는 코드에는 레코드를 통재로 넘기도록 수정하기

```js
// As-Is
const low = aRoom.daysTempRange.low;
const hight = aRoom.daysTempRange.high;
if (!aPlan.withinRange(low, high))
  alerts.push('방 온도가 지정 범위를 벗어났습니다.');

function withinRange(bottm, top) {
  return (bottom >= this._temperatureRange.low) && (top <>= this._temperatureRange.high);
}

// To-Be - 1단계
function withinRange(bottm, top) {
  return (bottom >= this._temperatureRange.low) && (top <= this._temperatureRange.high);
}

function xxxNEWwithinRange(aNumberRange) {
  return this.withinRange(aNumberRange.low, aNumberRange.high);
}

if (!aPlan.xxxNEWwithinRange(aRoom.daysTempRange))
  alerts.push('방 온도가 지정 범위를 벗어났습니다.');

// To-Be - 2단계
function xxxNEWwithinRange(aNumberRange) {
  return (aNumberRange.low >= this._temperatureRange.low) && (aNumberRange.high <>= this._temperatureRange.high);
}

if (!aPlan.xxxNEWwithinRange(aRoom.daysTempRange))
  alerts.push('방 온도가 지정 범위를 벗어났습니다.');
```

### 11.5 매개변수를 질의 함수로 바꾸기

- 피호출 함수가 스스로 '쉽게' 결정할 수 있는 값을 매개변수로 건네는 것도 일종의 중복이다
- 이런 매개변수를 제거하면 값을 결정하는 책임 주체가 달라진다
- 즉, 책임 소재를 피호출 함수로 옮기게 되는데 그 역할을 넘겨받기 적합할 때에만 그렇게 한다
- 주의사항: 대상 함수가 **참조 투명**해야 한다

```js
// As-Is
get finalPrice() {
  const basePrice = this.quantity * this.itemPrice;
  let discountLevel;
  if (this.quantity > 100) discountLevel = 2;
  else discountLevel = 1;
  return this.discountedPrice(basePrice, discountLevel);
}

function discountedPrice(basePrice, discountLevel) {
  switch (discountLevel) {
    case 1: return basePrice * 0.95;
    case 2: return basePrice * 0.9;
  }
}

// To-Be - 1단계
get finalPrice() {
  const basePrice = this.quantity * this.itemPrice;
  return this.discountedPrice(basePrice, this.discountLevel);
}

get discountLevel() {
  return (this.quantity > 100) ? 2 : 1;
}

function discountedPrice(basePrice, discountLevel) {
  switch (this.discountLevel) {
    case 1: return basePrice * 0.95;
    case 2: return basePrice * 0.9;
  }
}

// To-Be - 2단계
get finalPrice() {
  const basePrice = this.quantity * this.itemPrice;
  return this.discountedPrice(basePrice);
}

get discountLevel() {
  return (this.quantity > 100) ? 2 : 1;
}

function discountedPrice(basePrice) {
  switch (this.discountLevel) {
    case 1: return basePrice * 0.95;
    case 2: return basePrice * 0.9;
  }
}
```

### 11.6 질의 함수를 매개변수로 바꾸기 (437P)




```js
// As-Is


// To-Be

```

### 11.7 세터 제거하기



### 11.8 생성자를 팩터리 함수로 바꾸기



### 11.9 함수를 명령으로 바꾸기



### 11.10 명령을 함수로 바꾸기



### 11.11 수정된 값 반환하기



### 11.12 오류 코드를 예외로 바꾸기



### 11.13 예외를 사전확인으로 바꾸기



