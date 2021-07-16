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

### 11.6 질의 함수를 매개변수로 바꾸기

- 질의 함수의 의존성을 제거하기

```js
// As-Is
get targetTemperature() {
  if (thermostat.selectedTemperature > this._max) return this._max;
  else if (thermostat.selectedTemperature < this._min) return this._min;
  else return thermostat.selectedTemperature;
}

if (thePlan.targetTemperature > thermostat.currentTemperature) setToHeat();
else if (thePlan.targetTemperature < thermostat.currentTemperature) setToCool();
else setOff();

// To-Be - 1단계
get targetTemperature() {
  const selectedTemperature = thermostat.selectedTemperature;
  if (selectedTemperature > this._max) return this._max;
  else if (selectedTemperature < this._min) return this._min;
  else return selectedTemperature;
}

// To-Be - 2단계
get targetTemperature() {
  const selectedTemperature = thermostat.selectedTemperature;
  return this.xxxNewTargetTemperature(selectedTemperature);
}

xxxNewTargetTemperature(selectedTemperature) {
  if (selectedTemperature > this._max) return this._max;
  else if (selectedTemperature < this._min) return this._min;
  else return selectedTemperature;
}

// To-Be - 3단계
if (thePlan.xxxNewTargetTemperature(thermostat.selectedTemperature) > thermostat.currentTemperature) setToHeat();
else if (thePlan.xxxNewTargetTemperature(thermostat.selectedTemperature) < thermostat.currentTemperature) setToCool();
else setOff();

// To-Be - 4단계
targetTemperature(selectedTemperature) {
  if (selectedTemperature > this._max) return this._max;
  else if (selectedTemperature < this._min) return this._min;
  else return selectedTemperature;
}

if (thePlan.targetTemperature(thermostat.selectedTemperature) > thermostat.currentTemperature) setToHeat();
else if (thePlan.targetTemperature(thermostat.selectedTemperature) < thermostat.currentTemperature) setToCool();
else setOff();
```

### 11.7 세터 제거하기

- 세터 메서드가 존재하면 값이 변할 수 있기 때문에 세터를 제거함으로 수정하지 않겠다는 의도를 만든다

```js
// As-Is
class Person {
  get name() { return this._name; }
  set name(arg) { this._name = arg; }
  get id() { return this._id; }
  set id(arg) { this._id = arg; }
}

const david = new Person();
david.name = '데이빗';
david.id = 'david2';

// To-Be
class Person {
  constructor(id) {
    this.id = id;
  }

  get name() { return this._name; }
  set name(arg) { this._name = arg; }
  get id() { return this._id; }
}

const david = new Person('david2');
david.name = '데이빗';
```

### 11.8 생성자를 팩터리 함수로 바꾸기

- 생성자에 붙는 제약을 제거하기 위해 팩터리 함수를 사용함

```js
// As-Is
class Employee {
  constructor(name, typeCode) {
    this._name = name;
    this._typeCode = typeCode;
  }

  get name() { return this._name };
  get type() {
    return Employee.legalTypeCodes[this._typeCode];
  }
  static get legalTypeCodes() {
    return { 'E': 'engineer', 'M': 'Manager', 'S': 'Salesperson' };
  }
}

candidate = new Employee(document.name, document.empType);

// To-Be - 1단계
function createEmployee(name, typeCode) {
  return new Employee(name, typeCode);
}

candidate = createEmployee(document.name, document.empType);

const leadEngineer = createEmployee(document.name, 'E');

// To-Be - 2단계
function createEngineer(name) {
  return new Employee(name, 'E');
}

const leadEngineer = createEngineer(document.name);
```

### 11.9 함수를 명령으로 바꾸기

- 함수를 객체 안으로 캡슐화하면 더 유용한 경우가 존재함

```js
// As-Is
function score(candidate, medicalExam, scoringGuide) {
  let result = 0;
  let healthLevel = 0;
  let highMedicalRiskFlag = false;

  if (medicalExam.isSmoker) {
    healthLevel += 10;
    highMedicalRiskFlag = true;
  }

  let certificationGrade = 'regular';
  if (scoringGuide.stateWithLowCertification(candidate.originState)) {
    certificationGrade = 'low';
    result -= 5;
  }

  // do something...
  result -= Math.max(healthLevel - 5, 0);
  return result;
}

// To-Be - 1단계
function score(candidate, medicalExam, scoringGuide) {
  return new Scorer().execute(candidate, medicalExam, scoringGuide);
}

class Scorer {
  execute(candidate, medicalExam, scoringGuide) {
    let result = 0;
    let healthLevel = 0;
    let highMedicalRiskFlag = false;

    if (medicalExam.isSmoker) {
      healthLevel += 10;
      highMedicalRiskFlag = true;
    }

    let certificationGrade = 'regular';
    if (scoringGuide.stateWithLowCertification(candidate.originState)) {
      certificationGrade = 'low';
      result -= 5;
    }

    // do something...
    result -= Math.max(healthLevel - 5, 0);
    return result;
  }
}

// To-Be - 2단계
function score(candidate, medicalExam, scoringGuide) {
  return new Scorer(candidate).execute(medicalExam, scoringGuide);
}

class Scorer {
  constructor(candidate) {
    this._candidate = candidate;
  }

  execute(medicalExam, scoringGuide) {
    let result = 0;
    let healthLevel = 0;
    let highMedicalRiskFlag = false;

    if (medicalExam.isSmoker) {
      healthLevel += 10;
      highMedicalRiskFlag = true;
    }

    let certificationGrade = 'regular';
    if (scoringGuide.stateWithLowCertification(this._candidate.originState)) {
      certificationGrade = 'low';
      result -= 5;
    }

    // do something...
    result -= Math.max(healthLevel - 5, 0);
    return result;
  }
}

// To-Be - 3단계
function score(candidate, medicalExam, scoringGuide) {
  return new Scorer(candidate, medicalExam, scoringGuide).execute();
}

class Scorer {
  constructor(candidate, medicalExam, scoringGuide) {
    this._candidate = candidate;
    this._medicalExam = medicalExam;
    this._scoringGuide = scoringGuide;
  }

  execute() {
    let result = 0;
    let healthLevel = 0;
    let highMedicalRiskFlag = false;

    if (this._medicalExam.isSmoker) {
      healthLevel += 10;
      highMedicalRiskFlag = true;
    }

    let certificationGrade = 'regular';
    if (this._scoringGuide.stateWithLowCertification(this._candidate.originState)) {
      certificationGrade = 'low';
      result -= 5;
    }

    // do something...
    result -= Math.max(healthLevel - 5, 0);
    return result;
  }
}
```

### 11.10 명령을 함수로 바꾸기

- 객체지향 내에서 명령코드를 함수로 변환

```js
// As-Is
class ChargeCalculator {
  constructor(customer, usage, provider) {
    this._customer = customer;
    this._usage = usage;
    this._provider = provider;
  }

  get baseCharge() {
    return this._sutomer.baseRate * this._usage;
  }

  get charge() {
    return this.baseCharge + this._provider.connectionCharge;
  }
}

monthCharge = new ChargeCalculator(customer, usage, provider).charge;

// To-Be - 1단계
monthCharge = new ChargeCalculator(customer, usage, provider);

function charge(customer, usage, provider) {
  return new ChargeCalculator(customer, usage, provider).charge;
}

// To-Be - 2단계
get baseCharge() {
  return this._customer.baseRate + this._usage;
}

get charge() {
  const baseCharge = this.baseCharge;
  return baseCharge + this._provider.connectionCharge;
}

// To-Be - 3단계
get charge() {
  const baseCharge = this._customer.baseRate + this._usage;
  return baseCharge + this._provider.connectionCharge;
}

// To-Be - 4단계
get baseCharge() {
  return this._customer.baseRate + this._usage;
}

get charge() {
  const baseCharge = this.baseCharge;
  return baseCharge + this._provider.connectionCharge;
}

// To-Be - 5단계
constructor(customer, usage provider) {
  this._customer = customer;
  this._usage = usage;
  this._provider = provider;
}

charge(customer, usage, provider) {
  const baseCharge = this._cusomer.baseRate * this._usage;
  return baseCharge + this._provider.connectionCharge;
}

function charge(customer, usage, provider) {
  return new ChargeCalculator(customer, usage, provider).charge(customer, usage, provider);
}

// To-Be - 6단계
constructor(customer, usage, provider) {
  this._usage = usage;
  this._provider = provider;
}

charge(customer, usage, provider) {
  const baseCharge = custmoer.baseRate * this._usage;
  return baseCharge + this._provider.connectionCharge;
}

// To-Be - 7단계
charge(customer, usage, provider) {
  const baseCharge = customer.baseRate * usage;
  return baseCharge + provider.connectionCharge;
}

function charge(customer, usage, provider) {
  const baseCharge = customer.baseRate * usage;
  return baseCharge + provider.connectionCharge;
}
```

### 11.11 수정된 값 반환하기

- 데이터가 수정될 때 수정된 값을 반환함으로 분명한 목적이 있음을 드러냄

```js
// As-Is
let totalAscent = 0;
let totalTime = 0;
let totalDistance = 0;
calculateAscent();
calculateTime();
calculateDistance();
const pace = totalTime / 60 / totalDistance;

function calculateAscent() {
  for (let i = 1; i < points.length; i++) {
    const verticalChange = points[i].elevation - points[i - 1].elevation;
    totalAscent += (verticalChange > 0) ? verticalChnage : 0;
  }
}

// To-Be - 1단계
let totalAscent = 0;
let totalTime = 0;
let totalDistance = 0;
totalAscent = calculateAscent();
calculateTime();
calculateDistance();
const pace = totalTime / 60 / totalDistance;

function calculateAscent() {
  for (let i = 1; i < points.length; i++) {
    const verticalChange = points[i].elevation - points[i - 1].elevation;
    totalAscent += (verticalChange > 0) ? verticalChnage : 0;
  }
  return totalAscent;
}

// To-Be - 2단계
function calculateAscent() {
  let totalAscent = 0;
  for (let i = 1; i < points.length; i++) {
    const verticalChange = points[i].elevation - points[i - 1].elevation;
    totalAscent += (verticalChange > 0) ? verticalChnage : 0;
  }
  return totalAscent;
}

// To-Be - 3단계
function calculateAscent() {
  let result = 0;
  for (let i = 1; i < points.length; i++) {
    const verticalChange = points[i].elevation - points[i - 1].elevation;
    result += (verticalChange > 0) ? verticalChnage : 0;
  }
  return result;
}

// To-Be - 4단계
const totalAscent = calculateAscent();
let totalTime = 0;
let totalDistance = 0;
calculateTime();
calculateDistance();
const pace = totalTime / 60 / totalDistance;

// To-Be - 5단계(다른 함수들도 같은 방식으로 처리)
const totalAscent = calculateAscent();
let totalTime = calculateTime();
let totalDistance = calculateDistance();

const pace = totalTime / 60 / totalDistance;
```

### 11.12 오류 코드를 예외로 바꾸기

- 오류 코드를 예외(Exception)로 처리하기
- 주의: 예외를 던지는 코드를 프로그램 종료 코드로 바꿔도 프로그램이 정상 동작할지를 따저보아야 함

```js
// As-Is
function localShipppingRules(country) {
  const data = countryData.shippingRules[country];
  if (data) return new ShippingRules(data);
  else return -2;
}

function calculateShippingCosts(anOrder) {
  // do something...
  const shippingRules = localShippingRules(anOrder.country);
  if (shippingRules < 0) return shippingRules;  // 오류 전파
  // do something...
}

const status = calculateShippingCosts(orderData);
if (status < 0) errorList.push({ order: orderData, errorCode: status });

// To-Be - 1단계
let status;
status = calculateShippingCosts(orderData);
if (status < 0) errorList.push({ order: orderData, errorCode: status });


// To-Be - 2단계
let status;
try {
  status = calculateShippingCosts(orderData);
} catch (e) {
  throw e;
}
if (status < 0) errorList.push({ order: orderData, errorCode: status });

// To-Be - 3단계
try {
  calculateShippingCosts(orderData);
} catch (e) {
  if (e instanceof OrderProcessingError)
    errorList.push({ order: orderData, errorCode: status });
  else
    throw e;
}

```

### 11.13 예외를 사전확인으로 바꾸기

- 예외를 던지기 전 호출하는 곳에서 조건을 검사하도록 수정
