// var serverURL = 'http://localhost:3000/addPaymentSource'
// var stripe = Stripe('pk_test_u77KpSLxrO1jKMrKyA9CZWhy');
var serverURL = 'https://www.earthsun.ca'
var stripe = Stripe('pk_live_wQ8l7gZKVSvCfc5P6E0Qq2Lq');

var elements = stripe.elements();

var style = {
  base: {
    color: '#32325d',
    lineHeight: '18px',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4',
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};
let customer = JSON.parse(sessionStorage.customer)
const card = elements.create('card', {style, hidePostalCode: customer.billing ? Boolean(customer.billing.postal_code) : false })
card.addEventListener('change', event => {
  var displayError = document.getElementById('card-errors')
  if (event.error) { displayError.textContent = event.error.messages
  } else { displayError.textContent = ''}
})
card.mount('#card-element')
card.update({value: {postalCode: customer.billing ? customer.billing.postal_code : '' }})

const form = document.getElementById('addPaymentForm')
form.addEventListener('submit', (event) => {

  event.preventDefault()

  stripe.createToken(card).then(result => {
    if (result.error) {
      console.log('createToken hit an error')
      console.error(result.error)
      // Inform the user if there was an error
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      // Send the token to your server
      axios.post(`${serverURL}/addPaymentSource`, {customer: JSON.parse(sessionStorage.customer), token: result.token},
        {
          headers:{
            'Content-type': 'application/json',
            'Accept': 'application/json'
          }
        }
      ).then(response => {
        sessionStorage.setItem('customer', JSON.stringify(response.data))
        window.location.href = './thankyou.html'
      }).catch(error => {
        console.error(error)
        window.location.href = './error.html'
      })
    }
  })
})
