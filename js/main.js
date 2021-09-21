console.log('loaded main.js')
//let requestURL = 'https://api.exchangerate.host/latest?base=USD';
let requestURL = 'https://api.exchangerate.host/';
let currency = { convertFrom: 'USD', convertTo: [], data: {} };



function fetchCurrencyData() {
    let requestedURL = `${requestURL}latest?base=${currency.convertFrom}`
    return fetch(requestedURL).
    then(response => response.json()).
    then((data) => {
        currency.data = data;
        return;
    }).catch(error => console.warn(error));
}

function fetchSymbols() {
    requestedURL = `${requestURL}symbols`;
    return fetch(requestedURL).
    then(response => response.json()).
    then((symbolData) => {
        currency.symbols = symbolData.symbols
        return;
    }).catch(error => console.warn(error));
}

function fetchAPIData() {
    fetchCurrencyData().
    then(() => {
        console.log(currency.data.rates)
    }).then(() => fetchSymbols()).then(() => render());
}

function changeBase() {
    let select = document.querySelector('.section-config-base select')
    let selected = select.options[select.selectedIndex].value;
    //console.log(select.options[select.selectedIndex].value)
    currency.convertFrom = select.options[select.selectedIndex].value.slice(0, 3)
    console.log(selected);
    console.log(currency.convertTo);
    console.log(currency.convertTo.indexOf(selected));
    currency.convertTo.splice(currency.convertTo.indexOf(currency.convertFrom), 1);

    render();

}

function makeComparisonCurrencyEventListener(thisOption, rate) {
    thisOption.addEventListener('mousedown', function(e) {
        e.preventDefault();
        if (e.target.selected) {
            e.target.selected = false;
            currency.convertTo.splice(currency.convertTo.indexOf(rate), 1);
        } else if (currency.convertTo.length <= 3) {
            currency.convertTo.push(rate);
            e.target.selected = true;
        }
        showConfigurationSelectionsPanel();
    });
}

function showConfigurationSelectionsPanel() {
    let baseShow = document.querySelector('.section-config-show-base');

    baseShow.textContent = currency.convertFrom;
    let comparisonShow = document.querySelector('.section-config-show-comparisons');
    let comparisonUL = document.createElement('ul');
    comparisonShow.innerHTML = ''
    comparisonShow.appendChild(comparisonUL);

    for (let comparison of currency.convertTo) {
        let newLI = document.createElement('li');
        newLI.textContent = comparison;
        comparisonUL.appendChild(newLI);
    }
}

function makeBaseCurrencySelectionOption(thisSelect, rate) {
    let option = document.createElement('option');
    let rateName = currency.symbols[rate].description;
    option.textContent = `${rate}: ${rateName}`;
    if (rate === currency.convertFrom) option.selected = true;
    thisSelect.appendChild(option);

}

function makeComparisonCurrencySelectionOption(thisSelect, rate) {
    if (rate != currency.convertFrom) {
        let option = document.createElement('option');
        let rateName = currency.symbols[rate].description;
        option.textContent = `${rate}: ${rateName}`;
        thisSelect.appendChild(option);
        makeComparisonCurrencyEventListener(option, rate);
        if (currency.convertTo.includes(rate)) {
            option.setAttribute('selected', true);
        } else {
            option.selected = false;
        }
        thisSelect.appendChild(option);


    }
}

function render() {
    showConfigurationSelectionsPanel();
    console.log('rendering')
    let baseSelect = document.querySelector('.section-config-base select');
    let convertSelect = document.querySelector('.section-config-conversions select');
    //clears dom of comparison select options
    convertSelect.innerHTML = ''
    baseSelect.innerHTML = ''
    console.log(currency.data.rates);

    for (let rate in currency.data.rates) {
        makeBaseCurrencySelectionOption(baseSelect, rate);
        makeComparisonCurrencySelectionOption(convertSelect, rate);
    }
}

fetchAPIData();