window.addEventListener("load", downloadData);

function downloadData() {
    var tableCode = 'A';
    var url = `https://api.nbp.pl/api/exchangerates/tables/${tableCode}?format=json`;
    $.ajax({
        method: 'GET',
        url: url,
        success: function (current_course) {
            dataSuccess(current_course);
        }
    });
}

function dataSuccess(data) {
    setupFiveCurrencyIcons(data);
    setupSomeEventListeners();
    /*Tymczasowy kod. Najlepiej było by użyć do tego localStorage i może go użyjemy*/
    $('[data-set-currency-type="first"]').data('data-setted-currency-code', 'PLN');
    $('[data-set-currency-type="first"]').data('data-setted-currency-value', '1');
    $('[data-set-currency-type="first"]').html(`
		<span>PLN</span>
		<i class="icon-down-dir"></i>
	`);
    $('[data-set-currency-type="second"]').data('data-setted-currency-code', 'EUR');
    $('[data-set-currency-type="second"]').data('data-setted-currency-value', '4');
    $('[data-set-currency-type="second"]').html(`
		<span>EUR</span>
		<i class="icon-down-dir"></i>
	`);
    /*Koniec tymczasowego spamu kodem*/
    var currency_button = document.querySelectorAll('[data-set-currency-type]');
    for (let i = 0; i < 2; i++) {
        currency_button[i].addEventListener('click', function (mouseposition) {
            currency_button[i].setAttribute('data-set-currency-type-state', 'inactive');
            var currency_type = $(this).data('set-currency-type');
            $(".additional-content").data("actual-set-currency-open", currency_type);
            enterAdditionalData(data, mouseposition);
        });
    }
    preloaderHidding();
}

function enterAdditionalData(data, mouseposition) {
    $(".additional-content").append(`
		<div class="currency-button flexstyle" style="margin: 3px;" data-set-other-currency-id="-1">
			<span>PLN</span>
		</div>
	`);
    $('[data-set-other-currency-id="-1"]').data({
        'set-other-currency-code': 'PLN',
        'set-other-currency-value': '1'
    });
    $.each(data[0].rates, function (i, item) {
        var code = item.code,
            value = item.mid;
        $(".additional-content").append(`
			<div class="currency-button flexstyle" style="margin: 3px;" data-set-other-currency-id=${i}>
				<span>${code}</span>
			</div>
		`);
        $('[data-set-other-currency-id=' + i + ']').data({
            'set-other-currency-code': code,
            'set-other-currency-value': value
        });
    });
    var currency_to_set_button = document.querySelectorAll('[data-set-other-currency-id]');
    for (let i = 0; i < currency_to_set_button.length; i++) {
        currency_to_set_button[i].addEventListener("click", changeCurrentCurrency);
        $('[data-set-other-currency-id=' + i + ']').removeAttr('data-set-other-currency-id');
    }
    additional_show(mouseposition);
}

function changeCurrentCurrency() {
    var clicked_currency_to_set_code = $(this).data('set-other-currency-code'),
        clicked_currency_to_set_type = $(".additional-content").data('actual-set-currency-open'),
        clicked_currency_to_set_value = $(this).data('set-other-currency-value');
    console.log(clicked_currency_to_set_code, clicked_currency_to_set_type, clicked_currency_to_set_value);
    $('[data-set-currency-type=' + clicked_currency_to_set_type + ']').data('data-setted-currency-code', clicked_currency_to_set_code);
    $('[data-set-currency-type=' + clicked_currency_to_set_type + ']').data('data-setted-currency-value', clicked_currency_to_set_value);
    $('[data-set-currency-type=' + clicked_currency_to_set_type + ']').html(`
		<span>${clicked_currency_to_set_code}</span>
		<i class="icon-down-dir"></i>
	`);
    additional_hide();
}

function setupSomeEventListeners() {
    var additional_container_close = document.querySelector('[data-additional-close-button]');
    additional_container_close.addEventListener("click", additional_hide);
    var input_element = document.getElementsByClassName('calculate-input')[0],
        input_data_element = document.querySelector('[data-input-state]'),
        input_calculate_button = document.getElementsByClassName('calculate-button')[0],
        input_calculate_button_active = document.querySelector('[data-calculate-button]');
    input_element.addEventListener('focus', function () {
        input_data_element.setAttribute('data-input-state', 'focus');
    });
    input_element.addEventListener('blur', function () {
        var input_actual_value = $(this).val();
        if (input_actual_value === '') {
            input_data_element.setAttribute('data-input-state', 'blur');
        } else {
            input_data_element.setAttribute('data-input-state', 'blured');
        }
    });
    input_element.addEventListener('keyup', function () {
        var input_actual_value_second = $(this).val();
        if (input_actual_value_second === '') {
            input_calculate_button_active.setAttribute('data-calculate-button', 'inactive');
        } else {
            input_calculate_button_active.setAttribute('data-calculate-button', 'active');
        }
    });
    input_calculate_button.addEventListener("click", function (secondmouseposition) {
        calculateStartFunction(secondmouseposition);
    });
}

function calculateStartFunction(mouseposition) {
    var button_state = document.querySelector('[data-calculate-button]').getAttribute('data-calculate-button');
    if (button_state === 'active') {
        document.getElementsByClassName('calculate-button')[0].setAttribute('data-set-currency-type-state', 'inactive');
        var first_currency_code = $('[data-set-currency-type="first"]').data('data-setted-currency-code'),
            first_currency_value = $('[data-set-currency-type="first"]').data('data-setted-currency-value'),
            second_currency_code = $('[data-set-currency-type="second"]').data('data-setted-currency-code'),
            second_currency_value = $('[data-set-currency-type="second"]').data('data-setted-currency-value'),
            amount_value = $(".calculate-input").val();
        var calculation = amount_value * first_currency_value;
        var result = calculation / second_currency_value;
        if (isNaN(result)) {
            calculateEndFunction(false, mouseposition);
        } else {
            calculateEndFunction(true, mouseposition, first_currency_code, second_currency_code, amount_value, result.toFixed(2));
        }
    }
}

function calculateEndFunction(state, mousepos, first_code, second_code, amount_value, result) {
    if (state === true) {
        $(".additional-content").addClass('result-content-styles');
        $(".additional-header").css('display', 'none');
        $(".additional-content").append(`
			<span class="result-styles-text">${amount_value} ${first_code} = ${result} ${second_code}</span>
		`);
        additional_show(mousepos);
    } else {
        console.log('Coś poszło nie tak i trzeba napisać skrypcik który pokaże że coś poszło nie tak');
    }
}

function additional_show(evt) {
    var posx = evt.pageX - $('.change-container').offset().left;
    var posy = evt.pageY - $('.change-container').offset().top;
    var origin = posx + 'px' + ' ' + posy + 'px';
    $(".additional-container").css('transform-origin', origin);
    setTimeout(function () {
        $(".additional-container").addClass("additional-container-show");
    }, 400);
}

function additional_hide() {
    $(".additional-container").removeClass("additional-container-show");
    setTimeout(function () {
        $(".additional-content").removeClass('result-content-styles');
        $(".additional-header").css('display', 'flex');
        $(".additional-content").data("actual-set-currency-open", '');
        $(".additional-content").html(``);
    }, 400)
    document.querySelector('[data-set-currency-type-state="inactive"]').setAttribute('data-set-currency-type-state', 'active');
}

function preloaderHidding() {
    var windowWidth = window.innerWidth,
        windowHeight = window.innerHeight;
    var randomXpos = Math.floor((Math.random() * windowWidth) + 1),
        randomYpos = Math.floor((Math.random() * windowHeight) + 1);
    var origin = randomXpos + 'px' + ' ' + randomYpos + 'px';
    $(".loader-container").css('transform-origin', origin);
    setTimeout(function () {
        $(".loader-container").addClass('loader-hidding');
        setTimeout(function () {
            $(".loader-container").addClass('loader-hidden');
            $(".loader-container").removeClass('loader-hidding');
        }, 500);
    }, 500);
}

function setupFiveCurrencyIcons(data) {
    $(".actual-currency-date").html(`Data: ${data[0].effectiveDate}`);
    $(".actual-currency-number").html(`Oznaczenie: ${data[0].no}`);
    const availableCodes = [
		'EUR',
		'USD',
		'GBP',
		'JPY',
		'KRW'
	];
    const wantedWalues = [
		7,
		1,
		10,
		12,
		32
	];
    for (let i = 0; i < 5; i++) {
        var downloadedCurrencyCode = data[0].rates[wantedWalues[i]].code,
            downloadedCurrencyValue = data[0].rates[wantedWalues[i]].mid;
        if (downloadedCurrencyCode === availableCodes[i]) {
            $('[data-navigation-value-icons="' + downloadedCurrencyCode + '"]').val(downloadedCurrencyValue + ' ' + 'PLN');
        } else {
            $('[data-navigation-value-icons="' + availableCodes[i] + '"]').css("display", 'none');
        }
    }
}
