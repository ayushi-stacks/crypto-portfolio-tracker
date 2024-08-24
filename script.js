const API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,ripple&vs_currencies=usd";
const EXCHANGE_RATE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=inr";

async function getCryptoPrices() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch crypto prices');
        return await response.json();
    } catch (error) {
        document.getElementById('error-message').innerText = 'Error fetching crypto prices. Please try again later.';
        console.error(error);
        return null;
    }
}

async function getExchangeRate() {
    try {
        const response = await fetch(EXCHANGE_RATE_URL);
        if (!response.ok) throw new Error('Failed to fetch exchange rate');
        return await response.json();
    } catch (error) {
        document.getElementById('error-message').innerText = 'Error fetching exchange rate. Please try again later.';
        console.error(error);
        return null;
    }
}

// Loading existing portfolio from local storage
document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById('btc').value = localStorage.getItem('btc') || 0;
    document.getElementById('eth').value = localStorage.getItem('eth') || 0;
    document.getElementById('ltc').value = localStorage.getItem('ltc') || 0;
    document.getElementById('xrp').value = localStorage.getItem('xrp') || 0;

    // Automatically calculate portfolio on page load
    await calculatePortfolio();

    // Typewriter effect for heading
    const heading = "Cryptocurrency Portfolio Tracker";
    let i = 0;
    const speed = 150; 

    function typeWriter() {
        if (i < heading.length) {
            document.getElementById("heading").textContent += heading.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }

    typeWriter();
});

// Adding real-time updates every 30 seconds
setInterval(() => {
    calculatePortfolio();
}, 30000);

document.getElementById('calculate').addEventListener('click', async () => {
    await calculatePortfolio();
});

async function calculatePortfolio() {
    const btcHolding = parseFloat(document.getElementById('btc').value) || 0;
    const ethHolding = parseFloat(document.getElementById('eth').value) || 0;
    const ltcHolding = parseFloat(document.getElementById('ltc').value) || 0;
    const xrpHolding = parseFloat(document.getElementById('xrp').value) || 0;

    // Saving holdings to localStorage
    localStorage.setItem('btc', btcHolding);
    localStorage.setItem('eth', ethHolding);
    localStorage.setItem('ltc', ltcHolding);
    localStorage.setItem('xrp', xrpHolding);

    // Fetching the latest crypto prices and exchange rate
    const prices = await getCryptoPrices();
    const exchangeRateData = await getExchangeRate();
    if (!prices || !exchangeRateData) return;  // Exit if API calls failed

    const btcValue = btcHolding * prices.bitcoin.usd;
    const ethValue = ethHolding * prices.ethereum.usd;
    const ltcValue = ltcHolding * prices.litecoin.usd;
    const xrpValue = xrpHolding * prices.ripple.usd;

    const totalValueUSD = btcValue + ethValue + ltcValue + xrpValue;
    const usdToInr = exchangeRateData.usd.inr;
    const totalValueINR = totalValueUSD * usdToInr;

    // Updating the UI with the total portfolio value in both USD and INR
    document.getElementById('portfolio-value').innerHTML = `
        Total Portfolio Value (in USD): $${totalValueUSD.toFixed(2)}<br>
        Total Portfolio Value (in INR): ₹${totalValueINR.toFixed(2)}
    `;

    // Updating the chart
    updatePortfolioChart(btcValue, ethValue, ltcValue, xrpValue);
}

function updatePortfolioChart(btcValue, ethValue, ltcValue, xrpValue) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');

    if (window.portfolioChart && window.portfolioChart instanceof Chart) {
        window.portfolioChart.destroy();
    }

    window.portfolioChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Bitcoin', 'Ethereum', 'Litecoin', 'Ripple'],
            datasets: [{
                label: 'Crypto Portfolio',
                data: [btcValue, ethValue, ltcValue, xrpValue],
                backgroundColor: ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 12 
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': $' + tooltipItem.raw.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}
