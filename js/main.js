console.log('loaded main.js')
//let requestURL = 'https://api.exchangerate.host/latest?base=USD';
let requestURL = 'https://api.exchangerate.host/';
let currency = { convertFrom: 'USD', convertTo: [], data: {} };


function makeModalDiv(classStr) {
    let div = document.createElement('div');
    div.innerHTML = `1 ${currency.convertFrom} =<br>${currency.data.rates[classStr]} ${classStr}`;
    div.classList.add('modal', classStr);
    return div;

}

function showModal(div) {
    div.style.display = "block";
    div.onmouseout = function() {
        div.style.display = 'none';
    };
}

fetchAPIData();

/* fetch functions */
function fetchCurrencyData() {
    console.log(currency['convertFrom']);
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
        currency.symbols = symbolData.symbols;
        return;
    }).catch(error => console.warn(error));
}

function fetchAPIData() {
    fetchCurrencyData().
    then(() => fetchSymbols()).then(() => render());
}

function changeBase() {
    // THINK CAREFULLY ABOUT THIS, REVISIT
    let select = document.querySelector('.section-config-base select');
    let selected = select.options[select.selectedIndex].value;
    currency.convertFrom = select.options[select.selectedIndex].value.slice(0, 3);

    //check explicitly, because splice argument one will evaluate to -1 if not present
    // splice is defined to treat -1 index as last element
    if (currency.convertTo.includes(currency.convertFrom)) {
        currency.convertTo.splice(currency.convertTo.indexOf(currency.convertFrom), 1);
    }
    fetchAPIData();
}

function addFlashError() {
    let warningElem = document.querySelector('.header-warning');

    let message = "You cannot select more than 4 comparisons!  Deselect one (with click), then select another.";

    warningElem.classList.add('warning-added');
    warningElem.textContent = message;

}

function removeFlashError() {
    let warningElem = document.querySelector('.header-warning');
    warningElem.classList.remove('warning-added');
    warningElem.textContent = '';
    render();
}


/* page configuration functions */

function makeComparisonCurrencyEventListener(thisOption, rate) {
    thisOption.addEventListener('mousedown', function(e) {
        e.preventDefault();
        if (e.target.selected) {
            e.target.selected = false;
            currency.convertTo.splice(currency.convertTo.indexOf(rate), 1);
            removeFlashError();
            render();
        } else if (currency.convertTo.length <= 3) {
            currency.convertTo.push(rate);
            e.target.selected = true;


        } else {
            console.log("You cannot select more than 4 comparisons!");
            addFlashError();
        }
        showConfigurationSelectionsPanel();
    });
}

function showConfigurationSelectionsPanel() {
    let baseShow = document.querySelector('.section-config-show-base');

    baseShow.textContent = currency.convertFrom;
    let comparisonShow = document.querySelector('.section-config-show-comparisons');
    let comparisonUL = document.createElement('ul');
    comparisonShow.innerHTML = '';
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
    // TAKE A LOOK, SHOULD THIS BE A SEPARATE FUNCTION FOR THE BELOW SCENARIO
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
        // TAKE A SECOND LOOK AT WHAT I AM DOING HERE, CAN THIS BE A SEPARATE CONCERN
        if (currency.convertTo.includes(rate)) {
            option.setAttribute('selected', true);
        } else {
            option.selected = false;
        }
        thisSelect.appendChild(option);


    }
}

function charts() {
    console.log('make charts');
    let graphArea = document.querySelector('section-graphs');
    // graphArea.innerHTML = ''
    let toMakeGraphsFrom = currency.convertTo;
    let graphableCurrencies = {}
    graphableCurrencies[currency.convertFrom] = 1;
    let maxHeight = 1;
    for (let thisCurrency of currency.convertTo) {
        let val = (Number(currency.data.rates[thisCurrency]));
        graphableCurrencies[thisCurrency] = val;
        console.log(val);
        if (val > maxHeight) {
            maxHeight = val;
        }


    }
    console.log(maxHeight);
    let ratio = 100 / maxHeight;
    console.log('ratio', ratio);
    //maxHeight =
    console.log(graphableCurrencies);
    let titleRow = document.querySelector('.graphs-title');
    let graphsRow = document.querySelector('.graphs-graphing');
    titleRow.innerHTML = '';
    graphsRow.innerHTML = '';
    for (let graphName in graphableCurrencies) {
        let height = ratio * Number(graphableCurrencies[graphName]);

        let titleElement = document.createElement('p');
        titleElement.innerHTML = graphName;
        titleRow.appendChild(titleElement);
        console.log(titleElement);

        let graphElement = document.createElement('div');

        let modal = makeModalDiv(graphName);

        titleElement.appendChild(modal);

        graphElement.onmouseover = function() {

            showModal(modal);
        }
        graphElement.onmouseout = function() {
            modal.style.display = 'none';
        }
        titleElement.onmouseover = graphElement.onmouseover;
        titleElement.onmouseout = graphElement.onmouseout;
        graphElement.style.height = height + '%';

        graphElement.style.minHeight = '10px';
        graphElement.style.minWidth = '50px';
        graphElement.style.background = 'red';
        // graphElement.textContent = 'g';
        graphsRow.appendChild(graphElement);
    }
}


/* render */

function render() {

    showConfigurationSelectionsPanel();
    console.log('rendering');
    console.log(currency);

    let baseSelect = document.querySelector('.section-config-base select');
    let convertSelect = document.querySelector('.section-config-conversions select');
    //clears dom of comparison select options
    convertSelect.innerHTML = '';
    baseSelect.innerHTML = '';
    console.log(currency.data.rates);

    for (let rate in currency.data.rates) {
        makeBaseCurrencySelectionOption(baseSelect, rate);
        makeComparisonCurrencySelectionOption(convertSelect, rate);
    }
    charts();

}