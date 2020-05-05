window.addEventListener("load", function () {
	const availableIcons = [
		'euro',
		'dollar',
		'dollar-1',
		'money',
		'money-1',
		'money-2',
		'wallet',
		'pound',
		'rupee',
		'rouble',
		'yen',
		'won',
		'bitcoin'
	];
	var randomIconNumber = Math.floor(Math.random() * availableIcons.length);
	$(".loading-element-animation").html(`
		<i class="icon-${availableIcons[randomIconNumber]}"></i>
	`);
});