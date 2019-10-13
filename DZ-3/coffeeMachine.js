const coffeeTypes = [  //элементы, которые можно заказать
	{name:'espresso', vol:100, price:90},
	{name:'latte', vol:250, price:130},
	{name:'cappuccino', vol:250, price:110},
	{name:'banLatte', vol:300, price:150},
	{name:'vanCappuccino', vol:300, price:150},
	{name:'flatWhite', vol:280, price:100},
	{name:'milk', vol:50, price:25},
	{name:'cherrySyrup', vol:50, price:35},
];

let plasticCups = [  //стаканчики
	{vol:250, num:5},
	{vol:380, num:6},
];

let ingredients = [  //колбы с ингредиентами
	{name:'milk', vol:1000},
	{name:'cherry', vol:500},
	{name:'vanilla', vol:500},
	{name:'banana', vol:500},
]

let testIngredients = []; //"тестовые", несуществующие колбы с ингредиентами - используются для проверки при сборке заказа

let curOrder = {name:'none', vol:0, price:0, milk:0, syrup:0}; //текущий заказ

let operWindow = document.getElementById('operWindow'); //элементы управления
let orderWindow = document.getElementById('orderWindow');
let abortion = document.getElementById('abortion');
let image = document.getElementById('image');
let progress = document.getElementById('progress');
let sound = document.getElementById('sound');
let head = document.getElementById('h1');
let pay = document.getElementById('pay');

let espresso = { click:document.getElementById('espresso')} //элементы заказа
let latte = { click:document.getElementById('latte')}
let cappuccino = { click:document.getElementById('cappuccino')}
let banLatte = { click:document.getElementById('banLatte')}
let vanCappuccino = { click:document.getElementById('vanCappuccino')}
let flatWhite = { click:document.getElementById('flatWhite')}
let milk = { click:document.getElementById('milk')}
let cherrySyrup = { click:document.getElementById('cherrySyrup')}

let volArr = [  // массив для отключения кнопок заказа в зависимости от их объема
	{button:espresso, vol:coffeeTypes[0].vol},
	{button:latte, vol:coffeeTypes[1].vol},
	{button:cappuccino, vol:coffeeTypes[2].vol},
	{button:banLatte, vol:coffeeTypes[3].vol},
	{button:vanCappuccino, vol:coffeeTypes[4].vol},
	{button:flatWhite, vol:coffeeTypes[5].vol},
	{button:milk, vol:coffeeTypes[6].vol},
	{button:cherrySyrup, vol:coffeeTypes[7].vol},
]

let onTimer, offTimer; //таймеры включения/выключения анимации выдачи

let time; //время приготовления напитка

let espressoCounter = 0; //Считает количество эспрессо

function orderTime(order){ //определяет время приготовления напитка
	if (((order.name == 'cappuccino') || (order.name == 'latte') || (order.name == 'espresso')) && 
		(order.syrup == 0) && (order.milk == 0)){
		time = 30;
	}
	else if ((order.name == 'vanCappuccino') || (order.name == 'banLatte') || (order.name == 'flatWhite')){
		time = 50;
	}
	else if (order.name == 'milk'){
		time = 10;
	}
	else if ((order.syrup > 0) || (order.milk > 0)){
		time = 80;
	}
}

function copy(){ //копирует значения из реальных колб с ингредиентами в "тестовые"
	testIngredients = [];
	for (let key of ingredients){
		let temp = Object.assign({},key);
		testIngredients.push(temp);
	}
}

function testCheckIngredients(){ //проверяет доступность ингредиентов при сборке заказа
	if (curOrder.syrup > 1){cherrySyrup.click.disabled = true;}
	if (testIngredients[0].vol < 120){flatWhite.click.disabled = true;}
	if (testIngredients[0].vol < 100){latte.click.disabled = true; banLatte.click.disabled = true;}
	if (testIngredients[0].vol < 80){cappuccino.click.disabled = true; vanCappuccino.click.disabled = true;}
	if (testIngredients[0].vol < 50){milk.click.disabled = true;}
	if (testIngredients[1].vol < 50){cherrySyrup.click.disabled = true;}
	if (testIngredients[2].vol < 50){vanCappuccino.click.disabled = true;}
	if (testIngredients[3].vol < 50){banLatte.click.disabled = true;}
}

function checkIngredients(){ //проверяет доступность ингредиентов после оплаты и приготовления заказа
	if (ingredients[0].vol < 120){flatWhite.click.disabled = true;}
	if (ingredients[0].vol < 100){latte.click.disabled = true; banLatte.click.disabled = true;}
	if (ingredients[0].vol < 80){cappuccino.click.disabled = true; vanCappuccino.click.disabled = true;}
	if (ingredients[0].vol < 50){milk.click.disabled = true;}
	if (ingredients[1].vol < 50){cherrySyrup.click.disabled = true;}
	if (ingredients[2].vol < 50){vanCappuccino.click.disabled = true;}
	if (ingredients[3].vol < 50){banLatte.click.disabled = true;}
}

function avaliableVolume(){ //выдает максимальный доступный объем стаканчика
	if (plasticCups[1].num > 0) return 380;
	else if (plasticCups[0].num > 0) return 250;
	else return 0;
} 

function checkCups(){ //проверяет, не закончились ли стаканчики
	if (plasticCups[0].num < 1 && plasticCups[1].num < 1){
		manager(11);
		alert('Закончились стаканчики, автомат не работает!')
	}
}

function checkCupPossible(){ //проверяет после заказа, доступна ли опция в зависимости от объема стаканчика
	let avVolume = avaliableVolume();
	for (key of volArr){
		if (key.vol > avVolume) key.button.click.disabled = true;
	}
}

function checkVolume(volume){ //проверяет при сборке заказа, доступна ли опция в зависимости от объема стаканчика
	let avVolume = avaliableVolume();	
	let difference = avVolume - volume;
	for (key of volArr){
		if (key.vol > difference) key.button.click.disabled = true;
	}
}

function turnOnEffects(){ //включает мерцание рамки и музыку, если напиток еще не забрали
	if (image.style.visibility == 'visible'){
		image.classList.toggle('blink');
		sound.play();
	}
}

function turnOffEffects(){ //отключает мерцание рамки и музыку и выводит сообщение, если напиток еще не забрали
	if (image.style.visibility == 'visible'){
		image.classList.remove('blink');
		sound.pause();
		head.style.visibility = 'visible';
	}
}

function getProgress(){ //управляет прогрессбаром - его заполнением и исчезновением, а ткаже появлением картинки напитка
						//запускает тамеры для функций включения/выключения эфффектов
if (progress.value == progress.max) {
	image.style.visibility = 'visible';
	progress.style.visibility = 'hidden';
	onTimer = setTimeout(turnOnEffects, 5000);
	offTimer = setTimeout(turnOffEffects, 20000);
	return false;
}
progress.value++;
setTimeout(getProgress, time);
}

function showCooking(){ //показывает процесс готовки - отключает кнопки, запускает таймер прогрессбара
	manager(11);
	orderWindow.style.visibility = 'hidden';
	abortion.style.visibility = 'hidden';
	progress.style.visibility = 'visible';
	getProgress();
	//image.style.visibility = 'visible';
}

function cookOrder(order){ //тратит ингредиенты на приготовление заказа после оплаты, втч и стаканчики
	if (order.name == 'espresso'){
	ingredients[0].vol -= 50*order.milk;
	ingredients[1].vol -= 50*order.syrup;
	}
	else if (order.name == 'cappuccino'){
		ingredients[0].vol = (ingredients[0].vol-80)-50*order.milk;
		ingredients[1].vol -= 50*order.syrup;
	}
	else if (order.name == 'latte'){
		ingredients[0].vol = (ingredients[0].vol-100)-50*order.milk;
		ingredients[1].vol -= 50*order.syrup;
	}
	else if (order.name == 'banLatte'){
		ingredients[0].vol -= 100;
		ingredients[3].vol -= 50;
	}
	else if (order.name == 'vanCappuccino'){
		ingredients[0].vol -= 80;
		ingredients[2].vol -= 50;
	}
	else if (order.name == 'flatWhite'){
	ingredients[0].vol -= 120;
	}
	else if (order.name == 'milk'){
	ingredients[0].vol -= 50*(order.milk+1);
	}
	if (order.vol <= 250 && plasticCups[0].num > 0){
		plasticCups[0].num -= 1;
	}
	else plasticCups[1].num -= 1;
}

function testCookOrder(order){ //тратит тестовые ингредиенты при сборке заказа
	copy();
	if (order.name == 'espresso'){
		testIngredients[0].vol -= 50*order.milk;
		testIngredients[1].vol -= 50*order.syrup;
	}
	else if (order.name == 'cappuccino'){
		testIngredients[0].vol = (testIngredients[0].vol-80)-50*order.milk;
		testIngredients[1].vol -= 50*order.syrup;
	}
	else if (order.name == 'latte'){
		testIngredients[0].vol = (testIngredients[0].vol-100)-50*order.milk;
		testIngredients[1].vol -= 50*order.syrup;
	}
	else if (order.name == 'banLatte'){
		testIngredients[0].vol -= 100;
		testIngredients[3].vol -= 50;
	}
	else if (order.name == 'vanCappuccino'){
		testIngredients[0].vol -= 80;
		testIngredients[2].vol -= 50;
	}
	else if (order.name == 'flatWhite'){
	testIngredients[0].vol -= 120;
	}
	else if (order.name == 'milk'){
	testIngredients[0].vol -= 50*(order.milk+1);
	}
}

function manager(val){ //управляет включением/выключением кнопок
	switch(val){
		case 0: //espresso
			latte.click.disabled = true;
			cappuccino.click.disabled = true;
			banLatte.click.disabled = true;
			vanCappuccino.click.disabled = true;
			flatWhite.click.disabled = true;
			cherrySyrup.click.disabled = false;
			pay.disabled = false;
			break;
		case 1: //latte
			espresso.click.disabled = true;
			latte.click.disabled = true;
			cappuccino.click.disabled = true;
			banLatte.click.disabled = true;
			vanCappuccino.click.disabled = true;
			flatWhite.click.disabled = true;
			cherrySyrup.click.disabled = false;
			pay.disabled = false;
			break;
		case 2: //cappucino
			espresso.click.disabled = true;
			latte.click.disabled = true;
			cappuccino.click.disabled = true;
			banLatte.click.disabled = true;
			vanCappuccino.click.disabled = true;
			flatWhite.click.disabled = true;
			cherrySyrup.click.disabled = false;
			pay.disabled = false;
			break;
		case 3: //banLatte
			espresso.click.disabled = true;
			latte.click.disabled = true;
			cappuccino.click.disabled = true;
			banLatte.click.disabled = true;
			vanCappuccino.click.disabled = true;
			flatWhite.click.disabled = true;
			milk.click.disabled = true;
			cherrySyrup.click.disabled = true;
			pay.disabled = false;
			break;
		case 4: //vanCappuccino
			espresso.click.disabled = true;
			latte.click.disabled = true;
			cappuccino.click.disabled = true;
			banLatte.click.disabled = true;
			vanCappuccino.click.disabled = true;
			flatWhite.click.disabled = true;
			milk.click.disabled = true;
			cherrySyrup.click.disabled = true;
			pay.disabled = false;
			break;
		case 5: //flatWhite
			espresso.click.disabled = true;
			latte.click.disabled = true;
			cappuccino.click.disabled = true;
			banLatte.click.disabled = true;
			vanCappuccino.click.disabled = true;
			flatWhite.click.disabled = true;
			milk.click.disabled = true;
			cherrySyrup.click.disabled = true;
			pay.disabled = false;
			break;
		case 6: //milk
			//espresso.click.disabled = true;
			latte.click.disabled = true;
			cappuccino.click.disabled = true;
			banLatte.click.disabled = true;
			vanCappuccino.click.disabled = true;
			flatWhite.click.disabled = true;
			pay.disabled = false;
			break;
		case 8: //оплата
			espresso.click.disabled = false;
			latte.click.disabled = false;
			cappuccino.click.disabled = false;
			banLatte.click.disabled = false;
			vanCappuccino.click.disabled = false;
			flatWhite.click.disabled = false;
			milk.click.disabled = false;
			cherrySyrup.click.disabled = true;
			pay.disabled = true;
			orderWindow.innerHTML = ``;
			curOrder = {name:'none', vol:0, price:0, milk:0, syrup:0};
			break;
		case null: //отмена
			espresso.click.disabled = false;
			latte.click.disabled = false;
			cappuccino.click.disabled = false;
			banLatte.click.disabled = false;
			vanCappuccino.click.disabled = false;
			flatWhite.click.disabled = false;
			milk.click.disabled = false;
			cherrySyrup.click.disabled = true;
			pay.disabled = true;
			orderWindow.innerHTML = ``;
			curOrder = {name:'none', vol:0, price:0, milk:0, syrup:0};
			break;
		case 11: //выключить все
			abortion.disabled = true;
			espresso.click.disabled = true;
			latte.click.disabled = true;
			cappuccino.click.disabled = true;
			banLatte.click.disabled = true;
			vanCappuccino.click.disabled = true;
			flatWhite.click.disabled = true;
			milk.click.disabled = true;
			cherrySyrup.click.disabled = true;
			pay.disabled = true;
			break;
		case 12: //включить все
			abortion.disabled = false;
			espresso.click.disabled = false;
			latte.click.disabled = false;
			cappuccino.click.disabled = false;
			banLatte.click.disabled = false;
			vanCappuccino.click.disabled = false;
			flatWhite.click.disabled = false;
			milk.click.disabled = false;
			//pay.disabled = false;
			break;


	}

}

function getOrder(val){ //собирает заказ
	manager(val);
	if (curOrder.name != 'none'){
		if (coffeeTypes[val].name == 'milk'){curOrder.milk++;}
		else if (coffeeTypes[val].name == 'cherrySyrup'){curOrder.syrup++;}
	}
	else curOrder.name = coffeeTypes[val].name;
	if ((curOrder.name == 'milk') && (coffeeTypes[val].name == 'espresso')){
		curOrder.name = 'espresso';
		curOrder.milk++;
	}
	if (coffeeTypes[val].name == 'espresso') espressoCounter++;
	curOrder.vol += coffeeTypes[val].vol;
	curOrder.price += coffeeTypes[val].price;
	testCookOrder(curOrder);
	testCheckIngredients();
	checkVolume(curOrder.vol);
	checkCupPossible();
	showOrder(curOrder);
}

function payment(){ //оплачивает заказ
	espressoCounter = 0;
	cookOrder(curOrder);
	orderTime(curOrder);
	//alert(ingredients[0].vol);
	manager(8);
	checkIngredients();
	checkCupPossible();
	showCooking();
}

function showOrder(order) { //выводит информацию о заказе в окошко
	let message = `Ваш заказ: ` + order.name;
	if (espressoCounter > 1) message += ` (x${espressoCounter})`
    if (order.milk > 0) message += `\nДоп.молоко: ` + order.milk + `\n`;
    if (order.syrup > 0) message += `Доп. вишневый сироп: ` + order.syrup;
	orderWindow.innerHTML = message;
}



cherrySyrup.click.disabled = true;
pay.disabled = true;

checkIngredients();
checkCups();
copy();

abortion.onclick = function(){ manager(null); checkIngredients(); espressoCounter = 0;}
espresso.click.onclick = function(){ getOrder(0);}
latte.click.onclick = function(){ getOrder(1);}
cappuccino.click.onclick = function(){ getOrder(2);}
banLatte.click.onclick = function(){ getOrder(3);}
vanCappuccino.click.onclick = function(){ getOrder(4);}
flatWhite.click.onclick = function(){ getOrder(5);}
milk.click.onclick = function(){ getOrder(6);}
cherrySyrup.click.onclick = function(){ getOrder(7);}
pay.onclick = function(){ payment();}

image.onclick = function(){ 
	image.style.visibility = 'hidden';
	head.style.visibility = 'hidden';
	orderWindow.style.visibility = 'visible';
	abortion.style.visibility = 'visible';
	progress.value = 0;
	image.classList.remove('blink');
	sound.pause();
	manager(12);
	checkIngredients();
	checkCupPossible();
	checkCups();
	time = 0;
	clearTimeout(onTimer);
	clearTimeout(offTimer);
}

