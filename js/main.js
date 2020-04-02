document.addEventListener("keydown", function(e) {
    if (e.key === 'Enter'){
        stockTicker();
    }
});

stockSearch();

function stockTicker() {
    stockInformation();
}

function stockSearch(){

    let output = `
    <div class="container" style="margin-top: 70px;">
        <div class="buttonContainer">
            <label style="color: #001f33;"> Ticker symbol lookup </label>
            <input id="stockticket" type="text" placeholder="ex. AAPL">
            <button  class="btn btn-primary" onClick="stockTicker()">Enter</button>
        </div>
    </div>
    `

    document.getElementById('searchData').innerHTML = output;
}

function stockInformation() {

    let ticker = document.getElementById('stockticket').value;
    let tickerName = "";

    let urlName = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${ticker}&apikey=2X8AHKH6M7SLGS8H`;
    
    fetch(urlName).then(function(name) {
        name.json().then(function(nameData) {
            let stockName = nameData.bestMatches[0]['2. name'];
            tickerName = stockName;
            document.querySelector('.stockName').innerHTML = "Name: " + `<span class="red bold">${stockName}</span>`;
        });
    });

    let url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker.toUpperCase()}&interval=1min&apikey=2X8AHKH6M7SLGS8H`; 
    
    fetch(url).then(function(stockData) { 
        stockData.json().then(function(data) {
            generateInfo(data, tickerName);
            stockVariation(data);
            stockInterval(data);
        })
    })

} 

function generateInfo(data, stockName){

    if (data['Meta Data'] !== "") {

        let tickerName = data['Meta Data']['2. Symbol'];
        let lastRefresh = data['Meta Data']['3. Last Refreshed'];
        let dataSize = data['Meta Data']['5. Output Size'];
        let timeZone = data['Meta Data']['6. Time Zone'];

        let openPrice = data['Time Series (1min)'][lastRefresh]['1. open'];
        openPrice = Number( openPrice ).toFixed(2);

        let closePrice = data['Time Series (1min)'][lastRefresh]['4. close'];
        closePrice = Number( closePrice ).toFixed(2);
        
        let averageOpenClose = ((Number(openPrice) + Number(closePrice)) / 2).toFixed(2)
        let variationOpenClose = ((1-(Number(openPrice)/(Number(closePrice))))*100).toFixed(3)

        let  highPrice = data['Time Series (1min)'][lastRefresh]['2. high'];
        highPrice = Number( highPrice ).toFixed(2);

        let lowPrice = data['Time Series (1min)'][lastRefresh]['3. low'];
        lowPrice = Number( lowPrice ).toFixed(2);

        let averageHighLow = ((Number(highPrice) + Number(lowPrice)) / 2).toFixed(2)
        let variationHighLow = ((1-(Number(lowPrice)/(Number(highPrice))))*100).toFixed(3)

        let volume = data['Time Series (1min)'][lastRefresh]['5. volume'];
        volume = Number( volume ).toFixed(2);

        

        let outputInfo = `
        <div class="container">
            <h1>General Information</h1>
            <table style="width: 100%; text-align: center; font-size: 18px;">
            <tr>
                <td>Stock Name</td>
                <td>Last</td>
                <td>Size</td>
                <td>Time Zone</td>
            </tr>
            <tr>    
                <td><label>[${tickerName}] ${stockName}</label></td>
                <td><label>${lastRefresh}</label></td>
                <td><label>${dataSize}</label></td>
                <td><label>${timeZone}</label></td>
            </tr>
            </table>

            <table style="width: 100%; text-align: center; font-size: 18px;">
                <tr>
                    <td>Open</td>
                    <td>Close</td>
                    <td>Average</td>
                    <td>Variation</td>
                    <td>High</td>
                    <td>Low</td>
                    <td>Average</td>
                    <td>Variation</td>
                </tr>
                <tr>    
                    <td><label>${openPrice}</label></td>
                    <td><label>${closePrice}</label></td>
                    <td><label>${averageOpenClose}</label></td>
                    <td><label>${variationOpenClose} %</label></td>
                    <td><label>${highPrice}</label></td>
                    <td><label>${lowPrice}</label></td>
                    <td><label>${averageHighLow}</label></td>
                    <td><label>${variationHighLow} %</label></td>
                </tr>
            </table>
        </div>`

        document.getElementById('metaData').innerHTML = outputInfo;
    }

}

function stockVariation(data){

    let avgpriceh = 0;
    let avgpricel = 0;
    let avgpricet = 0;

    if (data['Meta Data'] !== "") {

        let hourIni = "";
        let hourEnd = "";
        let highest = 0;
        let lowest = 9999999;
        let qtt = 0;
        let variation = 0;

        hourEnd = data['Meta Data']['3. Last Refreshed'];
        let open = 0;
        let close = data['Time Series (1min)'][hourEnd]['4. close'];

        for (let ticker in data['Time Series (1min)']){

            open = data['Time Series (1min)'][ticker]['1. open'];

            let priceh = data['Time Series (1min)'][ticker]['2. high'];
            avgpriceh += Number(priceh);
            highest = Math.max(highest, priceh);

            let pricel = data['Time Series (1min)'][ticker]['3. low'];
            avgpricel = Number(pricel);
            lowest = Math.min(lowest, pricel); 

            hourIni = ticker

            qtt++;
        }

        avgpricet = ((highest+lowest)/2);
        variation = ((Number(highest)/Number(lowest))-1)*100;

        let outputInfo = `
        <div class="container">
            <table style="width: 100%; text-align: center; font-size: 18px;">
            <tr>
                <td>Start</td>
                <td>End</td>
                <td>Jumps</td>
                <td>Highest</td>
                <td>Lowest</td>
                <td>Average</td>
                <td>Variation (%)</td>
            </tr>
            <tr>    
                <td><label>${hourIni.substr(10,6)}</label></td>
                <td><label>${hourEnd.substr(10,6)}</label></td>
                <td><label>${qtt}</label></td>
                <td><label>${highest.toFixed(2)}</label></td>
                <td><label>${lowest.toFixed(2)}</label></td>
                <td><label>${avgpricet.toFixed(3)}</label></td>
                <td><label>${variation.toFixed(3)}</label></td>
            </tr>
            </table>`

        document.getElementById('metaVariation').innerHTML = outputInfo;
    }
}

function stockInterval(data){

    if (data['Meta Data'] !== "") {

        let outputInfo = `
        <div class="container" style="margin-bottom: 80px;">
        <h1>Ticker Update - Interval 1 Min.</h1>
        <table style="width: 100%; text-align: center; font-size: 18px;">
        <tr>
            <td>Hora</td>
            <td>Open</td>
            <td>Close</td>
            <td>Average</td>
            <td>Variation</td>
            <td>High</td>
            <td>Low</td>
            <td>Average</td>
            <td>Variation</td>
        </tr>`

        for (let ticker in data['Time Series (1min)']){

            let openPrice = data['Time Series (1min)'][ticker]['1. open'];
            openPrice = Number( openPrice ).toFixed(2);

            let closePrice = data['Time Series (1min)'][ticker]['4. close'];
            closePrice = Number( closePrice ).toFixed(2);
            
            let averageOpenClose = ((Number(openPrice) + Number(closePrice)) / 2).toFixed(2)
            let variationOpenClose = ((1-(Number(openPrice)/(Number(closePrice))))*100).toFixed(3)

            let pos = "";

            if(variationOpenClose >= 0){
                pos = "(+)"
            }
            else{
                pos = "(-)"
            }

            let  highPrice = data['Time Series (1min)'][ticker]['2. high'];
            highPrice = Number( highPrice ).toFixed(2);

            let lowPrice = data['Time Series (1min)'][ticker]['3. low'];
            lowPrice = Number( lowPrice ).toFixed(2);

            let averageHighLow = ((Number(highPrice) + Number(lowPrice)) / 2).toFixed(2)
            let variationHighLow = ((1-(Number(lowPrice)/(Number(highPrice))))*100).toFixed(3)

            let volume = data['Time Series (1min)'][ticker]['5. volume'];
            volume = Number( volume ).toFixed(2);
        
            outputInfo += `
            <tr>    
                <td><label>${ticker.substr(10,6)}</label></td>
                <td><label>${openPrice}</label></td>
                <td><label>${closePrice}</label></td>
                <td><label>${averageOpenClose}</label></td>
                <td><label>${variationOpenClose}%${pos}</label></td>
                <td><label>${highPrice}</label></td>
                <td><label>${lowPrice}</label></td>
                <td><label>${averageHighLow}</label></td>
                <td><label>${variationHighLow} %</label></td>
            </tr>`

        }

        outputInfo += `
            </table>
        </div>`

        document.getElementById('metaDataDetail').innerHTML = outputInfo;
    }
}
