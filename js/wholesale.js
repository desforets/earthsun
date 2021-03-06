var serverURL = 'https://www.earthsun.ca'
// var stripe = Stripe('pk_live_wQ8l7gZKVSvCfc5P6E0Qq2Lq')
// var serverURL = 'http://localhost:3000'
var stripe = Stripe('pk_test_u77KpSLxrO1jKMrKyA9CZWhy');
var testMode = true

const headers = { 'Content-type': 'application/json', 'Accept': 'application/json' }
var form = document.getElementById('wholesale-order')
var db = document.getElementsByClassName('delete')
for (var i = 0; i < db.length; i++) {
  db[i].addEventListener('click', function (e) {
    document.getElementById(e.target.dataset.item).remove()
  })
}
let catalog = {
  // 'ES-BEL-010': {title: 'Belereai 12 pack', quantity: 0, wholesaleAmount: 12, description: 'Beleai skin cleanser', price: 299.88 },
  'ES-BS-18': {title: 'Bio Shield 12 pack', quantity: 0, wholesaleAmount: 12, name: 'Bio Shield', description: 'Bio Shield: sun protection', price: 299.88 },
  'ES-SS-18': {title: 'Sun Sheer 12 pack', quantity: 0, wholesaleAmount: 12, name: 'Sun Sheer', description: 'Sun sheer: sun protection', price: 299.88 },
  // 'ES-BUM-010': {title: 'Coco Bum 12 pack', quantity: 0, wholesaleAmount: 12, name: 'BioShield', description: 'Gentle coconut ointment', price: 299.88 },
  'ES-SC-18': {title: 'Sun Child 12 pack', quantity: 0, wholesaleAmount: 12, name: 'Sun Child', description: 'Sun child: sun protection for children', price: 299.88 }
  // 'ES-5PK': {title: '5 Pack half dozen', quantity: 0, wholesaleAmount: 6, price: 900},
  // 'BEL-BUM-2PK': {title: '2 pack: Belerai + Cocobum half dozen', quantity: 0, wholesaleAmount: 6, price: 240},
  // 'SUN-CHI-2PK': {title: '2 pack: Sun Shielf + Sun Child half dozen', quantity: 0, wholesaleAmount: 6, price: 240},
  // 'BEL-BIO-SUN-3PK': {title: '3 pack Belerai BioShield SunSheer half dozen', quantity: 0, wholesaleAmount: 6, price: 360}
}
const wholesaleSkus = {
  'ES-BEL-010': 'WS-BEL-010',
  'ES-BIO-010': 'WS-BIO-010',
  'ES-SUN-008': 'WS-SUN-008',
  'ES-BUM-010': 'WS-BUM-010',
  'ES-CHI-010': 'WS-CHI-010',
  'ES-BS-18': 'WS-BIO-010',
  'ES-SS-18': 'WS-SUN-008',
  'ES-SC-18': 'WS-CHI-010'
}
const wholesalePrices = {
  base: 299.88,
  four: 269.88,
  nine: 239.88
}
let wsOrder = {
  sunchild: 0,
  bioshield: 0,
  sunsheer: 0
}
let totals = {
  tax: 0,
  shipping: {ca: 0, us: 0, base_ca: 0, base_us: 0},
  numberOfCases: 0,
  subtotal: 0,
  total_ca: 0,
  total_us: 0
}
if (sessionStorage.wholesaleAccount) {
  let account = JSON.parse(sessionStorage.wholesaleAccount)
  document.getElementById('accountNumberInput').value = account.id
  document.getElementById('accountEmailInput').value = account.email
}
if (localStorage.earthsunAccountId) {
  document.getElementById('accountNumberInput').value = localStorage.earthsunAccountId
  document.getElementById('accountEmailInput').value = localStorage.earthsunAccountEmail
}
window.addEventListener('load', function () {
  if (serverURL.includes('localhost') || testMode) {
    let s = document.getElementById('isTest')
    s.innerHTML = ('(Test mode) ')
  }
  let expressShippingCheckbox = document.getElementById('express')
  expressShippingCheckbox.addEventListener('change', function () { computeTaxesAndShipping(wsOrder, expressShippingCheckbox.checked)})
  let caseInputs = document.querySelectorAll('input.quantityInput')
  caseInputs.forEach(function (i, index, arr) {
    wsOrder[i.dataset.item] = Number(i.value)
    if (index === arr.length - 1) { computeTaxesAndShipping(wsOrder, expressShippingCheckbox.checked) }
    i.addEventListener('change', function () {
      wsOrder[i.dataset.item] = Number(i.value)
      computeTaxesAndShipping(wsOrder, expressShippingCheckbox.checked)
    })
  })
  computeTaxesAndShipping(wsOrder, expressShippingCheckbox.checked)
})
function computeTaxesAndShipping(order, isExpress) {
  let t = 0
  let numberOfCases = 0
  let caseRate = 299.88
  for (let item in order) {
    document.getElementById(`preview-${item}-quantity`).innerHTML = order[item]
    numberOfCases += order[item]
    caseRate = numberOfCases < 4 ? wholesalePrices.base : numberOfCases < 9 ? wholesalePrices.four : wholesalePrices.nine
    t = numberOfCases * caseRate
  }
  document.querySelectorAll('span.preview-price').forEach(function (el) {
    el.innerHTML = numberOfCases < 4 ? wholesalePrices.base : numberOfCases < 9 ? wholesalePrices.four : wholesalePrices.nine
  })
  let subtotal = document.getElementById(`preview-subtotal`)
  let total_ca = document.getElementById(`preview-total-ca`)
  let total_us = document.getElementById(`preview-total-us`)
  totals.numberOfCases = numberOfCases

  totals.shipping.ca = Number(numberOfCases * (isExpress ? 28.50 : 11.40))
  totals.shipping.us = Number(numberOfCases * (isExpress ? 58 : 17.85))
  totals.shipping.base_ca = isExpress ? 28.50 : 11.40
  totals.shipping.base_us = isExpress ? 58 : 17.85
  totals.isExpress = isExpress

  totals.total_ca = 1.12 * (t + totals.shipping.ca)
  totals.total_us = 1.12 * (t + totals.shipping.us)
  total_ca.innerHTML = totals.total_ca.toFixed(2)
  total_us.innerHTML = totals.total_us.toFixed(2)
  totals.subtotal = t
  subtotal.innerHTML = totals.subtotal.toFixed(2)

  let shipping_ca = document.getElementById(`preview-shipping-ca`)
  let shipping_us = document.getElementById(`preview-shipping-us`)
  shipping_ca.innerHTML = (numberOfCases * (isExpress ? 28.50 : 11.40)).toFixed(2)
  shipping_us.innerHTML = (numberOfCases * (isExpress ? 58 : 17.85)).toFixed(2)
}

form.addEventListener('submit', function (event) {

  event.preventDefault();
  for (var item in catalog) {
    catalog[item].quantity = form.elements[item] ? Number(form.elements[item].value) : 0
  }
  const customer = {
    email: event.target.email.value,
    id: event.target.account.value,
  }
  let details = form.elements.details.value || null
  let order = []
  for (sku in catalog) {
    let quantity = catalog[sku].quantity
    let name = catalog[sku].name
    if (quantity > 0) {
      let item = catalog[sku]
      let price = totals.numberOfCases < 4 ? wholesalePrices.base : totals.numberOfCases < 9 ? wholesalePrices.four : wholesalePrices.nine
      order.push({
        amount: price * 100,
        currency: 'cad',
        price,
        name,
        type: 'case',
        parent: wholesaleSkus[sku],
        quantity: item.quantity,
        units: item.quantity * 12,
        type: 'sku'
      })
    }
  }
  if (order.length) {
    console.dir(order)
    document.getElementById('submitCreateWholesaleOrder').className = 'button is-loading is-info'
    axios.post(`${serverURL}/retrieveCustomer`, { customer }, { headers })
    .then(function(response) {
      console.log('return from post to server')
      console.dir(response)
      if (response.data.error) {
        throw new Error(response.data.error)
      } else if (response.data.customer.sources.data.length) {
        response.data.customer.details = details
        sessionStorage.setItem('wholesaleAccount', JSON.stringify(response.data.customer))
        if (event.target.saveAccountLocally.checked) {
          localStorage.setItem('earthsunAccountId', response.data.customer.id)
          localStorage.setItem('earthsunAccountEmail', response.data.customer.email)
        }
        console.log('got a source')
        console.dir(totals)
        console.dir(response.data.customer.shipping.address)
        let isUs = `${response.data.customer.shipping.address.country}` !== 'Canada' && `${response.data.customer.shipping.address.country}` !== 'CA'
        order.push({
          amount: Number(totals.shipping[isUs ? 'base_us' : 'base_ca']) * 100,
          currency: 'cad',
          name: 'Shipping',
          quantity: totals.numberOfCases,
          description: !isUs ? totals.isExpress ? 'Domestic Express shipping' : 'Domestic shipping' : totals.isExpress ? 'US Express shipping' : 'US shipping',
          type: 'shipping'
        })
        console.dir(order)
        axios.post(`${serverURL}/createWholesaleOrder`, { customer: response.data.customer, order }, { headers })
        .then(function(response) {
          console.dir(response)
          console.dir(response.data)
          if (response.error) {
            console.log('response.error')
            document.getElementById('submitCreateWholesaleOrder').className = 'button is-info'
            document.getElementById('errorBox').innerHTML = `Payment failure: ${response.error.message}`
            console.error(response.error)
          }
          sessionStorage.setItem('cart', JSON.stringify(catalog))
          sessionStorage.setItem('charge', JSON.stringify(response.data.charge))
          sessionStorage.setItem('order', JSON.stringify(response.data.order))
          sessionStorage.setItem('dispatchResults', JSON.stringify(response.data.dispatchResults))
          sessionStorage.setItem('invoice', JSON.stringify(response.data.invoice))
          sessionStorage.setItem('error', JSON.stringify(response.data.error))
          window.location.href = './thankyou.html'
        })
        .catch(function (error) {
          console.log('caught error')
          document.getElementById('submitCreateWholesaleOrder').className = 'button is-info'
          document.getElementById('errorBox').innerHTML = `Payment failure: ${error.response.data}`
          console.error(error)
        })
      } else {
        alert('No payment method found! Please complete account setup')
        window.location.href = './addPaymentSource.html'
      }
    })
    .catch(function (error) {
      document.getElementById('submitCreateWholesaleOrder').className = 'button is-danger'
      document.getElementById('submitCreateWholesaleOrder').innerHTML = 'failed'
      setTimeout(function () {
        document.getElementById('submitCreateWholesaleOrder').className = 'button is-info'
        document.getElementById('submitCreateWholesaleOrder').innerHTML = 'Create Wholesale Order'
      }, 4000)
      document.getElementById('errorBox').innerHTML = `Order could not be placed. Error message: ${error.message}`
      console.error(error)
    })
  } else { return false }
})
